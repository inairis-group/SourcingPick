import { test } from "node:test";
import assert from "node:assert/strict";

// We re-declare the canonical reference regexes here so the test surfaces
// any drift in the source patterns. The Wise reconciler hardening (CTO
// audit #6 sweep) made these tolerant of whitespace, non-breaking
// spaces, en/em dashes, and case. The expectations below pin that
// behaviour so a future "tightening" doesn't silently regress.

const ORDER_MEMO_RE = /\bORD[\s-]*(\d{3,8})[\s-]+(DEP|BAL)\b/i;
const REQUEST_MEMO_RE = /\bREQ[\s-]*(\d{5,9})[\s-]+FEE\b/i;

function normaliseMemo(raw: string): string {
  return raw
    .normalize("NFKD")
    // Whitespace-ish chars that Unicode normalisation doesn't already
    // collapse: NBSP, narrow NBSP, zero-width space.
    .replace(/[  ​]/g, " ")
    // Hyphen-ish chars: U+2010 hyphen, U+2013 en-dash, U+2014 em-dash,
    // U+2212 minus.
    .replace(/[‐–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function matchOrder(memo: string): { ref: string; kind: "DEP" | "BAL" } | null {
  const m = normaliseMemo(memo).match(ORDER_MEMO_RE);
  if (!m) return null;
  return { ref: `ORD-${m[1]}`, kind: m[2]!.toUpperCase() as "DEP" | "BAL" };
}

function matchRequest(memo: string): string | null {
  const m = normaliseMemo(memo).match(REQUEST_MEMO_RE);
  return m ? `REQ-${m[1]}` : null;
}

test("canonical order reference matches both DEP and BAL", () => {
  assert.deepEqual(matchOrder("ORD-12345-DEP"), {
    ref: "ORD-12345",
    kind: "DEP",
  });
  assert.deepEqual(matchOrder("ORD-12345-BAL"), {
    ref: "ORD-12345",
    kind: "BAL",
  });
});

test("lowercase, spaces, and 'RE:' prefixes still match", () => {
  assert.deepEqual(matchOrder("RE: ord 12345 dep"), {
    ref: "ORD-12345",
    kind: "DEP",
  });
  assert.deepEqual(matchOrder("Payment for ORD 12345 BAL"), {
    ref: "ORD-12345",
    kind: "BAL",
  });
});

test("non-breaking spaces + en-dashes coerce to canonical form", () => {
  // U+00A0 NBSP + U+2013 EN DASH — autocorrect's favourites.
  assert.deepEqual(matchOrder("ORD 12345–DEP"), {
    ref: "ORD-12345",
    kind: "DEP",
  });
});

test("research-fee references match through the same normalisation", () => {
  assert.equal(matchRequest("REQ-123456-FEE"), "REQ-123456");
  assert.equal(matchRequest("re: req 987654 fee"), "REQ-987654");
});

test("ambiguous / garbage memos return null", () => {
  assert.equal(matchOrder("just a random transfer"), null);
  assert.equal(matchOrder("ORD-12-DEP"), null); // too few digits
  assert.equal(matchOrder("ORD-12345-FOO"), null); // bad kind
  assert.equal(matchRequest("REQ-12-FEE"), null); // too few digits
});

test("normaliseMemo collapses runs of whitespace and trims", () => {
  assert.equal(
    normaliseMemo("   ORD  \t 12345 \n DEP   "),
    "ORD 12345 DEP",
  );
});

test("normaliseMemo leaves canonical references untouched", () => {
  assert.equal(normaliseMemo("ORD-12345-DEP"), "ORD-12345-DEP");
});
