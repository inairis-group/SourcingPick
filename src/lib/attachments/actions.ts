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
    // Either party can prune their own dispute-evidence uploads while
    // the dispute is still pre-resolution. After the admin's decision
    // the evidence is part of the audit trail — only admins can remove.
    case AttachmentContext.DISPUTE_EVIDENCE: {
      const dispute = await prisma.dispute.findUnique({
        where: { id: att.contextId },
        select: {
          status: true,
          order: { select: { clientOrgId: true, factoryOrgId: true } },
        },
      });
      if (!dispute) return false;
      if (dispute.status === "RESOLVED") return false;
      const orgMatch =
        user.organizationId === dispute.order.clientOrgId ||
        user.organizationId === dispute.order.factoryOrgId;
      return orgMatch;
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

/**
 * App-wide image delete — works on the three entities that carry their
 * own `images: String[]` column (rather than rows in the polymorphic
 * Attachment table):
 *
 *   - MarketplaceProduct (factory listings)
 *   - SourcingProduct (request wizard line items)
 *   - Auction
 *
 * The Attachment-table version above is for any media uploaded through
 * the AttachmentPicker; this is for the pre-existing image slots
 * embedded directly on the parent row.
 *
 * Permission:
 *   - SUPER admin or scope-MARKETPLACE / scope-REQUESTS, OR
 *   - the org that owns the parent row.
 *
 * Same status-flow rule as the edit action for MarketplaceProduct:
 *   PUBLISHED / OUT_OF_STOCK → PENDING_REVIEW on owner-side delete
 *   (admin delete preserves status — admin is authoritative).
 */
export type DeleteUploadedImageResult =
  | { ok: true }
  | { ok: false; error: string };

export type ImageEntity = "marketplaceProduct" | "sourcingProduct" | "auction";

export async function deleteUploadedImageAction(input: {
  entity: ImageEntity;
  entityId: string;
  index: number;
}): Promise<DeleteUploadedImageResult> {
  const user = await requireAuth();

  if (!Number.isInteger(input.index) || input.index < 0) {
    return { ok: false, error: "Invalid image index." };
  }

  switch (input.entity) {
    case "marketplaceProduct":
      return deleteMarketplaceImage(input.entityId, input.index, user);
    case "sourcingProduct":
      return deleteSourcingImage(input.entityId, input.index, user);
    case "auction":
      return deleteAuctionImage(input.entityId, input.index, user);
  }
}

async function deleteMarketplaceImage(
  productId: string,
  index: number,
  user: { id: string; role: Role; organizationId: string },
): Promise<DeleteUploadedImageResult> {
  const product = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: {
      id: true,
      images: true,
      status: true,
      factoryOrgId: true,
      reference: true,
    },
  });
  if (!product) return { ok: false, error: "Listing not found." };

  const isOwner = user.organizationId === product.factoryOrgId;
  const isAdmin = user.role === Role.ADMIN;
  if (!isOwner && !isAdmin) {
    return { ok: false, error: "You can't edit this listing." };
  }

  const urls = [...product.images];
  if (index >= urls.length) return { ok: false, error: "Image not found." };
  const removed = urls.splice(index, 1)[0];

  // Owner-side edits to a live listing bounce it back to PENDING_REVIEW
  // (consistent with updateProductAction). Admin edits stay live.
  const nextStatus =
    !isAdmin &&
    (product.status === "PUBLISHED" || product.status === "OUT_OF_STOCK")
      ? "PENDING_REVIEW"
      : product.status;

  await prisma.marketplaceProduct.update({
    where: { id: product.id },
    data: { images: urls, status: nextStatus },
  });
  await unlinkBestEffort(removed);
  await writeAuditLog({
    actorUserId: user.id,
    action: isAdmin
      ? "marketplace.product_image_deleted_by_admin"
      : "marketplace.product_image_deleted",
    targetType: "MarketplaceProduct",
    targetId: product.id,
    payload: { reference: product.reference, index, removed },
    level: isAdmin ? "WARN" : "INFO",
  });

  revalidatePath("/[lang]/factory/catalogue", "page");
  revalidatePath("/[lang]/admin/marketplace", "page");
  return { ok: true };
}

async function deleteSourcingImage(
  productLineId: string,
  index: number,
  user: { id: string; role: Role; organizationId: string },
): Promise<DeleteUploadedImageResult> {
  const line = await prisma.sourcingProduct.findUnique({
    where: { id: productLineId },
    select: {
      id: true,
      images: true,
      request: {
        select: { id: true, reference: true, clientOrgId: true, agentId: true },
      },
    },
  });
  if (!line) return { ok: false, error: "Product line not found." };

  const isClientOwner =
    user.organizationId === line.request.clientOrgId && user.role === Role.CLIENT;
  const isAgent =
    line.request.agentId === user.id && user.role === Role.AGENT;
  const isAdmin = user.role === Role.ADMIN;
  if (!isClientOwner && !isAgent && !isAdmin) {
    return { ok: false, error: "You can't edit this request." };
  }

  const urls = [...line.images];
  if (index >= urls.length) return { ok: false, error: "Image not found." };
  const removed = urls.splice(index, 1)[0];

  await prisma.sourcingProduct.update({
    where: { id: line.id },
    data: { images: urls },
  });
  await unlinkBestEffort(removed);
  await writeAuditLog({
    actorUserId: user.id,
    action: "sourcing.product_image_deleted",
    targetType: "SourcingProduct",
    targetId: line.id,
    payload: { requestRef: line.request.reference, index, removed },
  });

  revalidatePath("/[lang]/client/requests", "page");
  revalidatePath("/[lang]/agent/requests", "page");
  return { ok: true };
}

async function deleteAuctionImage(
  auctionId: string,
  index: number,
  user: { id: string; role: Role; organizationId: string },
): Promise<DeleteUploadedImageResult> {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    select: {
      id: true,
      images: true,
      status: true,
      factoryOrgId: true,
      reference: true,
    },
  });
  if (!auction) return { ok: false, error: "Auction not found." };

  const isOwner = user.organizationId === auction.factoryOrgId;
  const isAdmin = user.role === Role.ADMIN;
  if (!isOwner && !isAdmin) {
    return { ok: false, error: "You can't edit this auction." };
  }

  // Once bids are running the listing is frozen — image edits have to
  // happen before launch.
  if (
    auction.status === "ACTIVE" ||
    auction.status === "ENDED" ||
    auction.status === "SOLD"
  ) {
    return { ok: false, error: "Live or closed auctions can't be edited." };
  }

  const urls = [...auction.images];
  if (index >= urls.length) return { ok: false, error: "Image not found." };
  const removed = urls.splice(index, 1)[0];

  await prisma.auction.update({
    where: { id: auction.id },
    data: { images: urls },
  });
  await unlinkBestEffort(removed);
  await writeAuditLog({
    actorUserId: user.id,
    action: isAdmin
      ? "auction.image_deleted_by_admin"
      : "auction.image_deleted",
    targetType: "Auction",
    targetId: auction.id,
    payload: { reference: auction.reference, index, removed },
    level: isAdmin ? "WARN" : "INFO",
  });

  revalidatePath("/[lang]/factory/auctions", "page");
  revalidatePath("/[lang]/admin/auctions", "page");
  return { ok: true };
}

async function unlinkBestEffort(storageUrl: string | undefined) {
  if (!storageUrl) return;
  const target = resolve(process.cwd(), storageUrl);
  if (target.startsWith(UPLOADS_ROOT + sep)) {
    await rm(target, { force: true }).catch(() => {});
  }
}
