import "server-only";
import { RATE_BOUNDS, rateIsSane } from "./convert";

/**
 * The day's exchange rates for a freight quote, euros per 1 yuan and per 1
 * dollar: the European Central Bank's reference rates (through
 * frankfurter.dev, which republishes them), kept an hour; failing that, the
 * operator's FX_CNY_EUR and FX_USD_EUR. The team sees them in the quote form
 * and can correct them before sending — whatever is sent is stored on the
 * quote and never recomputed.
 */

export type DailyRates = {
  cnyEur: number | null;
  usdEur: number | null;
  source: "ecb" | "env" | null;
  /** The ECB's date for its rates (YYYY-MM-DD). */
  date: string | null;
};

const TTL_MS = 60 * 60 * 1000;
let cache: { at: number; rates: DailyRates } | null = null;

function fromEnv(): DailyRates {
  const cny = Number(process.env.FX_CNY_EUR);
  const usd = Number(process.env.FX_USD_EUR);
  const cnyEur = rateIsSane("cnyEur", cny) ? cny : null;
  const usdEur = rateIsSane("usdEur", usd) ? usd : null;
  return { cnyEur, usdEur, source: cnyEur || usdEur ? "env" : null, date: null };
}

async function fromEcb(): Promise<DailyRates | null> {
  try {
    const res = await fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=CNY,USD", {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { date?: string; rates?: { CNY?: number; USD?: number } };
    // The ECB quotes yuan and dollars per euro; the quote wants euros per unit.
    const cny = body.rates?.CNY ? 1 / body.rates.CNY : null;
    const usd = body.rates?.USD ? 1 / body.rates.USD : null;
    const cnyEur = rateIsSane("cnyEur", cny) ? Math.round(cny * 1_000_000) / 1_000_000 : null;
    const usdEur = rateIsSane("usdEur", usd) ? Math.round(usd * 1_000_000) / 1_000_000 : null;
    if (!cnyEur && !usdEur) return null;
    return { cnyEur, usdEur, source: "ecb", date: body.date ?? null };
  } catch {
    return null;
  }
}

export async function dailyRates(): Promise<DailyRates> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rates;
  const env = fromEnv();
  const ecb = await fromEcb();
  const rates: DailyRates = ecb
    ? { ...ecb, cnyEur: ecb.cnyEur ?? env.cnyEur, usdEur: ecb.usdEur ?? env.usdEur }
    : env;
  // A failed lookup is not cached: the next form tries the bank again.
  if (ecb) cache = { at: Date.now(), rates };
  return rates;
}

export { RATE_BOUNDS };
