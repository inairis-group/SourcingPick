/**
 * Pricing v2 — pure commission, no caps.
 *
 * Spec (docs/pricing-v2.md):
 *   buyer side  : 12% on top of factory price
 *   supplier side: 3% deducted from factory revenue
 *
 * The buyer-side markup is already baked into Quote.totalCentsClient at
 * quote submission, so this module only needs to compute the supplier side
 * for payouts.
 *
 * Pure functions — no I/O, no side effects, safe to unit test.
 */

const SUPPLIER_FEE_BPS = 300; // 3% in basis points

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
