"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { advanceOrderStatusAction } from "@/lib/orders/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Factory state-machine controls — spec §3.2:
 *  - PREPARATION → QC
 *  - QC → SHIPPED  (tracking number + carrier required)
 *  - SHIPPED → IN_TRANSIT
 */
export function FactoryOrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [shipFormOpen, setShipFormOpen] = useState(false);
  const [_, startTransition] = useTransition();

  const run = (
    next: OrderStatus,
    tracking?: {
      trackingNumber: string;
      trackingCarrier: string;
      trackingUrl?: string;
    },
  ) => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await advanceOrderStatusAction(orderId, next, tracking);
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setShipFormOpen(false);
      router.refresh();
    });
  };

  const onShipSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const trackingNumber = (formData.get("trackingNumber") ?? "").toString().trim();
    const trackingCarrier = (formData.get("trackingCarrier") ?? "").toString().trim();
    const trackingUrl = (formData.get("trackingUrl") ?? "").toString().trim();
    if (!trackingNumber || !trackingCarrier) {
      setError(dict.factory.orders.errorTrackingRequired);
      return;
    }
    run(OrderStatus.SHIPPED, {
      trackingNumber,
      trackingCarrier,
      trackingUrl: trackingUrl || undefined,
    });
  };

  if (status === OrderStatus.PAYMENT_PENDING) {
    return (
      <div className="rounded-md border border-warning-edge bg-warning-soft/40 px-4 py-3 text-sm text-fg">
        <p className="font-semibold text-headline">
          {dict.factory.orders.waitingPaymentTitle}
        </p>
        <p className="text-xs text-muted mt-0.5">
          {dict.factory.orders.waitingPaymentBody}
        </p>
      </div>
    );
  }

  if (
    status === OrderStatus.COMPLETED ||
    status === OrderStatus.CANCELLED ||
    status === OrderStatus.IN_TRANSIT
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <FormError>{error}</FormError>}

      {status === OrderStatus.PREPARATION && (
        <ActionCard
          title={dict.factory.orders.preparationCtaTitle}
          body={dict.factory.orders.preparationCtaBody}
          ctaLabel={dict.factory.orders.markQcCta}
          pending={pending}
          onCta={() => run(OrderStatus.QC)}
        />
      )}

      {status === OrderStatus.QC && !shipFormOpen && (
        <ActionCard
          title={dict.factory.orders.qcCtaTitle}
          body={dict.factory.orders.qcCtaBody}
          ctaLabel={dict.factory.orders.markShippedCta}
          pending={pending}
          onCta={() => setShipFormOpen(true)}
        />
      )}

      {status === OrderStatus.QC && shipFormOpen && (
        <form
          onSubmit={onShipSubmit}
          className="rounded-lg border border-line bg-surface p-4 flex flex-col gap-3"
        >
          <p className="text-sm font-semibold text-headline">
            {dict.factory.orders.shipFormTitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={dict.client.orders.carrierLabel} required>
              <Input name="trackingCarrier" required maxLength={80} />
            </Field>
            <Field label={dict.client.orders.trackingNumberLabel} required>
              <Input name="trackingNumber" required maxLength={80} />
            </Field>
          </div>
          <Field
            label={dict.factory.orders.trackingUrlLabel}
            hint={dict.factory.orders.trackingUrlHint}
          >
            <Input name="trackingUrl" type="url" maxLength={500} />
          </Field>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShipFormOpen(false)}
              disabled={pending}
            >
              {dict.client.orders.back}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={pending}
            >
              {dict.factory.orders.confirmShipCta}
            </Button>
          </div>
        </form>
      )}

      {status === OrderStatus.SHIPPED && (
        <ActionCard
          title={dict.factory.orders.shippedCtaTitle}
          body={dict.factory.orders.shippedCtaBody}
          ctaLabel={dict.factory.orders.markInTransitCta}
          pending={pending}
          onCta={() => run(OrderStatus.IN_TRANSIT)}
        />
      )}
    </div>
  );
}

function ActionCard({
  title,
  body,
  ctaLabel,
  pending,
  onCta,
}: {
  title: string;
  body: string;
  ctaLabel: string;
  pending: boolean;
  onCta: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-info-edge bg-info-soft/40 p-4 flex items-center justify-between gap-3 flex-wrap",
      )}
    >
      <div className="text-sm">
        <p className="font-semibold text-headline">{title}</p>
        <p className="text-muted text-xs mt-0.5">{body}</p>
      </div>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onCta}
        loading={pending}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
