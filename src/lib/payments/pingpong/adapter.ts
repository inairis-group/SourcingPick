import "server-only";
import { PayoutAccountStatus, PayoutProvider } from "@prisma/client";
import type {
  OnboardingResult,
  PayoutAdapter,
  PayoutDispatchResult,
  PayoutInput,
} from "@/lib/payouts/types";
import {
  PingPongNotConfiguredError,
  pingpongRequest,
  type PingPongPayoutRequest,
  type PingPongPayoutResponse,
} from "./client";
import {
  PINGPONG_ENV_VARS,
  missingPingPongEnvVars,
  pingpongIsConfigured,
} from "./config";

/**
 * PingPong payout adapter.
 *
 * Implements the same `PayoutAdapter` contract Wise did, so the dispatcher,
 * the admin status dashboard and the factory onboarding button need no
 * knowledge of which rail is underneath — which is the entire reason that
 * interface exists and why it survived the rail change untouched.
 *
 * Every method fails closed while credentials are outstanding. `dispatch` in
 * particular returns `retryable: true`, so a payout attempted before the rail
 * is live stays queued for a later sweep instead of being marked failed and
 * needing manual resurrection.
 */
export const pingpongAdapter: PayoutAdapter = {
  provider: PayoutProvider.PINGPONG,

  isConfigured() {
    return pingpongIsConfigured();
  },

  requiredEnvVars() {
    return [...PINGPONG_ENV_VARS];
  },

  async healthCheck() {
    if (!pingpongIsConfigured()) {
      return {
        ok: false,
        message: `Missing: ${missingPingPongEnvVars().join(", ")}`,
      };
    }
    try {
      await pingpongRequest("/health");
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        message: e instanceof Error ? e.message : String(e),
      };
    }
  },

  async startOnboarding(orgId: string, returnUrl: string): Promise<OnboardingResult> {
    if (!pingpongIsConfigured()) {
      return { ok: false, error: new PingPongNotConfiguredError().message };
    }
    try {
      const res = await pingpongRequest<{ url: string; payeeId?: string }>(
        "/payees/onboarding",
        { method: "POST", body: { orgId, returnUrl } },
      );
      return { ok: true, url: res.url, accountRef: res.payeeId };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },

  async fetchAccountStatus(accountId: string): Promise<PayoutAccountStatus> {
    if (!pingpongIsConfigured()) return PayoutAccountStatus.PENDING;
    try {
      const res = await pingpongRequest<{ status: string }>(
        `/payees/${encodeURIComponent(accountId)}`,
      );
      switch (res.status) {
        case "ACTIVE":
          return PayoutAccountStatus.ACTIVE;
        case "REJECTED":
          return PayoutAccountStatus.REJECTED;
        case "RESTRICTED":
          return PayoutAccountStatus.RESTRICTED;
        default:
          return PayoutAccountStatus.PENDING;
      }
    } catch {
      // Unknown is not the same as rejected. Leaving it PENDING keeps the
      // factory's onboarding recoverable instead of dead-ending it on a
      // transient provider blip.
      return PayoutAccountStatus.PENDING;
    }
  },

  async dispatch(input: PayoutInput): Promise<PayoutDispatchResult> {
    if (!pingpongIsConfigured()) {
      return {
        ok: false,
        error: new PingPongNotConfiguredError().message,
        // Retryable on purpose: the money is still owed once the rail is live.
        retryable: true,
      };
    }

    const body: PingPongPayoutRequest = {
      reference: input.idempotencyKey,
      payeeId: input.accountId,
      amountCents: input.amountCents,
      currency: input.currency,
      description: input.description,
    };

    try {
      const res = await pingpongRequest<PingPongPayoutResponse>("/payouts", {
        method: "POST",
        body,
      });
      if (res.status === "FAILED") {
        return { ok: false, error: "PingPong rejected the payout.", retryable: false };
      }
      return { ok: true, providerRef: res.id };
    } catch (e) {
      const retryable =
        typeof e === "object" && e !== null && "retryable" in e
          ? Boolean((e as { retryable: unknown }).retryable)
          : true;
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        retryable,
      };
    }
  },
};
