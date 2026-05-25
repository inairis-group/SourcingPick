"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Category } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ImageUpload01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Select } from "@/components/ui/select";
import {
  createProductAction,
  updateProductAction,
  type ProductActionState,
} from "@/lib/marketplace/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

const CATEGORIES = Object.values(Category);
const INITIAL: ProductActionState = {};

export type ProductDefaults = {
  id: string;
  name: string;
  category: Category;
  description: string;
  priceCentsFactory: number;
  moq: number;
  stockAvailable: number;
  stockLowThreshold: number | null;
  leadTimeDays: number;
  certifications: string[];
  existingImages: string[]; // URLs (built from product id + index)
};

export function ProductForm({
  lang,
  defaults,
}: {
  lang: string;
  defaults?: ProductDefaults;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const isEdit = Boolean(defaults);

  const action = isEdit
    ? updateProductAction.bind(null, defaults!.id)
    : createProductAction;
  const [state, formAction, pending] = useActionState(action, INITIAL);

  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.productId && !isEdit) {
      router.push(`/${lang}/factory/catalogue/${state.productId}`);
    }
  }, [state.productId, isEdit, lang, router]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const previews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      previews.push(URL.createObjectURL(files[i]));
    }
    setNewImagePreviews(previews);
  };

  const existingCount = defaults?.existingImages.length ?? 0;
  const totalAfterUpload = existingCount + newImagePreviews.length;
  const remainingSlots = Math.max(0, 6 - existingCount);

  return (
    <form action={formAction} className="flex flex-col gap-5" encType="multipart/form-data">
      {state.error && <FormError>{state.error}</FormError>}

      <Field label={dict.factory.catalogue.nameLabel} required>
        <Input
          name="name"
          required
          maxLength={200}
          defaultValue={defaults?.name}
          placeholder={dict.factory.catalogue.namePlaceholder}
        />
      </Field>

      <Field label={dict.factory.catalogue.categoryLabel} required>
        <Select
          name="category"
          required
          defaultValue={defaults?.category ?? ""}
          placeholder={dict.client.requests.categoryPlaceholder}
          options={CATEGORIES.map((c) => ({
            value: c,
            label: dict.categories[c],
          }))}
        />
      </Field>

      <Field
        label={dict.factory.catalogue.descriptionLabel}
        required
        hint={dict.factory.catalogue.descriptionHint}
      >
        <textarea
          name="description"
          required
          rows={5}
          minLength={20}
          maxLength={4000}
          defaultValue={defaults?.description}
          className={cn(
            "w-full rounded-sm border bg-surface text-fg placeholder:text-faint p-3 text-base resize-y",
            "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
          )}
          placeholder={dict.factory.catalogue.descriptionPlaceholder}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={dict.factory.catalogue.priceLabel}
          required
          hint={dict.client.requests.priceHintEur}
        >
          <Input
            name="priceEur"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            defaultValue={
              defaults ? (defaults.priceCentsFactory / 100).toFixed(2) : ""
            }
          />
        </Field>
        <Field label={dict.factory.catalogue.leadTimeLabel} required>
          <Input
            name="leadTimeDays"
            type="number"
            inputMode="numeric"
            min="1"
            required
            defaultValue={defaults?.leadTimeDays ?? ""}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={dict.factory.catalogue.moqLabel}>
          <Input
            name="moq"
            type="number"
            inputMode="numeric"
            min="0"
            defaultValue={defaults?.moq ?? "0"}
          />
        </Field>
        <Field label={dict.factory.catalogue.stockLabel}>
          <Input
            name="stockAvailable"
            type="number"
            inputMode="numeric"
            min="0"
            defaultValue={defaults?.stockAvailable ?? "0"}
          />
        </Field>
        <Field
          label={dict.factory.catalogue.stockLowLabel}
          hint={dict.factory.catalogue.stockLowHint}
        >
          <Input
            name="stockLowThreshold"
            type="number"
            inputMode="numeric"
            min="0"
            defaultValue={defaults?.stockLowThreshold ?? ""}
          />
        </Field>
      </div>

      <Field
        label={dict.client.requests.certsLabel}
        hint={dict.client.requests.certsHint}
      >
        <Input
          name="certifications"
          maxLength={500}
          defaultValue={defaults?.certifications.join(", ") ?? ""}
          placeholder={dict.client.requests.certsPlaceholder}
        />
      </Field>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-fg">
          {dict.factory.catalogue.imagesLabel}
          <span className="text-faint text-xs ms-2">
            ({dict.factory.catalogue.imagesHint})
          </span>
        </label>

        {existingCount > 0 && defaults && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {defaults.existingImages.map((url, i) => (
              <div
                key={i}
                className="aspect-square rounded-md border border-line bg-subtle relative overflow-hidden"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="100px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}

        <label
          className={cn(
            "flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-md border-2 border-dashed cursor-pointer",
            "border-line-strong hover:bg-subtle transition-colors duration-fast",
            remainingSlots === 0 && "opacity-50 pointer-events-none",
          )}
        >
          <HugeiconsIcon
            icon={ImageUpload01Icon}
            size={20}
            strokeWidth={1.5}
            className="text-muted"
          />
          <span className="text-sm text-muted">
            {remainingSlots > 0
              ? dict.factory.catalogue.imagesDropHint.replace(
                  "{n}",
                  String(remainingSlots),
                )
              : dict.factory.catalogue.imagesMaxReached}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            name="images"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>

        {newImagePreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {newImagePreviews.map((src, i) => (
              <div
                key={i}
                className="aspect-square rounded-md border border-line bg-subtle relative overflow-hidden"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="100px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}

        {totalAfterUpload > 6 && (
          <p className="text-xs text-warning flex items-center gap-1">
            <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={1.5} />
            {dict.factory.catalogue.imagesTooMany}
          </p>
        )}
      </div>

      <div className="pt-2 flex items-center justify-end gap-3">
        <Button type="submit" variant="primary" size="md" loading={pending}>
          {isEdit
            ? dict.factory.catalogue.saveChanges
            : dict.factory.catalogue.saveDraft}
        </Button>
      </div>
    </form>
  );
}
