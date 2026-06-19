"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AdminScope,
  MarketplaceProductStatus,
  NotificationType,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";

/**
 * Admin-side overrides on marketplace listings — partner items #1 + #2.
 *
 *   - `adminBlockProductAction(productId, reason)`
 *     Temporarily hides a listing from buyers without archiving it.
 *     The factory keeps ownership and can remediate; once admin
 *     unblocks, the listing returns to its prior status. A non-empty
 *     reason is mandatory so the factory knows what to fix.
 *
 *   - `adminUnblockProductAction(productId)`
 *     Clears the block; listing returns to its previous status.
 *
 *   - `adminDeleteProductAction(productId)`
 *     Hard-archives the listing (sets status=ARCHIVED). Same effect
 *     as the factory's archive but reachable from the admin queue.
 *
 * Edit power is exposed via the existing factory edit form — admin
 * impersonates the factory through the standard /admin/marketplace
 * detail route, which we'll wire by reusing the create/update path
 * server-side once the form-action layer is in place. For v1 we
 * surface block / unblock / delete as the high-leverage controls.
 */

export type AdminMarketplaceResult =
  | { ok: true }
  | { ok: false; error: string };

const BlockSchema = z.object({
  reason: z.string().trim().min(10).max(500),
});

export async function adminBlockProductAction(
  productId: string,
  reason: string,
): Promise<AdminMarketplaceResult> {
  const admin = await requireAdminScope(AdminScope.MARKETPLACE);
  const parsed = BlockSchema.safeParse({ reason });
  if (!parsed.success) {
    return {
      ok: false,
      error:
        "Please provide a clear blocking reason (10–500 characters).",
    };
  }

  const product = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: {
      id: true,
      reference: true,
      status: true,
      blockedAt: true,
      factoryOrgId: true,
    },
  });
  if (!product) return { ok: false, error: "Listing not found." };
  if (product.status === MarketplaceProductStatus.ARCHIVED) {
    return { ok: false, error: "Archived listings can't be blocked." };
  }
  if (product.blockedAt) {
    return { ok: false, error: "This listing is already blocked." };
  }

  await prisma.marketplaceProduct.update({
    where: { id: product.id },
    data: {
      blockedAt: new Date(),
      blockReason: parsed.data.reason,
    },
  });
  await writeAuditLog({
    actorUserId: admin.id,
    action: "marketplace.product_blocked",
    targetType: "MarketplaceProduct",
    targetId: product.id,
    payload: { reference: product.reference, reason: parsed.data.reason },
    level: "WARN",
  });

  // Notify factory owners.
  const owners = await prisma.user.findMany({
    where: {
      organizationId: product.factoryOrgId,
      role: Role.FACTORY,
      deletedAt: null,
    },
    select: { id: true },
  });
  await emitNotificationToMany(
    owners.map((u) => u.id),
    {
      type: NotificationType.SYSTEM,
      vars: {
        systemKey: "marketplace_listing_blocked",
        reference: product.reference,
      },
      contextType: "MarketplaceProduct",
      contextId: product.id,
    },
  );

  revalidatePath("/[lang]/admin/marketplace", "page");
  revalidatePath("/[lang]/factory/catalogue", "page");
  return { ok: true };
}

export async function adminUnblockProductAction(
  productId: string,
): Promise<AdminMarketplaceResult> {
  const admin = await requireAdminScope(AdminScope.MARKETPLACE);
  const product = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: { id: true, reference: true, blockedAt: true, factoryOrgId: true },
  });
  if (!product) return { ok: false, error: "Listing not found." };
  if (!product.blockedAt) {
    return { ok: false, error: "This listing isn't blocked." };
  }

  await prisma.marketplaceProduct.update({
    where: { id: product.id },
    data: { blockedAt: null, blockReason: null },
  });
  await writeAuditLog({
    actorUserId: admin.id,
    action: "marketplace.product_unblocked",
    targetType: "MarketplaceProduct",
    targetId: product.id,
    payload: { reference: product.reference },
  });

  const owners = await prisma.user.findMany({
    where: {
      organizationId: product.factoryOrgId,
      role: Role.FACTORY,
      deletedAt: null,
    },
    select: { id: true },
  });
  await emitNotificationToMany(
    owners.map((u) => u.id),
    {
      type: NotificationType.SYSTEM,
      vars: {
        systemKey: "marketplace_listing_unblocked",
        reference: product.reference,
      },
      contextType: "MarketplaceProduct",
      contextId: product.id,
    },
  );

  revalidatePath("/[lang]/admin/marketplace", "page");
  revalidatePath("/[lang]/factory/catalogue", "page");
  return { ok: true };
}

export async function adminDeleteProductAction(
  productId: string,
): Promise<AdminMarketplaceResult> {
  const admin = await requireAdminScope(AdminScope.MARKETPLACE);
  const product = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: { id: true, reference: true, status: true, factoryOrgId: true },
  });
  if (!product) return { ok: false, error: "Listing not found." };
  if (product.status === MarketplaceProductStatus.ARCHIVED) {
    return { ok: false, error: "Already archived." };
  }

  await prisma.marketplaceProduct.update({
    where: { id: product.id },
    data: { status: MarketplaceProductStatus.ARCHIVED },
  });
  await writeAuditLog({
    actorUserId: admin.id,
    action: "marketplace.product_archived_by_admin",
    targetType: "MarketplaceProduct",
    targetId: product.id,
    payload: { reference: product.reference, prevStatus: product.status },
    level: "WARN",
  });

  const owners = await prisma.user.findMany({
    where: {
      organizationId: product.factoryOrgId,
      role: Role.FACTORY,
      deletedAt: null,
    },
    select: { id: true },
  });
  await emitNotificationToMany(
    owners.map((u) => u.id),
    {
      type: NotificationType.SYSTEM,
      vars: {
        systemKey: "marketplace_listing_archived_by_admin",
        reference: product.reference,
      },
      contextType: "MarketplaceProduct",
      contextId: product.id,
    },
  );

  revalidatePath("/[lang]/admin/marketplace", "page");
  revalidatePath("/[lang]/factory/catalogue", "page");
  return { ok: true };
}

/**
 * Pricing-v3 / Phase 2: mark a marketplace product as tested-and-approved.
 *
 * Distinct from the editorial `PENDING_REVIEW → PUBLISHED` review:
 *   - The status flow validates listing copy / images / metadata.
 *   - This flag confirms we have hands-on test of the physical product.
 *
 * Public marketplace queries filter on `testedAndApprovedAt IS NOT NULL`.
 * A product can be PUBLISHED yet unapproved; in that case it's visible to
 * the admin/factory but hidden from buyers until tested.
 *
 * Idempotent: re-running on an already-approved product is a no-op +
 * returns ok. An admin can revoke via the second argument `approve=false`,
 * which clears the timestamp + approver back to null.
 */
export async function adminMarkProductTestedAction(
  productId: string,
  approve: boolean = true,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdminScope(AdminScope.MARKETPLACE);

  const product = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: { id: true, reference: true, testedAndApprovedAt: true },
  });
  if (!product) return { ok: false, error: "Listing not found." };

  if (approve && product.testedAndApprovedAt) {
    return { ok: true };
  }
  if (!approve && !product.testedAndApprovedAt) {
    return { ok: true };
  }

  await prisma.marketplaceProduct.update({
    where: { id: product.id },
    data: {
      testedAndApprovedAt: approve ? new Date() : null,
      testedAndApprovedById: approve ? admin.id : null,
    },
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: approve
      ? "marketplace.product_tested_approved"
      : "marketplace.product_tested_revoked",
    targetType: "MarketplaceProduct",
    targetId: product.id,
    payload: { reference: product.reference },
    level: "WARN",
  });

  revalidatePath("/[lang]/admin/marketplace", "page");
  revalidatePath("/[lang]/marketplace", "page");
  revalidatePath("/[lang]/client/marketplace", "page");
  return { ok: true };
}

/**
 * Phase 2 — replace the marketplace test video for a product.
 *
 * One video per listing: any pre-existing MARKETPLACE_TEST_VIDEO
 * attachments on the same product are removed (DB + disk) before the
 * new file is stored. Files limited to mp4 / webm at the storage
 * layer; size cap is the standard upload limit.
 *
 * Admin scope: MARKETPLACE (same as edit / tested-approved). Audit
 * logged at WARN level — replacing the proof of test is a meaningful
 * operational event.
 */
export async function adminUploadTestVideoAction(
  productId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { rm } = await import("node:fs/promises");
  const { resolve, sep } = await import("node:path");
  const { AttachmentContext } = await import("@prisma/client");
  const { storeAttachments } = await import("@/lib/storage/attachments");

  const admin = await requireAdminScope(AdminScope.MARKETPLACE);

  const product = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: { id: true, reference: true },
  });
  if (!product) return { ok: false, error: "Listing not found." };

  const file = formData.get("video");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No video file provided." };
  }
  if (!/^video\/(mp4|webm)$/.test(file.type)) {
    return {
      ok: false,
      error: "Only MP4 or WebM video uploads are accepted.",
    };
  }

  // Drop any existing test videos for this listing first.
  const existing = await prisma.attachment.findMany({
    where: {
      contextType: AttachmentContext.MARKETPLACE_TEST_VIDEO,
      contextId: product.id,
    },
    select: { id: true, storageUrl: true },
  });
  if (existing.length > 0) {
    await prisma.attachment.deleteMany({
      where: { id: { in: existing.map((a) => a.id) } },
    });
    const UPLOADS_ROOT = resolve(process.cwd(), "uploads");
    for (const a of existing) {
      const path = resolve(process.cwd(), a.storageUrl);
      if (path.startsWith(UPLOADS_ROOT + sep)) {
        await rm(path, { force: true }).catch(() => {});
      }
    }
  }

  const { created, errors } = await storeAttachments({
    contextType: AttachmentContext.MARKETPLACE_TEST_VIDEO,
    contextId: product.id,
    uploaderId: admin.id,
    files: [file],
  });
  if (errors.length > 0 || created.length === 0) {
    return {
      ok: false,
      error: errors[0] ?? "Failed to store the video.",
    };
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: "marketplace.test_video_uploaded",
    targetType: "MarketplaceProduct",
    targetId: product.id,
    payload: {
      reference: product.reference,
      replacedCount: existing.length,
      attachmentId: created[0]?.id ?? null,
    },
    level: "WARN",
  });

  revalidatePath("/[lang]/admin/marketplace", "page");
  revalidatePath("/[lang]/marketplace", "page");
  revalidatePath("/[lang]/client/marketplace", "page");
  return { ok: true };
}
