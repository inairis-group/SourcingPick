"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { KycStatus, NotificationType, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";

async function notifyFactoryOfKyc(
  organizationId: string,
  status: KycStatus,
): Promise<void> {
  const owners = await prisma.user.findMany({
    where: {
      organizationId,
      role: Role.FACTORY,
      deletedAt: null,
    },
    select: { id: true },
  });
  if (owners.length === 0) return;
  await emitNotificationToMany(
    owners.map((u) => u.id),
    {
      type: NotificationType.KYC_DECISION,
      vars: { status },
      contextType: "Organization",
      contextId: organizationId,
    },
  );
}

const RejectFlagSchema = z.object({
  organizationId: z.string().min(1),
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters.")
    .max(500),
});

const IdSchema = z.object({
  organizationId: z.string().min(1),
});

export type KycActionResult = { ok: true } | { ok: false; error: string };

export async function approveKycAction(
  organizationId: string,
): Promise<KycActionResult> {
  const parsed = IdSchema.safeParse({ organizationId });
  if (!parsed.success) return { ok: false, error: "Invalid organisation." };

  const admin = await requireRole(Role.ADMIN);

  const org = await prisma.organization.findUnique({
    where: { id: parsed.data.organizationId },
    select: { id: true, kycStatus: true },
  });
  if (!org) return { ok: false, error: "Organisation not found." };
  if (org.kycStatus === KycStatus.VERIFIED) {
    return { ok: false, error: "Already verified." };
  }

  await prisma.organization.update({
    where: { id: org.id },
    data: { kycStatus: KycStatus.VERIFIED, kycVerifiedAt: new Date() },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "kyc.validated",
    targetType: "Organization",
    targetId: org.id,
    level: "WARN",
  });

  await notifyFactoryOfKyc(org.id, KycStatus.VERIFIED);

  revalidatePath("/[lang]/admin/kyc", "page");
  return { ok: true };
}

export async function rejectKycAction(
  organizationId: string,
  reason: string,
): Promise<KycActionResult> {
  const parsed = RejectFlagSchema.safeParse({ organizationId, reason });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const admin = await requireRole(Role.ADMIN);

  const org = await prisma.organization.findUnique({
    where: { id: parsed.data.organizationId },
    select: { id: true },
  });
  if (!org) return { ok: false, error: "Organisation not found." };

  await prisma.organization.update({
    where: { id: org.id },
    data: { kycStatus: KycStatus.REJECTED },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "kyc.rejected",
    targetType: "Organization",
    targetId: org.id,
    payload: { reason: parsed.data.reason },
    level: "ALERT",
  });

  await notifyFactoryOfKyc(org.id, KycStatus.REJECTED);

  revalidatePath("/[lang]/admin/kyc", "page");
  return { ok: true };
}

export async function flagKycAction(
  organizationId: string,
  reason: string,
): Promise<KycActionResult> {
  const parsed = RejectFlagSchema.safeParse({ organizationId, reason });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const admin = await requireRole(Role.ADMIN);

  const org = await prisma.organization.findUnique({
    where: { id: parsed.data.organizationId },
    select: { id: true },
  });
  if (!org) return { ok: false, error: "Organisation not found." };

  await prisma.organization.update({
    where: { id: org.id },
    data: { kycStatus: KycStatus.FLAGGED },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "kyc.flagged",
    targetType: "Organization",
    targetId: org.id,
    payload: { reason: parsed.data.reason },
    level: "ALERT",
  });

  await notifyFactoryOfKyc(org.id, KycStatus.FLAGGED);

  revalidatePath("/[lang]/admin/kyc", "page");
  return { ok: true };
}
