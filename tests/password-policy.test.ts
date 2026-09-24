import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MIN_PASSWORD_LENGTH, passwordSchema } from "../src/lib/auth/password-policy";
import { locales } from "../src/lib/i18n/config";

/**
 * The password rule is the one place the 2026-09 rebuild changed something
 * security-relevant, and it was changed on an explicit decision rather than by
 * drift. These tests exist so the next change is also a decision.
 */

test("the floor is the canvas's eight, and it is a deliberate number", () => {
  assert.equal(MIN_PASSWORD_LENGTH, 8);
});

test("length and composition are both enforced", () => {
  assert.equal(passwordSchema.safeParse("abc1").success, false, "too short");
  assert.equal(passwordSchema.safeParse("abcdefghijkl").success, false, "no digit");
  assert.equal(passwordSchema.safeParse("abcdefg1").success, true, "eight with a digit");
  assert.equal(passwordSchema.safeParse("a".repeat(201) + "1").success, false, "absurdly long");
});

test("every language's hint states the rule the server actually enforces", () => {
  // A hint that undersells the requirement produces rejected forms; one that
  // oversells it turns people away. Either way the words and the check have
  // to agree, and there are twelve sets of words.
  for (const l of locales) {
    const dict = JSON.parse(
      readFileSync(new URL(`../src/lib/i18n/dictionaries/${l}.json`, import.meta.url), "utf8"),
    ) as { auth?: { signup?: { passwordHint?: string } } };
    const hint = dict.auth?.signup?.passwordHint;
    assert.ok(hint, `${l} has no password hint`);
    // Arabic writes its numerals in Eastern Arabic script, so match either.
    assert.match(
      hint,
      new RegExp(`(${MIN_PASSWORD_LENGTH}|٨)`),
      `${l} hint does not mention the ${MIN_PASSWORD_LENGTH}-character minimum: ${hint}`,
    );
  }
});
