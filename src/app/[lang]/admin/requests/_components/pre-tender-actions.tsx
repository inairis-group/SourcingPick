"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import {
  approvePreTenderAction,
  rejectPreTenderAction,
} from "@/lib/admin/dispatch-actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate } from "@/lib/i18n/formatters";

/**
 * Pre-tender validation controls (partner item #14). Surfaced inline on
 * each row of the dispatch queue. Three states:
 *   - Approved: badge with approval date.
 *   - Rejected: reason + re-approve button so the admin can flip back once
 *     the agent has revised the brief.
 *   - Pending: approve / reject controls.
 *
 * Agents can't dispatch tender invitations while this is pending or
 * rejected — the block lives server-side in `sendTenderInvitationsAction`.
 */
export function PreTenderActions({
  requestId,
  approvedAt,
  rejectedAt,
  rejectionReason,
  hasAgent,
}: {
  requestId: string;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  hasAgent: boolean;
}) {
  const dict = useDictionary();
  const locale = useLocale();
  const router = useRouter();
  const t = dict.admin.dispatch.preTender;

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [_, startTransition] = useTransition();

  const onApprove = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await approvePreTenderAction(requestId);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  const onReject = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await rejectPreTenderAction(requestId, reason);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setRejecting(false);
      setReason("");
      router.refresh();
    });
  };

  if (approvedAt) {
    return (
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-line-subtle">
        <div className="flex items-center gap-2 text-xs text-success">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={14}
            strokeWidth={2}
          />
          <span className="font-medium">
            {t.approvedOn.replace(
              "{date}",
              formatDate(approvedAt, locale as never, "short"),
            )}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setRejecting(true)}
          disabled={pending}
        >
          {t.flipReject}
        </Button>
        {rejecting && (
          <RejectInline
            reason={reason}
            setReason={setReason}
            onReject={onReject}
            onCancel={() => {
              setRejecting(false);
              setReason("");
              setError(null);
            }}
            pending={pending}
            t={t}
          />
        )}
        {error && <FormError>{error}</FormError>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pt-3 border-t border-line-subtle">
      {rejectedAt && rejectionReason && (
        <div className="flex items-start gap-2 rounded-md border border-warning-line bg-warning-subtle px-3 py-2">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={14}
            strokeWidth={2}
            className="text-warning mt-0.5 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-warning">
              {t.rejectedOn.replace(
                "{date}",
                formatDate(rejectedAt, locale as never, "short"),
              )}
            </p>
            <p className="text-xs text-muted mt-0.5 leading-relaxed wrap-break-word">
              {rejectionReason}
            </p>
          </div>
        </div>
      )}
      {error && <FormError>{error}</FormError>}
      {rejecting ? (
        <RejectInline
          reason={reason}
          setReason={setReason}
          onReject={onReject}
          onCancel={() => {
            setRejecting(false);
            setReason("");
            setError(null);
          }}
          pending={pending}
          t={t}
        />
      ) : (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs text-muted">
            {hasAgent ? t.helperAssigned : t.helperUnassigned}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRejecting(true)}
              disabled={pending}
            >
              {t.rejectCta}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onApprove}
              loading={pending}
            >
              {t.approveCta}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RejectInline({
  reason,
  setReason,
  onReject,
  onCancel,
  pending,
  t,
}: {
  reason: string;
  setReason: (v: string) => void;
  onReject: () => void;
  onCancel: () => void;
  pending: boolean;
  t: {
    rejectReasonPlaceholder: string;
    cancel: string;
    confirmRejectCta: string;
  };
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={t.rejectReasonPlaceholder}
        maxLength={500}
      />
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={pending}
        >
          {t.cancel}
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={onReject}
          loading={pending}
          disabled={reason.trim().length < 5}
        >
          {t.confirmRejectCta}
        </Button>
      </div>
    </div>
  );
}
