import type { Role } from "@prisma/client";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { NavIconKey } from "./nav-icons";

/**
 * The application's navigation, which is the 2026-09 SaaS canvas's sidebar
 * and nothing else.
 *
 * This file is the allow-list. The canvas draws seven entries for a client,
 * seven for an agent and twelve for an administrator — identically on all
 * fifty boards, which was checked rather than assumed. One entry was added
 * since, at the owner's request: the administrator's freight calculator.
 * Caystone's rule is that anything the canvas does not draw is not a
 * feature, so the surfaces that used to appear here and no longer do —
 * marketplace, auctions, analytics, KYC, escrow, certifications, disputes,
 * payouts, organizations, webhooks, logins, support — are unreachable from
 * the interface.
 *
 * Their route files still exist and are guarded by `hidden-routes.ts`, which
 * turns them into 404s. Deleting them is a separate decision with data
 * consequences; making them unreachable is this one.
 *
 * FACTORY and SHIPPER have no navigation at all, because the canvas draws no
 * factory or shipper space. Those roles cannot sign in to a usable
 * application any more, which is the intended consequence of the rule and is
 * flagged as such.
 */

export type AppNavItem = {
  key: string;
  href: string;
  label: string;
  icon: NavIconKey;
  /**
   * Sign out rather than navigate. The canvas draws it as one more row in
   * the rail, which is what it looks like; what it does is post a form.
   */
  action?: "logout";
};

/**
 * Canvas screens that have not been built yet.
 *
 * The rail below is the canvas's, entry for entry. Several of those entries
 * lead to screens that are still artboards — `SaaS-Client-Documents`,
 * `SaaS-Admin-Emails` and the rest — and a rail full of links to nothing is
 * worse than a shorter rail.
 *
 * So an entry appears once its route exists. Deleting a line here is the
 * whole of "turn this section on", and an empty set means the rail is
 * complete. This is scaffolding with an end date, not a feature flag: nothing
 * reads it at runtime except the filter at the bottom of this file.
 */
const NOT_YET_BUILT = new Set([
  "/client/billing",
  "/client/documents",
  "/agent/documents",
  "/admin/quotes",
  "/admin/orders",
  "/admin/payments",
  "/admin/documents",
  "/admin/emails",
]);

export type AppNav = {
  /** The badge under the wordmark — "Client", "Agent", "Administration". */
  badge: string;
  items: AppNavItem[];
  /** The pair below the rule: help, then sign out. */
  footer: AppNavItem[];
};

/**
 * Roles the canvas covers. A role outside this set has no drawn interface.
 */
export const CANVAS_ROLES = ["CLIENT", "AGENT", "ADMIN"] as const;
export type CanvasRole = (typeof CANVAS_ROLES)[number];

export function isCanvasRole(role: Role): role is CanvasRole {
  return (CANVAS_ROLES as readonly string[]).includes(role);
}

export function appNav(role: Role, lang: string, dict: Dictionary): AppNav | null {
  const nav = buildNav(role, lang, dict);
  if (!nav) return null;
  const base = `/${lang}`;
  return {
    ...nav,
    items: nav.items.filter((i) => !NOT_YET_BUILT.has(i.href.slice(base.length))),
  };
}

function buildNav(role: Role, lang: string, dict: Dictionary): AppNav | null {
  const n = dict.nav;
  const base = `/${lang}`;
  // Drawn on every board, in both roles that have them.
  const footer: AppNavItem[] = [
    { key: "help", href: `${base}/support/new`, label: n.help, icon: "flag" },
    { key: "logout", href: "", label: n.logout, icon: "arrowBack", action: "logout" },
  ];

  switch (role) {
    case "CLIENT":
      return {
        badge: n.role.client,
        footer,
        items: [
          { key: "dashboard", href: `${base}/client/dashboard`, label: n.dashboard, icon: "grid" },
          { key: "requests", href: `${base}/client/requests`, label: n.requests, icon: "list" },
          { key: "orders", href: `${base}/client/orders`, label: n.orders, icon: "cube" },
          { key: "billing", href: `${base}/client/billing`, label: n.billing, icon: "euro" },
          {
            key: "documents",
            href: `${base}/client/documents`,
            label: n.documents,
            icon: "paperclip",
          },
          { key: "messages", href: `${base}/messages`, label: n.messages, icon: "chat" },
          { key: "settings", href: `${base}/client/settings`, label: n.settings, icon: "person" },
        ],
      };

    case "AGENT":
      return {
        badge: n.role.agent,
        footer,
        items: [
          { key: "dashboard", href: `${base}/agent/dashboard`, label: n.dashboard, icon: "grid" },
          { key: "requests", href: `${base}/agent/requests`, label: n.requests, icon: "list" },
          { key: "quotes", href: `${base}/agent/quotes`, label: n.quotations, icon: "document" },
          { key: "orders", href: `${base}/agent/orders`, label: n.orders, icon: "cube" },
          { key: "messages", href: `${base}/messages`, label: n.messages, icon: "chat" },
          {
            key: "documents",
            href: `${base}/agent/documents`,
            label: n.documents,
            icon: "paperclip",
          },
          { key: "settings", href: `${base}/agent/settings`, label: n.settings, icon: "person" },
        ],
      };

    case "ADMIN":
      return {
        badge: n.role.admin,
        footer,
        items: [
          { key: "dashboard", href: `${base}/admin`, label: n.dashboard, icon: "grid" },
          { key: "requests", href: `${base}/admin/requests`, label: n.requests, icon: "list" },
          {
            // The one entry the canvas does not draw: the team prices
            // shipments here with the public simulator's engine, and reads
            // the requests the simulator receives (asked for in 2026-10).
            key: "freight",
            href: `${base}/admin/freight-calculator`,
            label: dict.admin.freightCalculator.title,
            icon: "calculator",
          },
          { key: "quotes", href: `${base}/admin/quotes`, label: n.quotations, icon: "document" },
          { key: "orders", href: `${base}/admin/orders`, label: n.orders, icon: "cube" },
          { key: "invoices", href: `${base}/admin/invoices`, label: n.invoices, icon: "euro" },
          { key: "payments", href: `${base}/admin/payments`, label: n.payments, icon: "card" },
          { key: "users", href: `${base}/admin/users`, label: n.users, icon: "people" },
          { key: "agents", href: `${base}/admin/agents`, label: n.agents, icon: "person" },
          {
            key: "documents",
            href: `${base}/admin/documents`,
            label: n.documents,
            icon: "paperclip",
          },
          { key: "emails", href: `${base}/admin/emails`, label: n.emails, icon: "envelope" },
          { key: "settings", href: `${base}/admin/settings`, label: n.settings, icon: "funnel" },
          { key: "log", href: `${base}/admin/audit`, label: n.log, icon: "cycle" },
        ],
      };

    default:
      return null;
  }
}
