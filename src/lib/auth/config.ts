import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js v5 configuration.
 *
 * This file is imported by the proxy (which runs in the Edge runtime) so it
 * must NOT pull in the Prisma adapter or anything Node-only. The full config
 * (with adapter + DB-touching callbacks + the REAL credential/2FA logic)
 * lives in `src/lib/auth.ts`.
 *
 * The Credentials provider here intentionally returns null: actual sign-in
 * (password verification + email-OTP 2FA gating) happens in the Node config
 * in auth.ts, which is what the route handlers use. Do NOT implement
 * credential validation in this file — it would force Prisma/password.ts into
 * the Edge bundle and break the proxy. The proxy only uses the `authorized`
 * callback below for optimistic redirects; real authorization is enforced
 * server-side via requireRole() in layouts.
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
      // Intentional no-op — see file header. Real authorize() is in auth.ts.
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
