import { test, before, after } from "node:test";
import assert from "node:assert/strict";

/**
 * Freight FX. The rate is frozen onto the shipment at acceptance, so the only
 * thing that must be right here is: convert correctly, and refuse rather than
 * guess when there's no rate.
 */

const saved = process.env.FX_CNY_EUR;
before(() => { process.env.FX_CNY_EUR = "0.128"; });
after(() => { process.env.FX_CNY_EUR = saved; });

const load = () => import("../src/lib/payments/fx.ts");

test("a configured rate converts CNY minor units to EUR minor units", async () => {
  const { currentRateBps, convertMinorUnits, rateForQuote } = await load();
  assert.equal(currentRateBps(), 1280);

  // ¥5,000.00 at 0.128 → €640.00
  assert.equal(convertMinorUnits(500_000, rateForQuote("CNY")), 64_000);
  // Rounds half-up on the final figure, not per line.
  assert.equal(convertMinorUnits(1, 1280), 0);
  assert.equal(convertMinorUnits(4, 1280), 1);
});

test("EUR quotes need no rate at all", async () => {
  const { rateForQuote, convertMinorUnits } = await load();
  const prev = process.env.FX_CNY_EUR;
  delete process.env.FX_CNY_EUR;
  // A shipper who already quotes EUR must not be blocked by unset FX config.
  assert.equal(rateForQuote("EUR"), 10_000);
  assert.equal(convertMinorUnits(12_345, rateForQuote("eur")), 12_345);
  process.env.FX_CNY_EUR = prev;
});

test("a missing or implausible rate refuses instead of guessing", async () => {
  const { currentRateBps, rateForQuote, FxNotConfiguredError } = await load();
  const prev = process.env.FX_CNY_EUR;

  for (const bad of [undefined, "", "0", "-1", "abc", "12", "0.0001"]) {
    if (bad === undefined) delete process.env.FX_CNY_EUR;
    else process.env.FX_CNY_EUR = bad;
    assert.equal(currentRateBps(), null, `rate ${String(bad)} must be rejected`);
    assert.throws(
      () => rateForQuote("CNY"),
      FxNotConfiguredError,
      "billing €0 freight is worse than an error",
    );
  }
  process.env.FX_CNY_EUR = prev;
});
