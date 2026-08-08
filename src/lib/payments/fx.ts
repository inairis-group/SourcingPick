/**
 * Currency conversion for freight.
 *
 * Deliberately NOT `server-only`: this is arithmetic plus one env read, with
 * no secrets and no database. The guard bought nothing and cost testability —
 * and on the client `FX_CNY_EUR` is simply undefined, so `currentRateBps()`
 * returns null and every caller refuses. Fail-closed in any environment.
 *
 * Shippers quote in CNY; buyers pay in EUR. The rate has to be **frozen at the
 * moment the buyer accepts**, because recomputing it later would mean
 * invoicing a different number than the one they agreed to.
 *
 * The rate itself comes from `FX_CNY_EUR` — an operator-maintained figure
 * rather than a live feed, because no feed has been chosen yet. That is a
 * deliberate seam, not an oversight: swapping in an ECB or provider rate means
 * replacing `currentRateBps()` and nothing else, since every caller stores the
 * rate it used rather than re-deriving it.
 *
 * Whoever wires a live feed should keep two properties:
 *   1. a missing or nonsensical rate must refuse, never guess — quoting €0 or
 *      a 1:1 rate on someone's freight bill is worse than an error;
 *   2. the returned rate must be recorded alongside the converted amount, so
 *      the arithmetic can be re-derived from the row years later.
 */

/** Basis points: EUR cents per 1 CNY × 10 000. 1300 bps = 0.13 EUR per CNY. */
export type RateBps = number;

export class FxNotConfiguredError extends Error {
  constructor(pair: string) {
    super(
      `No exchange rate configured for ${pair}. Set FX_CNY_EUR (EUR per 1 CNY, e.g. "0.128").`,
    );
    this.name = "FxNotConfiguredError";
  }
}

/**
 * Current CNY→EUR rate in basis points, or null when unset/implausible.
 *
 * The sanity bounds are wide on purpose — they are there to catch a decimal
 * slip or an empty string, not to have an opinion on the market.
 */
export function currentRateBps(): RateBps | null {
  const raw = process.env.FX_CNY_EUR;
  if (!raw) return null;
  const rate = Number(raw);
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const bps = Math.round(rate * 10_000);
  // 0.01–1.00 EUR per CNY. A value outside that is a typo, not a market move.
  if (bps < 100 || bps > 10_000) return null;
  return bps;
}

/**
 * Convert a minor-unit amount using a stored rate.
 *
 * Rounds half-up on the final figure only — converting per-line and summing
 * would drift by a cent or two against the quote the buyer accepted, and a
 * freight invoice that disagrees with the accepted price by a cent is a
 * support ticket.
 */
export function convertMinorUnits(amountCents: number, rateBps: RateBps): number {
  return Math.round((amountCents * rateBps) / 10_000);
}

/**
 * Resolve the rate to freeze onto a record, refusing rather than guessing.
 *
 * A quote already denominated in EUR needs no conversion and no configured
 * rate — that path must keep working even when FX_CNY_EUR is unset.
 */
export function rateForQuote(currency: string): RateBps {
  if (currency.toUpperCase() === "EUR") return 10_000;
  const bps = currentRateBps();
  if (bps === null) throw new FxNotConfiguredError(`${currency}→EUR`);
  return bps;
}
