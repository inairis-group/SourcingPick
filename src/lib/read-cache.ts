/** Short-lived read cache. Memory first, Redis second. Any SQL write drops it. */

import { cacheEvents } from "@/lib/metrics.server";

type Entry = { at: number; value: Promise<unknown> };

const store = new Map<string, Entry>();
let authGeneration = 0;
let version = 0;
let versionReady = false;

export function bustReads() {
  store.clear();
  version += 1;
  versionReady = true;
  void import("@/lib/redis.server").then(({ redisClient }) =>
    redisClient().then((client) => client?.set("sp:gen", String(version))),
  );
}

export function authStamp() {
  return authGeneration;
}

export function noteSql(text: string) {
  if (!/\b(insert|update|delete|alter|truncate)\b/i.test(text)) return;
  bustReads();
  if (/admin_(sessions|users)\b/i.test(text)) authGeneration += 1;
}

async function currentVersion() {
  if (versionReady) return version;
  try {
    const { redisClient } = await import("@/lib/redis.server");
    const client = await redisClient();
    const raw = client ? await client.get("sp:gen") : null;
    version = Number(raw) || 0;
  } catch {
    version = 0;
  }
  versionReady = true;
  return version;
}

export function cachedRead<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && now - hit.at < ttlMs) {
    cacheEvents.inc({ result: "memoire" });
    return hit.value as Promise<T>;
  }
  const value = (async () => {
    const generation = await currentVersion();
    const redisKey = `sp:c:${generation}:${key}`;
    try {
      const { redisClient } = await import("@/lib/redis.server");
      const client = await redisClient();
      if (client) {
        const raw = await client.get(redisKey);
        if (raw) {
          cacheEvents.inc({ result: "redis" });
          return JSON.parse(raw) as T;
        }
      }
    } catch {
      // Redis is optional. The database remains the source.
    }
    cacheEvents.inc({ result: "base" });
    const data = await load();
    try {
      const { redisClient } = await import("@/lib/redis.server");
      const client = await redisClient();
      const packed = JSON.stringify(data);
      if (client && packed.length > 0 && packed.length < 180_000) await client.set(redisKey, packed, "PX", ttlMs);
    } catch {
      // A cache write must never hide the data already loaded.
    }
    return data;
  })();
  store.set(key, { at: now, value });
  value.catch(() => {
    const current = store.get(key);
    if (current?.value === value) store.delete(key);
  });
  return value;
}
