import Redis from "ioredis";

const slot = globalThis as typeof globalThis & {
  __spRedis?: Redis | null;
  __spRedisDown?: number;
  __spRedisOpen?: Promise<Redis | null>;
};

function drop(client: Redis | null) {
  if (slot.__spRedis === client) slot.__spRedis = null;
  slot.__spRedisOpen = undefined;
  client?.disconnect();
}

async function open() {
  const client = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    connectionName: "sourcingpick",
    enableAutoPipelining: true,
    keepAlive: 30_000,
    commandTimeout: 150,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 200,
    lazyConnect: true,
    retryStrategy: () => null,
  });
  client.on("error", () => {
    slot.__spRedisDown = Date.now() + 15_000;
    drop(client);
  });
  try {
    await client.connect();
    await client.ping();
    slot.__spRedis = client;
    slot.__spRedisDown = 0;
    return client;
  } catch {
    slot.__spRedisDown = Date.now() + 15_000;
    drop(client);
    return null;
  }
}

export function redisClient() {
  if ((slot.__spRedisDown || 0) > Date.now()) return Promise.resolve(null);
  if (slot.__spRedis) return Promise.resolve(slot.__spRedis);
  slot.__spRedisOpen ??= open();
  return slot.__spRedisOpen;
}
