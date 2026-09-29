import { getRequest } from "@tanstack/react-start/server";

type Bucket = { n: number; reset: number };

const buckets = new Map<string, Bucket>();

export function clientAddress() {
  const request = getRequest();
  const forwarded = request?.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || request?.headers.get("x-real-ip") || "local";
  return ip.slice(0, 64);
}

/** Counts one hit. Throws once the window is full. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 800) {
    for (const [name, bucket] of buckets) {
      if (bucket.reset < now) buckets.delete(name);
    }
  }
  const row = buckets.get(key);
  if (!row || row.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return;
  }
  if (row.n >= limit) {
    throw new Error("Trop de tentatives. Patientez quelques minutes, puis réessayez.");
  }
  row.n += 1;
}
