"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { InvoiceStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import {
  adminMarkInvoicePaidAction,
  adminVoidInvoiceAction,
} from "@/lib/invoices/admin-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Per-row controls for the admin invoices ledger: download PDF, mark
 * paid (with confirmation), void (with reason). Surfaced on every row
 * regardless of type — the actions themselves enforce status-based
 * restrictions server-side.
 */
export function InvoiceRowControls({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const dict = useDictionary();
  const t = dict.admin.invoices.row;
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voidOpen, setVoidOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [_, startTransition] = useTransition();

  const markPaid = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await adminMarkInvoicePaidAction(invoiceId);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  const voidIt = () => {
    if (reason.trim().length < 10) {
      setError(t.errorReasonShort);
      return;
    }
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await adminVoidInvoiceAction(invoiceId, reason.trim());
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setReason("");
      setVoidOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      {error && (
        <FormError className="text-[10px]">{error}</FormError>
      )}
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        <a
          href={`/api/invoices/${invoiceId}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-link hover:text-link-hover underline underline-offset-2"
        >
          {t.pdfCta}
        </a>
        {status !== InvoiceStatus.PAID && status !== InvoiceStatus.VOID && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={markPaid}
            loading={pending}
          >
            {t.markPaidCta}
          </Button>
        )}
        {status !== InvoiceStatus.PAID && status !== InvoiceStatus.VOID && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setVoidOpen(true)}
            disabled={pending}
          >
            {t.voidCta}
          </Button>
        )}
      </div>

      <Dialog
        open={voidOpen}
        onClose={(v) => !pending && setVoidOpen(v)}
        size="md"
      >
        <DialogTitle>{t.voidDialogTitle}</DialogTitle>
        <DialogDescription>{t.voidDialogBody}</DialogDescription>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder={t.voidPlaceholder}
          disabled={pending}
          className={cn(
            "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm mb-2",
            "focus:outline-2 focus:outline-focus focus:outline-offset-1",
          )}
        />
        <p className="text-[11px] text-faint mb-3">{reason.trim().length} / 500</p>
        <DialogActions>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setVoidOpen(false)}
            disabled={pending}
          >
            {t.cancelCta}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={voidIt}
            loading={pending}
          >
            {t.voidConfirm}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
