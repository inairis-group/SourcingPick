"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Category, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import {
  RESEARCH_FEE_DAY_CENTS,
  RESEARCH_FEE_WEEK_CENTS,
} from "@/lib/orders/pricing";

/**
 * Agent profile updates — rates, bio, timezone, category expertise.
 *
 * Rates: nullable. Setting to null restores the platform default
 * (€125/day, €500/week). Positive overrides must be ≥ the platform
 * floor — agents can negotiate UP, never DOWN. The floor exists for a
 * reason; cutting under it would devalue the platform's published
 * pricing.
 */

const ProfileSchema = z.object({
  agentBio: z.string().trim().max(2000).optional(),
  agentTimezone: z.string().trim().max(50).optional(),
  agentResearchFeeDayCents: z
    .number()
    .int()
    .min(RESEARCH_FEE_DAY_CENTS)
    .max(2000_00)
    .nullable()
    .optional(),
  agentResearchFeeWeekCents: z
    .number()
    .int()
    .min(RESEARCH_FEE_WEEK_CENTS)
    .max(8000_00)
    .nullable()
    .optional(),
  agentCategories: z.array(z.nativeEnum(Category)).max(20).optional(),
});

export type AgentProfileResult = { ok: true } | { ok: false; error: string };

export async function updateAgentProfileAction(
  input: z.input<typeof ProfileSchema>,
): Promise<AgentProfileResult> {
  const user = await requireRole(Role.AGENT);
  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid profile payload.",
    };
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.agentBio !== undefined) {
    data.agentBio = parsed.data.agentBio || null;
  }
  if (parsed.data.agentTimezone !== undefined) {
    data.agentTimezone = parsed.data.agentTimezone || null;
  }
  if (parsed.data.agentResearchFeeDayCents !== undefined) {
    data.agentResearchFeeDayCents = parsed.data.agentResearchFeeDayCents;
  }
  if (parsed.data.agentResearchFeeWeekCents !== undefined) {
    data.agentResearchFeeWeekCents = parsed.data.agentResearchFeeWeekCents;
  }
  if (parsed.data.agentCategories !== undefined) {
    data.agentCategories = { set: parsed.data.agentCategories };
  }

  await prisma.user.update({
    where: { id: user.id },
    data,
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "agent.profile_updated",
    targetType: "User",
    targetId: user.id,
    payload: {
      fields: Object.keys(data),
    },
  });

  revalidatePath("/[lang]/agent/profile", "page");
  revalidatePath("/[lang]/agent/dashboard", "page");
  return { ok: true };
}

/**
 * Mark the agent as onboarded — called by the wizard at the very end.
 */
export async function completeAgentOnboardingAction(): Promise<AgentProfileResult> {
  const user = await requireRole(Role.AGENT);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      agentOnboardedAt: new Date(),
      hasOnboarded: true,
    },
  });
  await writeAuditLog({
    actorUserId: user.id,
    action: "agent.onboarded",
    targetType: "User",
    targetId: user.id,
  });
  revalidatePath("/[lang]/agent/dashboard", "page");
  return { ok: true };
}
