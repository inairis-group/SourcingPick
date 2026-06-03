import "server-only";
import { AuctionStatus, BidStatus, type Locale } from "@prisma/client";
import { prisma } from "@/lib/db/client";

/**
 * Active auctions for storefront browsing — ACTIVE within their time
 * window, sorted by ending-soonest first so the urgency is visible.
 * Capped to keep the SSR payload bounded.
 */
export async function listActiveAuctions() {
  const now = new Date();
  return prisma.auction.findMany({
    where: {
      status: AuctionStatus.ACTIVE,
      startsAt: { lte: now },
      endsAt: { gt: now },
      deletedAt: null,
    },
    orderBy: { endsAt: "asc" },
    take: 60,
    select: {
      id: true,
      reference: true,
      title: true,
      category: true,
      images: true,
      startingBidCents: true,
      reserveCents: true,
      buyNowCents: true,
      quantity: true,
      endsAt: true,
      factoryOrg: {
        select: {
          id: true,
          displayName: true,
          country: true,
          city: true,
          logoUrl: true,
        },
      },
      _count: { select: { bids: true } },
    },
  });
}

export type ActiveAuctionCard = Awaited<
  ReturnType<typeof listActiveAuctions>
>[number];

/**
 * Public auction detail — viewable by anyone (anonymous browsers, clients,
 * even admins). The bid form is rendered separately and only mounts for
 * authenticated CLIENT users.
 */
export async function getAuctionDetail(id: string) {
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      factoryOrg: {
        select: {
          id: true,
          displayName: true,
          country: true,
          city: true,
          logoUrl: true,
        },
      },
    },
  });
  if (!auction || auction.deletedAt) return null;
  return auction;
}

/**
 * Highest-bid summary + total bid count for an auction's detail page.
 * Cheap — uses the (auctionId, amountCents) index defined on `Bid`.
 */
export async function getHighestBidInfo(auctionId: string) {
  const [count, top] = await Promise.all([
    prisma.bid.count({
      where: {
        auctionId,
        status: { in: [BidStatus.ACTIVE, BidStatus.WINNING, BidStatus.OUTBID] },
      },
    }),
    prisma.bid.findFirst({
      where: {
        auctionId,
        status: { in: [BidStatus.ACTIVE, BidStatus.WINNING] },
      },
      orderBy: { amountCents: "desc" },
      select: {
        id: true,
        amountCents: true,
        createdAt: true,
        bidderOrg: { select: { displayName: true } },
      },
    }),
  ]);
  return { count, top };
}

/**
 * Last N bids on an auction, newest first. Bidder name is intentionally
 * truncated to the org displayName — we don't surface individual user
 * names to other bidders.
 */
export async function listRecentBids(auctionId: string, take = 10) {
  return prisma.bid.findMany({
    where: { auctionId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      amountCents: true,
      status: true,
      createdAt: true,
      bidderOrg: { select: { displayName: true } },
    },
  });
}

/** Used only for routing — drop `lang` because Prisma typings drift. */
export type _LocaleHint = Locale;
