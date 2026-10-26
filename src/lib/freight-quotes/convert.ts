/**
 * A freight quote's euro amount, from the calculator's price by currency and
 * the day's rates. Pure arithmetic, shared by the admin's form (the preview)
 * and the server (which checks the rates it is sent).
 *
 * Rates are euros per 1 unit × 1 000 000 ("micros"): 0.121951 € per yuan is
 * 121 951. Rounded once, on the total — converting line by line and summing
 * would drift a cent or two from the figure the client accepts.
 */

export type PriceParts = { rmbCents: number; eurCents: number; usdCents: number };
export type RatesMicros = { cnyEur: number | null; usdEur: number | null };

/** Bounds that catch a typo or a decimal slip, not a market move. */
export const RATE_BOUNDS = {
  cnyEur: { min: 0.01, max: 1 },
  usdEur: { min: 0.3, max: 3 },
} as const;

export function toMicros(rate: number): number {
  return Math.round(rate * 1_000_000);
}

export function rateIsSane(kind: keyof typeof RATE_BOUNDS, rate: number | null | undefined): rate is number {
  return typeof rate === "number" && Number.isFinite(rate) && rate >= RATE_BOUNDS[kind].min && rate <= RATE_BOUNDS[kind].max;
}

/**
 * The parts in euro cents, or null when a part in yuan or dollars has no
 * rate to convert it with: a missing rate is refused, never guessed.
 */
export function eurCentsFromParts(parts: PriceParts, rates: RatesMicros): number | null {
  if (parts.rmbCents > 0 && !rates.cnyEur) return null;
  if (parts.usdCents > 0 && !rates.usdEur) return null;
  const total =
    (parts.rmbCents * (rates.cnyEur ?? 0)) / 1_000_000 + parts.eurCents + (parts.usdCents * (rates.usdEur ?? 0)) / 1_000_000;
  return Math.round(total);
}

/** The calculator's total (units, commission included) as minor units by currency. */
export function partsFromTotal(total: { RMB: number; EUR: number; USD: number } | null | undefined): PriceParts {
  return {
    rmbCents: Math.round((total?.RMB ?? 0) * 100),
    eurCents: Math.round((total?.EUR ?? 0) * 100),
    usdCents: Math.round((total?.USD ?? 0) * 100),
  };
}
