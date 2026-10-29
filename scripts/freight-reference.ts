/**
 * Recompute the expected prices of tests/fixtures/freight-reference.json after
 * a change of rates or rules in src/lib/freight:
 *
 *   npx tsx scripts/freight-reference.ts
 *
 * Then copy the changed src/lib/freight files and the regenerated file to the
 * administration's simulator (inairis-group/sourcingpick-site:
 * src/lib/freight/ and src/lib/freight/reference.json), so both price alike.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { estimateFreight } from "../src/lib/freight/estimate";
import { parseFreightRequest } from "../src/lib/freight/request";

const file = join(__dirname, "..", "tests", "fixtures", "freight-reference.json");
const cases = JSON.parse(readFileSync(file, "utf8")) as { name: string; request: unknown; estimate: unknown }[];
const updated = cases.map((c) => {
  const request = parseFreightRequest(c.request);
  return { ...c, estimate: request ? estimateFreight(request) : { ok: false, reason: "invalid" } };
});
writeFileSync(file, JSON.stringify(updated, null, 2) + "\n");
console.log(`${updated.length} reference shipments priced again: ${file}`);
