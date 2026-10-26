import { test } from "node:test";
import assert from "node:assert/strict";
import { eurCentsFromParts, partsFromTotal, rateIsSane, toMicros } from "../src/lib/freight-quotes/convert";
import { describeTransport, quoteStanding } from "../src/lib/freight-quotes/describe";
import { freightCopy } from "../src/content/freight/simulator";

test("the calculator's total becomes minor units by currency", () => {
  assert.deepEqual(partsFromTotal({ RMB: 4227.12, EUR: 92.7, USD: 29.66 }), { rmbCents: 422712, eurCents: 9270, usdCents: 2966 });
  assert.deepEqual(partsFromTotal(null), { rmbCents: 0, eurCents: 0, usdCents: 0 });
});

test("converted to euros at the day's rates, rounded once on the total", () => {
  const rates = { cnyEur: toMicros(0.134043), usdEur: toMicros(0.893815) };
  // 4227.12 RMB × 0.134043 = 566.62 €; 29.66 $ × 0.893815 = 26.51 €; + 92.70 €.
  assert.equal(eurCentsFromParts({ rmbCents: 422712, eurCents: 9270, usdCents: 2966 }, rates), 68583);
  assert.equal(eurCentsFromParts({ rmbCents: 0, eurCents: 5000, usdCents: 0 }, { cnyEur: null, usdEur: null }), 5000);
});

test("a part in yuan or dollars without its rate is refused, never guessed", () => {
  assert.equal(eurCentsFromParts({ rmbCents: 100, eurCents: 0, usdCents: 0 }, { cnyEur: null, usdEur: toMicros(0.9) }), null);
  assert.equal(eurCentsFromParts({ rmbCents: 0, eurCents: 0, usdCents: 100 }, { cnyEur: toMicros(0.13), usdEur: null }), null);
});

test("rates out of their plausible range are refused (a typo, not a market move)", () => {
  assert.equal(rateIsSane("cnyEur", 0.134), true);
  assert.equal(rateIsSane("cnyEur", 7.46), false);
  assert.equal(rateIsSane("usdEur", 0.89), true);
  assert.equal(rateIsSane("usdEur", 0), false);
  assert.equal(rateIsSane("cnyEur", null), false);
});

test("a quote reads as its mode and line, or its containers; an open quote past its date has expired", () => {
  const fr = freightCopy("fr");
  assert.equal(describeTransport(fr, { mode: "sea", line: "seaHeavy" }), "Bateau · Bateau, grands colis et palettes");
  assert.equal(describeTransport(fr, { mode: "container", line: null, container: { type: "40hc", count: 2 } }), "Conteneur complet · 2 × 40 pieds HC (environ 68 m³)");
  assert.equal(quoteStanding("SENT", new Date(Date.now() - 1000)), "EXPIRED");
  assert.equal(quoteStanding("SENT", new Date(Date.now() + 60_000)), "SENT");
  assert.equal(quoteStanding("ACCEPTED", new Date(Date.now() - 1000)), "ACCEPTED");
});
