import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SOURCING_BUYER_BPS,
  SOURCING_SUPPLIER_BPS,
  MARKETPLACE_BUYER_BPS,
  MARKETPLACE_SELLER_BPS,
  MARKETPLACE_NET_DIVISOR_BPS,
  RESEARCH_FEE_DAY_CENTS,
  RESEARCH_FEE_WEEK_CENTS,
  applyBuyerMarkup,
  computeFactoryPayout,
  computeDisputeRefund,
  computeResearchFee,
  buyerMarkupBps,
  supplierFeeBps,
} from "../src/lib/orders/pricing";

test("rate constants match the locked v3 model (sourcing 4%/1%, marketplace 2%/1%)", () => {
  assert.equal(SOURCING_BUYER_BPS, 400);
  assert.equal(SOURCING_SUPPLIER_BPS, 100);
  assert.equal(MARKETPLACE_BUYER_BPS, 200);
  assert.equal(MARKETPLACE_SELLER_BPS, 100);
  // Marketplace listed-price divisor = 1 − 2% − 1% = 97%
  assert.equal(MARKETPLACE_NET_DIVISOR_BPS, 9700);
});

test("buyerMarkupBps / supplierFeeBps resolve per flow", () => {
  assert.equal(buyerMarkupBps("sourcing"), 400);
  assert.equal(buyerMarkupBps("marketplace"), 200);
  assert.equal(supplierFeeBps("sourcing"), 100);
  assert.equal(supplierFeeBps("marketplace"), 100);
});

test("applyBuyerMarkup(sourcing) adds 4%", () => {
  assert.equal(applyBuyerMarkup(10_000, "sourcing"), 10_400); // 100.00 → 104.00
  assert.equal(applyBuyerMarkup(0, "sourcing"), 0);
  // 333 × 1.04 = 346.32 → rounds to 346
  assert.equal(applyBuyerMarkup(333, "sourcing"), 346);
});

test("applyBuyerMarkup(marketplace) adds 2%", () => {
  assert.equal(applyBuyerMarkup(10_000, "marketplace"), 10_200);
  // 555 × 1.02 = 566.10 → rounds to 566
  assert.equal(applyBuyerMarkup(555, "marketplace"), 566);
});

test("computeFactoryPayout(sourcing) deducts 1% supplier fee from gross", () => {
  const r = computeFactoryPayout(10_000, 3, "sourcing"); // unit 100.00 × 3 = 300.00
  assert.equal(r.grossCents, 30_000);
  assert.equal(r.feeCents, 300); // 1% of 30000
  assert.equal(r.netCents, 29_700);
  assert.equal(r.netCents + r.feeCents, r.grossCents);
});

test("computeFactoryPayout(marketplace) deducts 1% seller fee from gross", () => {
  const r = computeFactoryPayout(10_000, 3, "marketplace");
  assert.equal(r.grossCents, 30_000);
  assert.equal(r.feeCents, 300);
  assert.equal(r.netCents, 29_700);
});

test("computeFactoryPayout fee rounds half-up at the cent", () => {
  // gross 12_345 → 1% = 123.45 → rounds to 123
  const r = computeFactoryPayout(12_345, 1, "sourcing");
  assert.equal(r.feeCents, 123);
  assert.equal(r.netCents, 12_222);
});

test("computeDisputeRefund CUSTOM refunds the full escrow", () => {
  const r = computeDisputeRefund(50_000, "CUSTOM");
  assert.equal(r.refundCents, 50_000);
  assert.equal(r.retainedCents, 0);
  assert.equal(r.supplierShareCents, 0);
  assert.equal(r.platformShareCents, 0);
});

test("computeDisputeRefund STANDARD refunds 80%, splits the retained 20% in half", () => {
  const r = computeDisputeRefund(50_000, "STANDARD");
  assert.equal(r.refundCents, 40_000); // 80%
  assert.equal(r.retainedCents, 10_000); // 20%
  assert.equal(r.supplierShareCents, 5_000);
  assert.equal(r.platformShareCents, 5_000);
  assert.equal(
    r.supplierShareCents + r.platformShareCents,
    r.retainedCents,
  );
});

test("computeDisputeRefund never loses a cent on odd retained amounts", () => {
  // escrow 1001 → retained 20% = 200.2 → round 200; split 100/100
  const r = computeDisputeRefund(1_001, "STANDARD");
  assert.equal(r.refundCents + r.retainedCents, 1_001);
  assert.equal(r.supplierShareCents + r.platformShareCents, r.retainedCents);
});

test("research fee rates are €125/day and €500/week", () => {
  assert.equal(RESEARCH_FEE_DAY_CENTS, 12_500);
  assert.equal(RESEARCH_FEE_WEEK_CENTS, 50_000);
});

test("computeResearchFee multiplies the rate by quantity", () => {
  assert.equal(computeResearchFee("DAY", 1), 12_500);
  assert.equal(computeResearchFee("DAY", 3), 37_500);
  assert.equal(computeResearchFee("WEEK", 2), 100_000);
});

test("computeResearchFee honors per-agent overrides", () => {
  assert.equal(
    computeResearchFee("DAY", 2, { dayCents: 20_000 }),
    40_000,
  );
  assert.equal(
    computeResearchFee("WEEK", 1, { weekCents: 60_000 }),
    60_000,
  );
});
