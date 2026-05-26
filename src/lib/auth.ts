import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";

/**
 * Auth.js v5 (node runtime).
 *
 * Credentials provider validates email + password against the User table.
 * 2FA (email-OTP) is a SEPARATE flow handled via server actions in
 * `src/lib/auth/actions.ts` — it's not implemented yet in this Credentials
 * provider. Today: password-only sign-in. TODO Phase 1.x: wire 2FA gate.
 *
 * Pages config points the unauthenticated user at our localised /login route
 * (the locale prefix is added by the proxy when needed).
 *
 * NextAuth + Credentials requires JWT session strategy — DB sessions don't
 * work with credentials. Session-invalidation will be added later via a
 * tokenVersion field if/when we need server-side "kick this user out".
 */

const CredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
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
      },
      async authorize(raw) {
        const parsed = CredentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email, deletedAt: null },
        });
        if (!user || !user.passwordHash) return null;

        const ok = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        // Users with 2FA on do NOT complete sign-in here — the login server
        // action sends them to /verify-otp and finishes via the
        // `credentials-otp` provider below after the OTP is consumed.
        if (user.twoFactorEnabled) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastSeenAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
          subRole: user.subRole,
          organizationId: user.organizationId,
          locale: user.locale,
          twoFactorVerified: true,
        };
      },
    }),
    /**
     * Step-2 completer for the 2FA flow. The OTP server action validates and
     * consumes the OTP, then calls signIn("credentials-otp", { userId }) to
     * mint the JWT.
     *
     * Security: this provider trusts the caller's userId ONLY when a fresh
     * EmailOtp.consumedAt exists for that user within the last 60 seconds.
     * Anyone calling signIn("credentials-otp") with an arbitrary userId
     * without first burning a real OTP gets null. The 60s window matches the
     * server action's lifetime — a stolen call replayed minutes later fails.
     */
    Credentials({
      id: "credentials-otp",
      name: "Email OTP",
      credentials: {
        userId: { label: "User ID", type: "text" },
      },
      async authorize(raw) {
        const userId = typeof raw?.userId === "string" ? raw.userId : null;
        if (!userId) return null;

        const recent = await prisma.emailOtp.findFirst({
          where: {
            userId,
            consumedAt: { gte: new Date(Date.now() - 60_000) },
          },
          orderBy: { consumedAt: "desc" },
          select: { id: true },
        });
        if (!recent) return null;

        const user = await prisma.user.findUnique({
          where: { id: userId, deletedAt: null },
        });
        if (!user) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastSeenAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
          subRole: user.subRole,
          organizationId: user.organizationId,
          locale: user.locale,
          twoFactorVerified: true,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subRole = user.subRole;
        token.organizationId = user.organizationId;
        token.locale = user.locale;
        token.twoFactorVerified = user.twoFactorVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as never;
        session.user.subRole = token.subRole as never;
        session.user.organizationId = token.organizationId as string;
        session.user.locale = token.locale as never;
        session.user.twoFactorVerified = Boolean(token.twoFactorVerified);
      }
      return session;
    },
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
  },
});
