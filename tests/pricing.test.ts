import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BUYER_MARKUP_BPS,
  SUPPLIER_FEE_BPS,
  MARKETPLACE_NET_DIVISOR_BPS,
  RESEARCH_FEE_DAY_CENTS,
  RESEARCH_FEE_WEEK_CENTS,
  applyBuyerMarkup,
  computeFactoryPayout,
  computeDisputeRefund,
  computeResearchFee,
} from "../src/lib/orders/pricing";

test("rate constants match the locked v2 model (6% buyer / 3% supplier)", () => {
  assert.equal(BUYER_MARKUP_BPS, 600);
  assert.equal(SUPPLIER_FEE_BPS, 300);
  // divisor used to derive marketplace listed price = 1 − 6% − 3% = 91%
  assert.equal(MARKETPLACE_NET_DIVISOR_BPS, 9100);
});

test("applyBuyerMarkup adds 6% and rounds to the nearest cent", () => {
  assert.equal(applyBuyerMarkup(10_000), 10_600); // 100.00 → 106.00
  assert.equal(applyBuyerMarkup(0), 0);
  // 333 * 1.06 = 352.98 → rounds to 353
  assert.equal(applyBuyerMarkup(333), 353);
});

test("computeFactoryPayout deducts 3% supplier fee from gross", () => {
  const r = computeFactoryPayout(10_000, 3); // unit 100.00 × 3 = 300.00
  assert.equal(r.grossCents, 30_000);
  assert.equal(r.feeCents, 900); // 3% of 30000
  assert.equal(r.netCents, 29_100);
  // net + fee always reconstitutes gross
  assert.equal(r.netCents + r.feeCents, r.grossCents);
});

test("computeFactoryPayout fee rounds half-up at the cent", () => {
  // gross 1_050 → 3% = 31.5 → rounds to 32
  const r = computeFactoryPayout(1_050, 1);
  assert.equal(r.feeCents, 32);
  assert.equal(r.netCents, 1_018);
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
  // the split always reconstitutes the retained amount (no lost cents)
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

test("computeResearchFee floors fractional and clamps negative quantities", () => {
  assert.equal(computeResearchFee("DAY", 2.9), 25_000); // floor → 2
  assert.equal(computeResearchFee("WEEK", -5), 0); // clamp → 0
  assert.equal(computeResearchFee("DAY", 0), 0);
});
