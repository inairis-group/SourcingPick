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

// =============================================================
// Pre-tender validation gate (partner item #14)
// =============================================================
//
// The agent cannot dispatch TenderInvitations until an admin signs off on
// the request — confirming the brief is clear, the budget is sane, and
// the sourcing region is allowed. Approval and rejection both record an
// audit log + notify the agent so they know whether to act or revise.

/**
 * Mark a SOURCING_FLOW request as ready for the agent to dispatch tenders.
 * Idempotent — re-approving a request that's already approved is a no-op
 * after the audit log entry is written.
 */
export async function approvePreTenderAction(
  requestId: string,
): Promise<DispatchResult> {
  if (!requestId || typeof requestId !== "string") {
    return { ok: false, error: "Invalid request id." };
  }
  const admin = await requireRole(Role.ADMIN);

  const request = await prisma.sourcingRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      reference: true,
      agentId: true,
      origin: true,
      status: true,
      preTenderApprovedAt: true,
    },
  });
  if (!request) return { ok: false, error: "Request not found." };
  if (request.origin !== SourcingRequestOrigin.SOURCING_FLOW) {
    return {
      ok: false,
      error: "Only agent-led sourcing requests need this approval.",
    };
  }
  if (
    request.status !== SourcingStatus.REQUEST_RECEIVED &&
    request.status !== SourcingStatus.ASSIGNED
  ) {
    return {
      ok: false,
      error: "This request is past the pre-tender stage.",
    };
  }

  await prisma.sourcingRequest.update({
    where: { id: request.id },
    data: {
      preTenderApprovedAt: new Date(),
      preTenderApprovedById: admin.id,
      // Clear any prior rejection so the agent's queue UI flips back to
      // "ready" instead of carrying a stale rejection banner.
      preTenderRejectedAt: null,
      preTenderRejectionReason: null,
    },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "request.pre_tender_approved",
    targetType: "SourcingRequest",
    targetId: request.id,
    payload: { previouslyApproved: request.preTenderApprovedAt !== null },
  });

  if (request.agentId) {
    await emitNotification({
      recipientUserId: request.agentId,
      type: NotificationType.SYSTEM,
      vars: {
        systemKey: "pre_tender_approved",
        reference: request.reference,
      },
      contextType: "SourcingRequest",
      contextId: request.id,
    });
  }

  revalidatePath("/[lang]/admin/requests", "page");
  revalidatePath("/[lang]/agent/requests", "page");
  return { ok: true };
}

/**
 * Reject the request for tender — record the reason so the agent (and
 * downstream the client) can act on it. Clears any prior approval so the
 * gate is closed again until a new approval is granted.
 */
export async function rejectPreTenderAction(
  requestId: string,
  reason: string,
): Promise<DispatchResult> {
  const trimmed = (reason ?? "").trim();
  if (!requestId || typeof requestId !== "string") {
    return { ok: false, error: "Invalid request id." };
  }
  if (trimmed.length < 5) {
    return { ok: false, error: "Rejection reason is too short." };
  }
  if (trimmed.length > 500) {
    return { ok: false, error: "Rejection reason is too long." };
  }
  const admin = await requireRole(Role.ADMIN);

  const request = await prisma.sourcingRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      reference: true,
      agentId: true,
      origin: true,
      status: true,
    },
  });
  if (!request) return { ok: false, error: "Request not found." };
  if (request.origin !== SourcingRequestOrigin.SOURCING_FLOW) {
    return {
      ok: false,
      error: "Only agent-led sourcing requests need this approval.",
    };
  }
  if (
    request.status !== SourcingStatus.REQUEST_RECEIVED &&
    request.status !== SourcingStatus.ASSIGNED
  ) {
    return {
      ok: false,
      error: "This request is past the pre-tender stage.",
    };
  }

  await prisma.sourcingRequest.update({
    where: { id: request.id },
    data: {
      preTenderApprovedAt: null,
      preTenderApprovedById: null,
      preTenderRejectedAt: new Date(),
      preTenderRejectionReason: trimmed,
    },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "request.pre_tender_rejected",
    targetType: "SourcingRequest",
    targetId: request.id,
    payload: { reason: trimmed },
  });

  if (request.agentId) {
    await emitNotification({
      recipientUserId: request.agentId,
      type: NotificationType.SYSTEM,
      vars: {
        systemKey: "pre_tender_rejected",
        reference: request.reference,
      },
      contextType: "SourcingRequest",
      contextId: request.id,
    });
  }

  revalidatePath("/[lang]/admin/requests", "page");
  revalidatePath("/[lang]/agent/requests", "page");
  return { ok: true };
}
