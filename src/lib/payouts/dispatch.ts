import "server-only";
import type { PayoutProvider } from "@prisma/client";
import { stripeAdapter } from "./stripe";
import { lianlianAdapter } from "./lianlian";
import { alipayAdapter } from "./alipay";
import { wiseAdapter } from "./wise";
import type {
  OnboardingResult,
  PayoutAdapter,
  PayoutDispatchResult,
  PayoutInput,
  ProviderStatus,
} from "./types";

/**
 * Provider-routing layer. Every caller that needs to "start an
 * onboarding", "send a payout", or "check provider health" goes through
 * here so individual adapters stay swappable.
 *
 * The map is intentionally exhaustive on PayoutProvider — adding a new
 * provider means a TS error here until the adapter is added, which is
 * what we want.
 *
 * Keys are string literals (not enum member references) for the same
 * reason as the adapter files: avoids crashing at module load when
 * Turbopack serves a stale @prisma/client. `Record<PayoutProvider, …>`
 * still enforces exhaustiveness at compile time.
 */
const ADAPTERS: Record<PayoutProvider, PayoutAdapter> = {
  STRIPE_CONNECT: stripeAdapter,
  LIANLIAN: lianlianAdapter,
  ALIPAY: alipayAdapter,
  // Wise is the live rail going forward (2026-06-02 decision); the
  // others stay in the map until the migration arc finishes and a
  // follow-up drops them from PayoutProvider entirely.
  WISE: wiseAdapter,
};

// Static list — derived from the Record above, but avoids the runtime
// `Object.values(PayoutProvider)` call that would dereference a possibly
// undefined enum import during hot reload.
const ALL_PROVIDERS = [
  "STRIPE_CONNECT",
  "LIANLIAN",
  "ALIPAY",
  "WISE",
] as const satisfies readonly PayoutProvider[];

export function adapterFor(provider: PayoutProvider): PayoutAdapter {
  return ADAPTERS[provider];
}

/**
 * Status snapshot for the admin dashboard. Runs health checks in
 * parallel so the page renders fast even with three providers.
 */
export async function listProviderStatuses(): Promise<ProviderStatus[]> {
  const entries = ALL_PROVIDERS.map(async (p) => {
    const a = ADAPTERS[p];
    const configured = a.isConfigured();
    const health = configured
      ? await a.healthCheck().catch((e) => ({
          ok: false,
          message: e instanceof Error ? e.message : String(e),
        }))
      : { ok: false, message: undefined };
    return {
      provider: p,
      configured,
      reachable: configured && health.ok,
      message: health.message,
      requiredEnvVars: a.requiredEnvVars(),
    };
  });
  return Promise.all(entries);
}

/**
 * Thin wrappers that pick the right adapter from the org's chosen
 * provider — callers don't import individual adapters anywhere outside
 * this file.
 */
export async function startProviderOnboarding(
  provider: PayoutProvider,
  orgId: string,
  returnUrl: string,
): Promise<OnboardingResult> {
  return ADAPTERS[provider].startOnboarding(orgId, returnUrl);
}

export async function dispatchProviderPayout(
  provider: PayoutProvider,
  input: PayoutInput,
): Promise<PayoutDispatchResult> {
  return ADAPTERS[provider].dispatch(input);
}
