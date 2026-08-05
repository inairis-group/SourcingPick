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

export type BuyVariant = {
  id: string;
  label: string;
  priceCentsClient: number | null;
  stockAvailable: number;
  imageUrl: string | null;
};

export function BuyForm({
  productId,
  moq,
  stockAvailable,
  defaultIncoterm,
  unitPriceCentsClient,
  variants = [],
  lang,
}: {
  productId: string;
  moq: number;
  stockAvailable: number;
  defaultIncoterm: Incoterm;
  unitPriceCentsClient: number;
  /// Empty for a listing without options. When present one must be chosen —
  /// the server refuses a purchase that doesn't name one.
  variants?: BuyVariant[];
  lang: string;
}) {
  const dict = useDictionary();
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    buyMarketplaceProductAction,
    INITIAL,
  );
  const [qty, setQty] = useState(Math.max(moq, 1));
  // Preselect the first option that is actually in stock, so the default
  // choice is one the buyer can complete.
  const [variantId, setVariantId] = useState(
    () => variants.find((v) => v.stockAvailable > 0)?.id ?? variants[0]?.id ?? "",
  );

  const variant = variants.find((v) => v.id === variantId) ?? null;
  // Price and stock follow the option once there are options — the same rule
  // the server applies, so the total on screen is the total charged.
  const unitCents = variant?.priceCentsClient ?? unitPriceCentsClient;
  const maxQty = variant ? variant.stockAvailable : stockAvailable;
  const totalCents = qty * unitCents;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormError>{state.error}</FormError>}
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="variantId" value={variantId} />

      {variants.length > 0 && (
        <Field label={dict.publicMarketplace.variantsTitle} required>
          <div className="flex items-center gap-3">
            {/* Confirms what's actually being bought — a dropdown of
                "Red / XL" tells you less than the thing itself. */}
            {variant?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={variant.imageUrl}
                alt=""
                className="border-line h-11 w-11 shrink-0 rounded-md border object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
          <Select
            value={variantId}
            onChange={setVariantId}
            options={variants.map((v) => ({
              value: v.id,
              label: v.label,
              // Sold-out options stay listed rather than disappearing: the
              // buyer looking for "Red / XL" should be told it's gone, not
              // left wondering whether it ever existed.
              disabled: v.stockAvailable === 0,
              description:
                v.stockAvailable === 0
                  ? dict.client.marketplace.outOfStock
                  : undefined,
            }))}
          />
            </div>
          </div>
        </Field>
      )}

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
            max={maxQty}
            required
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 0))}
          />
        </Field>
        {/* Partner #15: incoterm is now set by the factory on the
            listing — buyers see it as fixed metadata. We keep the
            display so buyers know the term, but no input. */}
        <Field label={dict.client.requests.incotermLabel}>
          <div
            className="inline-flex items-center h-9 px-3 rounded-md border border-line bg-subtle text-sm text-fg"
            aria-readonly
          >
            <span className="font-mono font-semibold">{defaultIncoterm}</span>
            <span className="ms-2 text-muted">
              — {dict.client.requests.incoterms[defaultIncoterm]}
            </span>
            <input type="hidden" name="incoterm" value={defaultIncoterm} />
          </div>
        </Field>
      </div>

      {/* Partner #12: structured address — separate fields so we can
          render a clean shipping label downstream and (later) plug an
          address-validation API. The freeform `deliveryAddress` field
          is synthesised server-side from these. */}
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
          <Input
            name="deliveryPostalCode"
            required
            maxLength={20}
            placeholder="75001"
          />
        </Field>
        <Field label={dict.client.requests.addressCityLabel} required>
          <Input
            name="deliveryCity"
            required
            maxLength={100}
            placeholder="Paris"
          />
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
            placeholder="FR"
            className="font-mono uppercase"
          />
        </Field>
      </div>

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
