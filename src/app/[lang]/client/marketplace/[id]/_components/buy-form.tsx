"use client";

import { useActionState, useState } from "react";
import { Incoterm } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Select } from "@/components/ui/select";
import {
  buyMarketplaceProductAction,
  type BuyResult,
} from "@/lib/marketplace/buy";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatEUR } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

const INCOTERMS: Incoterm[] = [
  Incoterm.EXW,
  Incoterm.FOB,
  Incoterm.DAP,
  Incoterm.DDP,
  Incoterm.CIF,
];

const INITIAL: BuyResult = {};

export function BuyForm({
  productId,
  moq,
  stockAvailable,
  defaultIncoterm,
  unitPriceCentsClient,
  lang,
}: {
  productId: string;
  moq: number;
  stockAvailable: number;
  defaultIncoterm: Incoterm;
  unitPriceCentsClient: number;
  lang: string;
}) {
  const dict = useDictionary();
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    buyMarketplaceProductAction,
    INITIAL,
  );
  const [qty, setQty] = useState(Math.max(moq, 1));

  const totalCents = qty * unitPriceCentsClient;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormError>{state.error}</FormError>}
      <input type="hidden" name="productId" value={productId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={dict.client.requests.quantityLabel}
          required
          hint={
            moq > 0
              ? dict.client.marketplace.moqHint.replace("{n}", String(moq))
              : undefined
          }
        >
          <Input
            type="number"
            name="quantity"
            inputMode="numeric"
            min={Math.max(moq, 1)}
            max={stockAvailable}
            required
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 0))}
          />
        </Field>
        <Field label={dict.client.requests.incotermLabel} required>
          <Select
            name="incoterm"
            required
            defaultValue={defaultIncoterm}
            options={INCOTERMS.map((i) => ({
              value: i,
              label: `${i} — ${dict.client.requests.incoterms[i]}`,
            }))}
          />
        </Field>
      </div>

      <Field
        label={dict.client.requests.addressLabel}
        required
        hint={dict.client.marketplace.addressHint}
      >
        <textarea
          name="deliveryAddress"
          required
          rows={2}
          minLength={5}
          maxLength={300}
          className={cn(
            "w-full rounded-sm border bg-surface text-fg placeholder:text-faint p-3 text-base resize-y",
            "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
          )}
          placeholder={dict.client.requests.addressPlaceholder}
        />
      </Field>

      <div className="rounded-md bg-subtle border border-line-subtle p-3 flex items-center justify-between gap-3">
        <span className="text-xs text-faint uppercase tracking-wide">
          {dict.client.marketplace.totalLabel}
        </span>
        <span className="text-lg font-semibold text-headline">
          {formatEUR(totalCents / 100, locale)}
        </span>
      </div>

      <div className="flex items-center justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={pending}
          disabled={stockAvailable <= 0 || qty < Math.max(moq, 1)}
        >
          {dict.client.marketplace.buyCta}
        </Button>
      </div>

      <p className="text-[11px] text-faint">{lang === "fr" ? null : null}</p>
    </form>
  );
}
