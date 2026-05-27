import "server-only";
import type { PayoutAccountStatus, PayoutProvider } from "@prisma/client";

/**
 * Provider-agnostic onboarding handoff. Every adapter returns one of:
 *   - `{ url }` — redirect the org admin to a hosted onboarding flow
 *     (Stripe Connect's branded form, LianLian's KYB portal, Alipay's
 *     merchant onboarding).
 *   - `{ error }` — the provider refused (e.g. unsupported country) or
 *     env credentials are missing.
 *
 * The provider's eventual decision arrives via webhook, which updates
 * the Organization's `payoutStatus` to ACTIVE / RESTRICTED / REJECTED.
 */
export type OnboardingResult =
  | { ok: true; url: string; accountRef?: string }
  | { ok: false; error: string };

/**
 * Result of a single payout dispatch — what we record on the
 * EscrowTransaction / Payout audit trail. The `providerRef` is the
 * provider's own id for the transfer (used to reconcile webhooks).
 */
export type PayoutDispatchResult =
  | { ok: true; providerRef: string }
  | { ok: false; error: string; retryable: boolean };

export type PayoutInput = {
  orgId: string;
  /** Provider-specific account ref (acct_... / payee id / Alipay id). */
  accountId: string;
  amountCents: number;
  /** ISO 4217 currency code. Most flows are EUR for v1. */
  currency: string;
  /** Idempotency key — Stripe + LianLian + Alipay all accept one. */
  idempotencyKey: string;
  /** Free-form description shown to the recipient where supported. */
  description: string;
};

/**
 * Provider-status snapshot for the admin dashboard. Adapters return one
 * of these so the UI can render green/red without us special-casing
 * each provider in the page component.
 */
export type ProviderStatus = {
  provider: PayoutProvider;
  /** Adapter-declared "are env credentials present and well-formed". */
  configured: boolean;
  /** "Configured + we just made a no-op API call and it worked." */
  reachable: boolean;
  /** Free-form when not OK — e.g. "STRIPE_SECRET_KEY missing" or "401 from provider". */
  message?: string;
  /** Env var names this provider needs; surfaced in the admin checklist. */
  requiredEnvVars: string[];
};

/**
 * Common interface every payout adapter implements. Keeping it narrow
 * forces the dispatcher to stay provider-agnostic.
 */
export interface PayoutAdapter {
  readonly provider: PayoutProvider;

  /** Env presence + format check, no network call. */
  isConfigured(): boolean;

  /** Names of env vars the operator needs to set. */
  requiredEnvVars(): string[];

  /**
   * Optional cheap network probe — returns true if creds work. Throws
   * (or returns false + message) on auth/network failure.
   */
  healthCheck(): Promise<{ ok: boolean; message?: string }>;

  /** Start a fresh onboarding for an org. */
  startOnboarding(orgId: string, returnUrl: string): Promise<OnboardingResult>;

  /**
   * Returns the provider's latest view of the account status. Used by
   * the factory dashboard "refresh status" button and by ops debugging
   * stuck onboardings.
   */
  fetchAccountStatus(accountId: string): Promise<PayoutAccountStatus>;

  /** Send a payout. Idempotent via `input.idempotencyKey`. */
  dispatch(input: PayoutInput): Promise<PayoutDispatchResult>;
}
