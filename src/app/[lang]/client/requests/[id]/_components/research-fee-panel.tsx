"use client";

import { ResearchFeeStatus } from "@prisma/client";
import { useDictionary } from "@/lib/i18n/client-provider";
import { formatEUR } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";
import { WiseWirePanel } from "@/app/[lang]/client/orders/[id]/_components/wise-wire-panel";
import { cn } from "@/lib/utils";

type PlatformWire = { iban: string; bic: string; holderName: string };

/**
 * Buyer-facing research-fee panel on the request detail page.
 *
 * Pass 3b.5 dropped the Stripe Checkout action: payment now happens via
 * the WiseWirePanel rendered above the status card whenever the fee is
 * QUOTED + the platform's Wise IBAN env vars are set. The card below is
 * purely informational — it explains the fee state and the credit-back
 * promise; the actual money movement is bank wire → Wise webhook
 * reconciliation (see lib/wise/reconcile.ts).
 *
 * If the platform Wise account isn't configured yet, the buyer sees the
 * QUOTED status card on its own with no pay surface — the agent can
 * still issue the invoice but the buyer pays out-of-band until the env
 * vars land.
 */
export function ResearchFeePanel({
  requestReference,
  lang,
  status,
  amountCents,
  platformWire,
}: {
  /**
   * Unused after Pass 3b.5 — kept on the prop bag so the parent server
   * component doesn't need to change. Will be removed when 3b.6 cleans up
   * the public marketplace flow.
   */
  requestId?: string;
  requestReference: string;
  lang: Locale;
  status: ResearchFeeStatus;
  amountCents: number | null;
  /**
   * Platform's Wise receive account, when configured. When present + status
   * is QUOTED, the WiseWirePanel renders above the status card.
   */
  platformWire: PlatformWire | null;
}) {
  const dict = useDictionary();
  const t = dict.client.researchFee;

  if (status === ResearchFeeStatus.NONE) return null;

  const amount = amountCents ? formatEUR(amountCents / 100, lang) : "—";

  const tone =
    status === ResearchFeeStatus.QUOTED
      ? "border-warning-edge bg-warning-soft/30"
      : status === ResearchFeeStatus.PAID
        ? "border-info-edge bg-info-soft/30"
        : "border-success-edge bg-success-soft/30";

  return (
    <div className="mt-6">
      {status === ResearchFeeStatus.QUOTED &&
        platformWire &&
        amountCents !== null && (
          <WiseWirePanel
            iban={platformWire.iban}
            bic={platformWire.bic}
            holderName={platformWire.holderName}
            reference={`${requestReference}-FEE`}
            amountCents={amountCents}
            currency="EUR"
            lang={lang}
          />
        )}
      <section className={cn("rounded-lg border p-5", tone)}>
        <h2 className="text-sm font-semibold text-headline">{t.title}</h2>
        {status === ResearchFeeStatus.QUOTED && (
          <p className="text-xs text-muted mt-0.5 max-w-prose">
            {t.quotedBody.replace("{amount}", amount)}
          </p>
        )}
        {status === ResearchFeeStatus.PAID && (
          <p className="text-xs text-muted mt-0.5 max-w-prose">
            {t.paidBody.replace("{amount}", amount)}
          </p>
        )}
        {status === ResearchFeeStatus.CREDITED && (
          <p className="text-xs text-muted mt-0.5 max-w-prose">
            {t.creditedBody.replace("{amount}", amount)}
          </p>
        )}
        {status === ResearchFeeStatus.WAIVED && (
          <p className="text-xs text-muted mt-0.5">{t.waivedBody}</p>
        )}
      </section>
    </div>
  );
}
