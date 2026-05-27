"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Category, MarketplaceCondition } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import {
  adminCreateProductAction,
  type ProductActionState,
} from "@/lib/marketplace/actions";
import { AttachmentPicker } from "@/components/attachments/attachment-picker";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

const CATEGORIES = Object.values(Category);
const CONDITIONS = Object.values(MarketplaceCondition);
const INITIAL: ProductActionState = {};

type FactoryOption = {
  id: string;
  displayName: string;
  country: string;
};

/**
 * Admin-on-behalf product creation form. Same input shape as the factory
 * `<ProductForm>` but with a factory selector at the top. The resulting
 * listing lands in PENDING_REVIEW so it still goes through the normal
 * moderation queue before publishing.
 */
export function AdminProductForm({
  lang,
  factories,
}: {
  lang: string;
  factories: FactoryOption[];
}) {
  const dict = useDictionary();
  const router = useRouter();
  const [factoryId, setFactoryId] = useState(factories[0]?.id ?? "");
  const [extraMedia, setExtraMedia] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const boundAction = adminCreateProductAction.bind(null, factoryId);
  const [state, formAction, pending] = useActionState(boundAction, INITIAL);

  useEffect(() => {
    if (state.productId) {
      router.push(`/${lang}/admin/marketplace`);
    }
  }, [state.productId, lang, router]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!factoryId) return;
    const fd = new FormData(e.currentTarget);
    for (const f of images) fd.append("images", f);
    for (const f of extraMedia) fd.append("attachments", f);
    startTransition(() => formAction(fd));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5"
      encType="multipart/form-data"
    >
      {state.error && <FormError>{state.error}</FormError>}

      <Field label={dict.admin.adminListing.factoryLabel} required>
        <Select
          value={factoryId}
          onChange={setFactoryId}
          options={factories.map((f) => ({
            value: f.id,
            label: `${f.displayName} · ${f.country}`,
          }))}
        />
      </Field>

      <Field label={dict.factory.catalogue.nameLabel} required>
        <Input name="name" required maxLength={200} />
      </Field>

      <Field label={dict.factory.catalogue.categoryLabel} required>
        <Select
          name="category"
          required
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
          className={cn(
            "w-full rounded-sm border bg-surface text-fg placeholder:text-faint p-3 text-base resize-y",
            "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
          )}
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
          />
        </Field>
        <Field label={dict.factory.catalogue.leadTimeLabel} required>
          <Input name="leadTimeDays" type="number" min="1" required />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={dict.factory.catalogue.conditionLabel} required>
          <Select
            name="condition"
            required
            defaultValue={MarketplaceCondition.NEW}
            options={CONDITIONS.map((c) => ({
              value: c,
              label: dict.factory.catalogue.conditions[c],
            }))}
          />
        </Field>
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
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={dict.factory.catalogue.moqLabel}>
          <Input name="moq" type="number" min="0" defaultValue="0" />
        </Field>
        <Field label={dict.factory.catalogue.stockLabel}>
          <Input name="stockAvailable" type="number" min="0" defaultValue="0" />
        </Field>
        <Field
          label={dict.factory.catalogue.stockLowLabel}
          hint={dict.factory.catalogue.stockLowHint}
        >
          <Input name="stockLowThreshold" type="number" min="0" />
        </Field>
      </div>

      <Field
        label={dict.client.requests.certsLabel}
        hint={dict.client.requests.certsHint}
      >
        <Input name="certifications" maxLength={500} />
      </Field>

      <AttachmentPicker
        label={dict.factory.catalogue.imagesLabel}
        hint={dict.factory.catalogue.imagesHint}
        max={6}
        files={images}
        onChange={setImages}
      />

      <AttachmentPicker
        label={dict.factory.catalogue.mediaLabel}
        hint={dict.factory.catalogue.mediaHint}
        files={extraMedia}
        onChange={setExtraMedia}
      />

      <div className="pt-2 flex items-center justify-end gap-3">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={pending}
          disabled={!factoryId}
        >
          {dict.admin.adminListing.submit}
        </Button>
      </div>
    </form>
  );
}
