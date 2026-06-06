import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  OrderStatus,
  EscrowStatus,
  InvoiceType,
} from "@prisma/client";
import {
  prisma,
  resetDb,
  seedBaseFixtures,
  seedOrder,
  type BaseFixtures,
} from "./_helpers.ts";
import { finalizeBuyerOrderPayment } from "../../src/lib/stripe/finalize.ts";

// CTO audit F1b / F1c / F2 — the finaliser must respect the order state
// machine and never force COMPLETED out of state. These tests exercise
// the real `finalizeBuyerOrderPayment` against the DB so any drift in
// the lifecycle invariants surfaces here.

let base: BaseFixtures;

before(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

beforeEach(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

// ---------------------------------------------------------------
// DEPOSIT half: PAYMENT_PENDING → PREPARATION + escrow HELD
// ---------------------------------------------------------------

test("DEPOSIT finalisation moves PAYMENT_PENDING → PREPARATION and parks the escrow HELD", async () => {
  const { orderId, depositCents } = await seedOrder(base);

  await finalizeBuyerOrderPayment({
    orderId,
    type: InvoiceType.DEPOSIT,
    amountCents: depositCents,
    provider: "wise",
    providerRef: `wise-test-${randomUUID()}`,
  });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      balancePaidAt: true,
      deliveredAt: true,
    },
  });
  assert.equal(order?.status, OrderStatus.PREPARATION);
  assert.equal(order?.balancePaidAt, null);
  assert.equal(order?.deliveredAt, null);

  const escrows = await prisma.escrowTransaction.findMany({
    where: { orderId },
    select: { amountCents: true, status: true },
  });
  assert.equal(escrows.length, 1);
  assert.equal(escrows[0]!.status, EscrowStatus.HELD);
  assert.equal(escrows[0]!.amountCents, depositCents);
});

test("DEPOSIT on a non-PAYMENT_PENDING order records the escrow but DOESN'T touch status (F1c)", async () => {
  const { orderId, depositCents } = await seedOrder(base);
  // Walk past PAYMENT_PENDING manually to simulate an admin override.
  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.PREPARATION },
  });

  await finalizeBuyerOrderPayment({
    orderId,
    type: InvoiceType.DEPOSIT,
    amountCents: depositCents,
    provider: "wise",
    providerRef: `wise-test-${randomUUID()}`,
  });

  const status = (await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  }))!.status;
  // Still PREPARATION — finaliser respected the existing state and did
  // not force a re-flip or push it further.
  assert.equal(status, OrderStatus.PREPARATION);
});

// ---------------------------------------------------------------
// BALANCE half — F1b: balance + delivery confirm gate COMPLETED
// ---------------------------------------------------------------

test("BALANCE finalisation BEFORE delivery confirm only sets balancePaidAt (F1b)", async () => {
  const { orderId, balanceCents } = await seedOrder(base);
  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.SHIPPED },
  });

  await finalizeBuyerOrderPayment({
    orderId,
    type: InvoiceType.BALANCE,
    amountCents: balanceCents,
    provider: "wise",
    providerRef: `wise-test-${randomUUID()}`,
  });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      balancePaidAt: true,
      deliveredAt: true,
    },
  });
  assert.equal(order?.status, OrderStatus.SHIPPED, "status must stay at SHIPPED until delivery confirmed");
  assert.notEqual(order?.balancePaidAt, null, "balancePaidAt should be stamped by the finaliser");
  assert.equal(order?.deliveredAt, null, "deliveredAt must remain null — buyer hasn't confirmed");

  // No payout dispatched yet — F2 release runs on closure, not on
  // balance settlement.
  const payouts = await prisma.payout.findMany({ where: { factoryOrgId: base.factoryOrg.id } });
  assert.equal(payouts.length, 0, "factory payout must not fire before COMPLETED");
});

test("BALANCE after delivery confirm flips to COMPLETED and releases ALL escrows (F1b + F2)", async () => {
  const { orderId, depositCents, balanceCents } = await seedOrder(base);

  // Pay the deposit first so we have an escrow row to release alongside.
  await finalizeBuyerOrderPayment({
    orderId,
    type: InvoiceType.DEPOSIT,
    amountCents: depositCents,
    provider: "wise",
    providerRef: `wise-test-${randomUUID()}`,
  });

  // Buyer's "I received it" tap — stamps deliveredAt while the order is
  // mid-logistics.
  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.IN_TRANSIT, deliveredAt: new Date() },
  });

  await finalizeBuyerOrderPayment({
    orderId,
    type: InvoiceType.BALANCE,
    amountCents: balanceCents,
    provider: "wise",
    providerRef: `wise-test-${randomUUID()}`,
  });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      balancePaidAt: true,
    },
  });
  assert.equal(order?.status, OrderStatus.COMPLETED, "closure should fire when both gates are open");
  assert.notEqual(order?.balancePaidAt, null);

  // F2 — every HELD escrow released, not just the deposit.
  const escrows = await prisma.escrowTransaction.findMany({
    where: { orderId },
    select: { status: true },
  });
  assert.equal(escrows.length, 2);
  for (const e of escrows) {
    assert.equal(e.status, EscrowStatus.RELEASED, "balance + deposit escrows both need to release");
  }

  // Payout row was created and anchored to the factory.
  const payouts = await prisma.payout.findMany({
    where: { factoryOrgId: base.factoryOrg.id },
  });
  assert.equal(payouts.length, 1, "exactly one Payout row should be created on closure");
});

// ---------------------------------------------------------------
// Idempotency — repeated webhooks must be no-ops
// ---------------------------------------------------------------

test("Idempotent on providerRef: replaying the same DEPOSIT webhook does NOT double-charge the buyer", async () => {
  const { orderId, depositCents } = await seedOrder(base);
  const providerRef = `wise-test-${randomUUID()}`;

  await finalizeBuyerOrderPayment({
    orderId,
    type: InvoiceType.DEPOSIT,
    amountCents: depositCents,
    provider: "wise",
    providerRef,
  });

  // Same payload again — admin-replays via the webhooks page hit this code path.
  const second = await finalizeBuyerOrderPayment({
    orderId,
    type: InvoiceType.DEPOSIT,
    amountCents: depositCents,
    provider: "wise",
    providerRef,
  });

  assert.equal(second.applied, false, "replay should report not-applied");

  const escrows = await prisma.escrowTransaction.findMany({ where: { orderId } });
  assert.equal(escrows.length, 1, "no second escrow row should be created");
  const invoices = await prisma.invoice.findMany({ where: { orderId } });
  assert.equal(invoices.length, 1, "no second invoice row should be created");
});
