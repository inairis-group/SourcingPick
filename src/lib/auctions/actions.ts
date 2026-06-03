"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AuctionStatus,
  Category,
  Incoterm,
  KycStatus,
  LeadTimeUnit,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { StorageError, storeFile } from "@/lib/storage/local";
import { leadTimeToDays } from "@/lib/marketplace/lead-time";

/**
 * Auction CRUD + lifecycle actions (factory side).
 *
 * Phases:
 *   DRAFT → PENDING_REVIEW (factory submits) → ACTIVE (admin approves)
 *   DRAFT → DRAFT (factory edits)
 *   DRAFT → CANCELLED (factory deletes a draft)
 *   PENDING_REVIEW → REJECTED (admin rejects) — factory edits to bring
 *     back to DRAFT, can resubmit
 *
 * The factory must have VERIFIED KYC — same gate as marketplace listings.
 */

const AuctionInputSchema = z
  .object({
    title: z.string().trim().min(2, "Title is required.").max(200),
    category: z.enum(Category),
    description: z
      .string()
      .trim()
      .min(20, "Add at least 20 characters of description.")
      .max(8000),
    startingBidEur: z.coerce
      .number()
      .positive("Starting bid must be positive."),
    reserveEur: z
      .union([z.coerce.number().nonnegative(), z.literal("")])
      .optional(),
    buyNowEur: z
      .union([z.coerce.number().positive(), z.literal("")])
      .optional(),
    quantity: z.coerce
      .number()
      .int()
      .positive("Quantity must be positive."),
    moq: z.coerce.number().int().positive().default(1),
    leadTimeDays: z.coerce
      .number()
      .int()
      .positive("Lead time must be positive."),
    leadTimeUnit: z.enum(LeadTimeUnit).default(LeadTimeUnit.DAY),
    incoterm: z.enum(Incoterm),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .refine((d) => d.endsAt.getTime() > d.startsAt.getTime(), {
    path: ["endsAt"],
    message: "End must be after start.",
  })
  .refine((d) => d.endsAt.getTime() > Date.now(), {
    path: ["endsAt"],
    message: "End must be in the future.",
  })
  .refine(
    (d) =>
      typeof d.reserveEur !== "number" || d.reserveEur >= d.startingBidEur,
    {
      path: ["reserveEur"],
      message: "Reserve must be at least the starting bid.",
    },
  )
  .refine(
    (d) =>
      typeof d.buyNowEur !== "number" || d.buyNowEur > d.startingBidEur,
    {
      path: ["buyNowEur"],
      message: "Buy-now must be above the starting bid.",
    },
  );

export type AuctionActionState = {
  error?: string;
  auctionId?: string;
};

export type AuctionMutationResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createAuctionAction(
  _prev: AuctionActionState,
  formData: FormData,
): Promise<AuctionActionState> {
  const factory = await requireRole(Role.FACTORY);

  const org = await prisma.organization.findUnique({
    where: { id: factory.organizationId },
    select: { kycStatus: true },
  });
  if (org?.kycStatus !== KycStatus.VERIFIED) {
    return {
      error: "Your factory must complete KYC before listing auctions.",
    };
  }

  const parsed = AuctionInputSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const d = parsed.data;

  const reference = await generateUniqueReference("AUC");
  const startingBidCents = Math.round(d.startingBidEur * 100);
  const reserveCents =
    typeof d.reserveEur === "number" ? Math.round(d.reserveEur * 100) : null;
  const buyNowCents =
    typeof d.buyNowEur === "number" ? Math.round(d.buyNowEur * 100) : null;

  const auction = await prisma.auction.create({
    data: {
      reference,
      factoryOrgId: factory.organizationId,
      title: d.title,
      description: d.description,
      category: d.category,
      images: [],
      startingBidCents,
      reserveCents,
      buyNowCents,
      quantity: d.quantity,
      moq: d.moq,
      leadTimeDays: leadTimeToDays(d.leadTimeDays, d.leadTimeUnit),
      leadTimeUnit: d.leadTimeUnit,
      incoterm: d.incoterm,
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      status: AuctionStatus.DRAFT,
    },
    select: { id: true },
  });

  const storedUrls = await storeImagesFor(auction.id, formData);
  if (storedUrls.error) {
    await prisma.auction.delete({ where: { id: auction.id } });
    return { error: storedUrls.error };
  }
  if (storedUrls.urls.length > 0) {
    await prisma.auction.update({
      where: { id: auction.id },
      data: { images: storedUrls.urls },
    });
  }

  await writeAuditLog({
    actorUserId: factory.id,
    action: "auction.created",
    targetType: "Auction",
    targetId: auction.id,
    payload: { reference, title: d.title },
  });

  revalidatePath("/[lang]/factory/auctions", "page");
  return { auctionId: auction.id };
}

export async function updateAuctionAction(
  auctionId: string,
  _prev: AuctionActionState,
  formData: FormData,
): Promise<AuctionActionState> {
  const factory = await requireRole(Role.FACTORY);

  const existing = await prisma.auction.findFirst({
    where: {
      id: auctionId,
      factoryOrgId: factory.organizationId,
      deletedAt: null,
    },
    select: { id: true, status: true, images: true },
  });
  if (!existing) return { error: "Auction not found." };
  if (
    existing.status !== AuctionStatus.DRAFT &&
    existing.status !== AuctionStatus.REJECTED
  ) {
    return {
      error:
        "Live or pending auctions can't be edited — cancel it and create a new one.",
    };
  }

  const parsed = AuctionInputSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const d = parsed.data;

  const startingBidCents = Math.round(d.startingBidEur * 100);
  const reserveCents =
    typeof d.reserveEur === "number" ? Math.round(d.reserveEur * 100) : null;
  const buyNowCents =
    typeof d.buyNowEur === "number" ? Math.round(d.buyNowEur * 100) : null;

  // Append newly uploaded images to existing; cap at 6 like the marketplace
  // form. Treat the form as "add more" rather than "replace all" — easier
  // mental model for editing a draft.
  const newImages = await storeImagesFor(existing.id, formData, {
    keepExisting: existing.images,
  });
  if (newImages.error) return { error: newImages.error };

  await prisma.auction.update({
    where: { id: existing.id },
    data: {
      title: d.title,
      description: d.description,
      category: d.category,
      images: newImages.urls,
      startingBidCents,
      reserveCents,
      buyNowCents,
      quantity: d.quantity,
      moq: d.moq,
      leadTimeDays: leadTimeToDays(d.leadTimeDays, d.leadTimeUnit),
      leadTimeUnit: d.leadTimeUnit,
      incoterm: d.incoterm,
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      // Editing a REJECTED auction sends it back to DRAFT so the factory
      // reviews + resubmits.
      status:
        existing.status === AuctionStatus.REJECTED
          ? AuctionStatus.DRAFT
          : existing.status,
    },
  });

  await writeAuditLog({
    actorUserId: factory.id,
    action: "auction.updated",
    targetType: "Auction",
    targetId: existing.id,
  });

  revalidatePath("/[lang]/factory/auctions", "page");
  return { auctionId: existing.id };
}

export async function submitAuctionForReviewAction(
  auctionId: string,
): Promise<AuctionMutationResult> {
  const factory = await requireRole(Role.FACTORY);
  const existing = await prisma.auction.findFirst({
    where: {
      id: auctionId,
      factoryOrgId: factory.organizationId,
      deletedAt: null,
    },
    select: { id: true, status: true, images: true },
  });
  if (!existing) return { ok: false, error: "Auction not found." };
  if (
    existing.status !== AuctionStatus.DRAFT &&
    existing.status !== AuctionStatus.REJECTED
  ) {
    return { ok: false, error: "Only drafts can be submitted." };
  }
  if (existing.images.length === 0) {
    return {
      ok: false,
      error: "Add at least one photo before submitting for review.",
    };
  }

  await prisma.auction.update({
    where: { id: existing.id },
    data: { status: AuctionStatus.PENDING_REVIEW },
  });
  await writeAuditLog({
    actorUserId: factory.id,
    action: "auction.submitted_for_review",
    targetType: "Auction",
    targetId: existing.id,
  });
  revalidatePath("/[lang]/factory/auctions", "page");
  revalidatePath("/[lang]/admin/auctions", "page");
  return { ok: true };
}

export async function cancelAuctionDraftAction(
  auctionId: string,
): Promise<AuctionMutationResult> {
  const factory = await requireRole(Role.FACTORY);
  const existing = await prisma.auction.findFirst({
    where: {
      id: auctionId,
      factoryOrgId: factory.organizationId,
      deletedAt: null,
    },
    select: { id: true, status: true },
  });
  if (!existing) return { ok: false, error: "Auction not found." };
  if (
    existing.status !== AuctionStatus.DRAFT &&
    existing.status !== AuctionStatus.REJECTED &&
    existing.status !== AuctionStatus.PENDING_REVIEW
  ) {
    return {
      ok: false,
      error: "Only drafts or pending auctions can be cancelled.",
    };
  }
  await prisma.auction.update({
    where: { id: existing.id },
    data: { status: AuctionStatus.CANCELLED, deletedAt: new Date() },
  });
  await writeAuditLog({
    actorUserId: factory.id,
    action: "auction.cancelled",
    targetType: "Auction",
    targetId: existing.id,
  });
  revalidatePath("/[lang]/factory/auctions", "page");
  return { ok: true };
}

// ============================ Admin actions ============================

export async function approveAuctionAction(
  auctionId: string,
): Promise<AuctionMutationResult> {
  const admin = await requireRole(Role.ADMIN);
  const existing = await prisma.auction.findUnique({
    where: { id: auctionId },
    select: { id: true, status: true, reference: true },
  });
  if (!existing) return { ok: false, error: "Auction not found." };
  if (existing.status !== AuctionStatus.PENDING_REVIEW) {
    return { ok: false, error: "Only pending auctions can be approved." };
  }
  await prisma.auction.update({
    where: { id: existing.id },
    data: {
      status: AuctionStatus.ACTIVE,
      publishedAt: new Date(),
    },
  });
  await writeAuditLog({
    actorUserId: admin.id,
    action: "auction.approved",
    targetType: "Auction",
    targetId: existing.id,
    payload: { reference: existing.reference },
  });
  revalidatePath("/[lang]/admin/auctions", "page");
  revalidatePath("/[lang]/factory/auctions", "page");
  return { ok: true };
}

export async function rejectAuctionAction(
  auctionId: string,
  reason: string,
): Promise<AuctionMutationResult> {
  const admin = await requireRole(Role.ADMIN);
  const reasonClean = reason.trim().slice(0, 500);
  if (reasonClean.length < 5) {
    return { ok: false, error: "Give the factory at least a short reason." };
  }
  const existing = await prisma.auction.findUnique({
    where: { id: auctionId },
    select: { id: true, status: true },
  });
  if (!existing) return { ok: false, error: "Auction not found." };
  if (existing.status !== AuctionStatus.PENDING_REVIEW) {
    return { ok: false, error: "Only pending auctions can be rejected." };
  }
  await prisma.auction.update({
    where: { id: existing.id },
    data: {
      status: AuctionStatus.REJECTED,
      rejectionReason: reasonClean,
      rejectedAt: new Date(),
    },
  });
  await writeAuditLog({
    actorUserId: admin.id,
    action: "auction.rejected",
    targetType: "Auction",
    targetId: existing.id,
    payload: { reason: reasonClean },
  });
  revalidatePath("/[lang]/admin/auctions", "page");
  revalidatePath("/[lang]/factory/auctions", "page");
  return { ok: true };
}

// ============================ Helpers ============================

function readFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    startingBidEur: formData.get("startingBidEur"),
    reserveEur: formData.get("reserveEur") ?? "",
    buyNowEur: formData.get("buyNowEur") ?? "",
    quantity: formData.get("quantity"),
    moq: formData.get("moq") ?? "1",
    leadTimeDays: formData.get("leadTimeDays"),
    leadTimeUnit: formData.get("leadTimeUnit") ?? LeadTimeUnit.DAY,
    incoterm: formData.get("incoterm"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  };
}

async function storeImagesFor(
  auctionId: string,
  formData: FormData,
  opts?: { keepExisting?: string[] },
): Promise<{ urls: string[]; error?: string }> {
  const images = formData.getAll("images") as File[];
  const urls = [...(opts?.keepExisting ?? [])];
  for (let i = 0; i < images.length && urls.length < 6; i++) {
    const file = images[i];
    if (!file || file.size === 0) continue;
    try {
      const stored = await storeFile({
        scope: "marketplace",
        ownerId: auctionId,
        kindPrefix: `auction-image-${urls.length + 1}`,
        file,
      });
      urls.push(stored.storageUrl);
    } catch (e) {
      if (e instanceof StorageError) return { urls, error: e.message };
      throw e;
    }
  }
  return { urls };
}
