import { parseFxLabel, type FxQuote } from "@/lib/fx.shared";
import { redisClient } from "@/lib/redis.server";

const KEY = "fx:eur-cny";
const MEMORY_MS = 30 * 60 * 1000;
const REDIS_SEC = 6 * 60 * 60;

const slot = globalThis as typeof globalThis & { __spFx?: { rate?: FxQuote; until?: number } };

function memory() {
  return slot.__spFx ?? (slot.__spFx = {});
}

async function readRedis() {
  try {
    const client = await redisClient();
    const raw = await client?.get(KEY);
    if (!raw) return null;
    const rate = JSON.parse(raw) as FxQuote;
    return rate.cnyPerEur > 0 ? rate : null;
  } catch {
    return null;
  }
}

async function writeRedis(rate: FxQuote) {
  try {
    const client = await redisClient();
    await client?.set(KEY, JSON.stringify(rate), "EX", REDIS_SEC);
  } catch {
    /* le taux reste en mémoire */
  }
}

async function readJson(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(2500),
    headers: { accept: "application/json" },
  });
  if (!response.ok) return null;
  return (await response.json()) as { date?: string; rates?: { CNY?: number }; eur?: { cny?: number } };
}

async function fetchRate(): Promise<FxQuote | null> {
  try {
    const body = await readJson("https://api.frankfurter.dev/v1/latest?from=EUR&to=CNY");
    const rate = Number(body?.rates?.CNY);
    if (rate > 0) return { cnyPerEur: rate, asOf: body?.date || "", source: "ecb", fetchedAt: Date.now() };
  } catch {
    /* le repli open source prend le relais */
  }
  const mirrors = [
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.min.json",
    "https://latest.currency-api.pages.dev/v1/currencies/eur.min.json",
  ];
  for (const url of mirrors) {
    try {
      const body = await readJson(url);
      const rate = Number(body?.eur?.cny);
      if (rate > 0) return { cnyPerEur: rate, asOf: body?.date || "", source: "currency-api", fetchedAt: Date.now() };
    } catch {
      /* miroir suivant */
    }
  }
  return null;
}

export async function eurCny(fallbackLabel = "7,60"): Promise<FxQuote> {
  const bag = memory();
  if (bag.rate && (bag.until || 0) > Date.now()) return bag.rate;
  const cached = await readRedis();
  if (cached && Date.now() - cached.fetchedAt < REDIS_SEC * 1000) {
    bag.rate = cached;
    bag.until = Date.now() + MEMORY_MS;
    return cached;
  }
  const fresh = await fetchRate();
  if (fresh) {
    bag.rate = fresh;
    bag.until = Date.now() + MEMORY_MS;
    await writeRedis(fresh);
    return fresh;
  }
  if (cached) {
    bag.rate = cached;
    bag.until = Date.now() + 5 * 60 * 1000;
    return cached;
  }
  const fallback: FxQuote = {
    cnyPerEur: parseFxLabel(fallbackLabel),
    asOf: "",
    source: "label",
    fetchedAt: Date.now(),
  };
  bag.rate = fallback;
  bag.until = Date.now() + 5 * 60 * 1000;
  return fallback;
}
