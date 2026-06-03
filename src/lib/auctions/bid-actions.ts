"use server";

import { revalidatePath } from "next/cache";
import {
  AuctionStatus,
  BidStatus,
  NotificationType,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { materializeAuctionOrder } from "./settle";

/** Minimum increment between consecutive bids — €1. */
const MIN_INCREMENT_CENTS = 100;

export type BidResult =
  | { ok: true; bidId: string; auctionStatus: AuctionStatus }
  | { ok: false; error: string };

/**
 * Place a bid on an ACTIVE auction.
 *
 * Race protection via Prisma transaction + a re-check of the highest bid
 * inside the transaction. PostgreSQL's default Read Committed isolation
 * is enough for the contention shape here (auctions have low concurrent
 * bid volume); if traffic ramps we'd upgrade to serializable or use a
 * row lock on the auction.
 *
 * Rules:
 *   - Auction must be ACTIVE and within [startsAt, endsAt].
 *   - Bid must be strictly greater than the current highest by at least
 *     MIN_INCREMENT_CENTS, or — if no bid yet — meet startingBidCents.
 *   - Bidder cannot be the seller's own factory org.
 */
export async function placeBidAction(input: {
  auctionId: string;
  amountCents: number;
}): Promise<BidResult> {
  const user = await requireRole(Role.CLIENT);
  if (
    !Number.isFinite(input.amountCents) ||
    input.amountCents <= 0 ||
    !Number.isInteger(input.amountCents)
  ) {
    return { ok: false, error: "Invalid bid amount." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: input.auctionId },
        select: {
          id: true,
          reference: true,
          title: true,
          status: true,
          factoryOrgId: true,
          startingBidCents: true,
          buyNowCents: true,
          startsAt: true,
          endsAt: true,
        },
      });
      if (!auction) throw new Error("AUCTION_NOT_FOUND");
      if (auction.factoryOrgId === user.organizationId) {
        throw new Error("OWN_AUCTION");
      }
      if (auction.status !== AuctionStatus.ACTIVE) {
        throw new Error("NOT_ACTIVE");
      }
      const now = Date.now();
      if (auction.startsAt.getTime() > now) throw new Error("NOT_STARTED");
      if (auction.endsAt.getTime() <= now) throw new Error("ALREADY_ENDED");

      const highest = await tx.bid.findFirst({
        where: {
          auctionId: auction.id,
          status: { in: [BidStatus.ACTIVE, BidStatus.WINNING] },
        },
        orderBy: { amountCents: "desc" },
        select: { id: true, amountCents: true, bidderUserId: true },
      });

      const minRequired = highest
        ? highest.amountCents + MIN_INCREMENT_CENTS
        : auction.startingBidCents;
      if (input.amountCents < minRequired) {
        throw new Error(`BID_TOO_LOW:${minRequired}`);
      }

      // Hitting or exceeding buy-now → treat as buy-now winner.
      const isBuyNow =
        auction.buyNowCents !== null &&
        input.amountCents >= auction.buyNowCents;
      const finalAmount = isBuyNow
        ? auction.buyNowCents!
        : input.amountCents;

      const bid = await tx.bid.create({
        data: {
          auctionId: auction.id,
          bidderOrgId: user.organizationId,
          bidderUserId: user.id,
          amountCents: finalAmount,
          status: isBuyNow ? BidStatus.WINNING : BidStatus.ACTIVE,
        },
        select: { id: true },
      });

      // Knock the previous winning bid down to OUTBID — for analytics +
      // for the bidder-side "you were outbid" UI later.
      if (highest) {
        await tx.bid.update({
          where: { id: highest.id },
          data: { status: BidStatus.OUTBID },
        });
      }

      if (isBuyNow) {
        await tx.auction.update({
          where: { id: auction.id },
          data: {
            status: AuctionStatus.SOLD,
            winnerBidId: bid.id,
          },
        });
        return {
          bidId: bid.id,
          auctionStatus: AuctionStatus.SOLD,
          outbidUserId: highest?.bidderUserId ?? null,
          orgId: auction.factoryOrgId,
          auctionRef: auction.reference,
          auctionTitle: auction.title,
        };
      }

      return {
        bidId: bid.id,
        auctionStatus: AuctionStatus.ACTIVE,
        outbidUserId: highest?.bidderUserId ?? null,
        orgId: auction.factoryOrgId,
        auctionRef: auction.reference,
        auctionTitle: auction.title,
      };
    });

    await writeAuditLog({
      actorUserId: user.id,
      action:
        result.auctionStatus === AuctionStatus.SOLD
          ? "auction.buy_now"
          : "auction.bid_placed",
      targetType: "Auction",
      targetId: input.auctionId,
      payload: { bidId: result.bidId, amountCents: input.amountCents },
    });

    // Notify the previous high bidder they're outbid. Skipped on buy-now
    // because the next notification (auction_won_lost) covers it
    // implicitly + the previous bidder couldn't have won anyway.
    if (
      result.outbidUserId &&
      result.outbidUserId !== user.id &&
      result.auctionStatus !== AuctionStatus.SOLD
    ) {
      await emitNotificationToMany([result.outbidUserId], {
        type: NotificationType.SYSTEM,
        vars: {
          systemKey: "auction_outbid",
          reference: result.auctionRef,
          title: result.auctionTitle,
        },
        contextType: "Auction",
        contextId: input.auctionId,
      });
    }

    // Buy-now → settlement is immediate. Materialise the order so the
    // buyer can pay via Wise without waiting for the cron.
    if (result.auctionStatus === AuctionStatus.SOLD) {
      await materializeAuctionOrder(input.auctionId);
    }

    revalidatePath("/[lang]/client/auctions", "page");
    revalidatePath("/[lang]/(marketing)/auctions", "page");
    return {
      ok: true,
      bidId: result.bidId,
      auctionStatus: result.auctionStatus,
    };
  } catch (e) {
    return { ok: false, error: mapError(e) };
  }
}

function mapError(e: unknown): string {
  if (!(e instanceof Error)) return "Could not place bid.";
  const msg = e.message;
  if (msg === "AUCTION_NOT_FOUND") return "Auction not found.";
  if (msg === "OWN_AUCTION")
    return "You can't bid on your own factory's auction.";
  if (msg === "NOT_ACTIVE") return "This auction isn't open for bids.";
  if (msg === "NOT_STARTED") return "This auction hasn't started yet.";
  if (msg === "ALREADY_ENDED") return "This auction has already ended.";
  if (msg.startsWith("BID_TOO_LOW:")) {
    const min = Number.parseInt(msg.split(":")[1] ?? "0", 10);
    if (Number.isFinite(min)) {
      return `Your bid must be at least ${(min / 100).toFixed(2)} €.`;
    }
    return "Your bid is too low.";
  }
  return "Could not place bid.";
}
