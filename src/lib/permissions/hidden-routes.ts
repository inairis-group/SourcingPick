/**
 * The surfaces the 2026-09 SaaS canvas does not draw.
 *
 * Caystone's rule (2026-09-24): "if it is not in the canvas, it is not a
 * recommended feature." `app-shell/nav.ts` is the half that removes them from
 * the interface; this is the half that makes them unreachable by typing the
 * address, which matters because several of them are real, working screens
 * that a bookmark still points at.
 *
 * These routes are hidden, not deleted. Their code, their data and their
 * database tables are untouched — auctions have bids, disputes have evidence,
 * KYC has documents people uploaded. Removing a feature from the interface is
 * reversible in an afternoon; dropping what it held is not, and nobody has
 * asked for that.
 *
 * Kept as prefixes rather than exact paths so that a detail page under a
 * hidden section goes with it: hiding `/client/auctions` has to take
 * `/client/auctions/abc123` too, or the section is hidden and its contents
 * are not.
 */

/**
 * Prefixes that no longer resolve, relative to `/[lang]`.
 *
 * Grouped by why they are here so that restoring one is a matter of deleting
 * a line rather than working out what a path was for.
 */
export const HIDDEN_ROUTE_PREFIXES: readonly string[] = [
  // Whole roles the canvas has no space for. Their sign-in still works and
  // lands nowhere, which is why `blockedRoleForCanvas` exists below.
  "/factory",
  "/forwarder",
  "/shipper",

  // Client sections with no artboard.
  "/client/marketplace",
  "/client/auctions",
  "/client/analytics",
  // The canvas folds quotes into Facturation rather than giving them a
  // section of their own.
  "/client/quotes",

  // Agent sections with no artboard.
  "/agent/analytics",
  "/agent/factories",
  "/agent/payouts",
  "/agent/profile",
  "/agent/tasks",
  "/agent/invoices",

  // Administration. The canvas draws twelve entries; these are the rest.
  "/admin/account-deletions",
  "/admin/auctions",
  "/admin/certifications",
  "/admin/disputes",
  "/admin/escrow",
  "/admin/finance",
  "/admin/kyc",
  "/admin/logins",
  "/admin/marketplace",
  "/admin/organizations",
  "/admin/payouts",
  "/admin/quote-requests",
  "/admin/shipments",
  "/admin/support",
  "/admin/webhooks",

  // Public marketplace surfaces, hidden with the rest of the marketplace.
  "/marketplace",
  "/auctions",
];

/**
 * Whether a path inside a `[lang]` segment is one of the hidden sections.
 *
 * `path` is expected without the language prefix — `/client/auctions`, not
 * `/fr/client/auctions`.
 */
export function isHiddenRoute(path: string): boolean {
  const clean = path.replace(/\/+$/, "") || "/";
  return HIDDEN_ROUTE_PREFIXES.some(
    (prefix) => clean === prefix || clean.startsWith(prefix + "/"),
  );
}

/**
 * Strip a leading `/xx` language segment, if there is one.
 *
 * Deliberately accepts any two-or-more-letter first segment rather than
 * consulting the locale list: this runs on user-supplied paths, and a path
 * beginning with an unknown language is still not a path we want to serve a
 * hidden section for.
 */
export function withoutLocale(pathname: string): string {
  const match = /^\/[A-Za-z]{2,5}(?=\/|$)/.exec(pathname);
  return match ? pathname.slice(match[0].length) || "/" : pathname;
}
