"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  NotificationType,
  Role,
  SourcingRequestOrigin,
  SourcingStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotification } from "@/lib/notifications/emit";

const AssignSchema = z.object({
  requestId: z.string().min(1),
  agentId: z.string().min(1),
});

export type DispatchResult = { ok: true } | { ok: false; error: string };

/**
 * Assign an agent to a sourcing request.
 *
 * Allowed source states: REQUEST_RECEIVED (first assignment) or ASSIGNED
 * (re-assignment). Anything later in the lifecycle is post-quote and
 * shouldn't be reassigned via this entry point.
 */
export async function assignAgentAction(
  requestId: string,
  agentId: string,
): Promise<DispatchResult> {
  const parsed = AssignSchema.safeParse({ requestId, agentId });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const admin = await requireRole(Role.ADMIN);

  const [request, agent] = await Promise.all([
    prisma.sourcingRequest.findUnique({
      where: { id: parsed.data.requestId },
      select: { id: true, status: true, agentId: true, origin: true },
    }),
    prisma.user.findUnique({
      where: { id: parsed.data.agentId, deletedAt: null },
      select: { id: true, role: true },
    }),
  ]);

  if (!request) return { ok: false, error: "Request not found." };
  if (!agent || agent.role !== Role.AGENT) {
    return { ok: false, error: "Selected user is not an agent." };
  }

  // Hard guard: marketplace orders are fulfilled by the listing factory
  // only — never reachable by an agent, regardless of how the synthetic
  // request's status was advanced.
  if (request.origin === SourcingRequestOrigin.MARKETPLACE) {
    return {
      ok: false,
      error: "Marketplace orders aren't routed through agents.",
    };
  }

  if (
    request.status !== SourcingStatus.REQUEST_RECEIVED &&
    request.status !== SourcingStatus.ASSIGNED
  ) {
    return {
      ok: false,
      error: "This request is past the dispatch stage and can't be reassigned here.",
    };
  }

  const wasReassignment = request.agentId !== null && request.agentId !== agent.id;

  await prisma.sourcingRequest.update({
    where: { id: request.id },
    data: {
      agentId: agent.id,
      assignedAt: new Date(),
      status: SourcingStatus.ASSIGNED,
    },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: wasReassignment ? "request.reassigned" : "request.assigned",
    targetType: "SourcingRequest",
    targetId: request.id,
    payload: { agentId: agent.id, previousAgentId: request.agentId },
  });

  await emitNotification({
    recipientUserId: agent.id,
    type: NotificationType.SYSTEM,
    vars: { systemKey: "agent_assigned" },
    contextType: "SourcingRequest",
    contextId: request.id,
  });

  revalidatePath("/[lang]/admin/requests", "page");
  revalidatePath("/[lang]/agent/requests", "page");
  return { ok: true };
}
