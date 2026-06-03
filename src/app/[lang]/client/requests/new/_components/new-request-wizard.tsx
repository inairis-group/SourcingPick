"use client";

import { useState, useTransition } from "react";
import { Category, Incoterm, SourcingRegion } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import { Link } from "@/components/ui/link";
import { createSourcingRequestAction } from "@/lib/sourcing/actions";
import { AttachmentPicker } from "@/components/attachments/attachment-picker";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

const CATEGORIES: Category[] = [
  Category.TEXTILE,
  Category.HOME,
  Category.STATIONERY,
  Category.COSMETICS,
  Category.FOOD,
  Category.ELECTRONICS,
  Category.METAL,
  Category.WOOD,
  Category.PLASTIC,
  Category.OTHER,
];

const INCOTERMS: Incoterm[] = [
  Incoterm.EXW,
  Incoterm.FOB,
  Incoterm.DAP,
  Incoterm.DDP,
  Incoterm.CIF,
];

// REGIONS list is intentionally absent — Phase 1 locks the picker to ASIA.
// Phase 2 (admin allowlist) re-introduces it conditionally based on the
// PlatformSettings.allowedRegions value.

const STEPS = [1, 2, 3, 4] as const;
type Step = (typeof STEPS)[number];

type State = {
  title: string;
  category: Category | "";
  productName: string;
  productDescription: string;
  quantity: string;
  targetUnitPriceEur: string;
  budgetEur: string;
  deadline: string;
  deliveryAddress: string;
  incoterm: Incoterm | "";
  sourcingRegion: SourcingRegion | "";
  sourcingCountry: string;
  requiredCerts: string;
};

type CountryOption = { code: string; name: string };

type WizardProps = {
  /** Regions the admin has opened up via PlatformSettings. */
  allowedRegions: SourcingRegion[];
  /** Countries the admin has opened up (ISO 3166-1 alpha-2). */
  allowedCountries: CountryOption[];
};

export function NewRequestWizard({
  allowedRegions,
  allowedCountries,
}: WizardProps) {
  const dict = useDictionary();
  const locale = useLocale();
  const [step, setStep] = useState<Step>(1);

  // Pick sensible defaults from the allowlist. The action validates the
  // final values, so even a single-region allowlist still works.
  const defaultRegion: SourcingRegion =
    allowedRegions[0] ?? SourcingRegion.ASIA;
  const defaultCountry = allowedCountries[0]?.code ?? "CN";

  const [state, setState] = useState<State>({
    title: "",
    category: "",
    productName: "",
    productDescription: "",
    quantity: "",
    targetUnitPriceEur: "",
    budgetEur: "",
    deadline: "",
    deliveryAddress: "",
    incoterm: "",
    sourcingRegion: defaultRegion,
    sourcingCountry: defaultCountry,
    requiredCerts: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [pending, startTransition] = useTransition();

  const stepLabels = [
    dict.client.requests.stepProduct,
    dict.client.requests.stepLogistics,
    dict.client.requests.stepRequirements,
    dict.client.requests.stepReview,
  ];

  const set = <K extends keyof State>(key: K, value: State[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const validate = (s: Step): string | null => {
    if (s === 1) {
      if (!state.title.trim()) return dict.client.requests.errorTitle;
      if (!state.category) return dict.client.requests.errorCategory;
      if (!state.productName.trim()) return dict.client.requests.errorProductName;
      const qty = Number(state.quantity);
      if (!Number.isInteger(qty) || qty < 1)
        return dict.client.requests.errorQuantity;
    }
    if (s === 2) {
      if (!state.deadline) return dict.client.requests.errorDeadline;
      if (new Date(state.deadline) <= new Date())
        return dict.client.requests.errorDeadlineFuture;
      if (state.deliveryAddress.trim().length < 5)
        return dict.client.requests.errorAddress;
      if (!state.incoterm) return dict.client.requests.errorIncoterm;
      if (!state.sourcingRegion) return dict.client.requests.errorRegion;
    }
    return null;
  };

  const goNext = () => {
    const err = validate(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < 4) setStep((step + 1) as Step);
  };

  const goBack = () => {
    setError(null);
    if (step > 1) setStep((step - 1) as Step);
  };

  const submit = () => {
    const err = validate(1) ?? validate(2);
    if (err) {
      setError(err);
      return;
    }

    const fd = new FormData();
    fd.append("title", state.title);
    fd.append("category", state.category);
    fd.append("productName", state.productName);
    fd.append("productDescription", state.productDescription);
    fd.append("quantity", state.quantity);
    fd.append("targetUnitPriceEur", state.targetUnitPriceEur);
    fd.append("budgetEur", state.budgetEur);
    fd.append("deadline", state.deadline);
    fd.append("deliveryAddress", state.deliveryAddress);
    fd.append("incoterm", state.incoterm);
    fd.append("sourcingRegion", state.sourcingRegion);
    fd.append("sourcingCountry", state.sourcingCountry);
    fd.append("requiredCerts", state.requiredCerts);
    for (const file of attachments) fd.append("attachments", file);

    startTransition(async () => {
      const result = await createSourcingRequestAction({}, fd);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.client.requests.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.client.requests.newTitle}
        </h1>
        <p className="text-sm text-muted">{dict.client.requests.newDescription}</p>
      </header>

      <Stepper current={step} labels={stepLabels} />

      <div className="min-h-70">
        {error && <FormError className="mb-4">{error}</FormError>}

        {step === 1 && (
          <StepProduct
            dict={dict}
            state={state}
            set={set}
            allowedRegions={allowedRegions}
            allowedCountries={allowedCountries}
          />
        )}
        {step === 2 && (
          <StepLogistics
            dict={dict}
            state={state}
            set={set}
            allowedRegions={allowedRegions}
            allowedCountries={allowedCountries}
          />
        )}
        {step === 3 && (
          <StepRequirements
            dict={dict}
            state={state}
            set={set}
            allowedRegions={allowedRegions}
            allowedCountries={allowedCountries}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        )}
        {step === 4 && (
          <StepReview
            dict={dict}
            state={state}
            locale={locale}
            allowedRegions={allowedRegions}
            allowedCountries={allowedCountries}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-line-subtle">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={step === 1 || pending}
            onClick={goBack}
            leftIcon={
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
            }
          >
            {dict.common.actions.back}
          </Button>
          <Link
            href={`/${locale}/client/requests`}
            variant="muted"
            className="text-sm ms-1"
          >
            {dict.common.actions.cancel}
          </Link>
        </div>

        {step < 4 ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={goNext}
            rightIcon={
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
            }
          >
            {dict.common.actions.next}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={submit}
            loading={pending}
          >
            {dict.client.requests.submitRequest}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * True when the buyer-entered deadline is sooner than the 31-day floor for a
 * fully-secured air-freight order. We surface a soft warning rather than
 * blocking the submit — short turnarounds are allowed but fall outside the
 * standard SLA.
 */
function isShortDeadline(deadline: string): boolean {
  if (!deadline) return false;
  const target = new Date(deadline).getTime();
  if (Number.isNaN(target)) return false;
  const days = (target - Date.now()) / (1000 * 60 * 60 * 24);
  return days > 0 && days < 31;
}

function Stepper({ current, labels }: { current: Step; labels: string[] }) {
  return (
    <ol className="flex items-center gap-1.5" role="list">
      {STEPS.map((s, i) => {
        const isDone = s < current;
        const isCurrent = s === current;
        return (
          <li
            key={s}
            className="flex-1 flex items-center gap-2"
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className={cn(
                "shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold",
                "transition-colors duration-fast",
                isDone && "bg-action text-on-action",
                isCurrent && "bg-action text-on-action ring-2 ring-action/30",
                !isDone && !isCurrent && "bg-subtle text-faint",
              )}
            >
              {isDone ? (
                <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.5} />
              ) : (
                s
              )}
            </span>
            <span
              className={cn(
                "hidden md:inline text-xs font-medium truncate transition-colors duration-fast",
                isDone || isCurrent ? "text-fg" : "text-faint",
              )}
            >
              {labels[i]}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "flex-1 h-px transition-colors duration-fast",
                  isDone ? "bg-action" : "bg-line",
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

type StepProps = {
  dict: ReturnType<typeof useDictionary>;
  state: State;
  set: <K extends keyof State>(key: K, value: State[K]) => void;
  allowedRegions: SourcingRegion[];
  allowedCountries: CountryOption[];
};

function StepProduct({ dict, state, set }: StepProps) {
  return (
    <section className="flex flex-col gap-4">
      <Field
        label={dict.client.requests.titleLabel}
        required
        hint={dict.client.requests.titleHint}
      >
        <Input
          type="text"
          value={state.title}
          onChange={(e) => set("title", e.target.value)}
          autoFocus
          placeholder={dict.client.requests.titlePlaceholder}
        />
      </Field>

      <Field label={dict.client.requests.categoryLabel} required>
        <Select
          value={state.category}
          onChange={(v) => set("category", v as Category | "")}
          placeholder={dict.client.requests.categoryPlaceholder}
          options={CATEGORIES.map((c) => ({
            value: c,
            label: dict.categories[c],
          }))}
        />
      </Field>

      <Field label={dict.client.requests.productNameLabel} required>
        <Input
          type="text"
          value={state.productName}
          onChange={(e) => set("productName", e.target.value)}
          placeholder={dict.client.requests.productNamePlaceholder}
        />
      </Field>

      <Field
        label={dict.client.requests.productDescriptionLabel}
        hint={dict.client.requests.productDescriptionHint}
      >
        <textarea
          value={state.productDescription}
          onChange={(e) => set("productDescription", e.target.value)}
          rows={4}
          className={cn(
            "w-full rounded-sm border bg-surface text-fg placeholder:text-faint p-3 text-base resize-y",
            "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
            "transition-colors duration-fast",
          )}
          placeholder={dict.client.requests.productDescriptionPlaceholder}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={dict.client.requests.quantityLabel} required>
          <Input
            type="number"
            inputMode="numeric"
            min="1"
            value={state.quantity}
            onChange={(e) => set("quantity", e.target.value)}
          />
        </Field>
        <Field
          label={dict.client.requests.targetPriceLabel}
          hint={dict.client.requests.priceHintEur}
        >
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={state.targetUnitPriceEur}
            onChange={(e) => set("targetUnitPriceEur", e.target.value)}
          />
        </Field>
        <Field
          label={dict.client.requests.budgetLabel}
          hint={dict.client.requests.priceHintEur}
        >
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={state.budgetEur}
            onChange={(e) => set("budgetEur", e.target.value)}
          />
        </Field>
      </div>
    </section>
  );
}

function StepLogistics({
  dict,
  state,
  set,
  allowedRegions,
  allowedCountries,
}: StepProps) {
  const defaultRegion: SourcingRegion =
    allowedRegions[0] ?? SourcingRegion.ASIA;
  return (
    <section className="flex flex-col gap-4">
      <Field label={dict.client.requests.deadlineLabel} required>
        <Input
          type="date"
          value={state.deadline}
          onChange={(e) => set("deadline", e.target.value)}
        />
      </Field>
      {isShortDeadline(state.deadline) && (
        <div className="rounded-md border border-warning-edge bg-warning-soft/40 px-3 py-2 text-xs text-warning leading-snug">
          {dict.client.requests.deadlineWarningShort}
        </div>
      )}
      <Field label={dict.client.requests.addressLabel} required>
        <Input
          type="text"
          autoComplete="street-address"
          value={state.deliveryAddress}
          onChange={(e) => set("deliveryAddress", e.target.value)}
          placeholder={dict.client.requests.addressPlaceholder}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={dict.client.requests.incotermLabel}
          required
          hint={dict.client.requests.incotermHint}
        >
          <Select
            value={state.incoterm}
            onChange={(v) => set("incoterm", v as Incoterm | "")}
            placeholder={dict.client.requests.incotermPlaceholder}
            options={INCOTERMS.map((i) => ({
              value: i,
              label: `${i} — ${dict.client.requests.incoterms[i]}`,
            }))}
          />
        </Field>
        {/* Region picker — visible only when admins have unlocked more
            than one region. Otherwise we render a muted single-value
            display so the buyer knows the geography but can't change it. */}
        {allowedRegions.length > 1 ? (
          <Field label={dict.client.requests.regionLabel} required>
            <Select
              value={state.sourcingRegion}
              onChange={(v) => set("sourcingRegion", v as SourcingRegion)}
              options={allowedRegions.map((r) => ({
                value: r,
                label: dict.client.requests.regions[r],
              }))}
            />
          </Field>
        ) : (
          <Field
            label={dict.client.requests.regionLabel}
            hint={dict.client.requests.regionLockedHint}
          >
            <div
              aria-disabled
              className={cn(
                "w-full h-10 px-3 rounded-sm border bg-subtle text-muted",
                "border-line-strong flex items-center justify-between cursor-not-allowed",
              )}
            >
              <span className="text-sm">
                {dict.client.requests.regions[defaultRegion]}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-faint">
                {dict.client.requests.regionLockedBadge}
              </span>
            </div>
          </Field>
        )}
      </div>

      {/* Country picker — same conditional: muted when single country, real
          Select when admins have opened multiple. Goes below the
          incoterm/region row so it doesn't crowd the grid. */}
      {allowedCountries.length > 1 ? (
        <Field label={dict.client.requests.countryLabel} required>
          <Select
            value={state.sourcingCountry}
            onChange={(v) => set("sourcingCountry", v)}
            options={allowedCountries.map((c) => ({
              value: c.code,
              label: `${c.name} · ${c.code}`,
            }))}
          />
        </Field>
      ) : (
        <Field
          label={dict.client.requests.countryLabel}
          hint={dict.client.requests.regionLockedHint}
        >
          <div
            aria-disabled
            className={cn(
              "w-full h-10 px-3 rounded-sm border bg-subtle text-muted",
              "border-line-strong flex items-center justify-between cursor-not-allowed",
            )}
          >
            <span className="text-sm">
              {allowedCountries[0]?.name ?? "China"} ·{" "}
              {allowedCountries[0]?.code ?? "CN"}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-faint">
              {dict.client.requests.regionLockedBadge}
            </span>
          </div>
        </Field>
      )}
    </section>
  );
}

function StepRequirements({
  dict,
  state,
  set,
  attachments,
  onAttachmentsChange,
}: StepProps & {
  attachments: File[];
  onAttachmentsChange: (next: File[]) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <Field
        label={dict.client.requests.certsLabel}
        hint={dict.client.requests.certsHint}
      >
        <Input
          type="text"
          value={state.requiredCerts}
          onChange={(e) => set("requiredCerts", e.target.value)}
          placeholder={dict.client.requests.certsPlaceholder}
        />
      </Field>

      <AttachmentPicker
        label={dict.client.requests.attachmentsLabel}
        hint={dict.client.requests.attachmentsHint}
        files={attachments}
        onChange={onAttachmentsChange}
      />

      <div className="rounded-md border border-info-edge bg-info-soft p-4 text-sm text-info">
        {dict.client.requests.certsExplainer}
      </div>
    </section>
  );
}

function StepReview({
  dict,
  state,
  locale,
  allowedCountries,
}: Omit<StepProps, "set"> & { locale: string }) {
  void locale;
  const countryName =
    allowedCountries.find((c) => c.code === state.sourcingCountry)?.name ??
    state.sourcingCountry;
  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: dict.client.requests.titleLabel, value: state.title },
    {
      label: dict.client.requests.categoryLabel,
      value: state.category ? dict.categories[state.category] : "—",
    },
    { label: dict.client.requests.productNameLabel, value: state.productName },
    {
      label: dict.client.requests.productDescriptionLabel,
      value: state.productDescription || <span className="text-faint">—</span>,
    },
    { label: dict.client.requests.quantityLabel, value: state.quantity },
    {
      label: dict.client.requests.targetPriceLabel,
      value: state.targetUnitPriceEur
        ? `${state.targetUnitPriceEur} €`
        : "—",
    },
    {
      label: dict.client.requests.budgetLabel,
      value: state.budgetEur ? `${state.budgetEur} €` : "—",
    },
    { label: dict.client.requests.deadlineLabel, value: state.deadline },
    { label: dict.client.requests.addressLabel, value: state.deliveryAddress },
    {
      label: dict.client.requests.incotermLabel,
      value: state.incoterm
        ? `${state.incoterm} — ${dict.client.requests.incoterms[state.incoterm]}`
        : "—",
    },
    {
      label: dict.client.requests.regionLabel,
      value: state.sourcingRegion
        ? dict.client.requests.regions[state.sourcingRegion]
        : "—",
    },
    {
      label: dict.client.requests.countryLabel,
      value: state.sourcingCountry
        ? `${countryName} · ${state.sourcingCountry}`
        : "—",
    },
    {
      label: dict.client.requests.certsLabel,
      value: state.requiredCerts || <span className="text-faint">—</span>,
    },
  ];

  return (
    <section className="flex flex-col gap-5">
      <p className="text-sm text-muted leading-snug">
        {dict.client.requests.reviewDescription}
      </p>
      <dl className="rounded-md border border-line bg-subtle divide-y divide-line-subtle">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3 px-4 py-2.5"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-faint sm:pt-0.5">
              {row.label}
            </dt>
            <dd className="text-sm text-fg sm:col-span-2 wrap-break-word">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
