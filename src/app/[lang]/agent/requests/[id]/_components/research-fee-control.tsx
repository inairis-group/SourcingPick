"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ResearchFeeStatus, ResearchFeeUnit } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import {
  setResearchFeeAction,
  waiveResearchFeeAction,
} from "@/lib/sourcing/research-fee-actions";
import {
  RESEARCH_FEE_DAY_CENTS,
  RESEARCH_FEE_WEEK_CENTS,
} from "@/lib/orders/pricing";
import { useDictionary } from "@/lib/i18n/client-provider";
import { formatEUR } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";

/**
 * Agent control to quote (or waive) the research fee on a request. Shows a
 * live preview of the computed amount as the unit/quantity change. Hidden
 * once the fee is PAID (terminal for the agent's purposes).
 */
export function ResearchFeeControl({
  requestId,
  lang,
  current,
}: {
  requestId: string;
  lang: Locale;
  current: {
    status: ResearchFeeStatus;
    unit: ResearchFeeUnit | null;
    quantity: number | null;
    cents: number | null;
  };
}) {
  const dict = useDictionary();
  const t = dict.agent.researchFee;
  const router = useRouter();
  const [unit, setUnit] = useState<ResearchFeeUnit>(
    current.unit ?? ResearchFeeUnit.DAY,
  );
  const [quantity, setQuantity] = useState<string>(
    current.quantity ? String(current.quantity) : "1",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const qty = Math.max(0, Math.floor(Number(quantity) || 0));
  const previewCents =
    (unit === "WEEK" ? RESEARCH_FEE_WEEK_CENTS : RESEARCH_FEE_DAY_CENTS) * qty;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) {
        setError(r.error ?? null);
        return;
      }
      router.refresh();
    });
  };

  const statusBadge =
    current.status === ResearchFeeStatus.PAID
      ? "bg-success-soft text-success border-success-edge"
      : current.status === ResearchFeeStatus.QUOTED
        ? "bg-info-soft text-info border-info-edge"
        : current.status === ResearchFeeStatus.WAIVED
          ? "bg-subtle text-muted border-line"
          : "bg-subtle text-faint border-line";

  return (
    <section className="rounded-lg border border-line bg-surface p-5 mb-6">
      <header className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            {t.title}
          </h2>
          <p className="text-xs text-muted mt-0.5">{t.description}</p>
        </div>
        <span
          className={`inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${statusBadge}`}
        >
          {t.statuses[current.status]}
        </span>
      </header>

      {current.status === ResearchFeeStatus.PAID ? (
        <p className="text-sm text-success">
          {t.paidNote.replace(
            "{amount}",
            formatEUR((current.cents ?? 0) / 100, lang),
          )}
        </p>
      ) : (
        <>
          {error && <FormError className="mb-3">{error}</FormError>}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium uppercase tracking-wide text-faint mb-1 block">
                {t.unitLabel}
              </label>
              <Select
                size="sm"
                value={unit}
                onChange={(v) => setUnit(v as ResearchFeeUnit)}
                options={[
                  { value: ResearchFeeUnit.DAY, label: t.units.DAY },
                  { value: ResearchFeeUnit.WEEK, label: t.units.WEEK },
                ]}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium uppercase tracking-wide text-faint mb-1 block">
                {t.quantityLabel}
              </label>
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                max="60"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-faint mb-1">
                {t.amountLabel}
              </p>
              <p className="text-lg font-bold text-headline">
                {formatEUR(previewCents / 100, lang)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => run(() => waiveResearchFeeAction(requestId))}
            >
              {t.waiveCta}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={pending}
              disabled={qty < 1}
              onClick={() => run(() => setResearchFeeAction(requestId, unit, qty))}
            >
              {current.status === ResearchFeeStatus.QUOTED
                ? t.requoteCta
                : t.quoteCta}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
