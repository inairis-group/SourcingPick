import "server-only";
import {
  AuctionStatus,
  BidStatus,
  NotificationType,
  OrderStatus,
  QuoteStatus,
  Role,
  SourcingRegion,
  SourcingRequestOrigin,
  SourcingStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "@/lib/audit/log";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { auctionCommissionCents } from "@/lib/pricing/auctions";

/**
 * Auction settlement engine.
 *
 * Two entry points:
 *   - `settleEndedAuctions()` — called by the auctions cron. Scans every
 *     ACTIVE auction whose endsAt is in the past, settles each one and
 *     materialises the order if it sold. Idempotent — second runs see
 *     the auction is already SOLD/ENDED and skip.
 *   - `materializeAuctionOrder(auctionId)` — also called inline from the
 *     buy-now path in bid-actions, so a buyer who hits buy-now sees the
 *     order on /client/orders immediately (no cron round-trip).
 */

const DEFAULT_DEPOSIT_BPS = 3000;

export type SettleResult = {
  scanned: number;
  sold: number;
  endedNoWinner: number;
};

export async function settleEndedAuctions(): Promise<SettleResult> {
  const now = new Date();
  const ended = await prisma.auction.findMany({
    where: {
      status: AuctionStatus.ACTIVE,
      endsAt: { lte: now },
      deletedAt: null,
    },
    select: { id: true },
  });

  let sold = 0;
  let endedNoWinner = 0;
  for (const a of ended) {
    try {
      const outcome = await settleOne(a.id);
      if (outcome === "SOLD") sold++;
      else if (outcome === "ENDED") endedNoWinner++;
    } catch (e) {
      await writeAuditLog({
        action: "auction.settle_failed",
        level: "ALERT",
        targetType: "Auction",
        targetId: a.id,
        payload: { message: e instanceof Error ? e.message : "unknown" },
      });
    }
  }

  return { scanned: ended.length, sold, endedNoWinner };
}

async function settleOne(auctionId: string): Promise<"SOLD" | "ENDED" | "SKIP"> {
  // Settle the auction in a transaction so concurrent bid attempts at
  // the exact moment we flip status can't slip past.
  const outcome = await prisma.$transaction(async (tx) => {
    const a = await tx.auction.findUnique({
      where: { id: auctionId },
      select: {
        id: true,
        status: true,
        reserveCents: true,
        endsAt: true,
      },
    });
    if (!a || a.status !== AuctionStatus.ACTIVE) return "SKIP";

    const top = await tx.bid.findFirst({
      where: {
        auctionId: a.id,
        status: { in: [BidStatus.ACTIVE, BidStatus.WINNING] },
      },
      orderBy: { amountCents: "desc" },
      select: { id: true, amountCents: true, bidderUserId: true },
    });

    if (!top) {
      await tx.auction.update({
        where: { id: a.id },
        data: { status: AuctionStatus.ENDED },
      });
      return "ENDED";
    }

    // Reserve not met → ENDED, top bid REJECTED so the bidder can see
    // their bid in the analytics view but it didn't win.
    if (a.reserveCents !== null && top.amountCents < a.reserveCents) {
      await tx.auction.update({
        where: { id: a.id },
        data: { status: AuctionStatus.ENDED },
      });
      await tx.bid.update({
        where: { id: top.id },
        data: { status: BidStatus.REJECTED },
      });
      return "ENDED";
    }

    // Winner!
    await tx.bid.update({
      where: { id: top.id },
      data: { status: BidStatus.WINNING },
    });
    await tx.auction.update({
      where: { id: a.id },
      data: {
        status: AuctionStatus.SOLD,
        winnerBidId: top.id,
      },
    });
    return "SOLD";
  });

  if (outcome === "SOLD") {
    await materializeAuctionOrder(auctionId);
  }
  return outcome;
}

/**
 * Materialise an Order (with synthetic SourcingRequest + Quote) from a
 * SOLD auction. Idempotent on `Auction.materializedOrderId` — running
 * twice is a no-op. Also emits the auction-won + auction-sold
 * notifications so the buyer and the factory hear about it.
 *
 * Called inline from the buy-now success path and after every cron-led
 * SOLD transition above.
 */
export async function materializeAuctionOrder(
  auctionId: string,
): Promise<{ orderId: string } | null> {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: { winnerBid: true },
  });
  if (!auction) return null;
  if (auction.status !== AuctionStatus.SOLD) return null;
  if (auction.materializedOrderId) {
    return { orderId: auction.materializedOrderId };
  }
  if (!auction.winnerBid) return null;

  const winningBid = auction.winnerBid;
  const totalCents = winningBid.amountCents;
  const commissionCents = auctionCommissionCents(totalCents);
  const depositCents = Math.round(
    (totalCents * DEFAULT_DEPOSIT_BPS) / 10000,
  );
  const balanceCents = totalCents - depositCents;
  // Per-unit values for the synthetic Quote — needed because Order
  // pulls them off `quote`. Round to integer cents to keep DB clean.
  const unitClient = Math.round(totalCents / auction.quantity);
  const unitFactory = Math.round(
    (totalCents - commissionCents) / auction.quantity,
  );

  const reqRef = await generateUniqueReference("REQ");
  const ordRef = await generateUniqueReference("ORD");

  const buyerOrg = await prisma.organization.findUnique({
    where: { id: winningBid.bidderOrgId },
    select: { id: true, displayName: true, address: true },
  });
  if (!buyerOrg) return null;

  const deadline = new Date(
    Date.now() +
      (auction.leadTimeDays + 7) * 24 * 60 * 60 * 1000,
  );

  const order = await prisma.$transaction(async (tx) => {
    // Last-chance idempotency check inside the tx — between findUnique
    // above and now, a concurrent cron call may have materialised.
    const fresh = await tx.auction.findUnique({
      where: { id: auctionId },
      select: { materializedOrderId: true },
    });
    if (fresh?.materializedOrderId) {
      return { id: fresh.materializedOrderId, reference: "" };
    }

    const request = await tx.sourcingRequest.create({
      data: {
        reference: reqRef,
        clientOrgId: buyerOrg.id,
        createdByUserId: winningBid.bidderUserId,
        title: auction.title,
        category: auction.category,
        quantity: auction.quantity,
        deadline,
        // Auctions don't capture a delivery address at bid time. Fall
        // back to the buyer's billing address; the buyer can correct it
        // on the order page before / after paying the deposit.
        deliveryAddress:
          buyerOrg.address && buyerOrg.address.length > 0
            ? buyerOrg.address
            : "TBD — buyer to update",
        incoterm: auction.incoterm,
        sourcingRegion: SourcingRegion.ANYWHERE,
        requiredCerts: [],
        origin: SourcingRequestOrigin.AUCTION,
        status: SourcingStatus.QUOTE_ACCEPTED,
      },
      select: { id: true },
    });

    const quote = await tx.quote.create({
      data: {
        requestId: request.id,
        factoryOrgId: auction.factoryOrgId,
        unitPriceCentsFactory: unitFactory,
        marginCents: commissionCents,
        unitPriceCentsClient: unitClient,
        totalCentsClient: totalCents,
        quantity: auction.quantity,
        leadTimeDays: auction.leadTimeDays,
        leadTimeUnit: auction.leadTimeUnit,
        moq: auction.moq,
        incoterm: auction.incoterm,
        validUntil: auction.endsAt,
        qualificationScore: 100,
        depositPercentageBps: DEFAULT_DEPOSIT_BPS,
        status: QuoteStatus.ACCEPTED,
      },
      select: { id: true },
    });

    const ord = await tx.order.create({
      data: {
        reference: ordRef,
        quoteId: quote.id,
        requestId: request.id,
        clientOrgId: buyerOrg.id,
        factoryOrgId: auction.factoryOrgId,
        totalCents,
        depositCents,
        balanceCents,
        commissionCents,
        status: OrderStatus.PAYMENT_PENDING,
        estimatedEta: deadline,
      },
      select: { id: true, reference: true },
    });

    await tx.auction.update({
      where: { id: auctionId },
      data: { materializedOrderId: ord.id },
    });

    return ord;
  });

  await writeAuditLog({
    action: "auction.materialized",
    targetType: "Auction",
    targetId: auctionId,
    payload: {
      orderId: order.id,
      orderReference: order.reference,
      totalCents,
      commissionCents,
    },
  });

  await notifyAuctionOutcome({
    auction,
    orderId: order.id,
    winnerUserId: winningBid.bidderUserId,
  });

  return { orderId: order.id };
}

async function notifyAuctionOutcome(input: {
  auction: { id: string; reference: string; title: string; factoryOrgId: string };
  orderId: string;
  winnerUserId: string;
}): Promise<void> {
  const { auction, orderId, winnerUserId } = input;

  // Buyer: "You won this auction — head to your order to pay."
  await emitNotificationToMany([winnerUserId], {
    type: NotificationType.SYSTEM,
    vars: {
      systemKey: "auction_won",
      reference: auction.reference,
      title: auction.title,
    },
    contextType: "Order",
    contextId: orderId,
  });

  // Factory: "Your auction sold."
  const factoryUserIds = (
    await prisma.user.findMany({
      where: {
        organizationId: auction.factoryOrgId,
        role: Role.FACTORY,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);
  if (factoryUserIds.length > 0) {
    await emitNotificationToMany(factoryUserIds, {
      type: NotificationType.SYSTEM,
      vars: {
        systemKey: "auction_sold",
        reference: auction.reference,
        title: auction.title,
      },
      contextType: "Order",
      contextId: orderId,
    });
  }
}
