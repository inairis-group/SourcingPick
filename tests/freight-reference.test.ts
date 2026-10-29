import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { estimateFreight } from "../src/lib/freight/estimate";
import { parseFreightRequest } from "../src/lib/freight/request";

/**
 * The administration's simulator (inairis-group/sourcingpick-site, /simulateur)
 * prices with a copy of src/lib/freight. Both price the reference shipments of
 * fixtures/freight-reference.json the same way, and both repositories check it:
 * a rate or a rule changed here fails this test until the copy is changed too
 * (sourcingpick-site, src/lib/freight) and the reference file regenerated in
 * both.
 */
type Case = { name: string; request: unknown; estimate: unknown };

const cases = JSON.parse(readFileSync(join(__dirname, "fixtures", "freight-reference.json"), "utf8")) as Case[];

const price = (raw: unknown) => {
  const request = parseFreightRequest(raw);
  return request ? estimateFreight(request) : { ok: false, reason: "invalid" };
};

test("the reference shipments are there", () => {
  assert.ok(cases.length >= 25);
});

for (const c of cases) {
  test(`reference price: ${c.name}`, () => {
    assert.deepStrictEqual(price(c.request), c.estimate);
  });
}
