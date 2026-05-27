import "server-only";
import type { PayoutAccountStatus, PayoutProvider } from "@prisma/client";
import type {
  OnboardingResult,
  PayoutAdapter,
  PayoutDispatchResult,
  PayoutInput,
} from "./types";

// String literals over enum members to avoid load-time crashes when
// Turbopack serves a stale @prisma/client. See stripe.ts for full
// rationale. The literal IS the runtime enum value.
const LIANLIAN = "LIANLIAN" as const satisfies PayoutProvider;
const PENDING = "PENDING" as const satisfies PayoutAccountStatus;

/**
 * LianLian Global adapter — cross-border payouts to mainland China and
 * SE Asia. LianLian's flow:
 *   1. We register a "payee" via their API with the factory's KYB info.
 *   2. They return a payee_id; we store it as Organization.payoutAccountId.
 *   3. Factory completes any provider-side identity verification in the
 *      LianLian portal (whose URL we issue via `getOnboardingUrl`).
 *   4. Provider webhook fires on status change → updates payoutStatus.
 *   5. dispatch() calls /api/v2/transfer with idempotency_key + payee_id.
 *
 * Real SDK calls land in a follow-up — today these stubs return the
 * structured shapes the dispatcher + admin status page need.
 *
 * Required env: provider creds (issued after LianLian KYB), plus the
 * API host (production vs sandbox). LianLian uses RSA signature auth,
 * not bearer tokens, so we ship the private key fingerprint pair via
 * env (LIANLIAN_PRIVATE_KEY is a multiline PEM).
 */
class LianLianAdapter implements PayoutAdapter {
  readonly provider = LIANLIAN;

  requiredEnvVars(): string[] {
    return [
      "LIANLIAN_API_HOST",
      "LIANLIAN_MERCHANT_ID",
      "LIANLIAN_PRIVATE_KEY",
      "LIANLIAN_PLATFORM_PUBLIC_KEY",
      "LIANLIAN_WEBHOOK_SECRET",
    ];
  }

  isConfigured(): boolean {
    return this.requiredEnvVars().every((k) => Boolean(process.env[k]));
  }

  async healthCheck(): Promise<{ ok: boolean; message?: string }> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        message: "LianLian env vars missing — see admin checklist.",
      };
    }
    // TODO: GET /api/v2/merchant/ping with a signed request. Today we
    // treat env presence + parseable PEM as healthy.
    const pem = process.env.LIANLIAN_PRIVATE_KEY ?? "";
    if (!pem.includes("BEGIN") || !pem.includes("END")) {
      return { ok: false, message: "LIANLIAN_PRIVATE_KEY isn't a valid PEM." };
    }
    return { ok: true };
  }

  async startOnboarding(
    _orgId: string,
    _returnUrl: string,
  ): Promise<OnboardingResult> {
    // TODO:
    //   1. POST /api/v2/payee/create with the factory's legal entity
    //      details (name, country, business registration #, beneficial
    //      owner, bank account in CNY/USD).
    //   2. Capture payee_id + the returned KYB portal URL.
    //   3. Return { url, accountRef: payee_id }.
    return {
      ok: false,
      error: "LianLian onboarding adapter not yet implemented.",
    };
  }

  async fetchAccountStatus(_accountId: string): Promise<PayoutAccountStatus> {
    // TODO: GET /api/v2/payee/{payee_id} and translate their status
    // codes into PayoutAccountStatus.
    return PENDING;
  }

  async dispatch(_input: PayoutInput): Promise<PayoutDispatchResult> {
    // TODO:
    //   - Build the signed transfer payload (amount in minor units,
    //     currency, payee_id, our idempotency_key).
    //   - POST /api/v2/transfer.
    //   - On 4xx, classify retryable vs final (insufficient balance
    //     is retryable, blocked-payee is final).
    return {
      ok: false,
      error: "LianLian dispatch not yet implemented.",
      retryable: false,
    };
  }
}

export const lianlianAdapter = new LianLianAdapter();
