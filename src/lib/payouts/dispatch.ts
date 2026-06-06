import "server-only";
import type { PayoutProvider } from "@prisma/client";
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
 * Wise is the only live rail since the CTO audit follow-up migration
 * pruned the deprecated PayoutProvider values. The Stripe / LianLian /
 * Alipay adapter files were retired in the same pass.
 */
const ADAPTERS: Record<PayoutProvider, PayoutAdapter> = {
  WISE: wiseAdapter,
};

const ALL_PROVIDERS = ["WISE"] as const satisfies readonly PayoutProvider[];

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
