"use server";

import { headers } from "next/headers";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { createConnectOnboardingLink } from "./connect";

export type ConnectOnboardingResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Start (or resume) Stripe Express onboarding for the factory's org.
 *
 * The returned URL is one-shot and short-lived; the UI should redirect
 * immediately on receipt.
 */
export async function startFactoryOnboardingAction(): Promise<ConnectOnboardingResult> {
  const user = await requireRole(Role.FACTORY);

  const locale = await currentLocale();

  try {
    const url = await createConnectOnboardingLink(user.organizationId, locale);
    await writeAuditLog({
      actorUserId: user.id,
      action: "stripe.connect_onboarding_started",
      targetType: "Organization",
      targetId: user.organizationId,
    });
    return { ok: true, url };
  } catch (e) {
    return {
      ok: false,
      error: `Stripe error: ${(e as Error).message}`,
    };
  }
}

async function currentLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}
