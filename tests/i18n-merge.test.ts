import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mergeDictionary } from "../src/lib/i18n/merge";
import { locales } from "../src/lib/i18n/config";

/**
 * The eight languages added with the SaaS canvas ship partial dictionaries.
 * Everything below is about the one guarantee that makes that acceptable:
 * a reader never sees a hole.
 */

test("a translated key wins, an untranslated one falls back", () => {
  const en = { auth: { login: { title: "Log in", submit: "Log in" } } };
  const pl = { auth: { login: { title: "Zaloguj się" } } };
  const merged = mergeDictionary(en, pl);
  assert.equal(merged.auth.login.title, "Zaloguj się");
  assert.equal(merged.auth.login.submit, "Log in");
});

test("merging leaves the base untouched", () => {
  // The English dictionary is merged against eleven times per process. If any
  // of those mutated it, the second language would inherit the first's.
  const en = { a: { b: "en" } };
  mergeDictionary(en, { a: { b: "de" } });
  assert.equal(en.a.b, "en");
});

test("a whole missing section falls back rather than vanishing", () => {
  const en = { admin: { title: "Admin", rows: { empty: "Nothing yet" } } };
  const merged = mergeDictionary(en, {});
  assert.deepEqual(merged, en);
});

test("arrays are replaced, never zipped", () => {
  // A translated list of two must not inherit a third bullet from English.
  const en = { tips: ["one", "two", "three"] };
  const merged = mergeDictionary(en, { tips: ["uno", "dos"] });
  assert.deepEqual(merged.tips, ["uno", "dos"]);
});

test("null and undefined mean 'not translated', not 'blank'", () => {
  // An empty string is a deliberate translation and must survive; a null is
  // an export artefact and must not blank the English out.
  const en = { a: "English", b: "English", c: "English" };
  const merged = mergeDictionary(en, { a: null, b: undefined, c: "" });
  assert.equal(merged.a, "English");
  assert.equal(merged.b, "English");
  assert.equal(merged.c, "");
});

test("every shipped dictionary merges onto English without holes", () => {
  const read = (l: string) =>
    JSON.parse(
      readFileSync(new URL(`../src/lib/i18n/dictionaries/${l}.json`, import.meta.url), "utf8"),
    ) as Record<string, unknown>;

  const en = read("en");
  const leaves = (o: unknown, path = ""): string[] => {
    if (o === null || typeof o !== "object") return [path];
    if (Array.isArray(o)) return [path];
    return Object.entries(o).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  };
  const expected = leaves(en).sort();

  for (const l of locales) {
    const merged = mergeDictionary(en, read(l));
    assert.deepEqual(
      leaves(merged).sort(),
      expected,
      `${l} resolves to a different set of keys than English`,
    );
  }
});
