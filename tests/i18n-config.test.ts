import { test } from "node:test";
import assert from "node:assert/strict";
import {
  locales,
  defaultLocale,
  isLocale,
  directionFor,
  localeDirections,
} from "../src/lib/i18n/config";

test("supported locales are fr/en/zh/ar with fr as default", () => {
  assert.deepEqual([...locales], ["fr", "en", "zh", "ar"]);
  assert.equal(defaultLocale, "fr");
});

test("isLocale accepts supported codes and rejects others", () => {
  assert.equal(isLocale("fr"), true);
  assert.equal(isLocale("ar"), true);
  assert.equal(isLocale("de"), false);
  assert.equal(isLocale("EN"), false); // case-sensitive
  assert.equal(isLocale(""), false);
});

test("only Arabic is RTL", () => {
  assert.equal(directionFor("ar"), "rtl");
  assert.equal(directionFor("fr"), "ltr");
  assert.equal(directionFor("en"), "ltr");
  assert.equal(directionFor("zh"), "ltr");
});

test("every locale has a direction mapping", () => {
  for (const l of locales) {
    assert.ok(
      localeDirections[l] === "ltr" || localeDirections[l] === "rtl",
      `missing direction for ${l}`,
    );
  }
});
