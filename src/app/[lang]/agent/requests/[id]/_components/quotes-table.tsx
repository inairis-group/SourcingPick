"use client";

import { useState, useTransition } from "react";
import { Incoterm, QuoteStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { sendQuoteToClientAction } from "@/lib/sourcing/tender-actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

export type QuoteRow = {
  id: string;
  factoryName: string;
  unitPriceCentsFactory: number;
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
  createdAt: Date;
};

export function QuotesTable({ quotes }: { quotes: QuoteRow[] }) {
  const dict = useDictionary();
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [_, startTransition] = useTransition();

  const onSend = (quoteId: string) => {
    setError(null);
    setPendingId(quoteId);
    startTransition(async () => {
      const result = await sendQuoteToClientAction(quoteId);
      if (!result.ok) setError(result.error);
      setPendingId(null);
    });
  };

  if (quotes.length === 0) {
    return (
      <div className="rounded-md border border-line bg-subtle px-4 py-6 text-center text-sm text-muted">
        {dict.agent.quotes.empty}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <FormError>{error}</FormError>}

      {quotes.map((q) => {
        const expired = q.validUntil.getTime() < Date.now();
        const isSent = q.status === QuoteStatus.SENT_TO_CLIENT;
        const isAccepted = q.status === QuoteStatus.ACCEPTED;
        const isRejected = q.status === QuoteStatus.REJECTED;

        return (
          <article
            key={q.id}
            className={cn(
              "rounded-md border bg-surface p-4",
              isAccepted
                ? "border-success-edge bg-success-soft/30"
                : "border-line",
            )}
          >
            <header className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-headline">
                  {q.factoryName}
                </p>
                <p className="text-xs text-faint">
                  {dict.agent.quotes.submittedAt}{" "}
                  {formatDate(q.createdAt, locale, "short")}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <ScorePill score={q.qualificationScore} dict={dict} />
                <QuoteStatusPill status={q.status} dict={dict} />
              </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
              <Metric
                label={dict.agent.quotes.factoryPrice}
                value={formatEUR(q.unitPriceCentsFactory / 100, locale)}
              />
              <Metric
                label={dict.agent.quotes.clientPrice}
                value={formatEUR(q.unitPriceCentsClient / 100, locale)}
                emphasis
              />
              <Metric
                label={dict.factory.tenders.leadTimeLabel}
                value={`${q.leadTimeDays} ${dict.factory.tenders.daysShort}`}
              />
              <Metric
                label={dict.factory.tenders.moqLabel}
                value={q.moq.toLocaleString()}
              />
            </div>

            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
              <span>{q.incoterm}</span>
              <span>
                {dict.agent.quotes.total}: {formatEUR(q.totalCentsClient / 100, locale)}
              </span>
              <span
                className={cn(
                  expired && "text-danger font-medium",
                )}
              >
                {expired
                  ? dict.agent.quotes.expired
                  : `${dict.agent.quotes.validUntil} ${formatDate(q.validUntil, locale, "short")}`}
              </span>
            </div>

            {q.notes && (
              <p className="mt-3 pt-3 border-t border-line-subtle text-sm text-muted leading-snug">
                {q.notes}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-line-subtle flex items-center justify-end">
              {!isSent && !isAccepted && !isRejected && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onSend(q.id)}
                  loading={pendingId === q.id}
                  disabled={expired}
                >
                  {dict.agent.quotes.sendToClient}
                </Button>
              )}
              {isSent && (
                <span className="text-xs text-muted italic">
                  {dict.agent.quotes.sentToClientLabel}
                </span>
              )}
            </div>
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

function ScorePill({
  score,
  dict,
}: {
  score: number;
  dict: ReturnType<typeof useDictionary>;
}) {
  const label =
    score >= 90
      ? dict.agent.quotes.scoreRecommended
      : score >= 80
        ? dict.agent.quotes.scoreGood
        : dict.agent.quotes.scoreOk;
  const classes =
    score >= 90
      ? "bg-action text-on-action border-action"
      : score >= 80
        ? "bg-success-soft text-success border-success-edge"
        : "bg-warning-soft text-warning border-warning-edge";
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium whitespace-nowrap",
        classes,
      )}
    >
      {label} · {score}
    </span>
  );
}

function QuoteStatusPill({
  status,
  dict,
}: {
  status: QuoteStatus;
  dict: ReturnType<typeof useDictionary>;
}) {
  const map: Record<QuoteStatus, { label: string; classes: string }> = {
    DRAFT: {
      label: dict.agent.quotes.statusDraft,
      classes: "bg-subtle text-muted border-line",
    },
    SENT_TO_AGENT: {
      label: dict.agent.quotes.statusReceived,
      classes: "bg-info-soft text-info border-info-edge",
    },
    SENT_TO_CLIENT: {
      label: dict.agent.quotes.statusSentToClient,
      classes: "bg-warning-soft text-warning border-warning-edge",
    },
    ACCEPTED: {
      label: dict.agent.quotes.statusAccepted,
      classes: "bg-success-soft text-success border-success-edge",
    },
    REJECTED: {
      label: dict.agent.quotes.statusRejected,
      classes: "bg-danger-soft text-danger border-danger-edge",
    },
    EXPIRED: {
      label: dict.agent.quotes.statusExpired,
      classes: "bg-subtle text-faint border-line",
    },
  };
  const { label, classes } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide whitespace-nowrap",
        classes,
      )}
    >
      {label}
    </span>
  );
}
