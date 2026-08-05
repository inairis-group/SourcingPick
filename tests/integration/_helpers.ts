import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  KycStatus,
  OrgType,
  Role,
  SubRole,
} from "@prisma/client";
import { randomUUID } from "node:crypto";

// Load TEST_DATABASE_URL / DATABASE_URL from .env so the user doesn't
// have to remember to export it for `npm run test:integration`.
loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

/**
 * Integration-test harness.
 *
 * Tests run against `TEST_DATABASE_URL` (or DATABASE_URL if the test URL
 * isn't set — usable on a throwaway local DB only). Every test starts
 * with `await resetDb()` which TRUNCATEs every domain table; the
 * connection survives across the whole file so test boot is cheap.
 *
 * Keep these helpers pure — no business-logic imports beyond Prisma so
 * the tests stay independent from the things they're trying to assert
 * on.
 */

// Prefer TEST_DATABASE_URL when set; otherwise derive it from
// DATABASE_URL by swapping the database name to `sourcingpick_test`
// (matches what `db:test:setup` creates). This means a developer who
// just ran `npm run db:test:setup` can run `npm run test:integration`
// without exporting anything.
function resolveTestUrl(): string {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const dev = process.env.DATABASE_URL;
  if (!dev) {
    throw new Error(
      "Neither TEST_DATABASE_URL nor DATABASE_URL is set — integration tests need a database to connect to.",
    );
  }
  return dev.replace(/(postgresql:\/\/[^/]+\/)([^?]+)/, "$1sourcingpick_test");
}

const TEST_URL = resolveTestUrl();
// Hard-fail if we'd accidentally point at the dev DB — these tests
// TRUNCATE every table.
if (!/sourcingpick_test/.test(TEST_URL)) {
  throw new Error(
    `Refusing to run integration tests against "${TEST_URL}" — the URL must include the "sourcingpick_test" database name. Run \`npm run db:test:setup\` first.`,
  );
}

// Critical: rewrite DATABASE_URL *before* any production module under
// test imports `src/lib/db/client.ts`. Without this, finalize.ts and
// friends would talk to the dev DB while the tests seeded fixtures
// into the test DB — every test would see "order not found".
process.env.DATABASE_URL = TEST_URL;

// Prisma v7 wires the connection through the adapter, not the client
// constructor — see `src/lib/db/client.ts` for the prod equivalent.
const adapter = new PrismaPg({ connectionString: TEST_URL });
export const prisma = new PrismaClient({ adapter, log: ["error"] });

/**
 * Tables in *reverse* dependency order — children first so FK cascades
 * don't fire surprise deletes. TRUNCATE ... CASCADE handles the
 * dependency chain for us but listing them explicitly is faster + makes
 * the test boot deterministic when one table grows large.
 */
/**
 * Tables to truncate between tests, read from the database rather than listed
 * by hand.
 *
 * The hardcoded list this replaces had silently gone stale: GuestConversation,
 * GuestMessage and InboundEmail were never in it, so rows survived across runs
 * and a test that asserts "this is the first time we've seen this message"
 * passed alone and failed in the suite. Any list maintained by hand drifts the
 * moment someone adds a model; this can't.
 */
let cachedTables: string[] | null = null;

async function allTables(): Promise<string[]> {
  if (cachedTables) return cachedTables;
  const rows = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;
  cachedTables = rows.map((r) => r.tablename);
  return cachedTables;
}

export async function resetDb(): Promise<void> {
  const quoted = (await allTables()).map((t) => `"${t}"`).join(", ");
  if (!quoted) return;
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE;`,
  );
}

export type BaseFixtures = {
  factoryOrg: { id: string };
  factoryUser: { id: string };
  clientOrg: { id: string };
  clientUser: { id: string };
  adminUser: { id: string };
};

/**
 * Minimal fixture set used by most tests: one verified factory + owner,
 * one verified client + owner, and an admin. Anything richer (orders,
 * quotes, tickets) gets built per-test from these.
 */
export async function seedBaseFixtures(): Promise<BaseFixtures> {
  const factoryOrg = await prisma.organization.create({
    data: {
      type: OrgType.FACTORY,
      legalName: "Test Factory SAS",
      displayName: "Test Factory",
      country: "FR",
      city: "Lyon",
      address: "1 rue de la Test",
      kycStatus: KycStatus.VERIFIED,
      kycVerifiedAt: new Date(),
      payoutProvider: "PINGPONG",
      payoutAccountId: "pingpong-test-payee",
      payoutStatus: "ACTIVE",
    },
    select: { id: true },
  });

  const factoryUser = await prisma.user.create({
    data: {
      email: `factory-${randomUUID()}@test.local`,
      firstName: "Fact",
      lastName: "Owner",
      role: Role.FACTORY,
      subRole: SubRole.OWNER,
      organizationId: factoryOrg.id,
      hasOnboarded: true,
    },
    select: { id: true },
  });

  const clientOrg = await prisma.organization.create({
    data: {
      type: OrgType.CLIENT,
      legalName: "Test Client SAS",
      displayName: "Test Client",
      country: "FR",
      city: "Paris",
      address: "1 avenue de la Test",
      kycStatus: KycStatus.VERIFIED,
      kycVerifiedAt: new Date(),
    },
    select: { id: true },
  });

  const clientUser = await prisma.user.create({
    data: {
      email: `client-${randomUUID()}@test.local`,
      firstName: "Cli",
      lastName: "Buyer",
      role: Role.CLIENT,
      subRole: SubRole.OWNER,
      organizationId: clientOrg.id,
      hasOnboarded: true,
    },
    select: { id: true },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: `admin-${randomUUID()}@test.local`,
      firstName: "Adm",
      lastName: "In",
      role: Role.ADMIN,
      subRole: SubRole.OWNER,
      organizationId: clientOrg.id, // admins don't really belong to an org; placeholder
      hasOnboarded: true,
    },
    select: { id: true },
  });

  return { factoryOrg, factoryUser, clientOrg, clientUser, adminUser };
}

/**
 * Create a fully-formed Order at PAYMENT_PENDING via the agent-less /
 * marketplace shape so we don't need to fake the whole sourcing flow.
 * Returns the order id + the per-leg cent splits so tests can assert
 * against the same numbers the production buy.ts would have used.
 */
export async function seedOrder(
  base: BaseFixtures,
  overrides: {
    depositBps?: number;
    totalCents?: number;
  } = {},
): Promise<{
  orderId: string;
  requestId: string;
  quoteId: string;
  depositCents: number;
  balanceCents: number;
  totalCents: number;
}> {
  const totalCents = overrides.totalCents ?? 100_000; // €1000
  const depositBps = overrides.depositBps ?? 3000;
  const depositCents = Math.round((totalCents * depositBps) / 10000);
  const balanceCents = totalCents - depositCents;
  const unitFactory = Math.round(totalCents / 1.06);
  const margin = totalCents - unitFactory;

  const request = await prisma.sourcingRequest.create({
    data: {
      reference: `REQ-${randomUUID().slice(0, 8)}`,
      clientOrgId: base.clientOrg.id,
      createdByUserId: base.clientUser.id,
      title: "Integration test product",
      category: "TEXTILE",
      quantity: 1,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      deliveryAddress: "1 rue de Test",
      incoterm: "FOB",
      sourcingRegion: "ANYWHERE",
      requiredCerts: [],
      origin: "MARKETPLACE",
      status: "QUOTE_ACCEPTED",
    },
    select: { id: true },
  });

  const quote = await prisma.quote.create({
    data: {
      requestId: request.id,
      factoryOrgId: base.factoryOrg.id,
      unitPriceCentsFactory: unitFactory,
      marginCents: margin,
      unitPriceCentsClient: totalCents,
      totalCentsClient: totalCents,
      quantity: 1,
      leadTimeDays: 21,
      moq: 1,
      incoterm: "FOB",
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      qualificationScore: 100,
      status: "ACCEPTED",
      depositPercentageBps: depositBps,
    },
    select: { id: true },
  });

  const order = await prisma.order.create({
    data: {
      reference: `ORD-${randomUUID().slice(0, 5)}`,
      quoteId: quote.id,
      requestId: request.id,
      clientOrgId: base.clientOrg.id,
      factoryOrgId: base.factoryOrg.id,
      totalCents,
      depositCents,
      balanceCents,
      commissionCents: margin,
      status: "PAYMENT_PENDING",
    },
    select: { id: true },
  });

  return {
    orderId: order.id,
    requestId: request.id,
    quoteId: quote.id,
    depositCents,
    balanceCents,
    totalCents,
  };
}
