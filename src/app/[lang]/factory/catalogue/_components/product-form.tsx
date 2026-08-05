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
import {
  Category,
  Incoterm,
  LeadTimeUnit,
  MarketplaceCondition,
  VehicleDrivetrain,
  VehicleFuel,
  VehicleTransmission,
} from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ImageUpload01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Select } from "@/components/ui/select";
import {
  adminUpdateProductAction,
  createProductAction,
  updateProductAction,
  type ProductActionState,
} from "@/lib/marketplace/actions";
import { AttachmentPicker } from "@/components/attachments/attachment-picker";
import { ExistingImageDelete } from "@/components/attachments/existing-image-delete";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { useDictionary } from "@/lib/i18n/client-provider";
import { leadTimeDisplayValue } from "@/lib/marketplace/lead-time";
import { MAX_UPLOAD_BYTES, formatBytes, sumFileSizes } from "@/lib/storage/limits";
import { cn } from "@/lib/utils";

const CATEGORIES = Object.values(Category);
const CONDITIONS = Object.values(MarketplaceCondition);
const FUELS = Object.values(VehicleFuel);
const TRANSMISSIONS = Object.values(VehicleTransmission);
const DRIVETRAINS = Object.values(VehicleDrivetrain);
const INITIAL: ProductActionState = {};

export type ProductDefaults = {
  id: string;
  name: string;
  category: Category;
  description: string;
  priceCentsFactory: number;
  /// "Was" price stored on the buyer side. The form re-derives the factory-
  /// net equivalent for the input so the factory always edits factory-net
  /// numbers, consistent with the main price field.
  compareAtCents: number | null;
  flashSaleEndsAt: Date | null;
  condition: MarketplaceCondition;
  moq: number;
  stockAvailable: number;
  stockLowThreshold: number | null;
  leadTimeDays: number;
  leadTimeUnit: LeadTimeUnit;
  certifications: string[];
  /// CTO audit F4 — acompte share (basis points). Default 3000 mirrors
  /// the legacy 30 % policy; valid range 3000–5000 (30–50 %).
  depositPercentageBps: number;
  incoterm: Incoterm;
  sampleAvailable: boolean;
  samplePriceCentsClient: number | null;
  /// One specific unit rather than a stock line. Drives the quantity field
  /// and rules variants out.
  isUniqueItem: boolean;
  /// Present only on Category.VEHICLE listings.
  vehicle: VehicleDefaults | null;
  existingImages: string[]; // URLs (built from product id + index)
};

export type VehicleDefaults = {
  vin: string | null;
  makeName: string;
  modelName: string;
  year: number;
  mileageKm: number | null;
  fuel: VehicleFuel;
  transmission: VehicleTransmission;
  drivetrain: VehicleDrivetrain | null;
  colour: string | null;
  engineCc: number | null;
  powerKw: number | null;
  hasCoc: boolean;
  cocReference: string | null;
};

export function ProductForm({
  lang,
  defaults,
  /**
   * Selects which server-action variant to bind.
   * - "factory" (default): factory-owned product, factory user editing.
   * - "admin": admin overriding any listing. Skips factory-ownership
   *   check and preserves the listing's status (no re-review bounce).
   */
  actorVariant = "factory",
}: {
  lang: string;
  defaults?: ProductDefaults;
  actorVariant?: "factory" | "admin";
}) {
  const dict = useDictionary();
  const router = useRouter();
  const isEdit = Boolean(defaults);

  /**
   * The vehicle block is required for VEHICLE listings and meaningless for
   * everything else, so it follows the category live rather than after a save.
   * The inputs are unmounted, not hidden — a hidden required field is a form
   * that can't be submitted and won't say why.
   */
  const [category, setCategory] = useState<string>(defaults?.category ?? "");
  const isVehicle = category === Category.VEHICLE;

  /// Quantity is fixed at 1 for a unique item, so the stock input follows the
  /// checkbox instead of leaving two contradictory answers on screen.
  const [isUniqueItem, setIsUniqueItem] = useState(
    Boolean(defaults?.isUniqueItem),
  );

  const editAction =
    actorVariant === "admin" ? adminUpdateProductAction : updateProductAction;
  const action = isEdit
    ? editAction.bind(null, defaults!.id)
    : createProductAction;
  const [state, formAction, pending] = useActionState(action, INITIAL);

  // Staged images held in React state so each preview can be removed
  // before submit. The native `<input type="file">` is click-only; on
  // submit we hand the kept files to the FormData ourselves rather
  // than relying on the input's FileList.
  const [stagedImages, setStagedImages] = useState<File[]>([]);
  const [extraMedia, setExtraMedia] = useState<File[]>([]);
  // Surfaced for failures we catch before posting (e.g. total upload over the
  // limit) — the Server Action never runs in that case, so it can't return one.
  const [clientError, setClientError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.productId && !isEdit) {
      router.push(`/${lang}/factory/catalogue/${state.productId}`);
    }
  }, [state.productId, isEdit, lang, router]);

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
    // Reset the native input so picking the same file twice in a row
    // still fires `change` (browsers de-dupe identical FileLists).
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStagedImage = (i: number) => {
    setStagedImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  // Object-URL previews — recreated whenever the staged list changes
  // and revoked on cleanup so blob URLs don't leak.
  const newImagePreviews = useMemo(
    () => stagedImages.map((f) => URL.createObjectURL(f)),
    [stagedImages],
  );
  useEffect(() => {
    return () => {
      for (const url of newImagePreviews) URL.revokeObjectURL(url);
    };
  }, [newImagePreviews]);

  const totalAfterUpload = existingCount + stagedImages.length;

  // Intercept submit so we can fold the staged video/file attachments
  // (held in React state, not a native <input>) into the FormData before
  // calling the server action.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientError(null);
    const fd = new FormData(e.currentTarget);
    // Staged images live in React state (not the native input) so the
    // user can remove individual previews before submit; fold them
    // into the FormData under the same `images` key the server expects.
    for (const f of stagedImages) fd.append("images", f);
    for (const f of extraMedia) fd.append("attachments", f);

    // Catch oversized submissions here: a too-large body is rejected by the
    // reverse proxy with a raw 413 before the Server Action can respond, so
    // we check the total ourselves and explain exactly what to do.
    const total = sumFileSizes([...fd.getAll("images"), ...fd.getAll("attachments")]);
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
          onChange={setCategory}
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
        <MarkdownEditor
          name="description"
          required
          minLength={20}
          maxLength={4000}
          defaultValue={defaults?.description ?? ""}
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
                { value: LeadTimeUnit.DAY, label: dict.factory.catalogue.leadTimeUnits.DAY },
                { value: LeadTimeUnit.MONTH, label: dict.factory.catalogue.leadTimeUnits.MONTH },
              ]}
              className="w-28 shrink-0"
            />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={dict.factory.catalogue.conditionLabel} required>
          <Select
            name="condition"
            required
            defaultValue={defaults?.condition ?? MarketplaceCondition.NEW}
            options={CONDITIONS.map((c) => ({
              value: c,
              label: dict.factory.catalogue.conditions[c],
            }))}
          />
        </Field>
        <Field
          label={dict.factory.catalogue.depositLabel}
          required
          hint={dict.factory.catalogue.depositHint}
        >
          <Input
            name="depositPercentage"
            type="number"
            inputMode="numeric"
            min="30"
            max="50"
            step="1"
            required
            defaultValue={String(
              defaults
                ? Math.round((defaults.depositPercentageBps ?? 3000) / 100)
                : 30,
            )}
          />
        </Field>
        <Field
          label={dict.factory.catalogue.incotermLabel}
          required
          hint={dict.factory.catalogue.incotermHint}
        >
          <Select
            name="incoterm"
            required
            defaultValue={defaults?.incoterm ?? Incoterm.DAP}
            options={(
              [
                Incoterm.EXW,
                Incoterm.FOB,
                Incoterm.DAP,
                Incoterm.DDP,
                Incoterm.CIF,
              ] as const
            ).map((i) => ({
              value: i,
              label: `${i} — ${dict.client.requests.incoterms[i]}`,
            }))}
          />
        </Field>
        <Field
          label={dict.factory.catalogue.uniqueItemLabel}
          hint={dict.factory.catalogue.uniqueItemHint}
        >
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isUniqueItem"
              checked={isUniqueItem}
              onChange={(e) => setIsUniqueItem(e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-700 focus:ring-focus"
            />
            <span className="text-fg">
              {dict.factory.catalogue.uniqueItemToggle}
            </span>
          </label>
        </Field>
        {/* Partner #31: sample-purchase toggle + price. */}
        <Field
          label={dict.factory.catalogue.sampleAvailableLabel}
          hint={dict.factory.catalogue.sampleAvailableHint}
        >
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="sampleAvailable"
              defaultChecked={Boolean(defaults?.sampleAvailable)}
              className="h-4 w-4 rounded border-line text-brand-700 focus:ring-focus"
            />
            <span className="text-fg">
              {dict.factory.catalogue.sampleAvailableToggle}
            </span>
          </label>
        </Field>
        <Field
          label={dict.factory.catalogue.samplePriceLabel}
          hint={dict.factory.catalogue.samplePriceHint}
        >
          <Input
            name="samplePriceEur"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            defaultValue={
              defaults?.samplePriceCentsClient
                ? String(defaults.samplePriceCentsClient / 100)
                : ""
            }
            placeholder="29.90"
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
            defaultValue={
              // Reverse the buyer markup so the factory edits factory-net,
              // matching how the main `priceEur` field works. The action
              // re-applies the markup before persisting.
              defaults?.compareAtCents
                ? (
                    defaults.compareAtCents / 1.06 / 100
                  ).toFixed(2)
                : ""
            }
          />
        </Field>
      </div>

      <Field
        label={dict.factory.catalogue.flashSaleLabel}
        hint={dict.factory.catalogue.flashSaleHint}
      >
        <Input
          name="flashSaleEndsAt"
          type="datetime-local"
          defaultValue={
            defaults?.flashSaleEndsAt
              ? toDateTimeLocal(defaults.flashSaleEndsAt)
              : ""
          }
        />
      </Field>

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
        <Field
          label={dict.factory.catalogue.stockLabel}
          hint={isUniqueItem ? dict.factory.catalogue.uniqueItemHint : undefined}
        >
          <Input
            name="stockAvailable"
            type="number"
            inputMode="numeric"
            min="0"
            // `key` forces a remount so the value actually resets when the
            // checkbox flips — defaultValue alone is read once and ignored on
            // every later render.
            key={isUniqueItem ? "unique" : "stocked"}
            readOnly={isUniqueItem}
            defaultValue={
              isUniqueItem ? "1" : (defaults?.stockAvailable ?? "0")
            }
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

      {/* Vehicle facts. Mounted only for Category.VEHICLE — the required
          attributes below would otherwise block every other listing. */}
      {isVehicle && (
        <fieldset className="border-line rounded-lg border p-4">
          <legend className="text-fg px-2 text-sm font-medium">
            {dict.factory.catalogue.vehicleSectionTitle}
          </legend>
          <p className="text-faint mb-4 text-xs">
            {dict.factory.catalogue.vehicleSectionHint}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label={dict.factory.catalogue.makeLabel} required>
              <Input
                name="makeName"
                required
                maxLength={60}
                defaultValue={defaults?.vehicle?.makeName ?? ""}
              />
            </Field>
            <Field label={dict.factory.catalogue.modelLabel} required>
              <Input
                name="modelName"
                required
                maxLength={80}
                defaultValue={defaults?.vehicle?.modelName ?? ""}
              />
            </Field>
            <Field label={dict.factory.catalogue.yearLabel} required>
              <Input
                name="year"
                type="number"
                inputMode="numeric"
                min="1900"
                required
                defaultValue={defaults?.vehicle?.year ?? ""}
              />
            </Field>
            <Field label={dict.factory.catalogue.mileageLabel} required>
              <Input
                name="mileageKm"
                type="number"
                inputMode="numeric"
                min="0"
                required
                defaultValue={defaults?.vehicle?.mileageKm ?? ""}
              />
            </Field>
            <Field label={dict.factory.catalogue.fuelLabel} required>
              <Select
                name="fuel"
                required
                defaultValue={defaults?.vehicle?.fuel ?? VehicleFuel.PETROL}
                options={FUELS.map((f) => ({
                  value: f,
                  label: dict.publicMarketplace.fuels[f],
                }))}
              />
            </Field>
            <Field label={dict.factory.catalogue.transmissionLabel} required>
              <Select
                name="transmission"
                required
                defaultValue={
                  defaults?.vehicle?.transmission ?? VehicleTransmission.MANUAL
                }
                options={TRANSMISSIONS.map((tr) => ({
                  value: tr,
                  label: dict.publicMarketplace.transmissions[tr],
                }))}
              />
            </Field>
            <Field label={dict.factory.catalogue.drivetrainLabel}>
              <Select
                name="drivetrain"
                defaultValue={defaults?.vehicle?.drivetrain ?? ""}
                placeholder="—"
                options={DRIVETRAINS.map((d) => ({
                  value: d,
                  label: dict.publicMarketplace.drivetrains[d],
                }))}
              />
            </Field>
            <Field label={dict.factory.catalogue.colourLabel}>
              <Input
                name="colour"
                maxLength={40}
                defaultValue={defaults?.vehicle?.colour ?? ""}
              />
            </Field>
            <Field label={dict.factory.catalogue.engineCcLabel}>
              <Input
                name="engineCc"
                type="number"
                inputMode="numeric"
                min="1"
                defaultValue={defaults?.vehicle?.engineCc ?? ""}
              />
            </Field>
            <Field label={dict.factory.catalogue.powerKwLabel}>
              <Input
                name="powerKw"
                type="number"
                inputMode="numeric"
                min="1"
                defaultValue={defaults?.vehicle?.powerKw ?? ""}
              />
            </Field>
            <Field
              label={dict.factory.catalogue.vinLabel}
              hint={dict.factory.catalogue.vinHint}
              className="sm:col-span-2"
            >
              <Input
                name="vin"
                maxLength={17}
                defaultValue={defaults?.vehicle?.vin ?? ""}
                placeholder="WVWZZZ1JZXW000001"
              />
            </Field>
          </div>

          {/* The CoC is the one that decides whether the car can be
              registered at all, so it sits apart from the spec grid. */}
          <div className="border-line-subtle mt-4 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
            <Field
              label={dict.factory.catalogue.cocLabel}
              hint={dict.factory.catalogue.cocHint}
            >
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="hasCoc"
                  defaultChecked={Boolean(defaults?.vehicle?.hasCoc)}
                  className="h-4 w-4 rounded border-line text-brand-700 focus:ring-focus"
                />
                <span className="text-fg">
                  {dict.factory.catalogue.cocToggle}
                </span>
              </label>
            </Field>
            <Field label={dict.factory.catalogue.cocReferenceLabel}>
              <Input
                name="cocReference"
                maxLength={60}
                defaultValue={defaults?.vehicle?.cocReference ?? ""}
              />
            </Field>
          </div>
        </fieldset>
      )}

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
                <ExistingImageDelete
                  entity="marketplaceProduct"
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
            // No `name` — staged images are appended to FormData
            // manually in onSubmit from `stagedImages` state so we
            // can let the user remove a preview before posting.
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

        {totalAfterUpload > 6 && (
          <p className="text-xs text-warning flex items-center gap-1">
            <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={1.5} />
            {dict.factory.catalogue.imagesTooMany}
          </p>
        )}
      </div>

      <AttachmentPicker
        label={dict.factory.catalogue.mediaLabel}
        hint={dict.factory.catalogue.mediaHint}
        files={extraMedia}
        onChange={setExtraMedia}
      />

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

/**
 * Format a Date for `<input type="datetime-local">`, which needs
 * `YYYY-MM-DDTHH:mm` in the user's *local* time (no timezone suffix).
 * `toISOString()` would force UTC and shift the displayed value.
 */
function toDateTimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}
