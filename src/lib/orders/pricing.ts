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
