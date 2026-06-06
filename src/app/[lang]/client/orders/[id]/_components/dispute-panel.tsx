"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DisputeOutcome, DisputeStatus } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, ScrollIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { openDisputeAction } from "@/lib/orders/dispute-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

type Dispute = {
  id: string;
  reference: string;
  status: DisputeStatus;
  outcome: DisputeOutcome | null;
  openedAt: Date;
  buyerStatement: string;
  factoryStatement: string | null;
  adminDecision: string | null;
  refundCents: number | null;
};

/**
 * Buyer-side dispute panel on the order detail page. Two modes:
 *
 *   - No open dispute + the order is in the eligible window (SHIPPED /
 *     IN_TRANSIT / COMPLETED, within 7 days of deliveredAt) → renders
 *     the "Report a problem" CTA + open-dispute form.
 *
 *   - An existing dispute exists → renders a status card showing
 *     buyer/factory/admin statements, the outcome (if resolved), and
 *     the refund amount (if any).
 *
 * Eligibility logic mirrors `openDisputeAction` server-side — the
 * server is authoritative; this just hides the CTA when we know it'll
 * reject.
 */
export function BuyerDisputePanel({
  orderId,
  eligibleNow,
  dispute,
}: {
  orderId: string;
  eligibleNow: boolean;
  dispute: Dispute | null;
}) {
  const dict = useDictionary();
  const t = dict.client.orders.dispute;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [statement, setStatement] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  if (dispute) {
    return <DisputeStatusCard dispute={dispute} t={t} />;
  }

  if (!eligibleNow) return null;

  const submit = () => {
    if (statement.trim().length < 20) {
      setError(t.errorShort);
      return;
    }
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await openDisputeAction(orderId, { statement: statement.trim() });
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setStatement("");
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="rounded-lg border border-danger-edge bg-danger-soft/30 p-5 mt-4">
      {!open ? (
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex gap-3 min-w-0">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-danger-soft text-danger">
              <HugeiconsIcon
                icon={Alert02Icon}
                size={16}
                strokeWidth={1.5}
              />
            </span>
            <div>
              <p className="text-sm font-semibold text-headline">
                {t.openTitle}
              </p>
              <p className="text-xs text-muted mt-0.5 max-w-prose">
                {t.openBody}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setOpen(true)}
          >
            {t.openCta}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <header>
            <p className="text-sm font-semibold text-headline">
              {t.formTitle}
            </p>
            <p className="text-xs text-muted mt-0.5">{t.formBody}</p>
          </header>
          {error && <FormError>{error}</FormError>}
          <textarea
            value={statement}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setStatement(e.target.value)
            }
            rows={5}
            maxLength={4000}
            placeholder={t.statementPlaceholder}
            disabled={pending}
            className={cn(
              "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm",
              "focus:outline-2 focus:outline-focus focus:outline-offset-1",
              "placeholder:text-faint disabled:opacity-60",
            )}
          />
          <p className="text-xs text-faint">
            {statement.trim().length} / 4000
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              disabled={pending}
            >
              {dict.client.orders.back}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={pending}
              onClick={submit}
            >
              {t.submitCta}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DisputeStatusCard({
  dispute,
  t,
}: {
  dispute: Dispute;
  t: ReturnType<typeof useDictionary>["client"]["orders"]["dispute"];
}) {
  const statusLabel = t.statuses[dispute.status];
  const statusTone =
    dispute.status === DisputeStatus.RESOLVED
      ? "bg-subtle text-muted border-line"
      : "bg-warning-soft text-warning border-warning-edge";

  return (
    <div className="rounded-lg border border-line bg-surface p-5 mt-4">
      <header className="flex items-start gap-3 mb-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning">
          <HugeiconsIcon
            icon={ScrollIcon}
            size={16}
            strokeWidth={1.5}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-mono uppercase tracking-wide text-faint">
            {dispute.reference}
          </p>
          <p className="text-sm font-semibold text-headline">{t.cardTitle}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
            statusTone,
          )}
        >
          {statusLabel}
        </span>
      </header>

      <div className="flex flex-col gap-3 text-sm">
        <Statement
          label={t.buyerLabel}
          value={dispute.buyerStatement}
        />
        {dispute.factoryStatement && (
          <Statement
            label={t.factoryLabel}
            value={dispute.factoryStatement}
          />
        )}
        {dispute.status === DisputeStatus.RESOLVED && dispute.adminDecision && (
          <Statement
            label={t.adminLabel}
            value={dispute.adminDecision}
            tone="admin"
          />
        )}
        {dispute.outcome && (
          <p className="text-xs text-muted">
            <span className="font-medium text-fg">{t.outcomeLabel}:</span>{" "}
            {t.outcomes[dispute.outcome]}
            {dispute.refundCents != null && dispute.refundCents > 0 && (
              <>
                {" · "}
                <span className="font-medium text-fg">{t.refundLabel}:</span>{" "}
                €{(dispute.refundCents / 100).toFixed(2)}
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function Statement({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "admin";
}) {
  return (
    <div
      className={cn(
        "rounded-md p-3 text-sm",
        tone === "admin"
          ? "border border-brand-edge bg-brand-50/40"
          : "border border-line bg-subtle/40",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint mb-1">
        {label}
      </p>
      <p className="text-fg whitespace-pre-wrap wrap-break-word leading-relaxed">
        {value}
      </p>
    </div>
  );
}
