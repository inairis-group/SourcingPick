/**
 * Markup applied to 1688 supplier prices.
 *
 * Pure arithmetic, not server-only: the order form recomputes the total as the
 * buyer changes quantity, and it must agree with the server to the fen.
 *
 * Separate from `docs/pricing-v2.md`'s commission model on purpose: those
 * rates are commission on a sourcing or marketplace transaction we mediate,
 * whereas this is a resale margin on a third-party listing. Conflating them
 * would make both harder to change.
 */

/** Basis points — 1500 = 15%. Env-overridable so it can be tuned per season. */
export const DEFAULT_MARKUP_BPS = Number(
  process.env.VENDOR_1688_MARKUP_BPS ?? 1500,
);

export type Vendor1688Pricing = {
  unitPriceFen: number;
  quantity: number;
  subtotalFen: number;
  markupBps: number;
  markupFen: number;
  totalFen: number;
};

/**
 * All arithmetic in integer fen, rounded once at the end.
 *
 * Rounding the markup per unit and then multiplying drifts by up to a fen per
 * unit — on a 5 000-unit order that is a visible discrepancy between the line
 * total and quantity × unit price. Multiplying first and rounding once keeps
 * the invoice self-consistent.
 */
export function priceVendor1688(
  unitPriceFen: number,
  quantity: number,
  markupBps: number = DEFAULT_MARKUP_BPS,
): Vendor1688Pricing {
  const subtotalFen = unitPriceFen * quantity;
  const markupFen = Math.round((subtotalFen * markupBps) / 10_000);
  return {
    unitPriceFen,
    quantity,
    subtotalFen,
    markupBps,
    markupFen,
    totalFen: subtotalFen + markupFen,
  };
}
