import { test } from "node:test";
import assert from "node:assert/strict";
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

test("the product speaks the four it has a dictionary for", () => {
  assert.deepEqual([...appLocales], ["fr", "en", "zh", "ar"]);
  // Every product language must also be a site language, or a signed-in user
  // could hold a locale the public site cannot render.
  for (const l of appLocales) {
    assert.ok(isLocale(l), `${l} is an app locale but not a site locale`);
  }
});

test("appLocaleFor is total, and identity on the four", () => {
  for (const l of appLocales) {
    assert.equal(appLocaleFor(l), l);
  }
  for (const l of locales) {
    const mapped = appLocaleFor(l);
    assert.ok(isAppLocale(mapped), `${l} mapped to a non-product locale`);
  }
  // The eight the product does not speak read the application in English.
  assert.equal(appLocaleFor("pl"), "en");
  assert.equal(appLocaleFor("tr"), "en");
  assert.equal(appLocaleFor("pt"), "en");
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
