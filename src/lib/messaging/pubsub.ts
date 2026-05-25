import "server-only";
import { Client } from "pg";

/**
 * Postgres LISTEN/NOTIFY fan-out for thread messages.
 *
 * Prisma doesn't expose LISTEN — it's a long-lived connection that owns its
 * own session. So we open one dedicated `pg.Client` per SSE subscriber.
 * `notifyThread` borrows the Prisma pool via a one-shot `pg_notify()` call
 * so writes don't need a second client.
 *
 * Channel names are limited to 63 chars in Postgres; cuid2 IDs are 24, so
 * `msg_<id>` fits comfortably.
 */

const CHANNEL_PREFIX = "msg_";

export function channelFor(threadId: string): string {
  return `${CHANNEL_PREFIX}${threadId}`;
}

export type ThreadEvent = {
  type: "message";
  messageId: string;
  threadId: string;
  authorUserId: string | null;
  createdAt: string;
};

/**
 * Open a dedicated pg connection that LISTENs on the thread's channel.
 * The caller is responsible for calling the returned `close()` to release
 * the underlying socket. Notifications are pushed to `onEvent` as they
 * arrive — events that don't parse are dropped silently.
 */
export async function subscribeToThread(
  threadId: string,
  onEvent: (event: ThreadEvent) => void,
): Promise<() => Promise<void>> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const channel = channelFor(threadId);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  client.on("notification", (msg) => {
    if (msg.channel !== channel || !msg.payload) return;
    try {
      const parsed = JSON.parse(msg.payload) as ThreadEvent;
      onEvent(parsed);
    } catch {
      // Malformed payload — skip rather than crash the stream.
    }
  });

  await client.query(`LISTEN "${channel}"`);

  return async () => {
    try {
      await client.query(`UNLISTEN "${channel}"`);
    } catch {
      // Connection may already be torn down; nothing to do.
    }
    try {
      await client.end();
    } catch {
      // Same — best-effort cleanup.
    }
  };
}

/**
 * Fire a NOTIFY for a thread. Uses Prisma's pool via raw SQL — pg_notify
 * lets us send the payload as a regular parameter, no string escaping.
 */
export async function notifyThread(
  threadId: string,
  event: ThreadEvent,
): Promise<void> {
  const { prisma } = await import("@/lib/db/client");
  await prisma.$executeRaw`SELECT pg_notify(${channelFor(threadId)}, ${JSON.stringify(event)})`;
}
