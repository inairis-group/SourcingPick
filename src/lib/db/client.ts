import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 requires a driver adapter — the connection URL is no longer in
 * the schema. We use @prisma/adapter-pg over a node-postgres connection.
 *
 * In dev we cache the client on globalThis so Next.js HMR / Server Action
 * reloads don't open a new connection on every save (and exhaust Postgres
 * max_connections within minutes). In prod each serverless instance gets
 * exactly one client for its lifetime.
 */
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
};

declare global {
  // eslint-disable-next-line no-var
  var __prisma: ReturnType<typeof createPrismaClient> | undefined;
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
