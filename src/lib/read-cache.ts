/** Short-lived read cache. Any SQL write drops it, so a save is visible on the next open. */

type Entry = { at: number; value: Promise<unknown> };

const store = new Map<string, Entry>();
let authGeneration = 0;

export function bustReads() {
  store.clear();
}

export function authStamp() {
  return authGeneration;
}

export function noteSql(text: string) {
  if (!/\b(insert|update|delete|alter|truncate)\b/i.test(text)) return;
  bustReads();
  if (/admin_(sessions|users)\b/i.test(text)) authGeneration += 1;
}

export function cachedRead<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && now - hit.at < ttlMs) return hit.value as Promise<T>;
  const value = load().then(
    (data) => data,
    (error) => {
      const current = store.get(key);
      if (current?.value === value) store.delete(key);
      throw error;
    },
  );
  store.set(key, { at: now, value });
  return value;
}
