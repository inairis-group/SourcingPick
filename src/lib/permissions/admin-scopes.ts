import "server-only";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AdminScope, Role } from "@prisma/client";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { requireAuth } from "./guards";

/**
 * Admin permission hierarchy. Each admin surface declares the scope it
 * requires, then calls `requireAdminScope(scope)` at the top of the
 * page / server action. Users with `SUPER` are granted automatically.
 *
 * For brand-new admin pages: pick the scope that best fits, document
 * it in `ADMIN_SCOPE_DOC` so `/admin/users` can render a meaningful
 * checklist when granting permissions. Pages that span scopes (e.g. a
 * dashboard mixing finance + KYC) should call `hasAdminScope` per
 * panel rather than `requireAdminScope` once at the top.
 */

async function resolveLocaleForRedirect() {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}

/**
 * Server guard. Asserts the caller is an authenticated admin with the
 * given scope (or SUPER). On failure, redirects to `/admin` so the
 * user lands somewhere they can see — they're authenticated, just not
 * authorised for *this* page.
 */
export async function requireAdminScope(scope: AdminScope) {
  const user = await requireAuth();
  if (user.role !== Role.ADMIN || !hasAdminScope(user.adminScopes, scope)) {
    const locale = await resolveLocaleForRedirect();
    redirect(`/${locale}/admin`);
  }
  return user;
}

/**
 * Pure check — `true` iff `scopes` carries either `SUPER` or `scope`.
 * Use this in pages that need to gate sub-panels rather than the entire
 * surface (e.g. the admin dashboard cards).
 */
export function hasAdminScope(
  scopes: readonly AdminScope[],
  scope: AdminScope,
): boolean {
  if (scopes.includes(AdminScope.SUPER)) return true;
  return scopes.includes(scope);
}

/**
 * Static documentation for the admin user-management UI. Lets operators
 * see at a glance what each scope unlocks before granting it. Keep in
 * sync with the actual guard placement on each admin route.
 */
export const ADMIN_SCOPE_DOC: Record<
  AdminScope,
  { surfaces: string[] }
> = {
  SUPER: { surfaces: ["Everything — full admin"] },
  KYC: { surfaces: ["/admin/kyc"] },
  MARKETPLACE: { surfaces: ["/admin/marketplace", "/admin/auctions"] },
  FINANCE: {
    surfaces: [
      "/admin/finance",
      "/admin/escrow",
      "/admin/payouts",
      "/admin/settings/payments",
    ],
  },
  SUPPORT: { surfaces: ["/admin/support"] },
  DISPUTES: { surfaces: ["/admin/disputes"] },
  REQUESTS: { surfaces: ["/admin/requests"] },
  USERS: { surfaces: ["/admin/users", "/admin/organizations"] },
  WEBHOOKS: { surfaces: ["/admin/webhooks", "/admin/logins"] },
  SETTINGS: { surfaces: ["/admin/settings/sourcing"] },
  AGENTS: { surfaces: ["/admin/agents"] },
  AUDIT: { surfaces: ["/admin/audit"] },
};

/**
 * Per-route → required scope map. Lookups stay alongside the route in
 * its page file (closest to where the guard is enforced), but this map
 * exists so the admin user-management UI can show "this user can
 * access these N routes" without scraping every page file.
 */
export const ROUTE_SCOPE: Record<string, AdminScope> = {
  "/admin/kyc": AdminScope.KYC,
  "/admin/marketplace": AdminScope.MARKETPLACE,
  "/admin/auctions": AdminScope.MARKETPLACE,
  "/admin/finance": AdminScope.FINANCE,
  "/admin/escrow": AdminScope.FINANCE,
  "/admin/payouts": AdminScope.FINANCE,
  "/admin/settings/payments": AdminScope.FINANCE,
  "/admin/support": AdminScope.SUPPORT,
  "/admin/disputes": AdminScope.DISPUTES,
  "/admin/requests": AdminScope.REQUESTS,
  "/admin/users": AdminScope.USERS,
  "/admin/organizations": AdminScope.USERS,
  "/admin/webhooks": AdminScope.WEBHOOKS,
  "/admin/logins": AdminScope.WEBHOOKS,
  "/admin/settings/sourcing": AdminScope.SETTINGS,
  "/admin/agents": AdminScope.AGENTS,
  "/admin/audit": AdminScope.AUDIT,
};
