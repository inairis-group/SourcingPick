import { test } from "node:test";
import assert from "node:assert/strict";
import {
  auctionCommissionBps,
  auctionCommissionCents,
  auctionFactoryPayoutCents,
} from "../src/lib/pricing/auctions";

// Partner-supplied curve (interim, 2026-06-02):
//   ≤ €10k    → 10%
//   ≤ €50k    → 12%
//   ≤ €100k   → 14%
//   > €100k   → 15%

test("BPS curve hits the four bands at their boundaries", () => {
  assert.equal(auctionCommissionBps(1_000_000), 1000); // €10k → 10%
  assert.equal(auctionCommissionBps(1_000_001), 1200); // just over → 12%
  assert.equal(auctionCommissionBps(5_000_000), 1200); // €50k → 12%
  assert.equal(auctionCommissionBps(5_000_001), 1400); // just over → 14%
  assert.equal(auctionCommissionBps(10_000_000), 1400); // €100k → 14%
  assert.equal(auctionCommissionBps(10_000_001), 1500); // cap → 15%
  assert.equal(auctionCommissionBps(1_000_000_000), 1500); // anything bigger stays at 15%
});

test("Defensive defaults — sub-floor / NaN amounts fall back to 10%", () => {
  assert.equal(auctionCommissionBps(0), 1000);
  assert.equal(auctionCommissionBps(-5), 1000);
  assert.equal(auctionCommissionBps(Number.NaN), 1000);
});

test("commission + factory net always reconciles back to the bid amount", () => {
  const cases = [
    100_000, // €1k
    1_000_000, // €10k boundary
    1_000_100,
    5_000_000, // €50k boundary
    8_000_000,
    10_000_000, // €100k boundary
    12_345_678,
    50_000_000,
  ];
  for (const amount of cases) {
    const commission = auctionCommissionCents(amount);
    const net = auctionFactoryPayoutCents(amount);
    assert.equal(
      commission + net,
      amount,
      `commission(${commission}) + net(${net}) should equal bid ${amount}`,
    );
  }
});

test("Round-to-integer never overshoots when both halves are rounded", () => {
  // Crossing a band boundary where bps × amount is awkward: 12.5% of €1
  // would be 12.5 cents; rounding gives 13. Factory net is then 87, not
  // 88. Total still reconciles because we compute net = amount − commission.
  const amount = 100; // €1
  const commission = auctionCommissionCents(amount);
  const net = auctionFactoryPayoutCents(amount);
  assert.equal(commission + net, amount);
});
