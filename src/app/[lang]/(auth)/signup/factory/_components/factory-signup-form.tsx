"use client";

import { useRef, useState, useTransition } from "react";
import { Category } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  FileUploadIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { PasswordInput } from "@/components/ui/password-input";
import { EmailInput } from "@/components/ui/email-input";
import { CountrySelect } from "@/components/ui/country-select";
import { FormError } from "@/components/ui/form-error";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/link";
import { signupFactoryAction } from "@/lib/auth/signup-actions";
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

const STEPS = [1, 2, 3, 4, 5] as const;
type Step = (typeof STEPS)[number];

type State = {
  // Step 1
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  // Step 2
  legalName: string;
  displayName: string;
  country: string;
  city: string;
  address: string;
  vatNumber: string;
  // Step 3
  category: Category | "";
  capabilities: string;
  // Step 4
  registry: File | null;
  tax: File | null;
  facility: File[];
  // Step 5
  termsAccepted: boolean;
};

const INITIAL_STATE: State = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  legalName: "",
  displayName: "",
  country: "",
  city: "",
  address: "",
  vatNumber: "",
  category: "",
  capabilities: "",
  registry: null,
  tax: null,
  facility: [],
  termsAccepted: false,
};

export function FactorySignupForm() {
  const dict = useDictionary();
  const locale = useLocale();
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<State>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const stepLabels = [
    dict.auth.signup.stepAccount,
    dict.auth.signup.stepCompany,
    dict.auth.signup.stepFactory,
    dict.auth.signup.stepDocuments,
    dict.auth.signup.stepReview,
  ];

  const set = <K extends keyof State>(key: K, value: State[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const validate = (s: Step): string | null => {
    if (s === 1) {
      if (!state.firstName.trim()) return dict.auth.signup.errorFirstName;
      if (!state.lastName.trim()) return dict.auth.signup.errorLastName;
      if (!isValidEmail(state.email)) return dict.auth.signup.errorEmail;
      if (state.password.length < 12) return dict.auth.signup.errorPassword;
    }
    if (s === 2) {
      if (state.legalName.trim().length < 2)
        return dict.auth.signup.errorLegalName;
      if (!state.displayName.trim()) return dict.auth.signup.errorDisplayName;
      if (state.country.trim().length < 2)
        return dict.auth.signup.errorCountry;
      if (!state.city.trim()) return dict.auth.signup.errorCity;
      if (state.address.trim().length < 3)
        return dict.auth.signup.errorAddress;
    }
    if (s === 3) {
      if (!state.category) return dict.auth.signup.errorCategory;
    }
    if (s === 4) {
      if (!state.registry) return dict.auth.signup.errorRegistry;
      if (!state.tax) return dict.auth.signup.errorTax;
      if (state.facility.length === 0)
        return dict.auth.signup.errorFacility;
    }
    if (s === 5) {
      if (!state.termsAccepted) return dict.auth.signup.errorTerms;
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
    if (step < 5) setStep((step + 1) as Step);
  };

  const goBack = () => {
    setError(null);
    if (step > 1) setStep((step - 1) as Step);
  };

  const submit = () => {
    const err = validate(5);
    if (err) {
      setError(err);
      return;
    }

    const fd = new FormData();
    fd.append("firstName", state.firstName);
    fd.append("lastName", state.lastName);
    fd.append("email", state.email);
    fd.append("phone", state.phone);
    fd.append("password", state.password);
    fd.append("legalName", state.legalName);
    fd.append("displayName", state.displayName);
    fd.append("country", state.country);
    fd.append("city", state.city);
    fd.append("address", state.address);
    fd.append("vatNumber", state.vatNumber);
    fd.append("category", state.category);
    fd.append("capabilities", state.capabilities);
    fd.append("terms", "on");
    if (state.registry) fd.append("doc_registry", state.registry);
    if (state.tax) fd.append("doc_tax", state.tax);
    state.facility.forEach((f) => fd.append("doc_facility", f));

    startTransition(async () => {
      const result = await signupFactoryAction({}, fd);
      if (result?.error) setError(result.error);
      // On success the action calls redirect() which navigates client-side.
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.auth.signup.factoryEyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.auth.signup.factoryTitle}
        </h1>
      </header>

      <Stepper current={step} labels={stepLabels} />

      <div className="min-h-70">
        {error && <FormError className="mb-4">{error}</FormError>}

        {step === 1 && (
          <StepAccount dict={dict} state={state} set={set} />
        )}
        {step === 2 && (
          <StepCompany dict={dict} state={state} set={set} />
        )}
        {step === 3 && (
          <StepFactory dict={dict} state={state} set={set} />
        )}
        {step === 4 && (
          <StepDocuments dict={dict} state={state} set={set} />
        )}
        {step === 5 && (
          <StepReview
            dict={dict}
            state={state}
            locale={locale}
            set={set}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-line-subtle">
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={step === 1 || pending}
          onClick={goBack}
          leftIcon={<HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />}
        >
          {dict.common.actions.back}
        </Button>

        {step < 5 ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={goNext}
            rightIcon={<HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />}
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
            {dict.auth.signup.submit}
          </Button>
        )}
      </div>

      <p className="text-sm text-muted text-center">
        {dict.auth.signup.hasAccount}{" "}
        <Link href={`/${locale}/login`} variant="inline" className="text-sm">
          {dict.auth.signup.loginLink}
        </Link>
      </p>
    </div>
  );
}

function Stepper({ current, labels }: { current: Step; labels: string[] }) {
  return (
    <ol className="flex items-center gap-1.5" role="list" aria-label="Signup progress">
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
};

function StepAccount({ dict, state, set }: StepProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={dict.auth.signup.firstNameLabel} required>
          <Input
            type="text"
            autoComplete="given-name"
            autoFocus
            value={state.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
        </Field>
        <Field label={dict.auth.signup.lastNameLabel} required>
          <Input
            type="text"
            autoComplete="family-name"
            value={state.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
        </Field>
      </div>
      <Field label={dict.auth.login.emailLabel} required>
        <EmailInput
          autoComplete="email"
          placeholder="you@factory.example"
          value={state.email}
          onChange={(e) => set("email", e.target.value)}
          invalidMessage={dict.auth.signup.errorEmail}
        />
      </Field>
      <Field
        label={dict.auth.signup.phoneLabel}
        required
        hint={dict.auth.signup.phoneHint}
      >
        <Input
          type="tel"
          autoComplete="tel"
          maxLength={32}
          placeholder="+33 6 12 34 56 78"
          value={state.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </Field>
      <Field
        label={dict.auth.login.passwordLabel}
        required
        hint={dict.auth.signup.passwordHint}
      >
        <PasswordInput
          autoComplete="new-password"
          minLength={12}
          value={state.password}
          onChange={(e) => set("password", e.target.value)}
        />
      </Field>
    </section>
  );
}

function StepCompany({ dict, state, set }: StepProps) {
  return (
    <section className="flex flex-col gap-4">
      <Field label={dict.auth.signup.legalNameLabel} required>
        <Input
          type="text"
          value={state.legalName}
          onChange={(e) => set("legalName", e.target.value)}
        />
      </Field>
      <Field
        label={dict.auth.signup.displayNameLabel}
        required
        hint={dict.auth.signup.displayNameHint}
      >
        <Input
          type="text"
          autoComplete="organization"
          value={state.displayName}
          onChange={(e) => set("displayName", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={dict.auth.signup.countryLabel} required>
          <CountrySelect
            placeholder={dict.auth.signup.countryPlaceholder}
            value={state.country}
            onChange={(code) => set("country", code)}
          />
        </Field>
        <Field label={dict.auth.signup.cityLabel} required>
          <Input
            type="text"
            autoComplete="address-level2"
            value={state.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>
      </div>
      <Field label={dict.auth.signup.addressLabel} required>
        <Input
          type="text"
          autoComplete="street-address"
          value={state.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </Field>
      <Field
        label={dict.auth.signup.vatLabel}
        hint={dict.auth.signup.vatHint}
      >
        <Input
          type="text"
          value={state.vatNumber}
          onChange={(e) => set("vatNumber", e.target.value)}
        />
      </Field>
    </section>
  );
}

function StepFactory({ dict, state, set }: StepProps) {
  return (
    <section className="flex flex-col gap-4">
      <Field label={dict.auth.signup.categoryLabel} required>
        <Select
          value={state.category}
          onChange={(v) => set("category", v as Category | "")}
          placeholder={dict.auth.signup.categoryPlaceholder}
          options={CATEGORIES.map((cat) => ({
            value: cat,
            label: dict.categories[cat],
          }))}
        />
      </Field>
      <Field
        label={dict.auth.signup.capabilitiesLabel}
        hint={dict.auth.signup.capabilitiesHint}
      >
        <Input
          type="text"
          placeholder={dict.auth.signup.capabilitiesPlaceholder}
          value={state.capabilities}
          onChange={(e) => set("capabilities", e.target.value)}
        />
      </Field>
    </section>
  );
}

function StepDocuments({ dict, state, set }: StepProps) {
  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm text-muted leading-snug -mt-2 mb-2">
        {dict.auth.signup.documentsDescription}
      </p>
      <FileField
        label={dict.auth.signup.docRegistryLabel}
        hint={dict.auth.signup.docRegistryHint}
        required
        accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
        chooseLabel={dict.auth.signup.fileChoose}
        replaceLabel={dict.auth.signup.fileReplace}
        removeLabel={dict.common.actions.delete}
        value={state.registry ? [state.registry] : []}
        onChange={(files) => set("registry", files[0] ?? null)}
      />
      <FileField
        label={dict.auth.signup.docTaxLabel}
        hint={dict.auth.signup.docTaxHint}
        required
        accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
        chooseLabel={dict.auth.signup.fileChoose}
        replaceLabel={dict.auth.signup.fileReplace}
        removeLabel={dict.common.actions.delete}
        value={state.tax ? [state.tax] : []}
        onChange={(files) => set("tax", files[0] ?? null)}
      />
      <FileField
        label={dict.auth.signup.docFacilityLabel}
        hint={dict.auth.signup.docFacilityHint}
        required
        multiple
        accept=".jpg,.jpeg,.png,.webp,.heic"
        chooseLabel={dict.auth.signup.fileChoose}
        replaceLabel={dict.auth.signup.fileReplace}
        removeLabel={dict.common.actions.delete}
        value={state.facility}
        onChange={(files) => set("facility", files)}
      />
    </section>
  );
}

function StepReview({
  dict,
  state,
  locale,
  set,
}: StepProps & { locale: string }) {
  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: dict.auth.signup.firstNameLabel, value: state.firstName },
    { label: dict.auth.signup.lastNameLabel, value: state.lastName },
    { label: dict.auth.login.emailLabel, value: state.email },
    { label: dict.auth.signup.legalNameLabel, value: state.legalName },
    { label: dict.auth.signup.displayNameLabel, value: state.displayName },
    { label: dict.auth.signup.countryLabel, value: state.country },
    { label: dict.auth.signup.cityLabel, value: state.city },
    { label: dict.auth.signup.addressLabel, value: state.address },
    {
      label: dict.auth.signup.vatLabel,
      value: state.vatNumber || <span className="text-faint">—</span>,
    },
    {
      label: dict.auth.signup.categoryLabel,
      value: state.category ? dict.categories[state.category] : "—",
    },
    {
      label: dict.auth.signup.capabilitiesLabel,
      value: state.capabilities || <span className="text-faint">—</span>,
    },
    {
      label: dict.auth.signup.docRegistryLabel,
      value: state.registry?.name ?? "—",
    },
    {
      label: dict.auth.signup.docTaxLabel,
      value: state.tax?.name ?? "—",
    },
    {
      label: dict.auth.signup.docFacilityLabel,
      value:
        state.facility.length > 0
          ? state.facility.map((f) => f.name).join(", ")
          : "—",
    },
  ];

  return (
    <section className="flex flex-col gap-5">
      <p className="text-sm text-muted leading-snug">
        {dict.auth.signup.reviewDescription}
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

      <Checkbox
        checked={state.termsAccepted}
        onChange={(checked) => set("termsAccepted", checked)}
        label={
          <>
            {dict.auth.signup.termsAccept}{" "}
            <Link
              href={`/${locale}/legal/terms`}
              variant="inline"
              className="text-sm"
            >
              {dict.auth.signup.termsLink}
            </Link>{" "}
            {dict.auth.signup.termsAnd}{" "}
            <Link
              href={`/${locale}/legal/privacy`}
              variant="inline"
              className="text-sm"
            >
              {dict.auth.signup.privacyLink}
            </Link>
            .
          </>
        }
      />
    </section>
  );
}

type FileFieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  chooseLabel: string;
  replaceLabel: string;
  removeLabel: string;
  value: File[];
  onChange: (files: File[]) => void;
};

function FileField({
  label,
  hint,
  required,
  multiple,
  accept,
  chooseLabel,
  replaceLabel,
  removeLabel,
  value,
  onChange,
}: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onSelect = (selected: FileList | null) => {
    if (!selected) return;
    onChange(Array.from(selected));
  };

  const removeAt = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
    if (inputRef.current) {
      const dt = new DataTransfer();
      next.forEach((f) => dt.items.add(f));
      inputRef.current.files = dt.files;
    }
  };

  const id = `file-${label.replace(/\W+/g, "-")}`;

  return (
    <Field
      label={label}
      required={required}
      hint={value.length === 0 ? hint : undefined}
    >
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => onSelect(e.target.files)}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={cn(
            "inline-flex items-center gap-2 self-start h-10 px-3 rounded-sm border border-line-strong bg-surface text-fg",
            "cursor-pointer hover:bg-subtle transition-colors duration-fast",
            "text-sm font-medium",
          )}
        >
          <HugeiconsIcon icon={FileUploadIcon} size={16} strokeWidth={1.5} />
          {value.length === 0 ? chooseLabel : replaceLabel}
        </label>

        {value.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {value.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center gap-2 rounded-sm border border-line bg-subtle px-3 py-2"
              >
                <span className="flex-1 text-sm text-fg truncate">
                  {file.name}
                </span>
                <span className="text-xs text-muted whitespace-nowrap">
                  {formatBytes(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={removeLabel}
                  className="text-faint hover:text-danger transition-colors duration-fast"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
