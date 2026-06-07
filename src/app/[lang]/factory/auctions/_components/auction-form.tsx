"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Category, Incoterm, LeadTimeUnit } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Select } from "@/components/ui/select";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { ExistingImageDelete } from "@/components/attachments/existing-image-delete";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  createAuctionAction,
  updateAuctionAction,
  type AuctionActionState,
} from "@/lib/auctions/actions";
import { leadTimeDisplayValue } from "@/lib/marketplace/lead-time";
import { useDictionary } from "@/lib/i18n/client-provider";
import { MAX_UPLOAD_BYTES, formatBytes, sumFileSizes } from "@/lib/storage/limits";
import { cn } from "@/lib/utils";

const CATEGORIES = Object.values(Category);
const INCOTERMS: Incoterm[] = [
  Incoterm.EXW,
  Incoterm.FOB,
  Incoterm.DAP,
  Incoterm.DDP,
  Incoterm.CIF,
];
const INITIAL: AuctionActionState = {};

export type AuctionDefaults = {
  id: string;
  title: string;
  category: Category;
  description: string;
  startingBidCents: number;
  reserveCents: number | null;
  buyNowCents: number | null;
  quantity: number;
  moq: number;
  leadTimeDays: number;
  leadTimeUnit: LeadTimeUnit;
  incoterm: Incoterm;
  startsAt: Date;
  endsAt: Date;
  existingImages: string[];
};

export function AuctionForm({
  lang,
  defaults,
}: {
  lang: string;
  defaults?: AuctionDefaults;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const isEdit = Boolean(defaults);
  const action = isEdit
    ? updateAuctionAction.bind(null, defaults!.id)
    : createAuctionAction;
  const [state, formAction, pending] = useActionState(action, INITIAL);
  // Staged images held in React state so each preview can be removed
  // before submit — see product-form.tsx for the same pattern.
  const [stagedImages, setStagedImages] = useState<File[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.auctionId && !isEdit) {
      router.push(`/${lang}/factory/auctions/${state.auctionId}`);
    }
  }, [state.auctionId, isEdit, lang, router]);

  const t = dict.factory.auctions;
  const existingCount = defaults?.existingImages.length ?? 0;
  const remainingSlots = Math.max(0, 6 - existingCount);

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setStagedImages((prev) => {
      const next = [...prev];
      for (
        let i = 0;
        i < files.length && next.length < remainingSlots;
        i++
      ) {
        next.push(files[i]);
      }
      return next;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStagedImage = (i: number) => {
    setStagedImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const newImagePreviews = useMemo(
    () => stagedImages.map((f) => URL.createObjectURL(f)),
    [stagedImages],
  );
  useEffect(() => {
    return () => {
      for (const url of newImagePreviews) URL.revokeObjectURL(url);
    };
  }, [newImagePreviews]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientError(null);
    const fd = new FormData(e.currentTarget);
    for (const f of stagedImages) fd.append("images", f);
    const total = sumFileSizes(fd.getAll("images"));
    if (total > MAX_UPLOAD_BYTES) {
      setClientError(
        dict.factory.catalogue.uploadTooLarge
          .replace("{total}", formatBytes(total))
          .replace("{max}", formatBytes(MAX_UPLOAD_BYTES)),
      );
      return;
    }
    startTransition(() => formAction(fd));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5"
      encType="multipart/form-data"
    >
      {(clientError ?? state.error) && (
        <FormError>{clientError ?? state.error}</FormError>
      )}

      <Field label={t.titleLabel} required>
        <Input
          name="title"
          required
          maxLength={200}
          defaultValue={defaults?.title}
          placeholder={t.titlePlaceholder}
        />
      </Field>

      <Field label={t.categoryLabel} required>
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

      <Field label={t.descriptionLabel} required hint={t.descriptionHint}>
        <MarkdownEditor
          name="description"
          required
          minLength={20}
          maxLength={8000}
          defaultValue={defaults?.description ?? ""}
          placeholder={t.descriptionPlaceholder}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={t.startingBidLabel} required hint={t.eurHint}>
          <Input
            name="startingBidEur"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            defaultValue={
              defaults
                ? (defaults.startingBidCents / 100).toFixed(2)
                : ""
            }
          />
        </Field>
        <Field label={t.reserveLabel} hint={t.reserveHint}>
          <Input
            name="reserveEur"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={
              defaults?.reserveCents
                ? (defaults.reserveCents / 100).toFixed(2)
                : ""
            }
          />
        </Field>
        <Field label={t.buyNowLabel} hint={t.buyNowHint}>
          <Input
            name="buyNowEur"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={
              defaults?.buyNowCents
                ? (defaults.buyNowCents / 100).toFixed(2)
                : ""
            }
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={t.quantityLabel} required>
          <Input
            name="quantity"
            type="number"
            inputMode="numeric"
            min="1"
            required
            defaultValue={defaults?.quantity ?? ""}
          />
        </Field>
        <Field label={t.moqLabel} hint={t.moqHint}>
          <Input
            name="moq"
            type="number"
            inputMode="numeric"
            min="1"
            defaultValue={defaults?.moq ?? "1"}
          />
        </Field>
        <Field label={dict.factory.catalogue.leadTimeLabel} required>
          <div className="flex items-center gap-2">
            <Input
              name="leadTimeDays"
              type="number"
              inputMode="numeric"
              min="1"
              required
              defaultValue={
                defaults
                  ? leadTimeDisplayValue(
                      defaults.leadTimeDays,
                      defaults.leadTimeUnit,
                    )
                  : ""
              }
              className="flex-1"
            />
            <Select
              name="leadTimeUnit"
              defaultValue={defaults?.leadTimeUnit ?? LeadTimeUnit.DAY}
              options={[
                {
                  value: LeadTimeUnit.DAY,
                  label: dict.factory.catalogue.leadTimeUnits.DAY,
                },
                {
                  value: LeadTimeUnit.MONTH,
                  label: dict.factory.catalogue.leadTimeUnits.MONTH,
                },
              ]}
              className="w-24 shrink-0"
            />
          </div>
        </Field>
      </div>

      <Field label={dict.client.requests.incotermLabel} required>
        <Select
          name="incoterm"
          required
          defaultValue={defaults?.incoterm ?? ""}
          placeholder={dict.client.requests.incotermPlaceholder}
          options={INCOTERMS.map((i) => ({
            value: i,
            label: `${i} — ${dict.client.requests.incoterms[i]}`,
          }))}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t.startsAtLabel} required hint={t.startsAtHint}>
          <Input
            name="startsAt"
            type="datetime-local"
            required
            // Partner #8: previously empty by default. Factories were
            // leaving startsAt blank or picking a future date, then
            // wondering why their auction didn't appear after admin
            // approval (the public list filters on `startsAt <= now`).
            // Default to NOW for new auctions so the live-window starts
            // the moment admin approves.
            defaultValue={
              defaults?.startsAt
                ? toLocal(defaults.startsAt)
                : toLocal(new Date())
            }
          />
        </Field>
        <Field label={t.endsAtLabel} required hint={t.endsAtHint}>
          <Input
            name="endsAt"
            type="datetime-local"
            required
            // Default endsAt to NOW + 7 days for new auctions. Tweakable.
            defaultValue={
              defaults?.endsAt
                ? toLocal(defaults.endsAt)
                : toLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
            }
          />
        </Field>
      </div>

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
                <ExistingImageDelete
                  entity="auction"
                  entityId={defaults.id}
                  index={i}
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
            // No `name` — staged images live in React state and are
            // appended to FormData manually in onSubmit so each
            // preview can be removed before posting.
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
                <button
                  type="button"
                  onClick={() => removeStagedImage(i)}
                  aria-label={dict.common.actions.delete}
                  className={cn(
                    "absolute top-1 inset-e-1 z-10",
                    "inline-flex items-center justify-center h-6 w-6 rounded-full",
                    "bg-page/90 backdrop-blur text-muted hover:text-danger hover:bg-page",
                    "border border-line shadow-sm transition-colors duration-fast",
                  )}
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={12}
                    strokeWidth={1.75}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 flex items-center justify-end gap-3">
        <Button type="submit" variant="primary" size="md" loading={pending}>
          {isEdit ? t.saveChanges : t.saveDraft}
        </Button>
      </div>
    </form>
  );
}

function toLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}
