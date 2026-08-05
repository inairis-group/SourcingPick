import type { Prisma } from "@prisma/client";

/**
 * Variant and rating helpers. Pure — no `server-only` — because the product
 * page recomputes the displayed price as the buyer switches option, and it has
 * to agree with the server to the cent.
 */

export type VariantOption = { name: string; value: string };

export type VariantLike = {
  id: string;
  label: string;
  options: Prisma.JsonValue;
  priceCentsClient: number | null;
  stockAvailable: number;
  imageUrl: string | null;
};

/**
 * Options are stored as Json, so anything could be in that column — a bad
 * import, a hand-edited row, an older shape. Parse defensively and drop
 * malformed entries rather than throwing: a broken option pair should cost one
 * line of a spec table, not the whole product page.
 */
export function parseVariantOptions(value: Prisma.JsonValue): VariantOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return [];
    }
    const rec = entry as Record<string, unknown>;
    const name = typeof rec.name === "string" ? rec.name : null;
    const val = typeof rec.value === "string" ? rec.value : null;
    return name && val ? [{ name, value: val }] : [];
  });
}

/** Build the display label from options, e.g. "Blue · XL". */
export function buildVariantLabel(options: VariantOption[]): string {
  return options.map((o) => o.value).join(" · ");
}

/**
 * Effective buyer price: the variant's override, or the product's price when
 * it has none. Most ranges are one price across every option, so inheriting is
 * the common case and duplicating the number per variant invites drift.
 */
export function effectivePriceCents(
  productPriceCents: number,
  variant: { priceCentsClient: number | null } | null | undefined,
): number {
  return variant?.priceCentsClient ?? productPriceCents;
}

/**
 * Stock for a listing. When variants exist they own stock and the product-level
 * figure is ignored — keeping both authoritative is how oversells happen.
 */
export function effectiveStock(
  productStock: number,
  variants: { stockAvailable: number }[],
): number {
  if (variants.length === 0) return productStock;
  return variants.reduce((sum, v) => sum + v.stockAvailable, 0);
}

/** Price span across variants, for a "from €X" style label. */
export function priceRangeCents(
  productPriceCents: number,
  variants: { priceCentsClient: number | null }[],
): { min: number; max: number; varies: boolean } {
  if (variants.length === 0) {
    return { min: productPriceCents, max: productPriceCents, varies: false };
  }
  const prices = variants.map((v) => v.priceCentsClient ?? productPriceCents);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, varies: min !== max };
}

/**
 * Average rating from the denormalised aggregates.
 *
 * Returns null rather than 0 when there are no reviews: an unrated listing and
 * a listing everyone scored zero are different things, and 0 would sort them
 * together at the bottom.
 */
export function averageRating(
  ratingSum: number,
  ratingCount: number,
): number | null {
  if (ratingCount <= 0) return null;
  return Math.round((ratingSum / ratingCount) * 10) / 10;
}
