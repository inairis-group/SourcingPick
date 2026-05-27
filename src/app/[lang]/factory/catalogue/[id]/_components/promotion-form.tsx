"use client";

import { startTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import {
  setPromotionAction,
  type PromotionActionState,
} from "@/lib/marketplace/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

const INITIAL: PromotionActionState = {};

/**
 * Promotion-only editor for a PUBLISHED/OUT_OF_STOCK listing. Lets the
 * factory set or clear `compareAtCents` + `flashSaleEndsAt` without
 * dropping the listing back to DRAFT.
 *
 * The factory enters factory-net for compare-at — the server action
 * applies the platform markup before persisting, mirroring how the
 * main listing form handles the regular price.
 */
export function PromotionForm({
  productId,
  defaults,
}: {
  productId: string;
  defaults: {
    /** Existing compare-at as stored on the buyer side (markup included). */
    compareAtCents: number | null;
    flashSaleEndsAt: Date | null;
  };
}) {
  const dict = useDictionary();
  const boundAction = setPromotionAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(boundAction, INITIAL);

  const defaultCompareAtEur = defaults.compareAtCents
    ? (defaults.compareAtCents / 1.06 / 100).toFixed(2)
    : "";
  const defaultFlashEnds = defaults.flashSaleEndsAt
    ? toDateTimeLocal(defaults.flashSaleEndsAt)
    : "";

  const onClear = () => {
    const fd = new FormData();
    fd.append("compareAtEur", "");
    fd.append("flashSaleEndsAt", "");
    startTransition(() => formAction(fd));
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormError>{state.error}</FormError>}
      {state.saved && (
        <div className="rounded-md border border-success-edge bg-success-soft/40 px-3 py-2 text-xs text-success">
          {dict.factory.catalogue.promotionSaved}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={dict.factory.catalogue.compareAtLabel}
          hint={dict.factory.catalogue.compareAtHint}
        >
          <Input
            name="compareAtEur"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={defaultCompareAtEur}
          />
        </Field>
        <Field
          label={dict.factory.catalogue.flashSaleLabel}
          hint={dict.factory.catalogue.flashSaleHint}
        >
          <Input
            name="flashSaleEndsAt"
            type="datetime-local"
            defaultValue={defaultFlashEnds}
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-2">
        {(defaults.compareAtCents || defaults.flashSaleEndsAt) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={pending}
          >
            {dict.factory.catalogue.promotionClear}
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm" loading={pending}>
          {dict.factory.catalogue.promotionSave}
        </Button>
      </div>
    </form>
  );
}

function toDateTimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}
