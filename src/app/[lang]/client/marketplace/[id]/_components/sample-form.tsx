"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { buySampleAction } from "@/lib/marketplace/sample-buy";
import { useDictionary } from "@/lib/i18n/client-provider";

const INITIAL: { error?: string } = {};

/**
 * Single-unit "Order a sample" form — partner #31. Reuses the
 * structured-delivery-address pattern from the bulk-buy form.
 */
export function SampleForm({
  productId,
  samplePriceLabel,
}: {
  productId: string;
  samplePriceLabel: string;
}) {
  const dict = useDictionary();
  const [state, formAction, pending] = useActionState(buySampleAction, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state?.error && <FormError>{state.error}</FormError>}
      <input type="hidden" name="productId" value={productId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label={dict.client.requests.addressStreetLabel}
          required
        >
          <Input
            name="deliveryStreet"
            required
            maxLength={200}
            placeholder={dict.client.requests.addressStreetPlaceholder}
          />
        </Field>
        <Field
          label={dict.client.requests.addressPostalCodeLabel}
          required
        >
          <Input name="deliveryPostalCode" required maxLength={20} />
        </Field>
        <Field label={dict.client.requests.addressCityLabel} required>
          <Input name="deliveryCity" required maxLength={100} />
        </Field>
        <Field
          label={dict.client.requests.addressCountryLabel}
          required
          hint={dict.client.requests.addressCountryHint}
        >
          <Input
            name="deliveryCountry"
            required
            minLength={2}
            maxLength={2}
            className="font-mono uppercase"
            placeholder="FR"
          />
        </Field>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-md bg-subtle border border-line-subtle p-3">
        <span className="text-xs text-faint uppercase tracking-wide">
          {dict.client.marketplace.samplePriceLabel}
        </span>
        <span className="text-lg font-semibold text-headline">
          {samplePriceLabel}
        </span>
      </div>

      <Button type="submit" variant="primary" size="md" loading={pending}>
        {dict.client.marketplace.orderSampleCta}
      </Button>
    </form>
  );
}
