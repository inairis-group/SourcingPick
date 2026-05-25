/**
 * Pricing v2 — caps applied to factory payouts.
 *
 * Spec (docs/pricing-v2.md):
 *   buyer side  : 12% on top of factory price, capped at €15,000
 *   supplier side: 3% deducted from factory revenue, capped at €5,000
 *
 * The buyer-side markup is already baked into Quote.totalCentsClient at
 * quote submission, so this module only needs to compute the supplier side
 * for payouts.
 *
 * Pure functions — no I/O, no side effects, safe to unit test.
 */

const SUPPLIER_FEE_BPS = 300; // 3% in basis points
const SUPPLIER_FEE_CAP_CENTS = 5_000_00; // €5,000

export type FactoryPayoutBreakdown = {
  /** Factory's gross revenue: unit price × quantity. */
  grossCents: number;
  /** Supplier-side fee (3% capped). */
  feeCents: number;
  /** Net amount to wire to the factory's Connect account. */
  netCents: number;
};

export function computeFactoryPayout(
  unitPriceCentsFactory: number,
  quantity: number,
): FactoryPayoutBreakdown {
  const grossCents = unitPriceCentsFactory * quantity;
  const uncappedFee = Math.round((grossCents * SUPPLIER_FEE_BPS) / 10_000);
  const feeCents = Math.min(uncappedFee, SUPPLIER_FEE_CAP_CENTS);
  return {
    grossCents,
    feeCents,
    netCents: grossCents - feeCents,
  };
}
