type Point = { t: number; v: number };

const SOURCE = "http://127.0.0.1:9090";

async function range(query: string): Promise<Point[]> {
  const end = Math.floor(Date.now() / 1000);
  const url = new URL("/api/v1/query_range", SOURCE);
  url.searchParams.set("query", query);
  url.searchParams.set("start", String(end - 6 * 3600));
  url.searchParams.set("end", String(end));
  url.searchParams.set("step", "120");
  const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) return [];
  const body = (await response.json()) as { data?: { result?: { values?: [number, string][] }[] } };
  const values = body.data?.result?.[0]?.values ?? [];
  return values
    .map(([t, raw]) => ({ t: t * 1000, v: Number(raw) }))
    .filter((point) => Number.isFinite(point.v));
}

async function instant(query: string): Promise<number | null> {
  const url = new URL("/api/v1/query", SOURCE);
  url.searchParams.set("query", query);
  const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) return null;
  const body = (await response.json()) as { data?: { result?: { value?: [number, string] }[] } };
  const raw = Number(body.data?.result?.[0]?.value?.[1]);
  return Number.isFinite(raw) ? raw : null;
}

export async function readBoard() {
  try {
    const [up, db, memory, pages, errors, latency, redis, redisUsed, redisMax] = await Promise.all([
      instant("sourcingpick_up"),
      instant("sourcingpick_db_up"),
      range("sourcingpick_memory_mb"),
      range("sum(rate(sourcingpick_http_requests_total[2m])) * 60"),
      range('sum(rate(sourcingpick_http_responses_total{status=~"5.."}[5m])) * 60'),
      range('histogram_quantile(0.95, sum by (le) (rate(sourcingpick_http_duration_seconds_bucket{route="page"}[5m])))'),
      range("redis_memory_used_bytes / 1048576"),
      instant("redis_memory_used_bytes"),
      instant("redis_memory_max_bytes"),
    ]);
    return { ready: true, up, db, memory, pages, errors, latency, redis, redisUsed, redisMax };
  } catch {
    return { ready: false, up: null, db: null, memory: [], pages: [], errors: [], latency: [], redis: [], redisUsed: null, redisMax: null };
  }
}
