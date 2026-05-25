"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  CertificationBody,
  CertificationStatus,
  KycStatus,
  NotificationType,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotification, emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";

// =============================================================
// Factory: enroll / withdraw
// =============================================================

const EnrollSchema = z.object({
  standard: z
    .string()
    .trim()
    .min(2, "Standard name is required.")
    .max(120),
  body: z.enum(CertificationBody),
  targetMonths: z.coerce
    .number()
    .int()
    .min(1)
    .max(24)
    .optional(),
});

export type EnrollResult =
  | { ok: true; certificationId: string; reference: string }
  | { ok: false; error: string };

/**
 * Factory enrolls in a new certification programme. Status starts at
 * DOSSIER and a notification fans out to admins (who'll move it through
 * the AUDIT_PROGRAMME → EN_COURS → CERTIFIE pipeline).
 */
export async function enrollCertificationAction(
  formData: FormData,
): Promise<EnrollResult> {
  const user = await requireRole(Role.FACTORY);

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { kycStatus: true },
  });
  if (org?.kycStatus !== KycStatus.VERIFIED) {
    return {
      ok: false,
      error:
        "Complete KYC before enrolling in a certification programme — the audit bodies require a verified entity.",
    };
  }

  const parsed = EnrollSchema.safeParse({
    standard: formData.get("standard"),
    body: formData.get("body"),
    targetMonths: formData.get("targetMonths") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Block duplicates: one in-flight enrollment per (standard, body, factory).
  const existing = await prisma.certification.findFirst({
    where: {
      factoryOrgId: user.organizationId,
      standard: parsed.data.standard,
      body: parsed.data.body,
      status: {
        in: [
          CertificationStatus.DOSSIER,
          CertificationStatus.AUDIT_PROGRAMME,
          CertificationStatus.EN_COURS,
        ],
      },
    },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      error: "You already have an active enrollment for this standard and body.",
    };
  }

  const reference = await generateUniqueReference("CERT");
  const etaDate = parsed.data.targetMonths
    ? new Date(Date.now() + parsed.data.targetMonths * 30 * 24 * 60 * 60 * 1000)
    : null;

  const cert = await prisma.certification.create({
    data: {
      reference,
      factoryOrgId: user.organizationId,
      standard: parsed.data.standard,
      body: parsed.data.body,
      status: CertificationStatus.DOSSIER,
      progress: 5,
      etaDate,
    },
    select: { id: true, reference: true },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "certification.enrolled",
    targetType: "Certification",
    targetId: cert.id,
    payload: { reference: cert.reference, standard: parsed.data.standard, body: parsed.data.body },
  });

  // Notify admins.
  const adminIds = (
    await prisma.user.findMany({
      where: { role: Role.ADMIN, deletedAt: null },
      select: { id: true },
    })
  ).map((u) => u.id);
  await emitNotificationToMany(adminIds, {
    type: NotificationType.CERT_UPDATE,
    vars: { title: `${cert.reference} · ${parsed.data.standard}` },
    contextType: "Certification",
    contextId: cert.id,
  });

  revalidatePath("/[lang]/factory/certification", "page");
  revalidatePath("/[lang]/admin/certifications", "page");
  return { ok: true, certificationId: cert.id, reference: cert.reference };
}

export type CertMutationResult = { ok: true } | { ok: false; error: string };

export async function withdrawCertificationAction(
  certificationId: string,
): Promise<CertMutationResult> {
  const user = await requireRole(Role.FACTORY);
  const cert = await prisma.certification.findFirst({
    where: { id: certificationId, factoryOrgId: user.organizationId },
    select: { id: true, status: true, reference: true },
  });
  if (!cert) return { ok: false, error: "Certification not found." };
  if (
    cert.status !== CertificationStatus.DOSSIER &&
    cert.status !== CertificationStatus.AUDIT_PROGRAMME
  ) {
    return {
      ok: false,
      error: "You can only withdraw before the audit has started.",
    };
  }

  await prisma.certification.update({
    where: { id: cert.id },
    data: { status: CertificationStatus.REFUSE },
  });
  await writeAuditLog({
    actorUserId: user.id,
    action: "certification.withdrawn",
    targetType: "Certification",
    targetId: cert.id,
    payload: { reference: cert.reference },
  });
  revalidatePath("/[lang]/factory/certification", "page");
  revalidatePath("/[lang]/admin/certifications", "page");
  return { ok: true };
}

// =============================================================
// Admin: advance stages, set dates, issue certificate
// =============================================================

const AdvanceSchema = z.object({
  certificationId: z.string().min(1),
  nextStatus: z.enum(CertificationStatus),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  preAuditDate: z.union([z.coerce.date(), z.literal("")]).optional(),
  auditDate: z.union([z.coerce.date(), z.literal("")]).optional(),
  etaDate: z.union([z.coerce.date(), z.literal("")]).optional(),
  certificateUrl: z
    .union([z.url().max(500), z.literal("")])
    .optional(),
  issuedAt: z.union([z.coerce.date(), z.literal("")]).optional(),
  expiresAt: z.union([z.coerce.date(), z.literal("")]).optional(),
});

/**
 * Allowed forward transitions. REFUSE is reachable from any non-terminal
 * state. Once CERTIFIE we don't allow stage moves — the cert is closed
 * and revocation lives in a follow-up flow.
 */
const ALLOWED_TRANSITIONS: Record<
  CertificationStatus,
  CertificationStatus[]
> = {
  DOSSIER: [
    CertificationStatus.AUDIT_PROGRAMME,
    CertificationStatus.REFUSE,
  ],
  AUDIT_PROGRAMME: [
    CertificationStatus.EN_COURS,
    CertificationStatus.REFUSE,
  ],
  EN_COURS: [CertificationStatus.CERTIFIE, CertificationStatus.REFUSE],
  CERTIFIE: [],
  REFUSE: [],
};

export async function advanceCertificationAction(
  formData: FormData,
): Promise<CertMutationResult> {
  const admin = await requireRole(Role.ADMIN);

  const parsed = AdvanceSchema.safeParse({
    certificationId: formData.get("certificationId"),
    nextStatus: formData.get("nextStatus"),
    progress: formData.get("progress") || undefined,
    preAuditDate: formData.get("preAuditDate") || "",
    auditDate: formData.get("auditDate") || "",
    etaDate: formData.get("etaDate") || "",
    certificateUrl: formData.get("certificateUrl") || "",
    issuedAt: formData.get("issuedAt") || "",
    expiresAt: formData.get("expiresAt") || "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const cert = await prisma.certification.findUnique({
    where: { id: parsed.data.certificationId },
    select: { id: true, status: true, factoryOrgId: true, reference: true, standard: true },
  });
  if (!cert) return { ok: false, error: "Certification not found." };

  if (!ALLOWED_TRANSITIONS[cert.status].includes(parsed.data.nextStatus)) {
    return {
      ok: false,
      error: `Transition ${cert.status} → ${parsed.data.nextStatus} isn't allowed.`,
    };
  }

  const data: Record<string, unknown> = { status: parsed.data.nextStatus };
  if (parsed.data.progress !== undefined) data.progress = parsed.data.progress;
  if (parsed.data.preAuditDate instanceof Date)
    data.preAuditDate = parsed.data.preAuditDate;
  if (parsed.data.auditDate instanceof Date)
    data.auditDate = parsed.data.auditDate;
  if (parsed.data.etaDate instanceof Date) data.etaDate = parsed.data.etaDate;

  if (parsed.data.nextStatus === CertificationStatus.CERTIFIE) {
    if (
      !(parsed.data.certificateUrl) ||
      !(parsed.data.issuedAt instanceof Date) ||
      !(parsed.data.expiresAt instanceof Date)
    ) {
      return {
        ok: false,
        error:
          "Certificate URL, issue date and expiry date are required to mark as certified.",
      };
    }
    data.certificateUrl = parsed.data.certificateUrl;
    data.issuedAt = parsed.data.issuedAt;
    data.expiresAt = parsed.data.expiresAt;
    data.progress = 100;
  }

  // Auto-bump progress on stage advances if not provided explicitly.
  if (parsed.data.progress === undefined) {
    if (parsed.data.nextStatus === CertificationStatus.AUDIT_PROGRAMME)
      data.progress = 30;
    if (parsed.data.nextStatus === CertificationStatus.EN_COURS)
      data.progress = 70;
  }

  await prisma.certification.update({
    where: { id: cert.id },
    data,
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "certification.advanced",
    targetType: "Certification",
    targetId: cert.id,
    payload: {
      reference: cert.reference,
      from: cert.status,
      to: parsed.data.nextStatus,
    },
    level: "WARN",
  });

  // Notify the factory's owners on every transition.
  const factoryOwnerIds = (
    await prisma.user.findMany({
      where: {
        organizationId: cert.factoryOrgId,
        role: Role.FACTORY,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);
  await emitNotificationToMany(factoryOwnerIds, {
    type: NotificationType.CERT_UPDATE,
    vars: { title: `${cert.reference} · ${cert.standard}` },
    contextType: "Certification",
    contextId: cert.id,
  });

  revalidatePath("/[lang]/admin/certifications", "page");
  revalidatePath("/[lang]/factory/certification", "page");
  return { ok: true };
}

// =============================================================
// Client sponsorship: a buyer underwrites a factory certification
// =============================================================

export async function sponsorCertificationAction(
  certificationId: string,
): Promise<CertMutationResult> {
  const user = await requireRole(Role.CLIENT);
  const cert = await prisma.certification.findUnique({
    where: { id: certificationId },
    select: {
      id: true,
      status: true,
      sponsorClientOrgId: true,
      factoryOrgId: true,
      reference: true,
    },
  });
  if (!cert) return { ok: false, error: "Certification not found." };
  if (cert.sponsorClientOrgId) {
    return { ok: false, error: "This certification already has a sponsor." };
  }
  if (
    cert.status === CertificationStatus.CERTIFIE ||
    cert.status === CertificationStatus.REFUSE
  ) {
    return {
      ok: false,
      error: "This certification is closed and can't accept sponsorship.",
    };
  }

  await prisma.certification.update({
    where: { id: cert.id },
    data: { sponsorClientOrgId: user.organizationId },
  });
  await writeAuditLog({
    actorUserId: user.id,
    action: "certification.sponsored",
    targetType: "Certification",
    targetId: cert.id,
    payload: { reference: cert.reference, clientOrgId: user.organizationId },
  });

  // Notify factory + admins (admins pick up sponsor commitments in their queue).
  const factoryOwnerIds = (
    await prisma.user.findMany({
      where: {
        organizationId: cert.factoryOrgId,
        role: Role.FACTORY,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);
  await emitNotificationToMany(factoryOwnerIds, {
    type: NotificationType.CERT_UPDATE,
    vars: { title: `${cert.reference} · sponsorship secured` },
    contextType: "Certification",
    contextId: cert.id,
  });

  const adminIds = (
    await prisma.user.findMany({
      where: { role: Role.ADMIN, deletedAt: null },
      select: { id: true },
    })
  ).map((u) => u.id);
  for (const aid of adminIds) {
    await emitNotification({
      recipientUserId: aid,
      type: NotificationType.CERT_UPDATE,
      vars: { title: `${cert.reference} sponsored` },
      contextType: "Certification",
      contextId: cert.id,
    });
  }

  revalidatePath("/[lang]/client/certifications", "page");
  revalidatePath("/[lang]/factory/certification", "page");
  revalidatePath("/[lang]/admin/certifications", "page");
  return { ok: true };
}
