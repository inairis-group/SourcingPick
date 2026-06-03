import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  BankIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import type { getDictionary } from "@/lib/i18n/get-dictionary";
import { wiseIsConfigured } from "@/lib/wise/client";
import { WiseRecipientForm } from "./wise-recipient-form";

/**
 * Three-state Wise card for the factory payouts page:
 *
 *   1. Platform Wise creds not set yet  → "pending admin setup" pill, no form
 *   2. Configured, recipient not linked → setup form
 *   3. Configured, recipient linked     → "connected" pill + change link
 *
 * Sits above the legacy Stripe card during the migration window. Once the
 * Stripe rip-out lands this becomes the only payout setup surface.
 */
export function WiseRecipientCard({
  wiseRecipientId,
  dict,
}: {
  wiseRecipientId: string | null;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const t = dict.factory.payouts.wise;
  const configured = wiseIsConfigured();

  if (!configured) {
    return (
      <section className="rounded-lg border border-line bg-surface p-5 mb-6">
        <header className="flex items-start gap-3">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={20}
            strokeWidth={1.5}
            className="text-muted shrink-0 mt-0.5"
          />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-headline">
              {t.notConfiguredTitle}
            </h2>
            <p className="text-xs text-muted mt-0.5 leading-snug">
              {t.notConfiguredBody}
            </p>
          </div>
        </header>
      </section>
    );
  }

  if (wiseRecipientId) {
    return (
      <section className="rounded-lg border border-success-edge bg-success-soft/40 p-5 mb-6">
        <header className="flex items-start gap-3">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={20}
            strokeWidth={1.5}
            className="text-success shrink-0 mt-0.5"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-headline">
              {t.connectedTitle}
            </h2>
            <p className="text-xs text-muted mt-0.5 leading-snug">
              {t.connectedBody.replace("{ref}", wiseRecipientId)}
            </p>
          </div>
        </header>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 mb-6">
      <header className="flex items-start gap-3 mb-4">
        <HugeiconsIcon
          icon={BankIcon}
          size={20}
          strokeWidth={1.5}
          className="text-brand-700 shrink-0 mt-0.5"
        />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-headline">
            {t.setupTitle}
          </h2>
          <p className="text-xs text-muted mt-0.5 leading-snug">{t.setupBody}</p>
        </div>
      </header>
      <WiseRecipientForm />
    </section>
  );
}
