"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AdminScope,
  DeletionRequestStatus,
  NotificationType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotification } from "@/lib/notifications/emit";

const RejectSchema = z.object({
  requestId: z.string().min(1),
  note: z.string().trim().min(3, "A note is required.").max(1000),
});

const IdSchema = z.object({ requestId: z.string().min(1) });

export type AdminDeletionResult = { ok: true } | { ok: false; error: string };

/**
 * Approve a deletion request AND execute erasure in one transaction:
 * scrub the user's PII, soft-delete the account, and revoke all sessions /
 * OAuth links / OTPs so they can no longer sign in. Financial rows (orders,
 * invoices, escrow, payouts) are deliberately NOT deleted — they're retained
 * under accounting-law obligations (GDPR Art. 17(3)(b)), but they no longer
 * carry the user's personal identifiers.
 */
export async function approveAccountDeletionAction(
  requestId: string,
): Promise<AdminDeletionResult> {
  const parsed = IdSchema.safeParse({ requestId });
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const admin = await requireAdminScope(AdminScope.USERS);

  const req = await prisma.accountDeletionRequest.findUnique({
    where: { id: parsed.data.requestId },
    select: { id: true, status: true, userId: true },
  });
  if (!req) return { ok: false, error: "Request not found." };
  if (req.status !== DeletionRequestStatus.PENDING) {
    return { ok: false, error: "Request is not pending." };
  }

  const now = new Date();
  const anonymizedEmail = `deleted+${req.userId}@deleted.invalid`;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: req.userId },
      data: {
        deletedAt: now,
        email: anonymizedEmail,
        name: null,
        firstName: "Deleted",
        lastName: "User",
        phone: null,
        image: null,
        passwordHash: null,
        twoFactorEnabled: false,
        agentBio: null,
        agentTimezone: null,
      },
    }),
    prisma.session.deleteMany({ where: { userId: req.userId } }),
    prisma.account.deleteMany({ where: { userId: req.userId } }),
    prisma.emailOtp.deleteMany({ where: { userId: req.userId } }),
    prisma.accountDeletionRequest.update({
      where: { id: req.id },
      data: {
        status: DeletionRequestStatus.COMPLETED,
        reviewedById: admin.id,
        reviewedAt: now,
      },
    }),
  ]);

  await writeAuditLog({
    actorUserId: admin.id,
    action: "account.deletion_approved",
    targetType: "User",
    targetId: req.userId,
    payload: { requestId: req.id },
    level: "ALERT",
  });

  revalidatePath("/[lang]/admin/account-deletions", "page");
  return { ok: true };
}

/** Refuse a deletion request (e.g. active orders / retention) and notify the user. */
export async function rejectAccountDeletionAction(
  requestId: string,
  note: string,
): Promise<AdminDeletionResult> {
  const parsed = RejectSchema.safeParse({ requestId, note });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const admin = await requireAdminScope(AdminScope.USERS);

  const req = await prisma.accountDeletionRequest.findUnique({
    where: { id: parsed.data.requestId },
    select: { id: true, status: true, userId: true },
  });
  if (!req) return { ok: false, error: "Request not found." };
  if (req.status !== DeletionRequestStatus.PENDING) {
    return { ok: false, error: "Request is not pending." };
  }

  await prisma.accountDeletionRequest.update({
    where: { id: req.id },
    data: {
      status: DeletionRequestStatus.REJECTED,
      reviewedById: admin.id,
      reviewNote: parsed.data.note,
      reviewedAt: new Date(),
    },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "account.deletion_rejected",
    targetType: "AccountDeletionRequest",
    targetId: req.id,
    payload: { reason: parsed.data.note },
    level: "WARN",
  });

  await emitNotification({
    recipientUserId: req.userId,
    type: NotificationType.SYSTEM,
    vars: { systemKey: "account_deletion_rejected" },
    contextType: "AccountDeletionRequest",
    contextId: req.id,
  });

  revalidatePath("/[lang]/admin/account-deletions", "page");
  return { ok: true };
}
