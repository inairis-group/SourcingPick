/**
 * Pricing v3 — split commission per flow.
 *
 * Spec (docs/pricing-v2.md):
 *
 *   Sourcing flow   : buyer 4% / supplier 1%   (total platform take 5%)
 *   Marketplace flow: buyer 2% / seller    1%  (total platform take 3%)
 *
 * v2 + v2.1 had a single buyer / supplier pair shared across both flows
 * (most recently 3% buyer / 6% supplier). v3 splits them because the
 * two flows now carry different rates — marketplace is intentionally
 * cheaper to reflect the lower agent labour cost.
 *
 * Single source of truth: tender-actions, marketplace/actions and
 * marketplace/buy all import these helpers. Changing rates is a
 * one-line edit per constant (no schema migration; rates are runtime).
 *
 * Pure functions — no I/O, no side effects, safe to unit test.
 */

export type PricingFlow = "sourcing" | "marketplace";

export const SOURCING_BUYER_BPS = 400; // 4% in basis points
export const SOURCING_SUPPLIER_BPS = 100; // 1% in basis points
export const MARKETPLACE_BUYER_BPS = 200; // 2% in basis points
export const MARKETPLACE_SELLER_BPS = 100; // 1% in basis points

/**
 * Resolve the basis-point rate for the buyer side of the given flow.
 * Inlined math in `applyBuyerMarkup` / divisor uses these.
 */
export function buyerMarkupBps(flow: PricingFlow): number {
  return flow === "sourcing" ? SOURCING_BUYER_BPS : MARKETPLACE_BUYER_BPS;
}

/**
 * Resolve the basis-point rate for the supplier/seller side of the
 * given flow.
 */
export function supplierFeeBps(flow: PricingFlow): number {
  return flow === "sourcing"
    ? SOURCING_SUPPLIER_BPS
    : MARKETPLACE_SELLER_BPS;
}

/**
 * Marketplace-side helper: given the factory's net target, derive the
 * all-in listed price so that factory_net = listed × (1 − buyer% − seller%).
 *
 *   listed = factory_net / (1 − MARKETPLACE_BUYER_BPS − MARKETPLACE_SELLER_BPS)
 *
 * At 2% + 1% → divisor 0.97. The buyer never sees the breakdown; they
 * pay the sticker price.
 */
export const MARKETPLACE_NET_DIVISOR_BPS =
  10_000 - MARKETPLACE_BUYER_BPS - MARKETPLACE_SELLER_BPS;

/**
 * Apply the buyer-side markup to a factory unit price (in cents).
 * Used at quote submission (sourcing) and marketplace listing
 * creation. Pass the matching `flow` so the right rate applies.
 */
export function applyBuyerMarkup(
  unitPriceCentsFactory: number,
  flow: PricingFlow,
): number {
  return Math.round(
    (unitPriceCentsFactory * (10_000 + buyerMarkupBps(flow))) / 10_000,
  );
}

export type FactoryPayoutBreakdown = {
  /** Factory's gross revenue: unit price × quantity. */
  grossCents: number;
  /** Supplier-side fee (1% sourcing or 1% marketplace, of gross). */
  feeCents: number;
  /** Net amount to wire to the factory's payout account. */
  netCents: number;
};

export function computeFactoryPayout(
  unitPriceCentsFactory: number,
  quantity: number,
  flow: PricingFlow,
): FactoryPayoutBreakdown {
  const grossCents = unitPriceCentsFactory * quantity;
  const feeCents = Math.round((grossCents * supplierFeeBps(flow)) / 10_000);
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
 * Compute the research fee for a unit × quantity. Pure — the agent picks
 * a unit (day/week) and a count.
 *
 * `overrides`: optional per-agent day/week rate overrides (see
 * User.agentResearchFee{Day,Week}Cents). When unset, the platform's
 * published floor applies; when set, the agent's negotiated rate is
 * used. Senior agents commonly bill above the floor for complex
 * industrial briefs.
 */
export function computeResearchFee(
  unit: ResearchFeeUnitLite,
  quantity: number,
  overrides?: { dayCents?: number | null; weekCents?: number | null },
): number {
  const dayRate = overrides?.dayCents ?? RESEARCH_FEE_DAY_CENTS;
  const weekRate = overrides?.weekCents ?? RESEARCH_FEE_WEEK_CENTS;
  const rate = unit === "WEEK" ? weekRate : dayRate;
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
