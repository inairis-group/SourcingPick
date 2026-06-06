import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  DisputeStatus,
  DisputeOutcome,
  EscrowStatus,
  OrderStatus,
} from "@prisma/client";
import {
  prisma,
  resetDb,
  seedBaseFixtures,
  seedOrder,
  type BaseFixtures,
} from "./_helpers.ts";

// Dispute lifecycle invariants — we don't call the server actions
// directly (those require an authenticated session); instead we
// exercise the schema and the state-flip semantics that the actions
// depend on, so any drift in the underlying contract surfaces here.

let base: BaseFixtures;

before(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

beforeEach(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

async function seedShippedOrderWithHeldDeposit() {
  const { orderId, depositCents } = await seedOrder(base);
  // Walk to SHIPPED with a HELD deposit escrow + delivered stamp.
  const invoice = await prisma.invoice.create({
    data: {
      reference: `INV-2026-${randomUUID().slice(0, 4).toUpperCase()}`,
      type: "DEPOSIT",
      status: "PAID",
      organizationId: base.clientOrg.id,
      orderId,
      amountCents: depositCents,
      issuedAt: new Date(),
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
    },
    select: { id: true },
  });
  const escrow = await prisma.escrowTransaction.create({
    data: {
      reference: `ESC-2026-${randomUUID().slice(0, 4).toUpperCase()}`,
      orderId,
      invoiceId: invoice.id,
      amountCents: depositCents,
      status: EscrowStatus.HELD,
      provider: "wise",
      providerRef: `wise-${randomUUID()}`,
      fundedAt: new Date(),
    },
    select: { id: true, amountCents: true },
  });
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.SHIPPED,
      deliveredAt: new Date(),
    },
  });
  return { orderId, escrowId: escrow.id, escrowAmount: escrow.amountCents };
}

test("HELD escrows flip to DISPUTED when a dispute opens", async () => {
  const { orderId, escrowId } = await seedShippedOrderWithHeldDeposit();

  // Open a dispute manually (mirrors the action's writes).
  const dispute = await prisma.dispute.create({
    data: {
      reference: `DSP-${randomUUID().slice(0, 5)}`,
      orderId,
      primaryEscrowId: escrowId,
      openedByUserId: base.clientUser.id,
      buyerStatement: "The seams are coming apart and the sizing is way off.",
      status: DisputeStatus.OPEN,
    },
    select: { id: true },
  });
  await prisma.escrowTransaction.updateMany({
    where: { orderId, status: EscrowStatus.HELD },
    data: { status: EscrowStatus.DISPUTED },
  });

  const escrow = await prisma.escrowTransaction.findUnique({
    where: { id: escrowId },
    select: { status: true },
  });
  assert.equal(escrow?.status, EscrowStatus.DISPUTED);

  const d = await prisma.dispute.findUnique({
    where: { id: dispute.id },
    select: { status: true, factoryStatement: true, resolvedAt: true },
  });
  assert.equal(d?.status, DisputeStatus.OPEN);
  assert.equal(d?.factoryStatement, null);
  assert.equal(d?.resolvedAt, null);
});

test("RESOLVED + STANDARD outcome: escrow flips to REFUNDED, dispute carries the cents math", async () => {
  const { orderId, escrowId, escrowAmount } =
    await seedShippedOrderWithHeldDeposit();

  const dispute = await prisma.dispute.create({
    data: {
      reference: `DSP-${randomUUID().slice(0, 5)}`,
      orderId,
      primaryEscrowId: escrowId,
      openedByUserId: base.clientUser.id,
      buyerStatement: "Defects on stitching, colour off vs the sample.",
      status: DisputeStatus.OPEN,
    },
    select: { id: true },
  });
  await prisma.escrowTransaction.update({
    where: { id: escrowId },
    data: { status: EscrowStatus.DISPUTED },
  });

  // STANDARD math: refund 80% of escrow, retain 20% (10% platform / 10% supplier).
  const refundCents = Math.round(escrowAmount * 0.8);
  const retainedCents = escrowAmount - refundCents;
  const platformShareCents = Math.round(retainedCents / 2);
  const supplierShareCents = retainedCents - platformShareCents;

  await prisma.$transaction([
    prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: { status: EscrowStatus.REFUNDED, releasedAt: new Date() },
    }),
    prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: DisputeStatus.RESOLVED,
        outcome: DisputeOutcome.STANDARD,
        adminDecision: "Photos show clear off-spec stitching; standard refund applies.",
        resolvedAt: new Date(),
        resolvedById: base.adminUser.id,
        refundCents,
        retainedCents,
        platformShareCents,
        supplierShareCents,
      },
    }),
  ]);

  const reread = await prisma.dispute.findUnique({
    where: { id: dispute.id },
    select: {
      status: true,
      outcome: true,
      refundCents: true,
      retainedCents: true,
      platformShareCents: true,
      supplierShareCents: true,
    },
  });
  assert.equal(reread?.status, DisputeStatus.RESOLVED);
  assert.equal(reread?.outcome, DisputeOutcome.STANDARD);
  assert.equal(reread?.refundCents, refundCents);
  assert.equal(
    (reread?.platformShareCents ?? 0) + (reread?.supplierShareCents ?? 0),
    reread?.retainedCents,
  );

  const escrow = await prisma.escrowTransaction.findUnique({
    where: { id: escrowId },
    select: { status: true },
  });
  assert.equal(escrow?.status, EscrowStatus.REFUNDED);
});

test("RESOLVED + REJECT: escrow returns to HELD so normal release can run", async () => {
  const { orderId, escrowId, escrowAmount } =
    await seedShippedOrderWithHeldDeposit();

  await prisma.dispute.create({
    data: {
      reference: `DSP-${randomUUID().slice(0, 5)}`,
      orderId,
      primaryEscrowId: escrowId,
      openedByUserId: base.clientUser.id,
      buyerStatement: "I don't like the colour, I want a full refund.",
      status: DisputeStatus.OPEN,
    },
  });
  await prisma.escrowTransaction.update({
    where: { id: escrowId },
    data: { status: EscrowStatus.DISPUTED },
  });

  // Admin rejects: escrow goes back to HELD, no refund.
  await prisma.$transaction([
    prisma.escrowTransaction.updateMany({
      where: { orderId, status: EscrowStatus.DISPUTED },
      data: { status: EscrowStatus.HELD },
    }),
    prisma.dispute.updateMany({
      where: { orderId },
      data: {
        status: DisputeStatus.RESOLVED,
        outcome: DisputeOutcome.REJECT,
        refundCents: 0,
        retainedCents: escrowAmount,
        resolvedAt: new Date(),
      },
    }),
  ]);

  const escrow = await prisma.escrowTransaction.findUnique({
    where: { id: escrowId },
    select: { status: true },
  });
  assert.equal(escrow?.status, EscrowStatus.HELD);
});

test("@@unique-like guard: code-level prevention of two open disputes per order", async () => {
  // Schema doesn't enforce one-active-dispute-per-order at the column
  // level (would block the legitimate case of a REJECT-then-reopen).
  // The action enforces it. Verify the underlying query the action
  // uses returns the open dispute correctly.
  const { orderId, escrowId } = await seedShippedOrderWithHeldDeposit();

  await prisma.dispute.create({
    data: {
      reference: `DSP-${randomUUID().slice(0, 5)}`,
      orderId,
      primaryEscrowId: escrowId,
      openedByUserId: base.clientUser.id,
      buyerStatement: "First dispute opened",
      status: DisputeStatus.OPEN,
    },
  });
  const openOnes = await prisma.dispute.findMany({
    where: { orderId, status: { not: DisputeStatus.RESOLVED } },
    select: { id: true },
  });
  assert.equal(openOnes.length, 1);
});
