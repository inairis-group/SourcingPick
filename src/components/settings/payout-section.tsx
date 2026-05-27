"use client";

import { useState, useTransition } from "react";
import type { PayoutAccountStatus, PayoutProvider } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { startPayoutOnboardingAction } from "@/lib/payouts/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

const PROVIDERS: Array<{
  value: PayoutProvider;
  label: string;
  blurb: string;
  recommendedFor: string;
}> = [
  {
    value: "STRIPE_CONNECT",
    label: "Stripe Connect",
    blurb:
      "Hosted onboarding. Payouts to your bank account, usually within 2 business days. Best in the EU, UK, US, and major Asian markets.",
    recommendedFor: "EU · UK · US · UAE · SG · HK · MX · NG · KE · ZA",
  },
  {
    value: "LIANLIAN",
    label: "LianLian Global",
    blurb:
      "Cross-border payouts to a Chinese or SE-Asian bank account. Lower fees than Stripe for CNY-bound transfers; supports VND, IDR, THB, PHP.",
    recommendedFor: "Mainland China · Vietnam · Indonesia · Thailand · Philippines",
  },
  {
    value: "ALIPAY",
    label: "Alipay",
    blurb:
      "Payouts to an existing Alipay business account. Same target as LianLian, lighter-weight if you already use Alipay for B2B.",
    recommendedFor: "Mainland China · Alipay business users",
  },
];

const STATUS_LABELS: Record<
  PayoutAccountStatus,
  "active" | "pending" | "restricted" | "rejected" | "none"
> = {
  NONE: "none",
  PENDING: "pending",
  ACTIVE: "active",
  RESTRICTED: "restricted",
  REJECTED: "rejected",
};

/**
 * Payout-provider picker + onboarding launcher for factories/agents.
 *
 * - If no provider is set yet → three picker cards, "Start onboarding"
 *   on each.
 * - If a provider is set and status is PENDING / RESTRICTED → big
 *   "Continue with <provider>" button that re-issues a hosted link.
 * - If ACTIVE → locked summary with a "manage with provider" link.
 */
export function PayoutSection({
  current,
}: {
  current: {
    provider: PayoutProvider | null;
    status: PayoutAccountStatus;
  };
}) {
  const dict = useDictionary();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<PayoutProvider | null>(null);

  const launch = (provider: PayoutProvider) => {
    setError(null);
    setChosen(provider);
    startTransition(async () => {
      const result = await startPayoutOnboardingAction(provider);
      if (!result.ok) {
        setError(result.error);
        setChosen(null);
        return;
      }
      window.location.href = result.url;
    });
  };

  const isActive = current.status === "ACTIVE";

  if (isActive && current.provider) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-md border border-success-edge bg-success-soft/30 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-success">
              {dict.settings.payouts.activeWith.replace(
                "{provider}",
                providerLabel(current.provider),
              )}
            </p>
            <p className="text-xs text-success/80 mt-0.5">
              {dict.settings.payouts.activeBody}
            </p>
          </div>
          <span className="inline-flex items-center h-5 px-1.5 rounded-full bg-success-soft text-success border border-success-edge text-[10px] font-semibold uppercase tracking-wide">
            {dict.settings.payouts.statuses.active}
          </span>
        </div>
        <p className="text-xs text-muted">
          {dict.settings.payouts.lockedHint}
        </p>
      </div>
    );
  }

  if (current.provider && !isActive) {
    return (
      <div className="flex flex-col gap-3">
        {error && <FormError>{error}</FormError>}
        <div className="rounded-md border border-warning-edge bg-warning-soft/30 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-warning">
              {dict.settings.payouts.resumeTitle.replace(
                "{provider}",
                providerLabel(current.provider),
              )}
            </p>
            <p className="text-xs text-warning/80 mt-0.5">
              {dict.settings.payouts.resumeBody}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={pending}
            onClick={() => launch(current.provider!)}
          >
            {dict.settings.payouts.continueCta}
          </Button>
        </div>
        <p className="text-xs text-faint">
          {dict.settings.payouts.statusLabel}:{" "}
          <span className="font-mono">
            {dict.settings.payouts.statuses[STATUS_LABELS[current.status]]}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <FormError>{error}</FormError>}
      <p className="text-sm text-muted">{dict.settings.payouts.pickIntro}</p>
      <ul className="flex flex-col gap-3">
        {PROVIDERS.map((p) => (
          <li
            key={p.value}
            className={cn(
              "rounded-md border border-line bg-surface p-4 flex flex-col gap-2",
              "hover:bg-subtle transition-colors duration-fast",
            )}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-headline">{p.label}</p>
                <p className="text-[11px] font-mono uppercase tracking-wide text-faint mt-0.5">
                  {p.recommendedFor}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={pending && chosen === p.value}
                disabled={pending && chosen !== p.value}
                onClick={() => launch(p.value)}
              >
                {dict.settings.payouts.startCta}
              </Button>
            </div>
            <p className="text-xs text-muted leading-snug">{p.blurb}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function providerLabel(p: PayoutProvider): string {
  switch (p) {
    case "STRIPE_CONNECT":
      return "Stripe Connect";
    case "LIANLIAN":
      return "LianLian Global";
    case "ALIPAY":
      return "Alipay";
  }
}
