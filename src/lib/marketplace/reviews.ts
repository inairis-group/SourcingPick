"use server";

import { revalidatePath } from "next/cache";
import {
  MarketplaceProductStatus,
  OrderStatus,
  ReviewStatus,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth, requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Marketplace reviews.
 *
 * Two rules shape everything here:
 *
 *  1. **Nothing publishes unseen.** Reviews land PENDING. A single libellous or
 *     retaliatory review on a factory's listing is a legal problem for us, not
 *     just a bad look, so a human clears every one.
 *  2. **Aggregates never drift.** `ratingCount`/`ratingSum` on the product are
 *     denormalised for cheap card rendering, and are only ever recomputed
 *     inside the same transaction that changes a review's published state.
 *     Incrementing them by hand at each call site is how these go wrong.
 */

/** Recompute a product's aggregates from PUBLISHED reviews. Caller supplies tx. */
async function syncRatingAggregate(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  productId: string,
) {
  const agg = await tx.marketplaceReview.aggregate({
    where: { productId, status: ReviewStatus.PUBLISHED },
    _count: { rating: true },
    _sum: { rating: true },
  });
  await tx.marketplaceProduct.update({
    where: { id: productId },
    data: {
      ratingCount: agg._count.rating,
      ratingSum: agg._sum.rating ?? 0,
    },
  });
}

/**
 * Leave a review. Buyers only.
 *
 * A review is tied to a delivered order when one exists — that is what makes
 * it a verified purchase. Reviews without one are still accepted (a buyer may
 * have ordered before joining, or off-platform) but are labelled, because
 * silently discarding them would push that feedback somewhere we can't see.
 */
export async function submitMarketplaceReview(_prev: unknown, formData: FormData) {
  const user = await requireRole(Role.CLIENT);

  const productId = String(formData.get("productId") ?? "");
  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!productId) return { ok: false as const, error: "missing_product" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false as const, error: "invalid_rating" };
  }
  if (body.length < 10) return { ok: false as const, error: "body_too_short" };
  if (body.length > 4000) return { ok: false as const, error: "body_too_long" };

  const product = await prisma.marketplaceProduct.findFirst({
    where: { id: productId, status: MarketplaceProductStatus.PUBLISHED },
    select: { id: true, factoryOrgId: true },
  });
  if (!product) return { ok: false as const, error: "not_found" };

  // A factory reviewing its own listing is the most obvious way to game this.
  if (product.factoryOrgId === user.organizationId) {
    return { ok: false as const, error: "own_product" };
  }

  const existing = await prisma.marketplaceReview.findUnique({
    where: {
      productId_authorOrgId: { productId, authorOrgId: user.organizationId },
    },
    select: { id: true },
  });
  if (existing) return { ok: false as const, error: "already_reviewed" };

  // Verified purchase: a completed order from this buyer against this
  // listing's factory. Matching on the factory rather than the exact product
  // because marketplace orders reference the quote/request chain, not the
  // listing row — a stricter join would reject almost every genuine buyer.
  const order = await prisma.order.findFirst({
    where: {
      clientOrgId: user.organizationId,
      factoryOrgId: product.factoryOrgId,
      status: { in: [OrderStatus.COMPLETED, OrderStatus.IN_TRANSIT] },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const review = await prisma.marketplaceReview.create({
    data: {
      productId,
      authorOrgId: user.organizationId,
      authorUserId: user.id,
      rating,
      title: title || null,
      body,
      orderId: order?.id ?? null,
      status: ReviewStatus.PENDING,
    },
    select: { id: true },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "marketplace.review_submitted",
    targetType: "MarketplaceReview",
    targetId: review.id,
    payload: { productId, rating, verified: Boolean(order) },
  });

  return { ok: true as const };
}

/** Publish or reject a pending review. Admin only. */
export async function moderateMarketplaceReview(_prev: unknown, formData: FormData) {
  const admin = await requireRole(Role.ADMIN);

  const reviewId = String(formData.get("reviewId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!reviewId) return { ok: false as const, error: "not_found" };
  if (decision !== "publish" && decision !== "reject") {
    return { ok: false as const, error: "invalid_decision" };
  }
  // A rejection the author can't understand is just silence.
  if (decision === "reject" && !note) {
    return { ok: false as const, error: "missing_note" };
  }

  const review = await prisma.marketplaceReview.findUnique({
    where: { id: reviewId },
    select: { id: true, productId: true },
  });
  if (!review) return { ok: false as const, error: "not_found" };

  // Status change and aggregate recompute in one transaction: a crash between
  // them would leave a published review uncounted, or a rejected one still
  // inflating the average.
  await prisma.$transaction(async (tx) => {
    await tx.marketplaceReview.update({
      where: { id: reviewId },
      data: {
        status:
          decision === "publish" ? ReviewStatus.PUBLISHED : ReviewStatus.REJECTED,
        moderatedById: admin.id,
        moderatedAt: new Date(),
        moderationNote: note || null,
      },
    });
    await syncRatingAggregate(tx, review.productId);
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: `marketplace.review_${decision}ed`,
    targetType: "MarketplaceReview",
    targetId: reviewId,
  });

  revalidatePath("/[lang]/admin/marketplace", "page");
  return { ok: true as const };
}

/** Published reviews for a listing, newest first. */
export async function getPublishedReviews(productId: string) {
  return prisma.marketplaceReview.findMany({
    where: { productId, status: ReviewStatus.PUBLISHED },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      createdAt: true,
      // `orderId` is selected only to derive the verified badge — the id
      // itself is never rendered, since one buyer's order reference is no
      // business of the next visitor's.
      orderId: true,
      authorOrg: { select: { displayName: true, country: true } },
    },
  });
}

/** Moderation queue. */
export async function listPendingReviews() {
  await requireRole(Role.ADMIN);
  return prisma.marketplaceReview.findMany({
    where: { status: ReviewStatus.PENDING },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      createdAt: true,
      orderId: true,
      authorOrg: { select: { displayName: true } },
      product: { select: { id: true, name: true, reference: true } },
    },
  });
}

/** Whether the signed-in buyer may still review this listing. */
export async function canReviewProduct(productId: string) {
  const user = await requireAuth().catch(() => null);
  if (!user || user.role !== Role.CLIENT) return false;
  const existing = await prisma.marketplaceReview.findUnique({
    where: {
      productId_authorOrgId: { productId, authorOrgId: user.organizationId },
    },
    select: { id: true },
  });
  return existing === null;
}
