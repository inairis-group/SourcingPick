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
