"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { advanceOrderStatusAction } from "@/lib/orders/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

/**
 * Buyer-side controls on the order detail page (Wise rail).
 *
 * The actual payment happens via the WiseWirePanel rendered ABOVE this
 * component — the buyer copies the IBAN + reference and wires from their
 * own bank. The order advances automatically when the Wise webhook
 * reconciles the incoming credit (see lib/wise/reconcile.ts). So this
 * component is now mostly informational:
 *   - PAYMENT_PENDING : "wire the deposit" hint + a cancel button
 *   - SHIPPED/IN_TRANSIT : "wire the balance" hint, nothing else
 *   - other            : "waiting for factory" placeholder
 *
 * The Stripe Checkout buttons that used to live here were removed when
 * Wise became the sole rail (Pass 3b.5). Cancel still uses the existing
 * order state-machine action — no payment provider involved.
 */
export function OrderActions({
  orderId,
  status,
  lang,
}: {
  orderId: string;
  status: OrderStatus;
  lang: string;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<"cancel" | null>(null);
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);

  const runAdvance = (next: OrderStatus) => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await advanceOrderStatusAction(orderId, next);
      setPending(false);
      setConfirming(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED) {
    return null;
  }

  const canPay = status === OrderStatus.PAYMENT_PENDING;
  const canCancel = status === OrderStatus.PAYMENT_PENDING;
  const canReceive =
    status === OrderStatus.SHIPPED || status === OrderStatus.IN_TRANSIT;

  if (!canPay && !canCancel && !canReceive) {
    return (
      <div className="rounded-md border border-line bg-subtle px-4 py-3 text-sm text-muted">
        {dict.client.orders.waitingForFactory}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <FormError>{error}</FormError>}

      {canPay && (
        <div className="rounded-lg border border-warning-edge bg-warning-soft/40 p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm">
            <p className="font-semibold text-headline">
              {dict.client.orders.paymentPendingTitle}
            </p>
            <p className="text-muted text-xs mt-0.5">
              {dict.client.orders.paymentPendingBody}
            </p>
          </div>
          {canCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirming("cancel")}
              disabled={pending}
            >
              {dict.client.orders.cancelOrder}
            </Button>
          )}
        </div>
      )}

      {confirming === "cancel" && (
        <ConfirmCard
          title={dict.client.orders.confirmCancelTitle}
          body={dict.client.orders.confirmCancelBody}
          cancelLabel={dict.client.orders.back}
          confirmLabel={dict.client.orders.confirmCancelCta}
          variant="danger"
          onCancel={() => setConfirming(null)}
          onConfirm={() => runAdvance(OrderStatus.CANCELLED)}
          pending={pending}
        />
      )}

      {canReceive && (
        <div className="rounded-lg border border-success-edge bg-success-soft/40 p-4">
          <p className="font-semibold text-headline text-sm">
            {dict.client.orders.confirmReceiptTitle}
          </p>
          <p className="text-muted text-xs mt-0.5">
            {dict.client.orders.payBalanceBody}
          </p>
        </div>
      )}

      <input type="hidden" value={lang} readOnly hidden />
    </div>
  );
}

function ConfirmCard({
  title,
  body,
  cancelLabel,
  confirmLabel,
  variant = "primary",
  pending,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  variant?: "primary" | "danger";
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-sm font-semibold text-headline">{title}</p>
      <p className="text-xs text-muted mt-1">{body}</p>
      <div className="flex items-center justify-end gap-2 mt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={pending}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant === "danger" ? "danger" : "primary"}
          size="sm"
          onClick={onConfirm}
          loading={pending}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
