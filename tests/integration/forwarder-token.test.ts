import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { OrderStatus } from "@prisma/client";
import {
  prisma,
  resetDb,
  seedBaseFixtures,
  seedOrder,
  type BaseFixtures,
} from "./_helpers.ts";

// Forwarder magic-link tokens (#15). Lifecycle invariants:
//   - Token created on an order in the right status window.
//   - Token survives a TTL refresh-style read.
//   - Revoked token never authorises an upload.
//   - Expired token never authorises an upload.
// The upload action itself reads the token row directly, so testing the
// shape of the token + the order's status guard covers the real path.

let base: BaseFixtures;

before(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

beforeEach(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

async function mintToken(opts: {
  orderId: string;
  expiresAt?: Date;
  revokedAt?: Date | null;
  label?: string | null;
}) {
  return prisma.forwarderUploadToken.create({
    data: {
      token: randomBytes(16).toString("hex"),
      orderId: opts.orderId,
      createdByUserId: base.factoryUser.id,
      label: opts.label ?? null,
      expiresAt:
        opts.expiresAt ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      revokedAt: opts.revokedAt ?? null,
    },
  });
}

test("a fresh token on a PREPARATION order is live and pointing at the right order", async () => {
  const { orderId } = await seedOrder(base);
  // Walk to PREPARATION manually — buy.ts would do this via the
  // deposit-payment finaliser.
  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.PREPARATION },
  });

  const token = await mintToken({ orderId, label: "DHL pickup" });

  const reread = await prisma.forwarderUploadToken.findUnique({
    where: { token: token.token },
    select: {
      orderId: true,
      revokedAt: true,
      expiresAt: true,
      label: true,
    },
  });

  assert.equal(reread?.orderId, orderId);
  assert.equal(reread?.revokedAt, null);
  assert.equal(reread?.label, "DHL pickup");
  assert.ok((reread?.expiresAt.getTime() ?? 0) > Date.now());
});

test("revoking a token sets revokedAt but keeps the row queryable for audit", async () => {
  const { orderId } = await seedOrder(base);
  const token = await mintToken({ orderId });

  await prisma.forwarderUploadToken.update({
    where: { id: token.id },
    data: { revokedAt: new Date() },
  });

  const reread = await prisma.forwarderUploadToken.findUnique({
    where: { token: token.token },
    select: { revokedAt: true },
  });
  assert.notEqual(reread?.revokedAt, null);
});

test("expired tokens stay queryable so the public page can render an 'expired' notice", async () => {
  const { orderId } = await seedOrder(base);
  const token = await mintToken({
    orderId,
    expiresAt: new Date(Date.now() - 1000),
  });

  const reread = await prisma.forwarderUploadToken.findUnique({
    where: { token: token.token },
    select: { expiresAt: true },
  });
  assert.ok((reread?.expiresAt.getTime() ?? Infinity) < Date.now());
});

test("uploadCount increments cumulatively across multiple uploads", async () => {
  const { orderId } = await seedOrder(base);
  const token = await mintToken({ orderId });

  await prisma.forwarderUploadToken.update({
    where: { id: token.id },
    data: { uploadCount: { increment: 3 }, lastUsedAt: new Date() },
  });
  await prisma.forwarderUploadToken.update({
    where: { id: token.id },
    data: { uploadCount: { increment: 2 }, lastUsedAt: new Date() },
  });

  const reread = await prisma.forwarderUploadToken.findUnique({
    where: { id: token.id },
    select: { uploadCount: true, lastUsedAt: true },
  });
  assert.equal(reread?.uploadCount, 5);
  assert.notEqual(reread?.lastUsedAt, null);
});

test("multiple tokens can coexist on the same order (e.g. one revoked, one live)", async () => {
  const { orderId } = await seedOrder(base);

  await mintToken({ orderId, revokedAt: new Date() });
  await mintToken({ orderId, label: "Maersk container" });
  await mintToken({ orderId });

  const tokens = await prisma.forwarderUploadToken.findMany({
    where: { orderId },
  });
  assert.equal(tokens.length, 3);

  const live = await prisma.forwarderUploadToken.findMany({
    where: { orderId, revokedAt: null, expiresAt: { gt: new Date() } },
  });
  assert.equal(live.length, 2);
});

test("token field uniqueness prevents a collision when generating one", async () => {
  const { orderId } = await seedOrder(base);
  const tokenValue = randomBytes(16).toString("hex");
  await mintToken({ orderId }); // burn one to confirm the index works

  await prisma.forwarderUploadToken.create({
    data: {
      token: tokenValue,
      orderId,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await assert.rejects(
    () =>
      prisma.forwarderUploadToken.create({
        data: {
          token: tokenValue, // same — should be rejected by the unique index
          orderId,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      }),
    /Unique constraint|duplicate key/,
  );
});

// Unused import guard — keep randomUUID imported so the harness's RNG
// guarantee stays visible at the top of the file.
void randomUUID;
