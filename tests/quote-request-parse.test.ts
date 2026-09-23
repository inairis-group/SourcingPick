import { test } from "node:test";
import assert from "node:assert/strict";
import { QuoteRequestKind, QuoteRequestService } from "@prisma/client";
import { parseQuoteRequest } from "../src/lib/quotes/parse";

/**
 * Reading the public quote form.
 *
 * Two things are worth protecting here. The field names are the artboard's own
 * element ids, so a re-export that renames one has to fail loudly rather than
 * silently drop an answer. And the radio groups post an *index*, because the
 * canvas drew them without values — if those two lists ever fall out of step
 * with the order the designer drew, a visitor asking for sourcing would be
 * recorded as asking for logistics, which is a different price.
 */

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

/** The minimum the server accepts, and nothing more. */
function minimal(extra: Record<string, string> = {}): FormData {
  return form({
    "q-products": "LED desk lamps",
    "q-country": "NL",
    "q-name": "Ada Lovelace",
    "q-email": "ada@example.com",
    consent: "on",
    ...extra,
  });
}

test("accepts the minimum and leaves everything unfilled as null", () => {
  const r = parseQuoteRequest(minimal());
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.data.products, "LED desk lamps");
  assert.equal(r.data.destinationCountry, "NL");
  assert.equal(r.data.email, "ada@example.com");
  // Unanswered measurements are absent, not empty strings — the difference
  // between "they didn't say" and "they said nothing".
  assert.equal(r.data.quantity, null);
  assert.equal(r.data.volume, null);
  assert.equal(r.data.company, null);
  assert.equal(r.data.message, null);
});

test("radio indices map to the options in the order the canvas drew them", () => {
  const logistics = parseQuoteRequest(minimal({ service: "0", type: "0" }));
  assert.equal(logistics.ok && logistics.data.service, QuoteRequestService.LOGISTICS);
  assert.equal(logistics.ok && logistics.data.kind, QuoteRequestKind.BUSINESS);

  const sourcing = parseQuoteRequest(minimal({ service: "1", type: "1" }));
  assert.equal(sourcing.ok && sourcing.data.service, QuoteRequestService.SOURCING_LOGISTICS);
  assert.equal(sourcing.ok && sourcing.data.kind, QuoteRequestKind.INDIVIDUAL);
});

test("a missing or nonsense radio falls back to the first option", () => {
  // The canvas pre-checks the first of each pair, so its value is the one a
  // browser posts by default — anything else means tampering, and guessing
  // the drawn default beats rejecting the whole request.
  for (const raw of ["", "9", "-1", "abc", "1.5"]) {
    const r = parseQuoteRequest(minimal({ service: raw }));
    assert.equal(r.ok && r.data.service, QuoteRequestService.LOGISTICS, `service=${raw}`);
  }
  const absent = parseQuoteRequest(minimal());
  assert.equal(absent.ok && absent.data.service, QuoteRequestService.LOGISTICS);
});

test("the four answers needed to reply are required", () => {
  const cases: [Record<string, string>, string][] = [
    [{ "q-products": " " }, "missing_products"],
    [{ "q-name": "A" }, "missing_name"],
    [{ "q-email": "not-an-email" }, "invalid_email"],
  ];
  for (const [override, error] of cases) {
    const r = parseQuoteRequest(minimal(override));
    assert.equal(r.ok, false);
    assert.equal(!r.ok && r.error, error);
  }
});

test("the country is checked against the list, not the select that rendered it", () => {
  for (const bad of ["", "ZZ", "FRANCE", "f"]) {
    const r = parseQuoteRequest(minimal({ "q-country": bad }));
    assert.equal(!r.ok && r.error, "missing_country", `country=${bad}`);
  }
  const lower = parseQuoteRequest(minimal({ "q-country": "fr" }));
  assert.equal(lower.ok && lower.data.destinationCountry, "FR");
});

test("consent is not optional", () => {
  const fd = minimal();
  fd.delete("consent");
  const r = parseQuoteRequest(fd);
  assert.equal(!r.ok && r.error, "missing_consent");
});

test("free text is trimmed, lowercased where it is an address, and bounded", () => {
  const r = parseQuoteRequest(
    minimal({
      "q-email": "  ADA@Example.COM  ",
      "q-name": "  Ada  ",
      "q-msg": "x".repeat(5000),
      "q-products": "y".repeat(900),
    }),
  );
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.data.email, "ada@example.com");
  assert.equal(r.data.name, "Ada");
  // Bounded rather than rejected: a visitor who pastes an essay should not
  // lose the request over it.
  assert.equal(r.data.message?.length, 4000);
  assert.equal(r.data.products.length, 500);
});

test("attachments are bounded per file, in total, and by type", async () => {
  const { validateQuoteFiles } = await import("../src/lib/quotes/files");
  const f = (name: string, type: string, size: number) => ({ name, type, size });
  const pdf = (mb: number) => f("proforma.pdf", "application/pdf", mb * 1024 * 1024);

  assert.equal(validateQuoteFiles([pdf(1), pdf(2)]).ok, true);

  // Per file.
  const big = validateQuoteFiles([pdf(11)]);
  assert.equal(!big.ok && big.error, "file_too_large");

  // In total, even when every file is individually fine.
  const many = validateQuoteFiles(Array.from({ length: 4 }, () => pdf(9)));
  assert.equal(!many.ok && many.error, "total_too_large");

  // Count.
  const lots = validateQuoteFiles(Array.from({ length: 9 }, () => pdf(0.1)));
  assert.equal(!lots.ok && lots.error, "too_many_files");

  // Type — the page promises PDF, JPG or PNG, so it accepts those and no more.
  for (const [name, type] of [
    ["clip.mp4", "video/mp4"],
    ["sheet.xlsx", "application/vnd.ms-excel"],
    ["notes.txt", "text/plain"],
  ] as const) {
    const bad = validateQuoteFiles([f(name, type, 1024)]);
    assert.equal(!bad.ok && bad.error, "unsupported_type", name);
  }
  for (const [name, type] of [
    ["a.pdf", "application/pdf"],
    ["b.jpg", "image/jpeg"],
    ["c.png", "image/png"],
  ] as const) {
    assert.equal(validateQuoteFiles([f(name, type, 1024)]).ok, true, name);
  }

  // A scanner app that reports no MIME type at all still gets a look, by
  // extension — otherwise a perfectly good PDF is refused for a missing header.
  assert.equal(validateQuoteFiles([f("scan.pdf", "", 2048)]).ok, true);
  const noTypeBad = validateQuoteFiles([f("archive.zip", "", 2048)]);
  assert.equal(!noTypeBad.ok && noTypeBad.error, "unsupported_type");

  // An empty file input posts a zero-byte entry; it is not a selection.
  assert.equal(validateQuoteFiles([f("", "application/octet-stream", 0)]).ok, true);
});
