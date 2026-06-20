"use server";

import { z } from "zod";
import { DeletionRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";

const ReasonSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

export type DeletionRequestResult = { ok: true } | { ok: false; error: string };

/**
 * File a GDPR erasure request. Erasure is NOT executed here — a PENDING row
 * is created for an admin to review (legal-retention exceptions mean we can't
 * blindly self-serve delete accounts tied to financial records). One open
 * request per user.
 */
export async function requestAccountDeletionAction(
  reason?: string,
): Promise<DeletionRequestResult> {
  const parsed = ReasonSchema.safeParse({ reason });
  if (!parsed.success) return { ok: false, error: "Invalid reason." };

  const user = await requireAuth();

  const existing = await prisma.accountDeletionRequest.findFirst({
    where: { userId: user.id, status: DeletionRequestStatus.PENDING },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "A deletion request is already pending." };
  }

  const req = await prisma.accountDeletionRequest.create({
    data: { userId: user.id, reason: parsed.data.reason || null },
    select: { id: true },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "account.deletion_requested",
    targetType: "AccountDeletionRequest",
    targetId: req.id,
    level: "WARN",
  });

  return { ok: true };
}

/** Withdraw a still-pending deletion request. */
export async function cancelAccountDeletionAction(): Promise<DeletionRequestResult> {
  const user = await requireAuth();

  const existing = await prisma.accountDeletionRequest.findFirst({
    where: { userId: user.id, status: DeletionRequestStatus.PENDING },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, error: "No pending request to cancel." };
  }

  await prisma.accountDeletionRequest.update({
    where: { id: existing.id },
    data: { status: DeletionRequestStatus.CANCELLED },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "account.deletion_cancelled",
    targetType: "AccountDeletionRequest",
    targetId: existing.id,
  });

  return { ok: true };
}
