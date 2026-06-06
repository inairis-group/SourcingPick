import "server-only";
import {
  DisputeStatus,
  OrderStatus,
  QuoteStatus,
  TenderInvitationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";

const DAY_MS = 1000 * 60 * 60 * 24;
const MONTH_MS = 30 * DAY_MS;

// =============================================================
// CLIENT analytics
// =============================================================

export type ClientAnalytics = {
  totalSpendCents: number;
  ordersAllTime: number;
  ordersThisMonth: number;
  ordersLastMonth: number;
  avgOrderCents: number;
  avgActualLeadTimeDays: number | null;
  topFactories: { factoryOrgId: string; name: string; spentCents: number; orders: number }[];
  disputesOpened: number;
  disputesResolvedInFavor: number;
};

export async function clientAnalytics(orgId: string): Promise<ClientAnalytics> {
  const now = Date.now();
  const monthStart = new Date(now - MONTH_MS);
  const prevMonthStart = new Date(now - 2 * MONTH_MS);

  const [totals, monthCount, lastMonthCount, completedOrders, disputes, factoriesAgg] =
    await Promise.all([
      prisma.order.aggregate({
        where: { clientOrgId: orgId, status: { not: OrderStatus.CANCELLED } },
        _sum: { totalCents: true },
        _count: true,
      }),
      prisma.order.count({
        where: {
          clientOrgId: orgId,
          status: { not: OrderStatus.CANCELLED },
          createdAt: { gte: monthStart },
        },
      }),
      prisma.order.count({
        where: {
          clientOrgId: orgId,
          status: { not: OrderStatus.CANCELLED },
          createdAt: { gte: prevMonthStart, lt: monthStart },
        },
      }),
      // Pull completed orders to compute the realised lead time.
      prisma.order.findMany({
        where: {
          clientOrgId: orgId,
          status: OrderStatus.COMPLETED,
          deliveredAt: { not: null },
        },
        select: { createdAt: true, deliveredAt: true },
        take: 100,
        orderBy: { deliveredAt: "desc" },
      }),
      prisma.dispute.findMany({
        where: { order: { clientOrgId: orgId } },
        select: { status: true, outcome: true },
      }),
      prisma.order.groupBy({
        by: ["factoryOrgId"],
        where: {
          clientOrgId: orgId,
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { totalCents: true },
        _count: { _all: true },
        orderBy: { _sum: { totalCents: "desc" } },
        take: 5,
      }),
    ]);

  const avgOrderCents =
    totals._count > 0
      ? Math.round((totals._sum.totalCents ?? 0) / totals._count)
      : 0;

  const leadTimes = completedOrders.map(
    (o) => (o.deliveredAt!.getTime() - o.createdAt.getTime()) / DAY_MS,
  );
  const avgActualLeadTimeDays =
    leadTimes.length > 0
      ? Math.round(leadTimes.reduce((s, x) => s + x, 0) / leadTimes.length)
      : null;

  // Hydrate factory names in one read.
  const factoryIds = factoriesAgg.map((r) => r.factoryOrgId);
  const factoryRows = await prisma.organization.findMany({
    where: { id: { in: factoryIds } },
    select: { id: true, displayName: true },
  });
  const nameById = new Map(factoryRows.map((f) => [f.id, f.displayName]));
  const topFactories = factoriesAgg.map((r) => ({
    factoryOrgId: r.factoryOrgId,
    name: nameById.get(r.factoryOrgId) ?? "—",
    spentCents: r._sum.totalCents ?? 0,
    orders: r._count._all,
  }));

  return {
    totalSpendCents: totals._sum.totalCents ?? 0,
    ordersAllTime: totals._count,
    ordersThisMonth: monthCount,
    ordersLastMonth: lastMonthCount,
    avgOrderCents,
    avgActualLeadTimeDays,
    topFactories,
    disputesOpened: disputes.length,
    disputesResolvedInFavor: disputes.filter(
      (d) =>
        d.status === DisputeStatus.RESOLVED &&
        (d.outcome === "STANDARD" || d.outcome === "CUSTOM"),
    ).length,
  };
}

// =============================================================
// FACTORY analytics
// =============================================================

export type FactoryAnalytics = {
  gmvAllTimeCents: number;
  gmvThisMonthCents: number;
  gmvLastMonthCents: number;
  tendersReceived: number;
  quotesSubmitted: number;
  quotesAccepted: number;
  quoteWinRateBps: number; // 0–10000
  onTimeRateBps: number; // 0–10000
  topProducts: { productId: string; name: string; soldUnits: number }[];
  disputesReceived: number;
  disputesResolvedAgainst: number;
};

export async function factoryAnalytics(orgId: string): Promise<FactoryAnalytics> {
  const now = Date.now();
  const monthStart = new Date(now - MONTH_MS);
  const prevMonthStart = new Date(now - 2 * MONTH_MS);

  const [
    gmvAll,
    gmvMonth,
    gmvLastMonth,
    tendersReceived,
    quotesSubmitted,
    quotesAccepted,
    onTimeOrders,
    topProducts,
    disputes,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        factoryOrgId: orgId,
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { totalCents: true },
    }),
    prisma.order.aggregate({
      where: {
        factoryOrgId: orgId,
        status: { not: OrderStatus.CANCELLED },
        createdAt: { gte: monthStart },
      },
      _sum: { totalCents: true },
    }),
    prisma.order.aggregate({
      where: {
        factoryOrgId: orgId,
        status: { not: OrderStatus.CANCELLED },
        createdAt: { gte: prevMonthStart, lt: monthStart },
      },
      _sum: { totalCents: true },
    }),
    prisma.tenderInvitation.count({
      where: { factoryOrgId: orgId },
    }),
    prisma.quote.count({
      where: { factoryOrgId: orgId },
    }),
    prisma.quote.count({
      where: { factoryOrgId: orgId, status: QuoteStatus.ACCEPTED },
    }),
    prisma.order.findMany({
      where: {
        factoryOrgId: orgId,
        status: OrderStatus.COMPLETED,
        deliveredAt: { not: null },
      },
      select: {
        createdAt: true,
        deliveredAt: true,
        quote: { select: { leadTimeDays: true } },
      },
      take: 100,
      orderBy: { deliveredAt: "desc" },
    }),
    prisma.marketplaceProduct.findMany({
      where: { factoryOrgId: orgId, soldCount: { gt: 0 } },
      orderBy: { soldCount: "desc" },
      take: 5,
      select: { id: true, name: true, soldCount: true },
    }),
    prisma.dispute.findMany({
      where: { order: { factoryOrgId: orgId } },
      select: { status: true, outcome: true },
    }),
  ]);

  const quoteWinRateBps =
    quotesSubmitted > 0
      ? Math.round((quotesAccepted / quotesSubmitted) * 10000)
      : 0;

  let onTimeRateBps = 0;
  if (onTimeOrders.length > 0) {
    const onTimeCount = onTimeOrders.filter((o) => {
      const elapsedDays =
        (o.deliveredAt!.getTime() - o.createdAt.getTime()) / DAY_MS;
      return elapsedDays <= o.quote.leadTimeDays;
    }).length;
    onTimeRateBps = Math.round((onTimeCount / onTimeOrders.length) * 10000);
  }

  return {
    gmvAllTimeCents: gmvAll._sum.totalCents ?? 0,
    gmvThisMonthCents: gmvMonth._sum.totalCents ?? 0,
    gmvLastMonthCents: gmvLastMonth._sum.totalCents ?? 0,
    tendersReceived,
    quotesSubmitted,
    quotesAccepted,
    quoteWinRateBps,
    onTimeRateBps,
    topProducts: topProducts.map((p) => ({
      productId: p.id,
      name: p.name,
      soldUnits: p.soldCount,
    })),
    disputesReceived: disputes.length,
    disputesResolvedAgainst: disputes.filter(
      (d) =>
        d.status === DisputeStatus.RESOLVED &&
        (d.outcome === "STANDARD" || d.outcome === "CUSTOM"),
    ).length,
  };
}

// =============================================================
// AGENT analytics
// =============================================================

export type AgentAnalytics = {
  requestsAssigned: number;
  requestsActive: number;
  requestsCompleted: number;
  tendersDispatched: number;
  quotesForwarded: number;
  quotesAccepted: number;
  forwardAcceptRateBps: number;
  commissionEarnedCents: number;
  avgAssignToFirstTenderHours: number | null;
};

export async function agentAnalytics(agentUserId: string): Promise<AgentAnalytics> {
  const [
    assigned,
    quotesForwarded,
    quotesAccepted,
    invitations,
    commissionAgg,
  ] = await Promise.all([
    prisma.sourcingRequest.findMany({
      where: { agentId: agentUserId },
      select: { id: true, status: true, createdAt: true },
    }),
    prisma.quote.count({
      where: {
        agentId: agentUserId,
        status: {
          in: [QuoteStatus.SENT_TO_CLIENT, QuoteStatus.ACCEPTED, QuoteStatus.REJECTED],
        },
      },
    }),
    prisma.quote.count({
      where: {
        agentId: agentUserId,
        status: QuoteStatus.ACCEPTED,
      },
    }),
    prisma.tenderInvitation.findMany({
      where: {
        request: { agentId: agentUserId },
        status: {
          in: [
            TenderInvitationStatus.INVITED,
            TenderInvitationStatus.VIEWED,
            TenderInvitationStatus.RESPONDED,
            TenderInvitationStatus.DECLINED,
            TenderInvitationStatus.EXPIRED,
          ],
        },
      },
      select: {
        invitedAt: true,
        request: { select: { id: true, createdAt: true } },
      },
    }),
    prisma.order.aggregate({
      where: {
        status: OrderStatus.COMPLETED,
        quote: { agentId: agentUserId },
      },
      _sum: { commissionCents: true },
    }),
  ]);

  const activeStatuses = new Set([
    "REQUEST_RECEIVED",
    "ASSIGNED",
    "QUOTE_SENT",
    "QUOTE_ACCEPTED",
    "PREPARATION",
    "SHIPPED",
    "IN_TRANSIT",
  ]);
  const requestsActive = assigned.filter((r) =>
    activeStatuses.has(r.status),
  ).length;
  const requestsCompleted = assigned.filter((r) => r.status === "COMPLETED")
    .length;

  // Avg hours from request assignment to first tender invitation per
  // request. Skip requests that never got a tender (denominator only
  // counts requests where we have a timestamp pair).
  const firstSentByReq = new Map<string, number>();
  for (const inv of invitations) {
    const reqId = inv.request.id;
    const ts = inv.invitedAt.getTime();
    const cur = firstSentByReq.get(reqId);
    if (cur === undefined || ts < cur) firstSentByReq.set(reqId, ts);
  }
  const reqCreatedById = new Map(
    invitations.map((i) => [i.request.id, i.request.createdAt.getTime()] as const),
  );
  const lags: number[] = [];
  for (const [reqId, firstTs] of firstSentByReq) {
    const created = reqCreatedById.get(reqId);
    if (created !== undefined && firstTs >= created) {
      lags.push((firstTs - created) / (1000 * 60 * 60));
    }
  }
  const avgAssignToFirstTenderHours =
    lags.length > 0
      ? Math.round(lags.reduce((s, x) => s + x, 0) / lags.length)
      : null;

  const forwardAcceptRateBps =
    quotesForwarded > 0
      ? Math.round((quotesAccepted / quotesForwarded) * 10000)
      : 0;

  return {
    requestsAssigned: assigned.length,
    requestsActive,
    requestsCompleted,
    tendersDispatched: invitations.length,
    quotesForwarded,
    quotesAccepted,
    forwardAcceptRateBps,
    commissionEarnedCents: commissionAgg._sum.commissionCents ?? 0,
    avgAssignToFirstTenderHours,
  };
}
