"use client";

import { useActionState, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/lib/i18n/client-provider";
import {
  saveVariantsAction,
  type VariantActionState,
} from "@/lib/marketplace/variant-actions";
import {
  parseVariantOptions,
  type VariantOption,
} from "@/lib/marketplace/variants";
import type { Prisma } from "@prisma/client";

/**
 * The variant table.
 *
 * Rows are local state so they can be added and removed without a round trip,
 * and the whole table posts as parallel arrays that the action reconciles.
 * Existing rows carry their id in a hidden input — that is what lets a save be
 * an update rather than a delete-and-recreate.
 *
 * Removal is immediate in the UI but only lands on save, so a mis-click costs a
 * reload rather than a row.
 */

export type VariantRow = {
  id: string;
  label: string;
  sku: string | null;
  options: Prisma.JsonValue;
  priceCentsFactory: number | null;
  stockAvailable: number;
  imageUrl: string | null;
};

type Draft = {
  key: string;
  id: string;
  optionsText: string;
  label: string;
  sku: string;
  priceEur: string;
  stock: string;
  imageUrl: string | null;
  clearImage: boolean;
};

const INITIAL: VariantActionState = {};

function optionsToText(options: VariantOption[]): string {
  return options.map((o) => `${o.name}: ${o.value}`).join(", ");
}

function toDraft(v: VariantRow): Draft {
  return {
    key: v.id,
    id: v.id,
    optionsText: optionsToText(parseVariantOptions(v.options)),
    label: v.label,
    sku: v.sku ?? "",
    priceEur:
      v.priceCentsFactory === null ? "" : String(v.priceCentsFactory / 100),
    stock: String(v.stockAvailable),
    imageUrl: v.imageUrl,
    clearImage: false,
  };
}

export function VariantsEditor({
  productId,
  variants,
  isUniqueItem,
  actorVariant = "factory",
}: {
  productId: string;
  variants: VariantRow[];
  isUniqueItem: boolean;
  actorVariant?: "factory" | "admin";
}) {
  const dict = useDictionary();
  const t = dict.factory.catalogue;

  const [rows, setRows] = useState<Draft[]>(() => variants.map(toDraft));
  const [nextKey, setNextKey] = useState(0);
  const [state, action, pending] = useActionState(
    saveVariantsAction.bind(null, productId, actorVariant),
    INITIAL,
  );

  if (isUniqueItem) {
    return (
      <section className="border-line bg-surface mt-6 rounded-lg border p-5">
        <h2 className="text-headline text-sm font-semibold">
          {t.variantsTitle}
        </h2>
        <p className="text-muted mt-1 text-sm">{t.variantsUniqueBlocked}</p>
      </section>
    );
  }

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        key: `new-${nextKey}`,
        id: "",
        optionsText: "",
        label: "",
        sku: "",
        priceEur: "",
        stock: "0",
        imageUrl: null,
        clearImage: false,
      },
    ]);
    setNextKey((n) => n + 1);
  };

  const patch = (key: string, field: keyof Draft, value: string | boolean) =>
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );

  return (
    <section className="border-line bg-surface mt-6 rounded-lg border p-5">
      <h2 className="text-headline text-sm font-semibold">{t.variantsTitle}</h2>
      <p className="text-muted mt-1 mb-4 text-sm">{t.variantsHint}</p>

      <form
        action={action}
        encType="multipart/form-data"
        className="flex flex-col gap-3"
      >
        {rows.length === 0 && (
          <p className="text-faint border-line-subtle rounded-md border border-dashed px-3 py-4 text-center text-sm">
            {t.variantsEmpty}
          </p>
        )}

        {rows.map((r) => (
          <div
            key={r.key}
            className="border-line-subtle grid grid-cols-2 items-end gap-2 border-b pb-3 last:border-b-0 last:pb-0 sm:grid-cols-12"
          >
            <input type="hidden" name="variantId" value={r.id} />

            <label className="col-span-2 sm:col-span-4">
              <span className="text-faint mb-1 block text-xs">
                {t.variantOptionsLabel}
              </span>
              <Input
                name="variantOptions"
                value={r.optionsText}
                onChange={(e) => patch(r.key, "optionsText", e.target.value)}
                placeholder={t.variantOptionsPlaceholder}
                maxLength={300}
              />
            </label>

            <label className="col-span-2 sm:col-span-3">
              <span className="text-faint mb-1 block text-xs">
                {t.variantNameLabel}
              </span>
              <Input
                name="variantLabel"
                value={r.label}
                onChange={(e) => patch(r.key, "label", e.target.value)}
                maxLength={120}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-faint mb-1 block text-xs">
                {t.variantSkuLabel}
              </span>
              <Input
                name="variantSku"
                value={r.sku}
                onChange={(e) => patch(r.key, "sku", e.target.value)}
                maxLength={64}
              />
            </label>

            <label>
              <span className="text-faint mb-1 block text-xs">
                {t.variantPriceLabel}
              </span>
              <Input
                name="variantPrice"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={r.priceEur}
                onChange={(e) => patch(r.key, "priceEur", e.target.value)}
              />
            </label>

            <label>
              <span className="text-faint mb-1 block text-xs">
                {t.variantStockLabel}
              </span>
              <Input
                name="variantStock"
                type="number"
                inputMode="numeric"
                min="0"
                value={r.stock}
                onChange={(e) => patch(r.key, "stock", e.target.value)}
              />
            </label>

            <label className="col-span-2 sm:col-span-12">
              <span className="text-faint mb-1 block text-xs">
                {t.variantImageLabel}
              </span>
              <div className="flex items-center gap-3">
                {r.imageUrl && !r.clearImage && (
                  <span className="border-line relative inline-flex h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.imageUrl}
                      alt={r.label}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => patch(r.key, "clearImage", true)}
                      aria-label={t.variantImageRemove}
                      className="bg-page/80 text-danger absolute end-0 top-0 inline-flex h-4 w-4 items-center justify-center rounded-bs-md text-[10px] leading-none"
                    >
                      ×
                    </button>
                  </span>
                )}
                <input
                  type="hidden"
                  name="variantClearImage"
                  value={r.clearImage ? "1" : ""}
                />
                {/* Posted for every row, blank included: an empty file input
                    still sends a zero-byte File, and dropping it would slide
                    every later photo onto the wrong variant. */}
                <input
                  type="file"
                  name="variantImage"
                  accept="image/*"
                  className="text-faint min-w-0 flex-1 text-xs"
                />
              </div>
            </label>

            <button
              type="button"
              onClick={() => setRows((prev) => prev.filter((x) => x.key !== r.key))}
              aria-label={t.variantRemove}
              className="text-faint hover:text-danger duration-fast col-span-2 inline-flex h-10 items-center justify-center transition-colors sm:col-span-1"
            >
              <HugeiconsIcon icon={Delete02Icon} size={18} strokeWidth={1.5} />
            </button>
          </div>
        ))}

        <p className="text-faint text-xs">
          {t.variantPriceHint} {rows.length > 0 && t.variantsStockNote}
        </p>

        {state.error && (
          <p className="border-danger-edge bg-danger-soft text-danger rounded-md border px-3 py-2 text-sm">
            {state.error}
          </p>
        )}
        {state.saved && (
          <p className="border-success-edge bg-success-soft text-success rounded-md border px-3 py-2 text-sm">
            {t.variantsSaved}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addRow}
            className="text-info text-sm font-semibold"
          >
            + {t.variantAdd}
          </button>
          <Button type="submit" size="sm" disabled={pending}>
            {t.variantsSave}
          </Button>
        </div>
      </form>
    </section>
  );
}
