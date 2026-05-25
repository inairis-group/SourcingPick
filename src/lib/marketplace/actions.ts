"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import {
  Category,
  KycStatus,
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
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

// =============================================================
// Factory: create / update / delete / submit-for-review / archive
// =============================================================

const ProductInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(200),
  category: z.enum(Category),
  description: z.string().trim().min(20, "Add at least 20 characters of description.").max(4000),
  priceEur: z.coerce.number().positive("Price must be positive."),
  moq: z.coerce.number().int().nonnegative(),
  stockAvailable: z.coerce.number().int().nonnegative(),
  stockLowThreshold: z.union([z.coerce.number().int().nonnegative(), z.literal("")]).optional(),
  leadTimeDays: z.coerce.number().int().positive("Lead time must be positive."),
  certifications: z.string().trim().max(500).optional().or(z.literal("")),
});

const PLATFORM_MARKUP_BPS = 1200; // 12% — pricing-v2 buyer side

function computeClientPriceCents(priceCentsFactory: number): number {
  return Math.round(priceCentsFactory * (1 + PLATFORM_MARKUP_BPS / 10_000));
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
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const priceCentsFactory = Math.round(parsed.data.priceEur * 100);
  const priceCentsClient = computeClientPriceCents(priceCentsFactory);
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
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const priceCentsFactory = Math.round(parsed.data.priceEur * 100);
  const priceCentsClient = computeClientPriceCents(priceCentsFactory);

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
