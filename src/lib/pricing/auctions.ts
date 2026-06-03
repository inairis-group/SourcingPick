/**
 * Auction commission curve.
 *
 * Partner directive (2026-06-02): "starts at 10%, evolves with amounts
 * reached, caps at 15% around €100k — asking for a more coherent proposal
 * if needed." This interim piecewise-linear curve hits those endpoints
 * and is monotonic — bigger lots → more take rate, since auctions
 * involve more coordination + escrow exposure than fixed-price marketplace
 * sales. NOT YET partner-signed; update with the agreed curve before any
 * commercial commitment.
 *
 *   ≤ €10k    →  10%
 *   ≤ €50k    →  12%
 *   ≤ €100k   →  14%
 *   > €100k   →  15%  (cap)
 *
 * Module is pure (no `server-only`) so it can be unit-tested + reused
 * client-side for live preview on the auction settlement view.
 */

const STARTING_BID_MIN_CENTS = 100; // €1 floor — guards against zero math
const COMMISSION_CAP_BPS = 1500;

/**
 * Commission rate in basis points (10000 = 100%) for a winning bid of
 * `amountCents`. Reflects the curve above.
 */
export function auctionCommissionBps(amountCents: number): number {
  if (!Number.isFinite(amountCents) || amountCents < STARTING_BID_MIN_CENTS) {
    return 1000;
  }
  const eur = amountCents / 100;
  if (eur <= 10_000) return 1000;
  if (eur <= 50_000) return 1200;
  if (eur <= 100_000) return 1400;
  return COMMISSION_CAP_BPS;
}

/** Absolute commission in cents for a winning bid of `amountCents`. */
export function auctionCommissionCents(amountCents: number): number {
  const bps = auctionCommissionBps(amountCents);
  return Math.round((amountCents * bps) / 10000);
}

/** Factory's net payout after the platform takes its cut. */
export function auctionFactoryPayoutCents(amountCents: number): number {
  return amountCents - auctionCommissionCents(amountCents);
}
