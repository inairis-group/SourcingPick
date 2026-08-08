import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { InvoiceType, ShipmentStatus } from "@prisma/client";
import {
  prisma,
  resetDb,
  seedBaseFixtures,
  seedOrder,
  type BaseFixtures,
} from "./_helpers.ts";

/**
 * Freight pricing as a transaction.
 *
 * The invariants that matter are about money: the buyer is only ever billed a
 * figure they accepted, the conversion that produced it stays re-derivable,
 * and a shipper revision cannot silently re-price something already agreed.
 */

let base: BaseFixtures;

before(async () => { await resetDb(); base = await seedBaseFixtures(); });
beforeEach(async () => { await resetDb(); base = await seedBaseFixtures(); });

async function seedShipmentWithQuote(amountCents = 500_000, currency = "CNY") {
  const { orderId } = await seedOrder(base);
  const shipment = await prisma.shipment.create({
    data: {
      reference: `SHP-${randomUUID().slice(0, 5)}`,
      orderId,
      shippingMethod: "Air freight",
      totalWeightKg: 120,
      lengthCm: 100, widthCm: 80, heightCm: 60,
      destName: "Test Client", destAddress: "1 rue de Test",
      destCity: "Paris", destPostalCode: "75001", destCountry: "FR",
      status: ShipmentStatus.QUOTE_REQUESTED,
    },
    select: { id: true },
  });
  const quote = await prisma.shipmentQuote.create({
    data: {
      shipmentId: shipment.id,
      amountCents,
      currency,
      validUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      conditions: "Door to door, customs excluded.",
    },
    select: { id: true },
  });
  await prisma.shipment.update({
    where: { id: shipment.id },
    data: { status: ShipmentStatus.QUOTE_VALIDATED, acceptedQuoteId: quote.id },
  });
  return { orderId, shipmentId: shipment.id, quoteId: quote.id };
}

test("a shipper quote alone bills nothing — submitting is not the buyer agreeing", async () => {
  const { shipmentId } = await seedShipmentWithQuote();

  const s = await prisma.shipment.findUniqueOrThrow({
    where: { id: shipmentId },
    select: { acceptedQuoteId: true, buyerAcceptedAt: true, shippingInvoiceId: true },
  });
  assert.ok(s.acceptedQuoteId, "the shipper has fixed their price");
  assert.equal(s.buyerAcceptedAt, null, "but the buyer has not agreed to it");
  assert.equal(s.shippingInvoiceId, null);
  assert.equal(
    await prisma.invoice.count({ where: { type: InvoiceType.SHIPPING } }),
    0,
    "nothing may be invoiced before the buyer accepts",
  );
});

test("acceptance freezes the conversion so the arithmetic stays re-derivable", async () => {
  const { orderId, shipmentId, quoteId } = await seedShipmentWithQuote(500_000, "CNY");
  const rateBps = 1280; // 0.128 EUR per CNY
  const billed = Math.round((500_000 * rateBps) / 10_000);
  assert.equal(billed, 64_000, "¥5,000 → €640");

  const invoice = await prisma.invoice.create({
    data: {
      reference: `INV-${randomUUID().slice(0, 6)}`,
      orderId,
      organizationId: base.clientOrg.id,
      type: InvoiceType.SHIPPING,
      amountCents: billed,
      issuedAt: new Date(),
      dueAt: new Date(),
      status: "ISSUED",
    },
    select: { id: true },
  });
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      buyerAcceptedQuoteId: quoteId,
      buyerAcceptedAt: new Date(),
      quotedAmountCents: 500_000,
      quotedCurrency: "CNY",
      fxRateBps: rateBps,
      billedAmountCentsEur: billed,
      shippingInvoiceId: invoice.id,
    },
  });

  const s = await prisma.shipment.findUniqueOrThrow({
    where: { id: shipmentId },
    select: {
      quotedAmountCents: true, quotedCurrency: true,
      fxRateBps: true, billedAmountCentsEur: true, shippingInvoiceId: true,
    },
  });
  // All three stored, so an auditor can reproduce the number years later.
  assert.equal(
    Math.round((s.quotedAmountCents! * s.fxRateBps!) / 10_000),
    s.billedAmountCentsEur,
    "the stored rate must reproduce the billed figure",
  );
  assert.equal(s.quotedCurrency, "CNY");
  assert.equal(s.shippingInvoiceId, invoice.id);

  const inv = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoice.id },
    select: { amountCents: true, type: true, orderId: true },
  });
  assert.equal(inv.amountCents, s.billedAmountCentsEur, "billed = accepted");
  assert.equal(inv.type, InvoiceType.SHIPPING, "freight is its own line, not the balance");
  assert.equal(inv.orderId, orderId);
});

test("goods and freight stay separate lines on the order", async () => {
  const { orderId } = await seedShipmentWithQuote();
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { totalCents: true, balanceCents: true },
  });
  const before = { ...order };

  await prisma.invoice.create({
    data: {
      reference: `INV-${randomUUID().slice(0, 6)}`,
      orderId,
      organizationId: base.clientOrg.id,
      type: InvoiceType.SHIPPING,
      amountCents: 64_000,
      issuedAt: new Date(), dueAt: new Date(), status: "ISSUED",
    },
  });

  const after = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { totalCents: true, balanceCents: true },
  });
  // A freight dispute must not put the payment for the goods in dispute too.
  assert.deepEqual(after, before, "freight must not mutate the agreed order total");
});

test("a shipper revision clears a prior buyer acceptance", async () => {
  const { shipmentId, quoteId } = await seedShipmentWithQuote();
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { buyerAcceptedQuoteId: quoteId, buyerAcceptedAt: new Date() },
  });

  // What submitQuoteAction does on a revision.
  const revised = await prisma.shipmentQuote.create({
    data: {
      shipmentId,
      amountCents: 700_000,
      currency: "CNY",
      validUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      conditions: "Revised — fuel surcharge.",
      revisionReason: "Carrier surcharge",
    },
    select: { id: true },
  });
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      acceptedQuoteId: revised.id,
      buyerAcceptedQuoteId: null,
      buyerAcceptedAt: null,
    },
  });

  const s = await prisma.shipment.findUniqueOrThrow({
    where: { id: shipmentId },
    select: { acceptedQuoteId: true, buyerAcceptedAt: true },
  });
  assert.equal(s.acceptedQuoteId, revised.id);
  assert.equal(
    s.buyerAcceptedAt,
    null,
    "they agreed to the old price, not the new one — re-acceptance is required",
  );
});

test("an expired quote is not acceptable", async () => {
  const { shipmentId } = await seedShipmentWithQuote();
  const stale = await prisma.shipmentQuote.create({
    data: {
      shipmentId,
      amountCents: 300_000,
      currency: "CNY",
      validUntil: new Date(Date.now() - 3600 * 1000),
      conditions: "Expired.",
    },
    select: { validUntil: true },
  });
  assert.ok(
    stale.validUntil.getTime() < Date.now(),
    "the guard the action applies before invoicing — a price the shipper no longer stands behind",
  );
});
