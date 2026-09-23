import { test } from "node:test";
import assert from "node:assert/strict";
import {
  localeFromCookie,
  localeFromAcceptLanguage,
  resolveLocale,
} from "../src/lib/i18n/match-locale";

test("localeFromCookie returns the locale only for supported values", () => {
  assert.equal(localeFromCookie("en"), "en");
  assert.equal(localeFromCookie("ar"), "ar");
  assert.equal(localeFromCookie("de"), "de");
  assert.equal(localeFromCookie("ja"), null);
  assert.equal(localeFromCookie(undefined), null);
});

test("localeFromAcceptLanguage matches BCP-47 down to a supported base", () => {
  assert.equal(localeFromAcceptLanguage("fr-CA,fr;q=0.9"), "fr");
  assert.equal(localeFromAcceptLanguage("en-GB"), "en");
  assert.equal(localeFromAcceptLanguage("zh-Hans-CN"), "zh");
  assert.equal(localeFromAcceptLanguage("ar-AE"), "ar");
});

test("localeFromAcceptLanguage matches the eight added with the canvas", () => {
  assert.equal(localeFromAcceptLanguage("de-DE,it;q=0.8"), "de");
  assert.equal(localeFromAcceptLanguage("pt-BR"), "pt");
  assert.equal(localeFromAcceptLanguage("pl"), "pl");
  assert.equal(localeFromAcceptLanguage("tr-TR"), "tr");
});

test("localeFromAcceptLanguage falls back to default on no match / empty", () => {
  assert.equal(localeFromAcceptLanguage("ja-JP,ko;q=0.8"), "fr");
  assert.equal(localeFromAcceptLanguage(null), "fr");
  assert.equal(localeFromAcceptLanguage(""), "fr");
});

test("resolveLocale prefers a valid cookie over Accept-Language", () => {
  // cookie wins when valid
  assert.equal(resolveLocale("zh", "en-GB"), "zh");
  // invalid cookie falls through to Accept-Language
  assert.equal(resolveLocale("ja", "en-GB"), "en");
  // neither → default
  assert.equal(resolveLocale(undefined, null), "fr");
});
