import "server-only";
import { KycStatus, OrderStatus, QuoteStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

/**
 * Per-quote qualification score, 0–100.
 *
 * Replaces the v1 placeholder (hardcoded 80) with a real score that
 * the agent recommendation badge can lean on. Four weighted components:
 *
 *   KYC trust          — 20 pts  (VERIFIED 20, REJECTED -10, else 0)
 *   On-time delivery   — 40 pts  (% of last 10 orders shipped + delivered
 *                                 on or before the quoted lead time)
 *   Price competitive  — 25 pts  (scaled vs median of received quotes on
 *                                 the request, lowest gets full marks)
 *   Lead-time compete  — 15 pts  (same scaling, fastest gets full marks)
 *
 * Computed at quote-submit time so the score reflects the moment the
 * quote landed. Recomputing later as new quotes arrive is deliberately
 * NOT done — we want each quote's score to be stable so agents can
 * trust the badge they saw at the moment they read it.
 *
 * The "competitive" components use a soft floor: if the current quote
 * is the only one received so far, both competitive components default
 * to 70 % of their max (a quote can't be uncompetitive against itself).
 */

const KYC_MAX = 20;
const ONTIME_MAX = 40;
const PRICE_MAX = 25;
const LEAD_MAX = 15;

const SOLO_QUOTE_DEFAULT_BPS = 7000; // 70 %
const ONTIME_SAMPLE_SIZE = 10;

type Tx = Prisma.TransactionClient;

export async function computeQualificationScore(args: {
  tx: Tx;
  requestId: string;
  factoryOrgId: string;
  factoryKycStatus: KycStatus;
  unitPriceCentsFactory: number;
  leadTimeDays: number;
}): Promise<number> {
  const {
    tx,
    requestId,
    factoryOrgId,
    factoryKycStatus,
    unitPriceCentsFactory,
    leadTimeDays,
  } = args;

  // ─── KYC trust ─────────────────────────────────────────────
  let kycPts = 0;
  if (factoryKycStatus === KycStatus.VERIFIED) kycPts = KYC_MAX;
  else if (factoryKycStatus === KycStatus.REJECTED) kycPts = -10;

  // ─── On-time delivery rate ────────────────────────────────
  // Look at the last N COMPLETED orders. "On time" = the order
  // hit IN_TRANSIT on or before the quote's promised lead time.
  const recentOrders = await tx.order.findMany({
    where: {
      factoryOrgId,
      status: OrderStatus.COMPLETED,
      deliveredAt: { not: null },
    },
    orderBy: { deliveredAt: "desc" },
    take: ONTIME_SAMPLE_SIZE,
    select: {
      createdAt: true,
      deliveredAt: true,
      quote: { select: { leadTimeDays: true } },
    },
  });
  let ontimePts = 0;
  if (recentOrders.length > 0) {
    const onTimeCount = recentOrders.filter((o) => {
      if (!o.deliveredAt) return false;
      const elapsedDays =
        (o.deliveredAt.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return elapsedDays <= o.quote.leadTimeDays;
    }).length;
    ontimePts = Math.round((onTimeCount / recentOrders.length) * ONTIME_MAX);
  } else {
    // New factories get half-credit — a benefit-of-the-doubt anchor
    // that doesn't reward bad incumbents but doesn't punish newcomers.
    ontimePts = Math.round(ONTIME_MAX * 0.5);
  }

  // ─── Relative price + lead time vs other received quotes ───
  const sibling = await tx.quote.findMany({
    where: {
      requestId,
      // Don't include rejected / withdrawn quotes — they're noise.
      status: {
        in: [QuoteStatus.SENT_TO_AGENT, QuoteStatus.SENT_TO_CLIENT],
      },
    },
    select: { unitPriceCentsFactory: true, leadTimeDays: true },
  });

  let pricePts: number;
  let leadPts: number;
  if (sibling.length === 0) {
    // Solo quote — can't compare against itself.
    pricePts = Math.round((PRICE_MAX * SOLO_QUOTE_DEFAULT_BPS) / 10000);
    leadPts = Math.round((LEAD_MAX * SOLO_QUOTE_DEFAULT_BPS) / 10000);
  } else {
    const allPrices = [
      ...sibling.map((q) => q.unitPriceCentsFactory),
      unitPriceCentsFactory,
    ];
    const allLeads = [
      ...sibling.map((q) => q.leadTimeDays),
      leadTimeDays,
    ];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const minLead = Math.min(...allLeads);
    const maxLead = Math.max(...allLeads);

    // Linear scale: lowest in the cohort → max points, highest → 0.
    // When everyone matches, give everyone full marks.
    if (maxPrice === minPrice) pricePts = PRICE_MAX;
    else {
      const ratio =
        (maxPrice - unitPriceCentsFactory) / (maxPrice - minPrice);
      pricePts = Math.round(ratio * PRICE_MAX);
    }
    if (maxLead === minLead) leadPts = LEAD_MAX;
    else {
      const ratio = (maxLead - leadTimeDays) / (maxLead - minLead);
      leadPts = Math.round(ratio * LEAD_MAX);
    }
  }

  const total = kycPts + ontimePts + pricePts + leadPts;
  return Math.max(0, Math.min(100, total));
}
