"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Incoterm, QuoteStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import {
  acceptQuoteAction,
  rejectQuoteAction,
} from "@/lib/orders/actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

export type ClientQuoteRow = {
  id: string;
  factoryName: string;
  unitPriceCentsClient: number;
  totalCentsClient: number;
  quantity: number;
  leadTimeDays: number;
  moq: number;
  incoterm: Incoterm;
  validUntil: Date;
  qualificationScore: number;
  status: QuoteStatus;
  notes: string | null;
  agentRecommendation?: boolean;
};

export function ClientQuotesPanel({
  quotes,
  lang,
}: {
  quotes: ClientQuoteRow[];
  lang: string;
}) {
  const dict = useDictionary();
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmAcceptId, setConfirmAcceptId] = useState<string | null>(null);
  const [_, startTransition] = useTransition();

  const onAccept = (quoteId: string) => {
    setError(null);
    setPendingId(quoteId);
    startTransition(async () => {
      const result = await acceptQuoteAction(quoteId);
      setPendingId(null);
      setConfirmAcceptId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/${lang}/client/orders/${result.orderId}`);
    });
  };

  const onReject = (quoteId: string) => {
    setError(null);
    setPendingId(quoteId);
    startTransition(async () => {
      const result = await rejectQuoteAction(quoteId);
      if (!result.ok) setError(result.error);
      setPendingId(null);
      router.refresh();
    });
  };

  if (quotes.length === 0) {
    return (
      <div className="rounded-md border border-line bg-subtle px-4 py-6 text-center text-sm text-muted">
        {dict.client.quotes.empty}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <FormError>{error}</FormError>}

      {quotes.map((q) => {
        const expired = q.validUntil.getTime() < Date.now();
        const isAccepted = q.status === QuoteStatus.ACCEPTED;
        const isRejected = q.status === QuoteStatus.REJECTED;
        const decidable = q.status === QuoteStatus.SENT_TO_CLIENT && !expired;

        return (
          <article
            key={q.id}
            className={cn(
              "rounded-md border bg-surface p-4",
              isAccepted
                ? "border-success-edge bg-success-soft/30"
                : isRejected
                  ? "border-line bg-subtle/50"
                  : q.agentRecommendation
                    ? "border-action"
                    : "border-line",
            )}
          >
            <header className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-headline">
                    {q.factoryName}
                  </p>
                  {q.agentRecommendation && (
                    <span className="inline-flex items-center h-5 px-1.5 rounded-full text-[10px] font-medium uppercase tracking-wide bg-action text-on-action">
                      {dict.client.quotes.agentRecommendation}
                    </span>
                  )}
                </div>
                <p className="text-xs text-faint mt-0.5">
                  {dict.client.quotes.validUntil}{" "}
                  {formatDate(q.validUntil, locale, "short")}
                </p>
              </div>
              <StatusPill status={q.status} dict={dict} expired={expired} />
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
              <Metric
                label={dict.client.quotes.unitPrice}
                value={formatEUR(q.unitPriceCentsClient / 100, locale)}
              />
              <Metric
                label={dict.client.quotes.total}
                value={formatEUR(q.totalCentsClient / 100, locale)}
                emphasis
              />
              <Metric
                label={dict.client.quotes.leadTime}
                value={`${q.leadTimeDays} ${dict.factory.tenders.daysShort}`}
              />
              <Metric
                label={dict.client.quotes.incoterm}
                value={q.incoterm}
              />
            </div>

            {q.notes && (
              <p className="mt-3 pt-3 border-t border-line-subtle text-sm text-muted leading-snug">
                {q.notes}
              </p>
            )}

            {decidable && (
              <div className="mt-4 pt-3 border-t border-line-subtle flex items-center justify-end gap-2 flex-wrap">
                {confirmAcceptId === q.id ? (
                  <>
                    <span className="text-xs text-muted me-auto">
                      {dict.client.quotes.confirmAcceptCopy}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmAcceptId(null)}
                      disabled={pendingId === q.id}
                    >
                      {dict.client.quotes.cancel}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => onAccept(q.id)}
                      loading={pendingId === q.id}
                    >
                      {dict.client.quotes.confirmAccept}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onReject(q.id)}
                      loading={pendingId === q.id}
                    >
                      {dict.client.quotes.reject}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setConfirmAcceptId(q.id)}
                    >
                      {dict.client.quotes.accept}
                    </Button>
                  </>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Metric({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-semibold",
          emphasis ? "text-headline" : "text-fg",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function StatusPill({
  status,
  dict,
  expired,
}: {
  status: QuoteStatus;
  dict: ReturnType<typeof useDictionary>;
  expired: boolean;
}) {
  if (expired && status === QuoteStatus.SENT_TO_CLIENT) {
    return (
      <span className="inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide bg-subtle text-faint border-line">
        {dict.client.quotes.expired}
      </span>
    );
  }
  const map: Partial<Record<QuoteStatus, { label: string; classes: string }>> =
    {
      SENT_TO_CLIENT: {
        label: dict.client.quotes.statusAwaitingDecision,
        classes: "bg-info-soft text-info border-info-edge",
      },
      ACCEPTED: {
        label: dict.client.quotes.statusAccepted,
        classes: "bg-success-soft text-success border-success-edge",
      },
      REJECTED: {
        label: dict.client.quotes.statusRejected,
        classes: "bg-danger-soft text-danger border-danger-edge",
      },
    };
  const conf = map[status] ?? {
    label: status,
    classes: "bg-subtle text-faint border-line",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide whitespace-nowrap",
        conf.classes,
      )}
    >
      {conf.label}
    </span>
  );
}
