import "server-only";
import type { PayoutAccountStatus, PayoutProvider } from "@prisma/client";
import type {
  OnboardingResult,
  PayoutAdapter,
  PayoutDispatchResult,
  PayoutInput,
} from "./types";

// We use the *string literal* for the provider id instead of importing
// the runtime enum value. Reason: Turbopack hot-reload sometimes serves
// a stale @prisma/client module after `prisma generate`, leaving the
// enum object undefined at load time and crashing this module's class
// initialiser. Prisma generates enums as `{ STRIPE_CONNECT: 'STRIPE_CONNECT', ... }`
// so the literal IS the runtime value — `satisfies` keeps it type-safe.
const STRIPE = "STRIPE_CONNECT" as const satisfies PayoutProvider;
const PENDING = "PENDING" as const satisfies PayoutAccountStatus;

/**
 * Stripe Connect Express adapter — payouts to factories/agents in the
 * Stripe-supported countries (EU/UK/US/SG/HK/UAE/etc. plus parts of
 * Africa).
 *
 * v1 already had ad-hoc Stripe Connect plumbing in `lib/stripe/connect.ts`;
 * this adapter is the unified interface and will absorb that flow in a
 * follow-up. Today the methods return structured "not implemented"
 * shapes so the dispatcher + admin page can be wired without waiting
 * on the SDK migration.
 */
class StripeAdapter implements PayoutAdapter {
  readonly provider = STRIPE;

  requiredEnvVars(): string[] {
    return [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "STRIPE_PUBLISHABLE_KEY",
    ];
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.STRIPE_SECRET_KEY &&
        process.env.STRIPE_WEBHOOK_SECRET &&
        process.env.STRIPE_PUBLISHABLE_KEY,
    );
  }

  async healthCheck(): Promise<{ ok: boolean; message?: string }> {
    if (!this.isConfigured()) {
      return { ok: false, message: "Stripe env vars missing." };
    }
    // The existing lib/stripe/connect.ts already exercises the secret
    // key against real Stripe — we'll call its `pingAccount()` once
    // factored. Today: treat env presence as healthy.
    return { ok: true };
  }

  async startOnboarding(
    _orgId: string,
    _returnUrl: string,
  ): Promise<OnboardingResult> {
    // TODO: port lib/stripe/connect.ts createConnectAccount + onboarding
    // link helpers behind this method. Returns the AccountLink URL.
    return {
      ok: false,
      error: "Stripe Connect onboarding not yet wired into the adapter.",
    };
  }

  async fetchAccountStatus(_accountId: string): Promise<PayoutAccountStatus> {
    return PENDING;
  }

  async dispatch(input: PayoutInput): Promise<PayoutDispatchResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        error: "Stripe is not configured.",
        retryable: true,
      };
    }
    try {
      const { getStripe } = await import("@/lib/stripe/client");
      const stripe = getStripe();
      const transfer = await stripe.transfers.create(
        {
          amount: input.amountCents,
          currency: input.currency.toLowerCase(),
          destination: input.accountId,
          description: input.description,
          metadata: { orgId: input.orgId },
        },
        { idempotencyKey: input.idempotencyKey },
      );
      return { ok: true, providerRef: transfer.id };
    } catch (e) {
      // Stripe errors carry a `type`; balance/availability issues are
      // retryable, account/validation issues are terminal. We keep it
      // simple: network + rate-limit + insufficient-funds → retryable.
      const err = e as { type?: string; code?: string; message?: string };
      const retryable =
        err.type === "StripeConnectionError" ||
        err.type === "StripeAPIError" ||
        err.type === "StripeRateLimitError" ||
        err.code === "balance_insufficient";
      return {
        ok: false,
        error: (err.message ?? "Stripe transfer failed.").slice(0, 500),
        retryable,
      };
    }
  }
}

export const stripeAdapter = new StripeAdapter();
