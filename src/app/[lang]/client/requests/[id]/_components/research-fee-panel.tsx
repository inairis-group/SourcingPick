"use client";

import { useState, useTransition } from "react";
import { ResearchFeeStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { createResearchFeeCheckoutAction } from "@/lib/stripe/checkout-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { formatEUR } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Buyer-facing research-fee panel on the request detail page.
 *   QUOTED   → amount + "Pay" (redirects to Stripe checkout).
 *   PAID     → confirmation + credit-back reminder.
 *   CREDITED → "returned as credit" note.
 *   WAIVED   → waived note.
 *   NONE     → nothing.
 */
export function ResearchFeePanel({
  requestId,
  lang,
  status,
  amountCents,
}: {
  requestId: string;
  lang: Locale;
  status: ResearchFeeStatus;
  amountCents: number | null;
}) {
  const dict = useDictionary();
  const t = dict.client.researchFee;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status === ResearchFeeStatus.NONE) return null;

  const amount = amountCents ? formatEUR(amountCents / 100, lang) : "—";

  const pay = () => {
    setError(null);
    startTransition(async () => {
      const r = await createResearchFeeCheckoutAction(requestId);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      window.location.href = r.url;
    });
  };

  const tone =
    status === ResearchFeeStatus.QUOTED
      ? "border-warning-edge bg-warning-soft/30"
      : status === ResearchFeeStatus.PAID
        ? "border-info-edge bg-info-soft/30"
        : "border-success-edge bg-success-soft/30";

  return (
    <section className={cn("rounded-lg border p-5 mt-6", tone)}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
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
        </div>

        {status === ResearchFeeStatus.QUOTED && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={pending}
            onClick={pay}
          >
            {t.payCta.replace("{amount}", amount)}
          </Button>
        )}
      </div>
      {error && <FormError className="mt-3">{error}</FormError>}
    </section>
  );
}
