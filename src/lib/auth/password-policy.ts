import { z } from "zod";

/**
 * What counts as an acceptable password.
 *
 * The 2026-09 SaaS canvas states the rule in the signup screen's own helper
 * text: "8 caractères minimum, dont un chiffre." That replaces the twelve
 * characters the application used to require.
 *
 * Caystone decided this explicitly on 2026-09-24, after the trade was put to
 * him: a shorter minimum is easier to attack, and it applies to accounts that
 * already exist. Recording the reasoning because a future reader will
 * otherwise assume the floor drifted down by accident. It did not, and the
 * rule is not unusual — NIST SP 800-63B sets eight characters as its own
 * minimum for user-chosen secrets. The canvas also adds a composition
 * requirement the old rule lacked, which is kept.
 *
 * One schema, exported, rather than the five call sites that each used to
 * carry their own `min(12)`. A password rule that lives in five places is a
 * rule that gets changed in four.
 *
 * The helper text the reader sees comes from `auth.signup.passwordHint` in
 * the dictionaries. It says the same thing in all twelve languages, so the
 * words and the check cannot drift apart without someone noticing.
 */
export const MIN_PASSWORD_LENGTH = 8;

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
  .max(200, "Password is too long.")
  .regex(/\d/, "Password must contain at least one number.");
