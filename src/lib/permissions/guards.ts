import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

/**
 * Server-side guards for role-prefixed routes.
 *
 * Use in layouts/pages/actions — never in middleware (the proxy is for
 * optimistic checks only, never for authorization per Next 16 docs).
 *
 * Redirects use locale-aware paths so the user isn't bounced out of their
 * language when re-authentication is required.
 */

async function resolveLocaleForRedirect() {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    const locale = await resolveLocaleForRedirect();
    redirect(`/${locale}/login`);
  }
  return user;
}

/**
 * Require the user to be authenticated AND hold one of the given roles.
 * On role mismatch, redirects to login rather than rendering a 403 — keeps
 * the surface area for role-leak smaller.
 */
export async function requireRole(...roles: [Role, ...Role[]]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    const locale = await resolveLocaleForRedirect();
    redirect(`/${locale}/login`);
  }
  return user;
}
