/**
 * Pure helpers shared between `buy.ts` and `sample-buy.ts`.
 */

/**
 * Coerce a deposit basis-points value into the platform's 30 %–50 %
 * window. CTO audit F4 capped the range; the shared clamp keeps both
 * the bulk-buy and sample-buy code paths in sync.
 */
export function clampDepositBps(value: number): number {
  if (!Number.isFinite(value)) return 3000;
  return Math.max(3000, Math.min(5000, value));
}
