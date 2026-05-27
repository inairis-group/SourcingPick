import "server-only";
import type { PayoutAccountStatus, PayoutProvider } from "@prisma/client";
import type {
  OnboardingResult,
  PayoutAdapter,
  PayoutDispatchResult,
  PayoutInput,
} from "./types";

// String literals over enum members — see stripe.ts for rationale
// (avoids load-time crash under Turbopack hot-reload staleness).
const ALIPAY = "ALIPAY" as const satisfies PayoutProvider;
const PENDING = "PENDING" as const satisfies PayoutAccountStatus;

/**
 * Alipay (Ant International) cross-border payout adapter.
 *
 * For factory payouts to mainland China where the operator prefers Alipay
 * over LianLian — typical when the factory already has an Alipay business
 * account. Uses Ant International's "Cross-border Payment" product
 * (the one historically wrapped under the "Alipay Global" brand).
 *
 * Auth: RSA2 (SHA256withRSA) signed requests against
 *   https://openapi.alipay.com/gateway.do (production)
 *   https://openapi-sandbox.dl.alipaydev.com/gateway.do (sandbox)
 *
 * Required env mirrors Stripe's pattern: app id, our private key, Ant's
 * public key (for response verification), and a webhook secret for the
 * async notifications. Real SDK calls land in a follow-up.
 */
class AlipayAdapter implements PayoutAdapter {
  readonly provider = ALIPAY;

  requiredEnvVars(): string[] {
    return [
      "ALIPAY_API_HOST",
      "ALIPAY_APP_ID",
      "ALIPAY_APP_PRIVATE_KEY",
      "ALIPAY_PUBLIC_KEY",
      "ALIPAY_WEBHOOK_SECRET",
    ];
  }

  isConfigured(): boolean {
    return this.requiredEnvVars().every((k) => Boolean(process.env[k]));
  }

  async healthCheck(): Promise<{ ok: boolean; message?: string }> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        message: "Alipay env vars missing — see admin checklist.",
      };
    }
    const pem = process.env.ALIPAY_APP_PRIVATE_KEY ?? "";
    if (!pem.includes("BEGIN") || !pem.includes("END")) {
      return {
        ok: false,
        message: "ALIPAY_APP_PRIVATE_KEY isn't a valid PEM.",
      };
    }
    // TODO: call alipay.commerce.merchant.query as a noop probe.
    return { ok: true };
  }

  async startOnboarding(
    _orgId: string,
    _returnUrl: string,
  ): Promise<OnboardingResult> {
    // TODO:
    //   - For Alipay, "onboarding" is really linking the factory's
    //     existing Alipay business id (login_id / open_id). We issue
    //     a one-time link with our app id; the factory authenticates
    //     in Alipay's hosted page and we receive their open_id back.
    //   - Return that URL + the eventual open_id as accountRef.
    return {
      ok: false,
      error: "Alipay onboarding adapter not yet implemented.",
    };
  }

  async fetchAccountStatus(_accountId: string): Promise<PayoutAccountStatus> {
    // TODO: alipay.commerce.merchant.query → translate status.
    return PENDING;
  }

  async dispatch(_input: PayoutInput): Promise<PayoutDispatchResult> {
    // TODO: alipay.fund.trans.uni.transfer with our biz_no =
    // idempotencyKey. Currency must be one Alipay accepts on the route
    // (CNY for domestic, USD/EUR for cross-border).
    return {
      ok: false,
      error: "Alipay dispatch not yet implemented.",
      retryable: false,
    };
  }
}

export const alipayAdapter = new AlipayAdapter();
