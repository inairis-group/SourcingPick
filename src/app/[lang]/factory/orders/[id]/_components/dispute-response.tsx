"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DisputeOutcome, DisputeStatus } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, ScrollIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { respondToDisputeAction } from "@/lib/orders/dispute-actions";
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
};

/**
 * Factory-side dispute panel on the order detail page. Shows:
 *
 *   - The buyer's claim, in full.
 *   - The factory's response (or a write box if they haven't responded
 *     yet and the dispute is still pre-resolution).
 *   - The admin decision when RESOLVED.
 *
 * The window for responding is implicitly the dispute lifecycle —
 * silence past 5 days defaults to "no response" in admin's view but
 * doesn't lock the form here, so a factory who comes back late can
 * still submit.
 */
export function FactoryDisputeResponse({
  dispute,
}: {
  dispute: Dispute;
}) {
  const dict = useDictionary();
  const t = dict.factory.orders.dispute;
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [statement, setStatement] = useState(dispute.factoryStatement ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  const canRespond = dispute.status !== DisputeStatus.RESOLVED;
  const submit = () => {
    if (statement.trim().length < 20) {
      setError(t.errorShort);
      return;
    }
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await respondToDisputeAction(dispute.id, {
        statement: statement.trim(),
      });
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  const statusTone =
    dispute.status === DisputeStatus.RESOLVED
      ? "bg-subtle text-muted border-line"
      : "bg-warning-soft text-warning border-warning-edge";

  return (
    <div className="rounded-lg border border-warning-edge bg-warning-soft/30 p-5 mt-4">
      <header className="flex items-start gap-3 mb-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning">
          <HugeiconsIcon
            icon={canRespond ? Alert02Icon : ScrollIcon}
            size={16}
            strokeWidth={1.5}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-mono uppercase tracking-wide text-faint">
            {dispute.reference}
          </p>
          <p className="text-sm font-semibold text-headline">{t.title}</p>
          <p className="text-xs text-muted mt-0.5 max-w-prose">{t.body}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
            statusTone,
          )}
        >
          {t.statuses[dispute.status]}
        </span>
      </header>

      <div className="flex flex-col gap-3 text-sm">
        <Statement label={t.buyerLabel} value={dispute.buyerStatement} />

        {dispute.factoryStatement && !editing && (
          <Statement
            label={t.yourLabel}
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
          </p>
        )}

        {canRespond && (editing || !dispute.factoryStatement) && (
          <div className="flex flex-col gap-3 mt-2">
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
              {editing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                    setStatement(dispute.factoryStatement ?? "");
                  }}
                  disabled={pending}
                >
                  {dict.client.orders.back}
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={pending}
                onClick={submit}
              >
                {dispute.factoryStatement ? t.updateCta : t.submitCta}
              </Button>
            </div>
          </div>
        )}

        {canRespond && dispute.factoryStatement && !editing && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
            >
              {t.editCta}
            </Button>
          </div>
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
          : "border border-line bg-surface",
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
