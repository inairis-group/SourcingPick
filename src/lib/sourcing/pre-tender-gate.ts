import { Category } from "@prisma/client";
// Pure helper — usable from both server (tender action, page) and
// client (admin dispatch table) so the gate decision is computed in
// one place.

/**
 * Pre-tender approval gate (partner #21).
 *
 * Previously every sourcing request required admin pre-tender
 * approval before the agent could dispatch tenders. That meant the
 * smallest €500 commodity ask sat in the admin queue alongside the
 * €50k industrial brief — too much friction on the low end.
 *
 * Rule now: a request needs pre-tender approval iff EITHER
 *
 *   - its budget is above HIGH_BUDGET_THRESHOLD_CENTS (currently €5,000),
 *     OR
 *   - its category is on HIGH_RISK_CATEGORIES (cosmetics, food, electronics —
 *     these face regulatory + safety obligations that warrant a
 *     compliance check before going to factories).
 *
 * Below those thresholds the agent dispatches tenders straight away.
 *
 * To tune: nudge the constants below. They're pure code, no migration —
 * the rule lives in one place and is referenced both server-side (in
 * `sendTenderInvitationsAction`) and UI-side (the agent's request
 * detail page renders the right banner/state by calling the same
 * helper).
 */

export const HIGH_BUDGET_THRESHOLD_CENTS = 500_000; // €5,000

export const HIGH_RISK_CATEGORIES: ReadonlySet<Category> = new Set<Category>([
  Category.COSMETICS,
  Category.FOOD,
  Category.ELECTRONICS,
]);

export function requiresPreTenderApproval(args: {
  category: Category;
  budgetCents: number | null;
}): boolean {
  if (HIGH_RISK_CATEGORIES.has(args.category)) return true;
  if (args.budgetCents !== null && args.budgetCents >= HIGH_BUDGET_THRESHOLD_CENTS) {
    return true;
  }
  return false;
}

/**
 * Reason code for UI rendering — lets the request-detail page show
 * the agent *why* pre-tender approval is gated (or not).
 */
export type PreTenderReason =
  | "HIGH_BUDGET"
  | "HIGH_RISK_CATEGORY"
  | "EXEMPT";

export function preTenderReason(args: {
  category: Category;
  budgetCents: number | null;
}): PreTenderReason {
  if (HIGH_RISK_CATEGORIES.has(args.category)) return "HIGH_RISK_CATEGORY";
  if (args.budgetCents !== null && args.budgetCents >= HIGH_BUDGET_THRESHOLD_CENTS) {
    return "HIGH_BUDGET";
  }
  return "EXEMPT";
}
