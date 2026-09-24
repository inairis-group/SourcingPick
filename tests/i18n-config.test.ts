import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  appLocaleFor,
  appLocales,
  defaultLocale,
  directionFor,
  isAppLocale,
  isLocale,
  localeDirections,
  localeLabels,
  localeTags,
  locales,
} from "../src/lib/i18n/config";

test("the site speaks the canvas's twelve, French by default", () => {
  assert.deepEqual(
    [...locales],
    ["fr", "en", "zh", "es", "de", "it", "pt", "nl", "ar", "ru", "tr", "pl"],
  );
  assert.equal(defaultLocale, "fr");
});

test("the product speaks every language the site does", () => {
  // These were four until the 2026-09 SaaS canvas. Nothing may now be
  // downgraded on its way from a marketing page into the application, so the
  // two sets are the same set.
  assert.deepEqual([...appLocales], [...locales]);
  for (const l of appLocales) {
    assert.ok(isLocale(l), `${l} is an app locale but not a site locale`);
  }
});

test("appLocaleFor is the identity, and stays total", () => {
  for (const l of locales) {
    assert.equal(appLocaleFor(l), l, `${l} was not preserved`);
    assert.ok(isAppLocale(appLocaleFor(l)), `${l} mapped to a non-product locale`);
  }
});

test("the database enum holds every locale the site offers", () => {
  // A visitor signing up from the Polish site writes `pl` into User.locale.
  // If the schema and this list ever part company that write throws at
  // runtime, on the one path where the account is already half-created.
  const schema = readFileSync(
    new URL("../prisma/schema.prisma", import.meta.url),
    "utf8",
  );
  const block = /enum Locale \{([^}]*)\}/.exec(schema);
  assert.ok(block, "no Locale enum in schema.prisma");
  const values = block[1]
    .split("\n")
    .map((l) => l.replace(/\/\/.*/, "").trim())
    .filter(Boolean);
  assert.deepEqual(values, [...locales]);
});

test("every locale has a dictionary of its own", async () => {
  // Not a loader that falls back — a file. The per-key merge in
  // get-dictionary.ts is what makes a partial file safe, and it only runs for
  // files that exist.
  for (const l of locales) {
    const path = new URL(`../src/lib/i18n/dictionaries/${l}.json`, import.meta.url);
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    assert.ok(
      parsed && typeof parsed === "object" && Object.keys(parsed).length > 0,
      `${l}.json is missing or empty`,
    );
  }
});

test("isLocale accepts supported codes and rejects others", () => {
  assert.equal(isLocale("fr"), true);
  assert.equal(isLocale("ar"), true);
  assert.equal(isLocale("de"), true);
  assert.equal(isLocale("ja"), false);
  assert.equal(isLocale("EN"), false); // case-sensitive
  assert.equal(isLocale(""), false);
});

test("only Arabic is RTL", () => {
  assert.equal(directionFor("ar"), "rtl");
  for (const l of locales) {
    if (l !== "ar") assert.equal(directionFor(l), "ltr", `${l} should be ltr`);
  }
});

test("every locale has a direction, a label and a BCP 47 tag", () => {
  for (const l of locales) {
    assert.ok(
      localeDirections[l] === "ltr" || localeDirections[l] === "rtl",
      `missing direction for ${l}`,
    );
    assert.ok(localeLabels[l]?.length, `missing label for ${l}`);
    assert.ok(localeTags[l]?.length, `missing BCP 47 tag for ${l}`);
  }
});
