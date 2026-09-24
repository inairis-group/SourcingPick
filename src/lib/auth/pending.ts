/**
 * The half-authenticated state between a correct password and a verified
 * one-time code.
 *
 * Lives here rather than in `actions.ts` because that file is `"use server"`,
 * and a `"use server"` module may export only async functions — a constant
 * there compiles and then fails at runtime when something imports it. The
 * verification screen needs the cookie's name to show whose inbox it just
 * wrote to, so the name has to be somewhere a server component can read it.
 */
export const AUTH_PENDING_COOKIE = "sp_auth_pending";

/** Ten minutes: long enough to fetch a code, short enough to be worthless later. */
export const AUTH_PENDING_TTL_S = 10 * 60;
