import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeCreditApplication,
  STRIPE_MIN_CHARGE_CENTS,
} from "../src/lib/credit/apply";

test("no balance → nothing applied, full charge stands", () => {
  const r = computeCreditApplication({ chargeCents: 30_000, balanceCents: 0 });
  assert.equal(r.appliedCents, 0);
  assert.equal(r.remainderCents, 30_000);
});

test("balance covers the whole charge → credit-only (remainder 0)", () => {
  const r = computeCreditApplication({ chargeCents: 30_000, balanceCents: 50_000 });
  assert.equal(r.appliedCents, 30_000);
  assert.equal(r.remainderCents, 0);
});

test("balance exactly equals charge → credit-only", () => {
  const r = computeCreditApplication({ chargeCents: 30_000, balanceCents: 30_000 });
  assert.equal(r.appliedCents, 30_000);
  assert.equal(r.remainderCents, 0);
});

test("partial balance → apply it, charge the rest (rest ≥ minimum)", () => {
  const r = computeCreditApplication({ chargeCents: 30_000, balanceCents: 10_000 });
  assert.equal(r.appliedCents, 10_000);
  assert.equal(r.remainderCents, 20_000);
  assert.equal(r.appliedCents + r.remainderCents, 30_000);
});

test("would leave an un-chargeable sub-minimum remainder → defer the credit", () => {
  // charge 300, balance 270 → remainder 30 (< 50 min) → apply nothing
  const r = computeCreditApplication({ chargeCents: 300, balanceCents: 270 });
  assert.equal(r.appliedCents, 0);
  assert.equal(r.remainderCents, 300);
});

test("remainder exactly at the minimum is chargeable", () => {
  // charge 300, balance 250 → remainder 50 (== min) → allowed
  const r = computeCreditApplication({ chargeCents: 300, balanceCents: 250 });
  assert.equal(r.appliedCents, 250);
  assert.equal(r.remainderCents, STRIPE_MIN_CHARGE_CENTS);
});

test("negative balance is clamped to zero", () => {
  const r = computeCreditApplication({ chargeCents: 30_000, balanceCents: -5_000 });
  assert.equal(r.appliedCents, 0);
  assert.equal(r.remainderCents, 30_000);
});
