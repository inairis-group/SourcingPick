import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js v5 configuration.
 *
 * This file is imported by the proxy (which runs in the Edge runtime) so it
 * must NOT pull in the Prisma adapter or anything Node-only. The full config
 * (with adapter + DB-touching callbacks) lives in `src/lib/auth.ts`.
 *
 * Phase 6 will wire the Credentials provider's authorize() to call into
 * password.ts + otp.ts. For Phase 0 it's a placeholder that always rejects —
 * routes that depend on auth will still build, just won't sign anyone in.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-otp",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      // TODO Phase 1: actual credential validation + 2FA gating
      async authorize() {
        return null;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      // Proxy uses this for optimistic checks. Full role enforcement happens
      // in server-side layouts via requireRole() — proxy is not authorization.
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
