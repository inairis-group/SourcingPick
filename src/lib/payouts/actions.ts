"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import type { PayoutAccountStatus, PayoutProvider } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import {
  adapterFor,
  startProviderOnboarding,
} from "./dispatch";

// String-literal aliases for the PayoutAccountStatus values we
// reference at runtime. Avoids the load-time crash when @prisma/client
// is stale under Turbopack (see lib/payouts/stripe.ts comment).
const STATUS_NONE = "NONE" as const satisfies PayoutAccountStatus;
const STATUS_PENDING = "PENDING" as const satisfies PayoutAccountStatus;
const STATUS_ACTIVE = "ACTIVE" as const satisfies PayoutAccountStatus;

export type StartOnboardingResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Factory/agent action: pick a payout provider (if not already set) and
 * start hosted onboarding.
 *
 *   - First call sets `payoutProvider` + `payoutStatus = PENDING` and
 *     returns the provider's hosted onboarding URL.
 *   - Subsequent calls before the account is ACTIVE return a fresh URL
 *     (Stripe Connect, LianLian and Alipay all support re-issuing).
 *   - Once `payoutStatus = ACTIVE` (set by webhook), this returns the
 *     URL to the provider's account management page so the user can
 *     update bank details / docs.
 *
 * Locked once ACTIVE: changing provider mid-relationship invalidates
 * audit references on already-paid orders. UI should hide the picker
 * once that's true; this action also refuses, defensively.
 */
export async function startPayoutOnboardingAction(
  provider: PayoutProvider,
): Promise<StartOnboardingResult> {
  const user = await requireAuth();
  // Shippers were added 2026-08: we collect freight from the buyer and settle
  // the carrier, so they need a payout account exactly like a factory does.
  if (
    user.role !== Role.FACTORY &&
    user.role !== Role.AGENT &&
    user.role !== Role.SHIPPER
  ) {
    return {
      ok: false,
      error: "Only factories, agents and shippers can onboard with a payout provider.",
    };
  }

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: {
      id: true,
      payoutProvider: true,
      payoutStatus: true,
    },
  });
  if (!org) return { ok: false, error: "Organisation not found." };

  // Refuse to switch providers once active. Operations can override via
  // a direct DB edit (intentionally not a UI button — too easy to break
  // an audited chain by accident).
  if (
    org.payoutProvider &&
    org.payoutProvider !== provider &&
    org.payoutStatus === STATUS_ACTIVE
  ) {
    return {
      ok: false,
      error: `You're already onboarded with ${org.payoutProvider}. Contact support to switch providers.`,
    };
  }

  const adapter = adapterFor(provider);
  if (!adapter.isConfigured()) {
    return {
      ok: false,
      error: `${provider} isn't configured on this platform yet. The admin needs to set the API keys first.`,
    };
  }

  // Build a return URL the provider redirects to after onboarding.
  // Hosts in dev/preview/prod differ; read from the actual request.
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const settingsPath =
    user.role === Role.FACTORY
      ? "/factory/settings"
      : "/agent/settings";
  const returnUrl = `${proto}://${host}${settingsPath}?payout=return`;

  const result = await startProviderOnboarding(provider, org.id, returnUrl);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  // Record the provider choice + the accountRef the provider gave us
  // (Stripe acct_..., LianLian payee id, Alipay open_id). Status starts
  // PENDING; webhooks promote it to ACTIVE.
  await prisma.organization.update({
    where: { id: org.id },
    data: {
      payoutProvider: provider,
      payoutAccountId: result.accountRef ?? undefined,
      payoutStatus:
        org.payoutStatus === STATUS_NONE
          ? STATUS_PENDING
          : org.payoutStatus,
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "payouts.onboarding_started",
    targetType: "Organization",
    targetId: org.id,
    payload: { provider },
  });

  revalidatePath("/[lang]/factory/settings", "page");
  revalidatePath("/[lang]/agent/settings", "page");
  return { ok: true, url: result.url };
}
