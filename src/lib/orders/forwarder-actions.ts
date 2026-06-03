"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import {
  AttachmentContext,
  NotificationType,
  OrderStatus,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { storeAttachments } from "@/lib/storage/attachments";

/**
 * Forwarder magic-link upload (partner item #15).
 *
 * The factory generates a short-lived token for one of its orders. The
 * resulting magic URL — `/forwarder/upload/<token>` — lets the carrier
 * upload handoff photos that flow into the same ORDER_SHIPMENT_PROOF
 * attachment context the factory itself uses on the order page. The
 * forwarder doesn't see anything but the order summary + the dropzone,
 * and the token can be revoked any time.
 */

/** Default lifetime — long enough to share via WhatsApp/email and have the forwarder act. */
const DEFAULT_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export type CreateTokenResult =
  | {
      ok: true;
      token: string;
      tokenId: string;
      expiresAt: string;
    }
  | { ok: false; error: string };

/**
 * Factory generates a magic link for one of its orders. We reuse any
 * still-valid token on the same order so the factory can copy the link
 * again without flooding the table.
 */
export async function createForwarderUploadTokenAction(
  orderId: string,
  label: string,
): Promise<CreateTokenResult> {
  if (!orderId || typeof orderId !== "string") {
    return { ok: false, error: "Invalid order id." };
  }
  const cleanLabel = (label ?? "").trim().slice(0, 120);

  const factory = await requireRole(Role.FACTORY);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      reference: true,
      factoryOrgId: true,
      status: true,
      deletedAt: true,
    },
  });
  if (!order || order.deletedAt) {
    return { ok: false, error: "Order not found." };
  }
  if (order.factoryOrgId !== factory.organizationId) {
    return { ok: false, error: "This order isn't on your factory." };
  }
  // Forwarder magic links only make sense between deposit-paid and
  // delivery-confirmed. Outside that window the proof would be ignored.
  const allowed: OrderStatus[] = [
    OrderStatus.PREPARATION,
    OrderStatus.QC,
    OrderStatus.SHIPPED,
    OrderStatus.IN_TRANSIT,
  ];
  if (!allowed.includes(order.status)) {
    return {
      ok: false,
      error: "Forwarder links are only available once production has started.",
    };
  }

  // If a non-expired, non-revoked token already exists with the same
  // label, reuse it — the factory clicked "create" twice.
  const now = new Date();
  const existing = await prisma.forwarderUploadToken.findFirst({
    where: {
      orderId: order.id,
      revokedAt: null,
      expiresAt: { gt: now },
      label: cleanLabel.length > 0 ? cleanLabel : null,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, token: true, expiresAt: true },
  });
  if (existing) {
    return {
      ok: true,
      token: existing.token,
      tokenId: existing.id,
      expiresAt: existing.expiresAt.toISOString(),
    };
  }

  const token = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + DEFAULT_TTL_MS);

  const row = await prisma.forwarderUploadToken.create({
    data: {
      token,
      orderId: order.id,
      createdByUserId: factory.id,
      label: cleanLabel.length > 0 ? cleanLabel : null,
      expiresAt,
    },
    select: { id: true },
  });

  await writeAuditLog({
    actorUserId: factory.id,
    action: "forwarder.token_created",
    targetType: "Order",
    targetId: order.id,
    payload: { tokenId: row.id, label: cleanLabel, orderRef: order.reference },
  });

  revalidatePath("/[lang]/factory/orders/[id]", "page");

  return {
    ok: true,
    token,
    tokenId: row.id,
    expiresAt: expiresAt.toISOString(),
  };
}

export type RevokeTokenResult = { ok: true } | { ok: false; error: string };

export async function revokeForwarderUploadTokenAction(
  tokenId: string,
): Promise<RevokeTokenResult> {
  if (!tokenId) return { ok: false, error: "Invalid token id." };
  const factory = await requireRole(Role.FACTORY);

  const row = await prisma.forwarderUploadToken.findUnique({
    where: { id: tokenId },
    select: {
      id: true,
      revokedAt: true,
      order: {
        select: { id: true, reference: true, factoryOrgId: true },
      },
    },
  });
  if (!row) return { ok: false, error: "Token not found." };
  if (row.order.factoryOrgId !== factory.organizationId) {
    return { ok: false, error: "This token isn't on your factory's order." };
  }
  if (row.revokedAt) return { ok: true };

  await prisma.forwarderUploadToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });

  await writeAuditLog({
    actorUserId: factory.id,
    action: "forwarder.token_revoked",
    targetType: "Order",
    targetId: row.order.id,
    payload: { tokenId: row.id, orderRef: row.order.reference },
  });

  revalidatePath("/[lang]/factory/orders/[id]", "page");
  return { ok: true };
}

export type ForwarderUploadResult =
  | { ok: true; created: number; warnings?: string[] }
  | { ok: false; error: string };

/**
 * Public upload endpoint — no session required, the token is the auth.
 * Validates the token's window and live state, then writes each file as
 * an ORDER_SHIPMENT_PROOF attachment. Failure on individual files comes
 * back in `warnings` so a single bad photo doesn't block the whole batch.
 */
export async function uploadForwarderProofAction(
  formData: FormData,
): Promise<ForwarderUploadResult> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { ok: false, error: "Missing token." };
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { ok: false, error: "Pick at least one file to upload." };
  }

  const now = new Date();
  const tokenRow = await prisma.forwarderUploadToken.findUnique({
    where: { token },
    select: {
      id: true,
      orderId: true,
      revokedAt: true,
      expiresAt: true,
      order: {
        select: {
          id: true,
          reference: true,
          factoryOrgId: true,
          status: true,
          deletedAt: true,
        },
      },
    },
  });
  if (!tokenRow || tokenRow.order.deletedAt) {
    return { ok: false, error: "Link not found." };
  }
  if (tokenRow.revokedAt) {
    return { ok: false, error: "This link has been revoked." };
  }
  if (tokenRow.expiresAt < now) {
    return { ok: false, error: "This link has expired." };
  }

  const { created, errors } = await storeAttachments({
    contextType: AttachmentContext.ORDER_SHIPMENT_PROOF,
    contextId: tokenRow.orderId,
    uploaderId: null,
    files,
  });

  if (created.length === 0) {
    return {
      ok: false,
      error: errors[0] ?? "Could not upload any of the selected files.",
    };
  }

  await prisma.forwarderUploadToken.update({
    where: { id: tokenRow.id },
    data: {
      lastUsedAt: now,
      uploadCount: { increment: created.length },
    },
  });

  await writeAuditLog({
    action: "forwarder.proof_uploaded",
    targetType: "Order",
    targetId: tokenRow.orderId,
    payload: {
      tokenId: tokenRow.id,
      filesUploaded: created.length,
      filesFailed: errors.length,
      orderRef: tokenRow.order.reference,
    },
  });

  // Tell the factory + agent the forwarder dropped proofs. Buyers don't
  // need to know about every intermediate handoff — they'll see the
  // shipment update when the factory marks SHIPPED.
  const recipients = await prisma.user.findMany({
    where: {
      organizationId: tokenRow.order.factoryOrgId,
      role: Role.FACTORY,
      deletedAt: null,
    },
    select: { id: true },
  });
  if (recipients.length > 0) {
    await emitNotificationToMany(
      recipients.map((u) => u.id),
      {
        type: NotificationType.SYSTEM,
        vars: {
          systemKey: "forwarder_proof_uploaded",
          reference: tokenRow.order.reference,
        },
        contextType: "Order",
        contextId: tokenRow.orderId,
      },
    );
  }

  revalidatePath("/[lang]/factory/orders/[id]", "page");
  revalidatePath("/[lang]/client/orders/[id]", "page");

  return {
    ok: true,
    created: created.length,
    ...(errors.length > 0 ? { warnings: errors } : {}),
  };
}
