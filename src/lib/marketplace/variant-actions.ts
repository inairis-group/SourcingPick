"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AdminScope,
  MarketplaceProductStatus,
  Prisma,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { writeAuditLog } from "@/lib/audit/log";
import { storeFile, StorageError } from "@/lib/storage/local";
import { applyBuyerMarkup } from "@/lib/orders/pricing";
import { buildVariantLabel, type VariantOption } from "@/lib/marketplace/variants";

/**
 * Variant editing.
 *
 * The whole table is submitted at once and reconciled against what's stored:
 * rows that carry an id are updated, rows without one are created, and stored
 * rows absent from the submission are deleted. Delete-then-recreate would have
 * been shorter, but it churns variant ids on every save — fine today, quietly
 * destructive the moment anything starts referencing them.
 *
 * Prices are entered factory-net, exactly like the product price, so a factory
 * never has to reason about our markup. A blank price means "same as the
 * listing", which is the common case; storing the number on every row instead
 * would guarantee they drift apart on the next price change.
 */

export type VariantActionState = { error?: string; saved?: boolean };

const MAX_VARIANTS = 50;

const RowSchema = z.object({
  id: z.string().trim().max(40),
  /// "Colour: Red, Size: M" — one line of typing rather than a nested
  /// name/value widget. Forgiving on spacing because it's typed by hand.
  optionsText: z.string().trim().max(300),
  label: z.string().trim().max(120),
  sku: z.string().trim().max(64),
  priceEur: z.union([z.coerce.number().positive(), z.literal("")]),
  stockAvailable: z.coerce.number().int().nonnegative().max(1_000_000),
  /// Set by the × on an existing thumbnail. Without it a wrong photo would
  /// be permanent — you could replace it but never remove it.
  clearImage: z.union([z.literal("1"), z.literal("")]).optional(),
});

function parseOptionsText(raw: string): VariantOption[] {
  return raw
    .split(",")
    .map((part) => part.split(":"))
    .flatMap(([name, ...rest]) => {
      const value = rest.join(":").trim();
      const key = (name ?? "").trim();
      return key && value ? [{ name: key, value }] : [];
    })
    .slice(0, 6);
}

type ResolvedRow = {
  id: string | null;
  label: string;
  sku: string | null;
  options: VariantOption[];
  priceCentsFactory: number | null;
  priceCentsClient: number | null;
  stockAvailable: number;
  position: number;
  clearImage: boolean;
  /**
   * Index of this row in the submitted form, which is NOT its position:
   * blank rows are skipped, so the two diverge the moment someone adds a row
   * and abandons it. Photos arrive as a parallel array indexed by the form,
   * and an empty file input still posts a zero-byte File — so this is what
   * keeps photo 3 off variant 2.
   */
  sourceIndex: number;
};

function readRows(formData: FormData): ResolvedRow[] | { error: string } {
  const ids = formData.getAll("variantId");
  const count = ids.length;
  if (count > MAX_VARIANTS) {
    return { error: `A listing can carry at most ${MAX_VARIANTS} variants.` };
  }

  const rows: ResolvedRow[] = [];
  const seenSkus = new Set<string>();

  for (let i = 0; i < count; i++) {
    const parsed = RowSchema.safeParse({
      id: ids[i] ?? "",
      optionsText: formData.getAll("variantOptions")[i] ?? "",
      label: formData.getAll("variantLabel")[i] ?? "",
      sku: formData.getAll("variantSku")[i] ?? "",
      priceEur: formData.getAll("variantPrice")[i] ?? "",
      stockAvailable: formData.getAll("variantStock")[i] ?? "0",
      clearImage: formData.getAll("variantClearImage")[i] ?? "",
    });
    if (!parsed.success) {
      return {
        error: `Variant ${i + 1}: ${parsed.error.issues[0]?.message ?? "invalid."}`,
      };
    }
    const r = parsed.data;
    const options = parseOptionsText(r.optionsText);

    // A row with nothing in it is a row the user added and abandoned — skip it
    // rather than refusing the whole save over an empty line.
    if (!options.length && !r.label && !r.sku) continue;

    const label = r.label || buildVariantLabel(options);
    if (!label) {
      return {
        error: `Variant ${i + 1}: give it options (like "Colour: Red") or a name.`,
      };
    }

    const sku = r.sku || null;
    if (sku) {
      // The DB has a unique index on (productId, sku), but it would surface as
      // an opaque constraint error — catch it here where we can name the row.
      if (seenSkus.has(sku)) {
        return { error: `Variant ${i + 1}: SKU "${sku}" is used twice.` };
      }
      seenSkus.add(sku);
    }

    const priceCentsFactory =
      typeof r.priceEur === "number" ? Math.round(r.priceEur * 100) : null;

    rows.push({
      id: r.id || null,
      label,
      sku,
      options,
      priceCentsFactory,
      priceCentsClient:
        priceCentsFactory === null
          ? null
          : applyBuyerMarkup(priceCentsFactory, "marketplace"),
      stockAvailable: r.stockAvailable,
      position: rows.length,
      clearImage: r.clearImage === "1",
      sourceIndex: i,
    });
  }
  return rows;
}

/**
 * Replace a listing's variant table.
 *
 * Bound with `productId` pre-applied, so the id can't be swapped by the form.
 */
export async function saveVariantsAction(
  productId: string,
  actorVariant: "factory" | "admin",
  _prev: VariantActionState,
  formData: FormData,
): Promise<VariantActionState> {
  const actor =
    actorVariant === "admin"
      ? await requireAdminScope(AdminScope.MARKETPLACE)
      : await requireRole(Role.FACTORY);

  const product = await prisma.marketplaceProduct.findFirst({
    where:
      actorVariant === "admin"
        ? { id: productId }
        : { id: productId, factoryOrgId: actor.organizationId },
    select: {
      id: true,
      status: true,
      reference: true,
      isUniqueItem: true,
      variants: { select: { id: true, imageUrl: true } },
    },
  });
  if (!product) return { error: "Product not found." };
  if (product.status === MarketplaceProductStatus.ARCHIVED) {
    return { error: "Archived listings can't be edited." };
  }
  if (product.isUniqueItem) {
    return {
      error:
        "This listing is a one-of-a-kind item, so it can't have variants. Turn that off first.",
    };
  }

  const rows = readRows(formData);
  if ("error" in rows) return { error: rows.error };

  const keptIds = new Set(rows.map((r) => r.id).filter(Boolean) as string[]);
  const storedIds = new Set(product.variants.map((v) => v.id));
  // An id we were handed that isn't on this product is either a stale form or
  // someone else's row. Refuse rather than create a duplicate under a new id.
  for (const id of keptIds) {
    if (!storedIds.has(id)) return { error: "This form is out of date — reload it." };
  }
  const removed = [...storedIds].filter((id) => !keptIds.has(id));

  // Variants own stock once they exist, so the product-level figure has to
  // follow them. Two authoritative stock numbers is how a listing oversells.
  const totalStock = rows.reduce((sum, r) => sum + r.stockAvailable, 0);

  /**
   * Per-variant photos.
   *
   * Indexed by `sourceIndex`, not by position — an empty file input still
   * posts a zero-byte File, so the array is only aligned with the form's rows
   * if the blanks are kept rather than filtered.
   *
   * Resolution order per row: a new upload wins, then an explicit clear, then
   * whatever was already stored. That last case is what stops an ordinary
   * price edit from wiping every thumbnail on the listing.
   */
  const existingImages = new Map(
    product.variants.map((v) => [v.id, v.imageUrl] as const),
  );
  const files = formData.getAll("variantImage");
  const imageFor = new Map<number, string | null>();

  for (const r of rows) {
    const file = files[r.sourceIndex];
    if (file instanceof File && file.size > 0) {
      try {
        const stored = await storeFile({
          scope: "marketplace",
          ownerId: product.id,
          kindPrefix: `variant-${r.sourceIndex + 1}`,
          file,
        });
        imageFor.set(r.sourceIndex, stored.storageUrl);
      } catch (e) {
        if (e instanceof StorageError) return { error: e.message };
        throw e;
      }
    } else if (r.clearImage) {
      imageFor.set(r.sourceIndex, null);
    } else {
      imageFor.set(r.sourceIndex, r.id ? (existingImages.get(r.id) ?? null) : null);
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (removed.length) {
        await tx.marketplaceVariant.deleteMany({ where: { id: { in: removed } } });
      }
      for (const r of rows) {
        const data = {
          label: r.label,
          sku: r.sku,
          imageUrl: imageFor.get(r.sourceIndex) ?? null,
          options: r.options as unknown as Prisma.InputJsonValue,
          priceCentsFactory: r.priceCentsFactory,
          priceCentsClient: r.priceCentsClient,
          stockAvailable: r.stockAvailable,
          position: r.position,
        };
        if (r.id) {
          await tx.marketplaceVariant.update({ where: { id: r.id }, data });
        } else {
          await tx.marketplaceVariant.create({
            data: { ...data, productId: product.id },
          });
        }
      }
      if (rows.length > 0) {
        await tx.marketplaceProduct.update({
          where: { id: product.id },
          data: { stockAvailable: totalStock },
        });
      }
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { error: "Two variants share the same SKU." };
    }
    throw e;
  }

  await writeAuditLog({
    actorUserId: actor.id,
    action: "marketplace.variants_saved",
    targetType: "MarketplaceProduct",
    targetId: product.id,
    payload: {
      reference: product.reference,
      count: rows.length,
      removed: removed.length,
    },
  });

  revalidatePath("/[lang]/factory/catalogue/[id]", "page");
  revalidatePath("/[lang]/marketplace/[id]", "page");
  return { saved: true };
}
