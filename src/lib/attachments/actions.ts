"use server";

import { rm } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { revalidatePath } from "next/cache";
import { AttachmentContext, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";

const UPLOADS_ROOT = resolve(process.cwd(), "uploads");

export type DeleteAttachmentResult = { ok: true } | { ok: false; error: string };

/**
 * Delete a single attachment (row + file on disk). Permission:
 *   - ADMIN always, OR
 *   - the uploader, OR
 *   - the owner of the parent context (factory for a marketplace product,
 *     client for a sourcing request). Messages + orders are NOT deletable
 *     through this action — a sent message's media is part of the record,
 *     and order attachments are operational artefacts.
 *
 * File removal is best-effort: if the row deletes but the unlink fails
 * (already gone, perms), we still report success — the authoritative
 * state is the DB row.
 */
export async function deleteAttachmentAction(
  attachmentId: string,
): Promise<DeleteAttachmentResult> {
  const user = await requireAuth();

  const att = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    select: {
      id: true,
      contextType: true,
      contextId: true,
      uploaderId: true,
      storageUrl: true,
    },
  });
  if (!att) return { ok: false, error: "Attachment not found." };

  const allowed = await canManage(att, user);
  if (!allowed) {
    return { ok: false, error: "You can't remove this attachment." };
  }

  await prisma.attachment.delete({ where: { id: att.id } });

  // Best-effort file unlink, guarded against path traversal.
  const target = resolve(process.cwd(), att.storageUrl);
  if (target.startsWith(UPLOADS_ROOT + sep)) {
    await rm(target, { force: true }).catch(() => {});
  }

  await writeAuditLog({
    actorUserId: user.id,
    action: "attachment.deleted",
    targetType: "Attachment",
    targetId: att.id,
    payload: { contextType: att.contextType, contextId: att.contextId },
  });

  // Revalidate the surfaces an attachment can live on.
  revalidatePath("/[lang]/factory/catalogue", "page");
  revalidatePath("/[lang]/client/requests", "page");
  revalidatePath("/[lang]/marketplace", "page");
  revalidatePath("/[lang]/client/marketplace", "page");
  return { ok: true };
}

async function canManage(
  att: {
    contextType: AttachmentContext;
    contextId: string;
    uploaderId: string | null;
  },
  user: { id: string; role: Role; organizationId: string },
): Promise<boolean> {
  if (user.role === Role.ADMIN) return true;
  if (att.uploaderId && att.uploaderId === user.id) return true;

  switch (att.contextType) {
    case AttachmentContext.MARKETPLACE_PRODUCT: {
      const product = await prisma.marketplaceProduct.findUnique({
        where: { id: att.contextId },
        select: { factoryOrgId: true },
      });
      return product?.factoryOrgId === user.organizationId;
    }
    case AttachmentContext.SOURCING_REQUEST: {
      const req = await prisma.sourcingRequest.findUnique({
        where: { id: att.contextId },
        select: { clientOrgId: true },
      });
      return req?.clientOrgId === user.organizationId;
    }
    // The factory uploaded the proof and can remove their own (typo,
    // wrong photo, etc.) until the order completes. After completion the
    // photos are part of the audit trail — only admins can prune.
    case AttachmentContext.ORDER_QC_PROOF:
    case AttachmentContext.ORDER_SHIPMENT_PROOF: {
      const order = await prisma.order.findUnique({
        where: { id: att.contextId },
        select: { factoryOrgId: true, status: true },
      });
      if (!order) return false;
      if (order.status === "COMPLETED" || order.status === "CANCELLED") {
        return false;
      }
      return order.factoryOrgId === user.organizationId;
    }
    // Messages, orders, and banners aren't deletable via this path.
    // Banner media is admin-managed (handled by deleteBannerAction) and
    // admins already short-circuit to true above.
    case AttachmentContext.MESSAGE:
    case AttachmentContext.ORDER:
    case AttachmentContext.MARKETPLACE_BANNER:
      return false;
  }
}
