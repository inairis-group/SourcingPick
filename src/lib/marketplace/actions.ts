"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import {
  AttachmentContext,
  Category,
  KycStatus,
  MarketplaceCondition,
  MarketplaceProductStatus,
  NotificationType,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { storeFile, StorageError } from "@/lib/storage/local";
import { storeAttachments } from "@/lib/storage/attachments";
import { applyBuyerMarkup } from "@/lib/orders/pricing";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

// =============================================================
// Factory: create / update / delete / submit-for-review / archive
// =============================================================

const ProductInputSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required.").max(200),
    category: z.enum(Category),
    description: z
      .string()
      .trim()
      .min(20, "Add at least 20 characters of description.")
      .max(4000),
    priceEur: z.coerce.number().positive("Price must be positive."),
    moq: z.coerce.number().int().nonnegative(),
    stockAvailable: z.coerce.number().int().nonnegative(),
    stockLowThreshold: z
      .union([z.coerce.number().int().nonnegative(), z.literal("")])
      .optional(),
    leadTimeDays: z.coerce.number().int().positive("Lead time must be positive."),
    certifications: z.string().trim().max(500).optional().or(z.literal("")),
    condition: z.enum(MarketplaceCondition).default(MarketplaceCondition.NEW),
    /// "Was" price (factory-side) — strikethrough is rendered against the
    /// client-side comparison after we apply the buyer markup, so both stay
    /// internally consistent (factory enters factory-net, buyer sees all-in).
    compareAtEur: z
      .union([z.coerce.number().positive(), z.literal("")])
      .optional(),
    /// Datetime-local input — empty string = no flash sale. We coerce a
    /// blank string to undefined so the action persists null in the DB.
    flashSaleEndsAt: z
      .union([z.coerce.date(), z.literal("")])
      .optional(),
  })
  .refine(
    (d) =>
      typeof d.compareAtEur !== "number" || d.compareAtEur > d.priceEur,
    {
      path: ["compareAtEur"],
      message: "The compare-at price must be higher than the sale price.",
    },
  )
  .refine(
    (d) =>
      !(d.flashSaleEndsAt instanceof Date) ||
      d.flashSaleEndsAt.getTime() > Date.now(),
    {
      path: ["flashSaleEndsAt"],
      message: "Flash sale end must be in the future.",
    },
  );

function computeClientPriceCents(priceCentsFactory: number): number {
  return applyBuyerMarkup(priceCentsFactory);
}

function parseCerts(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export type ProductActionState = {
  error?: string;
  productId?: string;
};

/**
 * Create a new MarketplaceProduct in DRAFT. The factory must have
 * VERIFIED KYC — listings from un-vetted factories don't ship.
 */
export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const factory = await requireRole(Role.FACTORY);

  const org = await prisma.organization.findUnique({
    where: { id: factory.organizationId },
    select: { kycStatus: true },
  });
  if (org?.kycStatus !== KycStatus.VERIFIED) {
    return { error: "Your factory must complete KYC before listing products." };
  }

  const parsed = ProductInputSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    priceEur: formData.get("priceEur"),
    moq: formData.get("moq") ?? "0",
    stockAvailable: formData.get("stockAvailable") ?? "0",
    stockLowThreshold: formData.get("stockLowThreshold") ?? "",
    leadTimeDays: formData.get("leadTimeDays"),
    certifications: formData.get("certifications") ?? "",
    condition: formData.get("condition") ?? MarketplaceCondition.NEW,
    compareAtEur: formData.get("compareAtEur") ?? "",
    flashSaleEndsAt: formData.get("flashSaleEndsAt") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const priceCentsFactory = Math.round(parsed.data.priceEur * 100);
  const priceCentsClient = computeClientPriceCents(priceCentsFactory);
  // compareAt is stored on the buyer side: the strikethrough the buyer
  // sees should be apples-to-apples with the displayed sale price.
  const compareAtCents =
    typeof parsed.data.compareAtEur === "number"
      ? applyBuyerMarkup(Math.round(parsed.data.compareAtEur * 100))
      : null;
  const flashSaleEndsAt =
    parsed.data.flashSaleEndsAt instanceof Date
      ? parsed.data.flashSaleEndsAt
      : null;
  const reference = await generateUniqueReference("MKT");

  const product = await prisma.marketplaceProduct.create({
    data: {
      reference,
      factoryOrgId: factory.organizationId,
      name: parsed.data.name,
      category: parsed.data.category,
      description: parsed.data.description,
      images: [],
      priceCentsFactory,
      priceCentsClient,
      compareAtCents,
      flashSaleEndsAt,
      condition: parsed.data.condition,
      moq: parsed.data.moq,
      stockAvailable: parsed.data.stockAvailable,
      stockLowThreshold:
        typeof parsed.data.stockLowThreshold === "number"
          ? parsed.data.stockLowThreshold
          : null,
      leadTimeDays: parsed.data.leadTimeDays,
      certifications: parseCerts(parsed.data.certifications),
      status: MarketplaceProductStatus.DRAFT,
    },
    select: { id: true },
  });

  // Handle uploaded images (if any) — write them and patch the row.
  const images = formData.getAll("images") as File[];
  const storedUrls: string[] = [];
  for (let i = 0; i < images.length && i < 6; i++) {
    const file = images[i];
    if (!file || file.size === 0) continue;
    try {
      const stored = await storeFile({
        scope: "marketplace",
        ownerId: product.id,
        kindPrefix: `image-${i + 1}`,
        file,
      });
      storedUrls.push(stored.storageUrl);
    } catch (e) {
      if (e instanceof StorageError) {
        return { error: e.message };
      }
      throw e;
    }
  }
  if (storedUrls.length > 0) {
    await prisma.marketplaceProduct.update({
      where: { id: product.id },
      data: { images: storedUrls },
    });
  }

  // Optional video / file attachments (alongside the dedicated images
  // column). Failures here don't fail product creation — the user just
  // needs to re-upload missing media on the edit screen.
  const mediaFiles = formData
    .getAll("attachments")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (mediaFiles.length > 0) {
    await storeAttachments({
      contextType: AttachmentContext.MARKETPLACE_PRODUCT,
      contextId: product.id,
      uploaderId: factory.id,
      files: mediaFiles,
    });
  }

  await writeAuditLog({
    actorUserId: factory.id,
    action: "marketplace.product_created",
    targetType: "MarketplaceProduct",
    targetId: product.id,
    payload: { reference, name: parsed.data.name },
  });

  revalidatePath("/[lang]/factory/catalogue", "page");
  return { productId: product.id };
}

/**
 * Update a DRAFT or REJECTED product. Once submitted for review (or
 * published), edits require archiving and re-creating — keeps the audit
 * trail clean and avoids accidentally editing live listings.
 */
export async function updateProductAction(
  productId: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const factory = await requireRole(Role.FACTORY);

  const existing = await prisma.marketplaceProduct.findFirst({
    where: { id: productId, factoryOrgId: factory.organizationId, deletedAt: null },
    select: { id: true, status: true, images: true },
  });
  if (!existing) return { error: "Product not found." };
  if (
    existing.status !== MarketplaceProductStatus.DRAFT &&
    existing.status !== MarketplaceProductStatus.REJECTED
  ) {
    return {
      error:
        "Live or pending listings can't be edited — archive it and create a new one.",
    };
  }

  const parsed = ProductInputSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    priceEur: formData.get("priceEur"),
    moq: formData.get("moq") ?? "0",
    stockAvailable: formData.get("stockAvailable") ?? "0",
    stockLowThreshold: formData.get("stockLowThreshold") ?? "",
    leadTimeDays: formData.get("leadTimeDays"),
    certifications: formData.get("certifications") ?? "",
    condition: formData.get("condition") ?? MarketplaceCondition.NEW,
    compareAtEur: formData.get("compareAtEur") ?? "",
    flashSaleEndsAt: formData.get("flashSaleEndsAt") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const priceCentsFactory = Math.round(parsed.data.priceEur * 100);
  const priceCentsClient = computeClientPriceCents(priceCentsFactory);
  const compareAtCents =
    typeof parsed.data.compareAtEur === "number"
      ? applyBuyerMarkup(Math.round(parsed.data.compareAtEur * 100))
      : null;
  const flashSaleEndsAt =
    parsed.data.flashSaleEndsAt instanceof Date
      ? parsed.data.flashSaleEndsAt
      : null;

  // Append any newly uploaded images to the existing array (up to 6 total).
  const newImages = formData.getAll("images") as File[];
  const storedUrls: string[] = [...existing.images];
  for (let i = 0; i < newImages.length && storedUrls.length < 6; i++) {
    const file = newImages[i];
    if (!file || file.size === 0) continue;
    try {
      const stored = await storeFile({
        scope: "marketplace",
        ownerId: existing.id,
        kindPrefix: `image-${storedUrls.length + 1}`,
        file,
      });
      storedUrls.push(stored.storageUrl);
    } catch (e) {
      if (e instanceof StorageError) return { error: e.message };
      throw e;
    }
  }

  await prisma.marketplaceProduct.update({
    where: { id: existing.id },
    data: {
      name: parsed.data.name,
      category: parsed.data.category,
      description: parsed.data.description,
      priceCentsFactory,
      priceCentsClient,
      compareAtCents,
      flashSaleEndsAt,
      condition: parsed.data.condition,
      moq: parsed.data.moq,
      stockAvailable: parsed.data.stockAvailable,
      stockLowThreshold:
        typeof parsed.data.stockLowThreshold === "number"
          ? parsed.data.stockLowThreshold
          : null,
      leadTimeDays: parsed.data.leadTimeDays,
      certifications: parseCerts(parsed.data.certifications),
      images: storedUrls,
      // Editing a REJECTED listing puts it back in DRAFT so the factory
      // can review their changes before resubmitting.
      status:
        existing.status === MarketplaceProductStatus.REJECTED
          ? MarketplaceProductStatus.DRAFT
          : existing.status,
    },
  });

  // Optional new video / file attachments (appended; the polymorphic
  // table doesn't replace existing attachments — to remove one the
  // factory uses the per-attachment delete endpoint, TBD).
  const mediaFiles = formData
    .getAll("attachments")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (mediaFiles.length > 0) {
    await storeAttachments({
      contextType: AttachmentContext.MARKETPLACE_PRODUCT,
      contextId: existing.id,
      uploaderId: factory.id,
      files: mediaFiles,
    });
  }

  await writeAuditLog({
    actorUserId: factory.id,
    action: "marketplace.product_updated",
    targetType: "MarketplaceProduct",
    targetId: existing.id,
  });

  revalidatePath("/[lang]/factory/catalogue", "page");
  return { productId: existing.id };
}

export type ProductMutationResult = { ok: true } | { ok: false; error: string };

export async function submitProductForReviewAction(
  productId: string,
): Promise<ProductMutationResult> {
  const factory = await requireRole(Role.FACTORY);
  const existing = await prisma.marketplaceProduct.findFirst({
    where: { id: productId, factoryOrgId: factory.organizationId, deletedAt: null },
    select: { id: true, status: true, images: true, reference: true },
  });
  if (!existing) return { ok: false, error: "Product not found." };
  if (existing.status !== MarketplaceProductStatus.DRAFT) {
    return { ok: false, error: "Only drafts can be submitted for review." };
  }
  if (existing.images.length === 0) {
    return {
      ok: false,
      error: "Add at least one image before submitting for review.",
    };
  }

  await prisma.marketplaceProduct.update({
    where: { id: existing.id },
    data: { status: MarketplaceProductStatus.PENDING_REVIEW },
  });
  await writeAuditLog({
    actorUserId: factory.id,
    action: "marketplace.product_submitted",
    targetType: "MarketplaceProduct",
    targetId: existing.id,
    payload: { reference: existing.reference },
  });

  // Notify admins so the moderation queue surfaces it.
  const adminIds = (
    await prisma.user.findMany({
      where: { role: Role.ADMIN, deletedAt: null },
      select: { id: true },
    })
  ).map((u) => u.id);
  await emitNotificationToMany(adminIds, {
    type: NotificationType.SYSTEM,
    vars: { title: existing.reference },
    contextType: "MarketplaceProduct",
    contextId: existing.id,
  });

  revalidatePath("/[lang]/factory/catalogue", "page");
  revalidatePath("/[lang]/admin/marketplace", "page");
  return { ok: true };
}

export async function archiveProductAction(
  productId: string,
): Promise<ProductMutationResult> {
  const factory = await requireRole(Role.FACTORY);
  const existing = await prisma.marketplaceProduct.findFirst({
    where: { id: productId, factoryOrgId: factory.organizationId, deletedAt: null },
    select: { id: true, status: true },
  });
  if (!existing) return { ok: false, error: "Product not found." };
  if (existing.status === MarketplaceProductStatus.ARCHIVED) {
    return { ok: false, error: "Already archived." };
  }

  await prisma.marketplaceProduct.update({
    where: { id: existing.id },
    data: { status: MarketplaceProductStatus.ARCHIVED },
  });
  await writeAuditLog({
    actorUserId: factory.id,
    action: "marketplace.product_archived",
    targetType: "MarketplaceProduct",
    targetId: existing.id,
  });
  revalidatePath("/[lang]/factory/catalogue", "page");
  return { ok: true };
}

// =============================================================
// Admin: create a listing on behalf of a factory.
//
// Same input as `createProductAction` plus a target `factoryOrgId`. The
// admin must pick a VERIFIED factory; the row is created as PENDING_REVIEW
// instead of DRAFT (skip the factory's review step — the admin's curation
// counts as the review). Audit log captures both the admin and the
// factory so the dual identity is auditable.
// =============================================================

export async function adminCreateProductAction(
  factoryOrgId: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const admin = await requireRole(Role.ADMIN);

  const org = await prisma.organization.findUnique({
    where: { id: factoryOrgId },
    select: { id: true, kycStatus: true, displayName: true },
  });
  if (!org) return { error: "Factory not found." };
  if (org.kycStatus !== KycStatus.VERIFIED) {
    return {
      error: `${org.displayName}'s KYC is not verified — can't publish a listing on their behalf.`,
    };
  }

  const parsed = ProductInputSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    priceEur: formData.get("priceEur"),
    moq: formData.get("moq") ?? "0",
    stockAvailable: formData.get("stockAvailable") ?? "0",
    stockLowThreshold: formData.get("stockLowThreshold") ?? "",
    leadTimeDays: formData.get("leadTimeDays"),
    certifications: formData.get("certifications") ?? "",
    condition: formData.get("condition") ?? MarketplaceCondition.NEW,
    compareAtEur: formData.get("compareAtEur") ?? "",
    flashSaleEndsAt: formData.get("flashSaleEndsAt") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const priceCentsFactory = Math.round(parsed.data.priceEur * 100);
  const priceCentsClient = computeClientPriceCents(priceCentsFactory);
  const compareAtCents =
    typeof parsed.data.compareAtEur === "number"
      ? applyBuyerMarkup(Math.round(parsed.data.compareAtEur * 100))
      : null;
  const flashSaleEndsAt =
    parsed.data.flashSaleEndsAt instanceof Date
      ? parsed.data.flashSaleEndsAt
      : null;
  const reference = await generateUniqueReference("MKT");

  const product = await prisma.marketplaceProduct.create({
    data: {
      reference,
      factoryOrgId: org.id,
      name: parsed.data.name,
      category: parsed.data.category,
      description: parsed.data.description,
      images: [],
      priceCentsFactory,
      priceCentsClient,
      compareAtCents,
      flashSaleEndsAt,
      condition: parsed.data.condition,
      moq: parsed.data.moq,
      stockAvailable: parsed.data.stockAvailable,
      stockLowThreshold:
        typeof parsed.data.stockLowThreshold === "number"
          ? parsed.data.stockLowThreshold
          : null,
      leadTimeDays: parsed.data.leadTimeDays,
      certifications: parseCerts(parsed.data.certifications),
      // Admin-created listings skip the factory-side draft step. They
      // still need to be approved, but that's an explicit admin click —
      // we don't auto-publish even when admin authored, to keep the
      // audit trail clean.
      status: MarketplaceProductStatus.PENDING_REVIEW,
    },
    select: { id: true },
  });

  // Images flow exactly like the factory path.
  const images = formData.getAll("images") as File[];
  const storedUrls: string[] = [];
  for (let i = 0; i < images.length && i < 6; i++) {
    const file = images[i];
    if (!file || file.size === 0) continue;
    try {
      const stored = await storeFile({
        scope: "marketplace",
        ownerId: product.id,
        kindPrefix: `image-${i + 1}`,
        file,
      });
      storedUrls.push(stored.storageUrl);
    } catch (e) {
      if (e instanceof StorageError) return { error: e.message };
      throw e;
    }
  }
  if (storedUrls.length > 0) {
    await prisma.marketplaceProduct.update({
      where: { id: product.id },
      data: { images: storedUrls },
    });
  }

  const mediaFiles = formData
    .getAll("attachments")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (mediaFiles.length > 0) {
    await storeAttachments({
      contextType: AttachmentContext.MARKETPLACE_PRODUCT,
      contextId: product.id,
      uploaderId: admin.id,
      files: mediaFiles,
    });
  }

  await writeAuditLog({
    actorUserId: admin.id,
    action: "marketplace.product_created_by_admin",
    targetType: "MarketplaceProduct",
    targetId: product.id,
    payload: {
      reference,
      name: parsed.data.name,
      onBehalfOfOrgId: org.id,
    },
    level: "WARN",
  });

  revalidatePath("/[lang]/admin/marketplace", "page");
  revalidatePath("/[lang]/factory/catalogue", "page");
  return { productId: product.id };
}

// =============================================================
// Promotion-only edit: set/clear flash sale + compare-at on a PUBLISHED
// listing without dropping it back to DRAFT.
// =============================================================

const PromotionInputSchema = z
  .object({
    compareAtEur: z
      .union([z.coerce.number().positive(), z.literal("")])
      .optional(),
    flashSaleEndsAt: z
      .union([z.coerce.date(), z.literal("")])
      .optional(),
  })
  .refine(
    (d) =>
      !(d.flashSaleEndsAt instanceof Date) ||
      d.flashSaleEndsAt.getTime() > Date.now(),
    {
      path: ["flashSaleEndsAt"],
      message: "Flash sale end must be in the future.",
    },
  );

export type PromotionActionState = {
  error?: string;
  saved?: boolean;
};

/**
 * Toggle the promotional fields (compareAtCents + flashSaleEndsAt) on a
 * PUBLISHED or OUT_OF_STOCK listing. Carved out from `updateProductAction`
 * because the latter restricts edits to DRAFT/REJECTED — factories
 * shouldn't have to archive + re-list just to run a flash sale.
 *
 * The base price, content, and stock are out of scope here on purpose:
 * changing those on a live listing breaks the implicit "what's on the
 * page is what got approved" contract.
 */
export async function setPromotionAction(
  productId: string,
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const factory = await requireRole(Role.FACTORY);

  const existing = await prisma.marketplaceProduct.findFirst({
    where: {
      id: productId,
      factoryOrgId: factory.organizationId,
      deletedAt: null,
    },
    select: { id: true, status: true, priceCentsClient: true },
  });
  if (!existing) return { error: "Product not found." };
  if (
    existing.status !== MarketplaceProductStatus.PUBLISHED &&
    existing.status !== MarketplaceProductStatus.OUT_OF_STOCK
  ) {
    return {
      error:
        "Promotions can only be set on live (published) listings. Drafts use the main edit form.",
    };
  }

  const parsed = PromotionInputSchema.safeParse({
    compareAtEur: formData.get("compareAtEur") ?? "",
    flashSaleEndsAt: formData.get("flashSaleEndsAt") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const compareAtCents =
    typeof parsed.data.compareAtEur === "number"
      ? applyBuyerMarkup(Math.round(parsed.data.compareAtEur * 100))
      : null;
  if (
    compareAtCents !== null &&
    compareAtCents <= existing.priceCentsClient
  ) {
    return {
      error: "The compare-at price must be higher than the current sale price.",
    };
  }
  const flashSaleEndsAt =
    parsed.data.flashSaleEndsAt instanceof Date
      ? parsed.data.flashSaleEndsAt
      : null;

  await prisma.marketplaceProduct.update({
    where: { id: existing.id },
    data: { compareAtCents, flashSaleEndsAt },
  });

  await writeAuditLog({
    actorUserId: factory.id,
    action: "marketplace.promotion_updated",
    targetType: "MarketplaceProduct",
    targetId: existing.id,
    payload: {
      compareAtCents,
      flashSaleEndsAt: flashSaleEndsAt?.toISOString() ?? null,
    },
  });

  revalidatePath("/[lang]/factory/catalogue", "page");
  revalidatePath(`/[lang]/factory/catalogue/${existing.id}`, "page");
  revalidatePath("/[lang]/marketplace", "page");
  revalidatePath("/[lang]/client/marketplace", "page");
  return { saved: true };
}

// =============================================================
// Admin: approve / reject pending listings
// =============================================================

export async function approveProductAction(
  productId: string,
): Promise<ProductMutationResult> {
  const admin = await requireRole(Role.ADMIN);
  const existing = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: { id: true, status: true, factoryOrgId: true, reference: true },
  });
  if (!existing) return { ok: false, error: "Product not found." };
  if (existing.status !== MarketplaceProductStatus.PENDING_REVIEW) {
    return { ok: false, error: "This product isn't pending review." };
  }

  await prisma.marketplaceProduct.update({
    where: { id: existing.id },
    data: {
      status: MarketplaceProductStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });
  await writeAuditLog({
    actorUserId: admin.id,
    action: "marketplace.product_approved",
    targetType: "MarketplaceProduct",
    targetId: existing.id,
    payload: { reference: existing.reference },
    level: "WARN",
  });

  const factoryOwners = (
    await prisma.user.findMany({
      where: {
        organizationId: existing.factoryOrgId,
        role: Role.FACTORY,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);
  await emitNotificationToMany(factoryOwners, {
    type: NotificationType.SYSTEM,
    vars: { title: `${existing.reference} publié` },
    contextType: "MarketplaceProduct",
    contextId: existing.id,
  });

  revalidatePath("/[lang]/admin/marketplace", "page");
  revalidatePath("/[lang]/factory/catalogue", "page");
  revalidatePath("/[lang]/marketplace", "page");
  return { ok: true };
}

const RejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters.")
    .max(500),
});

export async function rejectProductAction(
  productId: string,
  reason: string,
): Promise<ProductMutationResult> {
  const parsed = RejectSchema.safeParse({ reason });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const admin = await requireRole(Role.ADMIN);
  const existing = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: { id: true, status: true, factoryOrgId: true, reference: true },
  });
  if (!existing) return { ok: false, error: "Product not found." };
  if (existing.status !== MarketplaceProductStatus.PENDING_REVIEW) {
    return { ok: false, error: "This product isn't pending review." };
  }

  await prisma.marketplaceProduct.update({
    where: { id: existing.id },
    data: { status: MarketplaceProductStatus.REJECTED },
  });
  await writeAuditLog({
    actorUserId: admin.id,
    action: "marketplace.product_rejected",
    targetType: "MarketplaceProduct",
    targetId: existing.id,
    payload: { reference: existing.reference, reason: parsed.data.reason },
    level: "ALERT",
  });

  const factoryOwners = (
    await prisma.user.findMany({
      where: {
        organizationId: existing.factoryOrgId,
        role: Role.FACTORY,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);
  await emitNotificationToMany(factoryOwners, {
    type: NotificationType.SYSTEM,
    vars: { title: `${existing.reference} refusé` },
    contextType: "MarketplaceProduct",
    contextId: existing.id,
  });

  revalidatePath("/[lang]/admin/marketplace", "page");
  revalidatePath("/[lang]/factory/catalogue", "page");
  return { ok: true };
}

// Lint helper: keep currentLocale for future use (i18n in error messages).
export async function _currentLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}
