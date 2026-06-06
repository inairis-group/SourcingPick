"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { updateOrderTrackingAction } from "@/lib/orders/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

/**
 * Factory-side edit-tracking surface (partner item #8). Available while
 * the order is SHIPPED / IN_TRANSIT — the partner specifically wanted
 * the factory to be able to fix typos in the tracking number after the
 * fact without rolling the order back through the state machine.
 *
 * Renders inline as a "Tracking" card with the current values + an
 * Edit button. Clicking Edit swaps in a form with the same field set
 * the shipment-confirmation modal uses.
 */
export function TrackingEditor({
  orderId,
  initial,
}: {
  orderId: string;
  initial: {
    trackingNumber: string;
    trackingCarrier: string | null;
    trackingUrl: string | null;
  };
}) {
  const dict = useDictionary();
  const router = useRouter();
  const t = dict.factory.orders.trackingEditor;
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const trackingNumber = (fd.get("trackingNumber") ?? "").toString().trim();
    const trackingCarrier = (fd.get("trackingCarrier") ?? "").toString().trim();
    const trackingUrl = (fd.get("trackingUrl") ?? "").toString().trim();
    if (!trackingNumber || !trackingCarrier) {
      setError(t.errorRequired);
      return;
    }
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await updateOrderTrackingAction(orderId, {
        trackingNumber,
        trackingCarrier,
        trackingUrl: trackingUrl || undefined,
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

  if (!editing) {
    return (
      <div className="rounded-lg border border-line bg-surface p-5 flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {t.title}
          </p>
          <p className="text-sm text-fg">
            <span className="text-muted">{t.carrierLabel}:</span>{" "}
            <span className="font-medium">{initial.trackingCarrier ?? "—"}</span>
          </p>
          <p className="text-sm font-mono text-fg break-all">
            {initial.trackingNumber}
          </p>
          {initial.trackingUrl && (
            <p className="text-xs text-muted truncate">
              {initial.trackingUrl}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setEditing(true)}
        >
          <HugeiconsIcon icon={Edit02Icon} size={12} strokeWidth={1.5} />
          <span className="ms-1.5">{t.editCta}</span>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-line bg-surface p-5 flex flex-col gap-4"
    >
      <header>
        <p className="text-sm font-semibold text-headline">{t.editTitle}</p>
        <p className="text-xs text-muted mt-0.5">{t.editBody}</p>
      </header>

      {error && <FormError>{error}</FormError>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label={dict.client.orders.carrierLabel} required>
          <Input
            name="trackingCarrier"
            required
            maxLength={80}
            defaultValue={initial.trackingCarrier ?? ""}
          />
        </Field>
        <Field label={dict.client.orders.trackingNumberLabel} required>
          <Input
            name="trackingNumber"
            required
            maxLength={80}
            defaultValue={initial.trackingNumber}
            className="font-mono"
          />
        </Field>
      </div>
      <Field label={dict.factory.orders.trackingUrlLabel}>
        <Input
          name="trackingUrl"
          type="url"
          maxLength={500}
          defaultValue={initial.trackingUrl ?? ""}
        />
      </Field>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditing(false);
            setError(null);
          }}
          disabled={pending}
        >
          {dict.client.orders.back}
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={pending}>
          {t.saveCta}
        </Button>
      </div>
    </form>
  );
}
