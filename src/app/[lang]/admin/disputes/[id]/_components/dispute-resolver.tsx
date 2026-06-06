"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { resolveDisputeAction } from "@/lib/orders/dispute-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { formatEUR } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Split = {
  refundCents: number;
  retainedCents: number;
  platformShareCents: number;
  supplierShareCents: number;
};

type Outcome = "STANDARD" | "CUSTOM" | "REJECT";

/**
 * Admin arbitration form. Three outcomes, each previewing the actual
 * cents math the resolveDisputeAction will write. The decision narrative
 * is mandatory (≥ 20 chars) so resolved disputes always carry a reason
 * for both parties to read.
 */
export function AdminDisputeResolver({
  disputeId,
  disputedCents,
  standard,
  custom,
  lang,
}: {
  disputeId: string;
  disputedCents: number;
  standard: Split;
  custom: Split;
  lang: Locale;
}) {
  const dict = useDictionary();
  const t = dict.admin.disputes;
  const router = useRouter();
  const [outcome, setOutcome] = useState<Outcome>("STANDARD");
  const [decision, setDecision] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  const submit = () => {
    if (decision.trim().length < 20) {
      setError(t.errorShort);
      return;
    }
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await resolveDisputeAction(disputeId, {
        outcome,
        decision: decision.trim(),
      });
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="rounded-lg border border-line bg-surface p-5 mb-6">
      <h2 className="text-sm font-semibold text-headline mb-1">
        {t.arbitrateTitle}
      </h2>
      <p className="text-xs text-muted mb-4">{t.arbitrateBody}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        <OutcomeRadio
          checked={outcome === "STANDARD"}
          onSelect={() => setOutcome("STANDARD")}
          label={t.outcomes.STANDARD}
          summary={
            <>
              <SummaryRow
                label={t.refundCents}
                value={formatEUR(standard.refundCents / 100, lang)}
                tone="success"
              />
              <SummaryRow
                label={t.platformCents}
                value={formatEUR(standard.platformShareCents / 100, lang)}
              />
              <SummaryRow
                label={t.supplierCents}
                value={formatEUR(standard.supplierShareCents / 100, lang)}
              />
            </>
          }
        />
        <OutcomeRadio
          checked={outcome === "CUSTOM"}
          onSelect={() => setOutcome("CUSTOM")}
          label={t.outcomes.CUSTOM}
          summary={
            <SummaryRow
              label={t.refundCents}
              value={formatEUR(custom.refundCents / 100, lang)}
              tone="success"
            />
          }
        />
        <OutcomeRadio
          checked={outcome === "REJECT"}
          onSelect={() => setOutcome("REJECT")}
          label={t.outcomes.REJECT}
          summary={
            <SummaryRow
              label={t.escrowReturnsHeld}
              value={formatEUR(disputedCents / 100, lang)}
            />
          }
        />
      </div>

      {error && <FormError className="mb-3">{error}</FormError>}

      <label className="text-xs font-medium text-faint uppercase tracking-wide block mb-1">
        {t.decisionLabel}
      </label>
      <textarea
        value={decision}
        onChange={(e) => setDecision(e.target.value)}
        rows={5}
        maxLength={4000}
        placeholder={t.decisionPlaceholder}
        disabled={pending}
        className={cn(
          "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm",
          "focus:outline-2 focus:outline-focus focus:outline-offset-1",
          "placeholder:text-faint disabled:opacity-60",
        )}
      />
      <p className="text-xs text-faint mt-1 mb-3">
        {decision.trim().length} / 4000
      </p>

      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="primary"
          size="md"
          loading={pending}
          onClick={submit}
        >
          {t.resolveCta}
        </Button>
      </div>
    </div>
  );
}

function OutcomeRadio({
  checked,
  onSelect,
  label,
  summary,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  summary: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "text-start rounded-lg border p-4 transition-colors duration-fast",
        checked
          ? "border-brand-edge bg-brand-50/50 ring-1 ring-brand-edge"
          : "border-line bg-surface hover:bg-subtle/30",
      )}
    >
      <p className="text-sm font-semibold text-headline mb-2">{label}</p>
      <div className="flex flex-col gap-1 text-xs">{summary}</div>
    </button>
  );
}

function SummaryRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span
        className={cn(
          "font-medium",
          tone === "success" ? "text-success" : "text-fg",
        )}
      >
        {value}
      </span>
    </div>
  );
}
