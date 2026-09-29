import Redis from "ioredis";

const slot = globalThis as typeof globalThis & { __spRedis?: Redis | null; __spRedisDown?: number };

export async function redisClient() {
  if ((slot.__spRedisDown || 0) > Date.now()) return null;
  if (slot.__spRedis) return slot.__spRedis;
  const client = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 250,
    lazyConnect: true,
  });
  client.on("error", () => {
    slot.__spRedisDown = Date.now() + 15_000;
  });
  try {
    await client.connect();
    await client.ping();
    slot.__spRedis = client;
    slot.__spRedisDown = 0;
    return client;
  } catch {
    slot.__spRedisDown = Date.now() + 15_000;
    client.disconnect();
    return null;
  }
}
