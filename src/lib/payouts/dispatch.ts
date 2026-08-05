import "server-only";
import type { PayoutProvider } from "@prisma/client";
import { pingpongAdapter } from "@/lib/payments/pingpong/adapter";
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
/**
 * One live rail. The map stays a `Record<PayoutProvider, …>` so adding a
 * provider to the enum without an adapter is a type error rather than a
 * runtime "cannot read property of undefined" on someone's payout.
 *
 * WISE is retained in the enum because Payout rows reference it and financial
 * records are immutable — but it has no adapter, so nothing can dispatch
 * through it again.
 */
const ADAPTERS: Partial<Record<PayoutProvider, PayoutAdapter>> = {
  PINGPONG: pingpongAdapter,
  // WISE is intentionally absent, not null: it was retired in 2026-08 and
  // exists in the enum only because Payout rows reference it.
};

const ALL_PROVIDERS = ["PINGPONG"] as const satisfies readonly PayoutProvider[];

/**
 * Throws for a retired provider rather than returning undefined.
 *
 * An org still carrying `payoutProvider: WISE` is a data problem someone has
 * to fix, and it should surface as a named error on the payout attempt — not
 * as "cannot read properties of undefined" three frames deeper, and certainly
 * not as a silent no-op on somebody's money.
 */
export function adapterFor(provider: PayoutProvider): PayoutAdapter {
  const adapter = ADAPTERS[provider];
  if (!adapter) {
    throw new Error(
      `Payout provider ${provider} has been retired and has no adapter. Migrate this organisation to PINGPONG.`,
    );
  }
  return adapter;
}

/**
 * Status snapshot for the admin dashboard. Runs health checks in
 * parallel so the page renders fast however many rails are live.
 */
export async function listProviderStatuses(): Promise<ProviderStatus[]> {
  const entries = ALL_PROVIDERS.map(async (p) => {
    const a = adapterFor(p);
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
  return adapterFor(provider).startOnboarding(orgId, returnUrl);
}

/**
 * Dispatch, degrading rather than throwing on a retired provider.
 *
 * `adapterFor` throws deliberately — a retired rail is a data problem someone
 * must fix. But throwing *here* aborted the whole release transaction, which
 * left the buyer's escrow stuck HELD on a delivered order: the money sat in
 * limbo because of a stale column on the supplier. Returning a failed result
 * instead lets the order complete and the escrow release, with the reason
 * recorded on the Payout row for ops to action.
 */
export async function dispatchProviderPayout(
  provider: PayoutProvider,
  input: PayoutInput,
): Promise<PayoutDispatchResult> {
  let adapter: PayoutAdapter;
  try {
    adapter = adapterFor(provider);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      // The supplier is still owed the money once they're re-onboarded.
      retryable: true,
    };
  }
  return adapter.dispatch(input);
}
