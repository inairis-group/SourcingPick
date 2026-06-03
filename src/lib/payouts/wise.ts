import "server-only";
import type { PayoutAccountStatus, PayoutProvider } from "@prisma/client";
import {
  WiseError,
  wiseFetch,
  wiseIsConfigured,
  wiseRequiredEnvVars,
} from "@/lib/wise/client";
import type {
  OnboardingResult,
  PayoutAdapter,
  PayoutDispatchResult,
  PayoutInput,
} from "./types";

// String literals to dodge the Turbopack stale-Prisma-client hazard; see
// the matching comment in payouts/stripe.ts for the rationale.
const WISE = "WISE" as const satisfies PayoutProvider;
const ACTIVE = "ACTIVE" as const satisfies PayoutAccountStatus;
const PENDING = "PENDING" as const satisfies PayoutAccountStatus;

/**
 * Wise Business adapter — the rail every payout will route through once
 * the migration arc completes. This is the scaffold: env detection,
 * health check, and method stubs returning structured errors so the
 * dispatcher + admin status surface light up while the per-method
 * implementations land.
 *
 * Architecture (when fully wired):
 *   - `startOnboarding` redirects the factory into our own bank-details
 *     form (Wise has no hosted onboarding equivalent to Stripe Connect —
 *     we collect IBAN/SWIFT ourselves and POST it to /v1/accounts).
 *   - `fetchAccountStatus` reads `GET /v1/accounts/{id}` and maps Wise's
 *     `active` flag to our `PayoutAccountStatus`.
 *   - `dispatch` does the three-step Wise transfer: create quote →
 *     create transfer → fund transfer from balance. Idempotency via
 *     `X-idempotence-uuid` header (Wise's convention).
 *
 * Refs: https://docs.wise.com/api-docs/api-reference
 */
class WiseAdapter implements PayoutAdapter {
  readonly provider = WISE;

  requiredEnvVars(): string[] {
    return [...wiseRequiredEnvVars()];
  }

  isConfigured(): boolean {
    return wiseIsConfigured();
  }

  async healthCheck(): Promise<{ ok: boolean; message?: string }> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        message: "Wise env vars missing (WISE_API_TOKEN / WISE_PROFILE_ID).",
      };
    }
    try {
      // GET /v2/profiles confirms the token resolves to a real account.
      // Cheap, no side effects, returns 401 on bad tokens which we'll
      // surface to the admin checklist.
      await wiseFetch("/v2/profiles");
      return { ok: true };
    } catch (e) {
      if (e instanceof WiseError) {
        return { ok: false, message: e.message };
      }
      return {
        ok: false,
        message: e instanceof Error ? e.message : "Wise health check failed.",
      };
    }
  }

  async startOnboarding(
    _orgId: string,
    returnUrl: string,
  ): Promise<OnboardingResult> {
    // Wise has no hosted onboarding flow — the factory enters bank
    // details on our own page, which calls `POST /v1/accounts` server-
    // side and stores the returned id in `Organization.wiseRecipientId`.
    // For now we just hand back our internal onboarding URL so the
    // generic "Start payout setup" CTA on the factory dashboard works
    // once the bank-details form lands.
    return {
      ok: true,
      url: returnUrl,
    };
  }

  async fetchAccountStatus(
    accountId: string,
  ): Promise<PayoutAccountStatus> {
    if (!this.isConfigured()) return PENDING;
    try {
      // GET /v1/accounts/{id} — when wired, map response.active → ACTIVE,
      // anything else → PENDING/RESTRICTED depending on Wise's status
      // strings (TBD pending docs spelunking).
      await wiseFetch(`/v1/accounts/${accountId}`);
      return ACTIVE;
    } catch {
      return PENDING;
    }
  }

  async dispatch(input: PayoutInput): Promise<PayoutDispatchResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        error: "Wise is not configured (token / profile env vars missing).",
        retryable: true,
      };
    }
    // TODO (Pass 3b follow-up):
    //   1. POST /v3/profiles/{WISE_PROFILE_ID}/quotes
    //        { sourceCurrency, targetCurrency, sourceAmount, profile }
    //      → quote.id
    //   2. POST /v1/transfers
    //        { targetAccount: input.accountId, quoteUuid, customerTransactionId: input.idempotencyKey,
    //          details: { reference: ..., transferPurpose: ... } }
    //      → transfer.id
    //   3. POST /v3/profiles/{WISE_PROFILE_ID}/transfers/{transfer.id}/payments
    //        { type: "BALANCE" }
    //      → fundedAt
    //
    //   The /payments endpoint is SCA-protected — wire `signedRequest()`
    //   in lib/wise/client.ts before this method goes live.
    return {
      ok: false,
      error:
        "Wise dispatch not implemented yet (Pass 3b follow-up will wire quote → transfer → fund).",
      retryable: false,
    };
  }
}

export const wiseAdapter = new WiseAdapter();
