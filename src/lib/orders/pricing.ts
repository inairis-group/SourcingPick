/**
 * Pricing v2 — pure commission, no caps.
 *
 * Spec (docs/pricing-v2.md):
 *   buyer side  : 6% on top of factory price
 *   supplier side: 3% deducted from factory revenue
 *
 * Single source of truth for the platform rates. tender-actions,
 * marketplace/actions and marketplace/buy all import from here — changing
 * the rate is a one-line edit (no migration, since rates are runtime-only
 * until Phase 3 introduces PricingRule).
 *
 * Pure functions — no I/O, no side effects, safe to unit test.
 */

export const BUYER_MARKUP_BPS = 600; // 6% in basis points
export const SUPPLIER_FEE_BPS = 300; // 3% in basis points

/**
 * Marketplace-side helper: given the factory's net target, derive the
 * all-in listed price so that factory_net = listed × (1 − buyer% − supplier%).
 *
 *   listed = factory_net / (1 − BUYER_MARKUP − SUPPLIER_FEE)
 *
 * At 6% + 3% → divisor 0.91. The buyer never sees the breakdown; they pay
 * the sticker price.
 */
export const MARKETPLACE_NET_DIVISOR_BPS =
  10_000 - BUYER_MARKUP_BPS - SUPPLIER_FEE_BPS;

/**
 * Apply the buyer-side markup to a factory unit price (in cents). Used at
 * quote submission and marketplace listing creation.
 */
export function applyBuyerMarkup(unitPriceCentsFactory: number): number {
  return Math.round(
    (unitPriceCentsFactory * (10_000 + BUYER_MARKUP_BPS)) / 10_000,
  );
}

export type FactoryPayoutBreakdown = {
  /** Factory's gross revenue: unit price × quantity. */
  grossCents: number;
  /** Supplier-side fee (3% of gross). */
  feeCents: number;
  /** Net amount to wire to the factory's Connect account. */
  netCents: number;
};

export function computeFactoryPayout(
  unitPriceCentsFactory: number,
  quantity: number,
): FactoryPayoutBreakdown {
  const grossCents = unitPriceCentsFactory * quantity;
  const feeCents = Math.round((grossCents * SUPPLIER_FEE_BPS) / 10_000);
  return {
    grossCents,
    feeCents,
    netCents: grossCents - feeCents,
  };
}

/**
 * Research fee rates (docs/pricing-v2.md): €125/day or €500/week. Quoted
 * per request by the agent based on scope. Stored in cents.
 */
export const RESEARCH_FEE_DAY_CENTS = 125_00;
export const RESEARCH_FEE_WEEK_CENTS = 500_00;

export type ResearchFeeUnitLite = "DAY" | "WEEK";

/**
 * Compute the research fee for a unit × quantity. Pure — the agent picks a
 * unit (day/week) and a count; this is the only place the rates live.
 */
export function computeResearchFee(
  unit: ResearchFeeUnitLite,
  quantity: number,
): number {
  const rate = unit === "WEEK" ? RESEARCH_FEE_WEEK_CENTS : RESEARCH_FEE_DAY_CENTS;
  return rate * Math.max(0, Math.floor(quantity));
}

/** Platform retains 20% of a disputed escrow on a standard partial refund. */
export const DISPUTE_STANDARD_RETAINED_BPS = 2000;

export type DisputeOutcome = "STANDARD" | "CUSTOM";

export type DisputeRefundBreakdown = {
  /** Amount refunded to the buyer. */
  refundCents: number;
  /** Amount the platform retains (0 on a full/custom refund). */
  retainedCents: number;
  /** Supplier's half of the retained amount (compensation for committed work). */
  supplierShareCents: number;
  /** Platform's half of the retained amount. */
  platformShareCents: number;
};

/**
 * Dispute refund math, per docs/pricing-v2.md:
 *   CUSTOM   → full refund of the escrowed amount (personalised goods are
 *              unsellable; the platform shouldn't shift that risk to the buyer).
 *   STANDARD → buyer refunded 80%; platform retains 20%, split 50/50 with
 *              the supplier as compensation for materials/labour committed.
 *
 * Pure — extracted from resolveDisputeAction so the policy is unit-testable.
 */
export function computeDisputeRefund(
  escrowAmountCents: number,
  outcome: DisputeOutcome,
): DisputeRefundBreakdown {
  const refundCents =
    outcome === "CUSTOM"
      ? escrowAmountCents
      : escrowAmountCents -
        Math.round((escrowAmountCents * DISPUTE_STANDARD_RETAINED_BPS) / 10_000);
  const retainedCents = escrowAmountCents - refundCents;
  const supplierShareCents = Math.round(retainedCents / 2);
  const platformShareCents = retainedCents - supplierShareCents;
  return { refundCents, retainedCents, supplierShareCents, platformShareCents };
}
