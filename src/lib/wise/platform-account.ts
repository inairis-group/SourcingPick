import "server-only";

/**
 * Platform-side Wise receive account details. These three env vars hold
 * the platform's own Wise Business EUR account info — the IBAN/BIC the
 * buyer's bank wire is addressed to.
 *
 * Source of truth is the Wise dashboard's Account Details view; set them
 * once after KYB and they don't change. Keeping them as env (not DB rows)
 * because they're per-deployment config, never per-user.
 *
 *   WISE_PLATFORM_IBAN         e.g. "BE17 9670 0000 0000"
 *   WISE_PLATFORM_BIC          e.g. "TRWIBEB1XXX"
 *   WISE_PLATFORM_HOLDER_NAME  e.g. "SourcingPick SAS"
 */

export type PlatformWireAccount = {
  iban: string;
  bic: string;
  holderName: string;
};

export function platformWireAccount(): PlatformWireAccount | null {
  const iban = process.env.WISE_PLATFORM_IBAN;
  const bic = process.env.WISE_PLATFORM_BIC;
  const holderName = process.env.WISE_PLATFORM_HOLDER_NAME;
  if (!iban || !bic || !holderName) return null;
  return { iban, bic, holderName };
}

/**
 * Unique-per-invoice reference the buyer puts in their bank wire memo.
 * The Wise balance-credit webhook handler matches incoming deposits back
 * to invoices by spotting this string in the transfer note (see Pass 3b.4).
 *
 * Format: `<orderRef>-<kind>`. Short enough for European bank UI limits
 * (some banks cap memos at ~35 chars). Examples:
 *   ORD-12345-DEP   deposit
 *   ORD-12345-BAL   balance
 *   REQ-100001-FEE  research fee
 */
export function buildWireReference(
  parentRef: string,
  kind: "DEP" | "BAL" | "FEE",
): string {
  return `${parentRef}-${kind}`;
}
