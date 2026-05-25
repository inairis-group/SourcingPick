"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { advanceOrderStatusAction } from "@/lib/orders/actions";
import {
  createBalanceCheckoutAction,
  createDepositCheckoutAction,
} from "@/lib/stripe/checkout-actions";
import { useDictionary } from "@/lib/i18n/client-provider";

/**
 * Client-side state-machine controls. Spec §3.2 lets the client:
 *  - PAYMENT_PENDING → PREPARATION (Stripe Checkout for the 30% deposit)
 *  - PAYMENT_PENDING → CANCELLED (before factory starts work)
 *  - SHIPPED/IN_TRANSIT → COMPLETED (Stripe Checkout for the 70% balance;
 *    the webhook completes the order + triggers the factory payout)
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
  const [_, startTransition] = useTransition();
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

  const onPayDeposit = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await createDepositCheckoutAction(orderId);
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Full-page navigation to Stripe — `router.push` would try to handle
      // it as an internal route.
      window.location.href = result.url;
    });
  };

  const onPayBalance = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await createBalanceCheckoutAction(orderId);
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
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
          <div className="flex items-center gap-2">
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
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onPayDeposit}
              loading={pending && confirming === null}
            >
              {dict.client.orders.payDepositCta}
            </Button>
          </div>
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
        <div className="rounded-lg border border-success-edge bg-success-soft/40 p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm">
            <p className="font-semibold text-headline">
              {dict.client.orders.confirmReceiptTitle}
            </p>
            <p className="text-muted text-xs mt-0.5">
              {dict.client.orders.payBalanceBody}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onPayBalance}
            loading={pending}
          >
            {dict.client.orders.payBalanceCta}
          </Button>
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
