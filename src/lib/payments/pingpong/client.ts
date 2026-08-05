import "server-only";
import { pingpongConfig } from "./config";

/**
 * PingPong HTTP client.
 *
 * ⚠️ The request/response shapes below are NOT implemented against PingPong's
 * live API — we don't have the credentials or the partner API document yet.
 * Everything provider-specific is isolated here on purpose, so wiring the real
 * calls later is a change to one file rather than a hunt across the codebase.
 *
 * What is already correct and must not be re-litigated when the real API
 * arrives: the adapter interface, the escrow seam
 * (`finalizeBuyerOrderPayment`), the idempotency key contract, and the webhook
 * → escrow flow. Those are ours, not PingPong's.
 *
 * To finish the integration you need, from PingPong:
 *   1. the API base URL for sandbox and production;
 *   2. the auth scheme (OAuth client-credentials vs signed request headers);
 *   3. the payout-creation endpoint and its payload;
 *   4. the payee/beneficiary onboarding endpoint;
 *   5. the webhook signature algorithm and header name.
 *
 * Items 1–4 land in this file. Item 5 lands in `webhook.ts`.
 */

export class PingPongNotConfiguredError extends Error {
  constructor() {
    super(
      "PingPong is not configured. Set PINGPONG_API_BASE, PINGPONG_CLIENT_ID, PINGPONG_CLIENT_SECRET and PINGPONG_WEBHOOK_SECRET.",
    );
    this.name = "PingPongNotConfiguredError";
  }
}

/** Thrown for a provider-side failure that is worth retrying (5xx, timeout). */
export class PingPongTransientError extends Error {
  readonly retryable = true;
}

/** Thrown for a provider-side refusal that will not change on retry (4xx). */
export class PingPongPermanentError extends Error {
  readonly retryable = false;
}

export type PingPongPayoutRequest = {
  /** Our idempotency key — PingPong must echo it or reject a duplicate. */
  reference: string;
  /** Provider-side payee id, stored on Organization.payoutAccountId. */
  payeeId: string;
  amountCents: number;
  currency: string;
  description: string;
};

export type PingPongPayoutResponse = {
  /** Provider transaction id. Becomes Payout.providerRef. */
  id: string;
  status: "PENDING" | "PAID" | "FAILED";
};

/**
 * Placeholder for the authenticated call.
 *
 * Throws rather than returning a fake success: a payout rail that pretends to
 * have sent money is the single most dangerous thing this codebase could do.
 */
export async function pingpongRequest<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const cfg = pingpongConfig();
  if (!cfg) throw new PingPongNotConfiguredError();

  void path;
  void init;
  throw new PingPongPermanentError(
    "PingPong API calls are not implemented yet — the partner API document and credentials are outstanding. See src/lib/payments/pingpong/client.ts.",
  );
}
