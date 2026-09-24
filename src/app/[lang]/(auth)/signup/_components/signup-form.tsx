"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { EmailInput } from "@/components/ui/email-input";
import { CountrySelect } from "@/components/ui/country-select";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { Link } from "@/components/ui/link";
import { signupAccountAction, type SignupActionState } from "@/lib/auth/signup-actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { AuthHeading, AuthSubmitIcon, AuthWordmark } from "../../_design/auth-shell";
import { cn } from "@/lib/utils";

const INITIAL: SignupActionState = {};

type AccountType = "business" | "individual";

/**
 * Create an account, as the SaaS canvas draws it.
 *
 * The canvas replaces the old pick-a-role page and the wizard behind it with
 * this single screen. It draws the Business option selected and both company
 * fields filled, which is the common case rather than the only one — an
 * individual has neither a company nor a VAT number, so choosing that option
 * drops the pair instead of showing two fields that cannot be answered.
 *
 * The password hint states the rule the server actually enforces (twelve
 * characters). The artboard's helper text says eight, which is a drawing
 * rather than a policy; matching it would only produce rejected forms.
 */
export function SignupForm() {
  const dict = useDictionary();
  const t = dict.auth.signup;
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(signupAccountAction, INITIAL);
  const [accountType, setAccountType] = useState<AccountType>("business");

  const isBusiness = accountType === "business";

  return (
    <>
      <AuthWordmark href={`/${locale}`} alt={dict.brand.name} />
      <AuthHeading title={t.title} body={t.subtitle} />

      <form action={formAction} className="flex flex-col gap-[22px]">
        {state.error && <FormError>{state.error}</FormError>}

        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="text-fg mb-2 p-0 text-[13.5px] leading-tight font-semibold">
            {t.youAre}
          </legend>
          <div className="flex gap-2.5">
            {(
              [
                ["business", t.business],
                ["individual", t.individual],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={cn(
                  "flex min-h-[46px] flex-1 cursor-pointer items-center gap-2 rounded-xl border-[1.5px] px-3.5",
                  "text-[14.5px] font-semibold transition-colors duration-fast",
                  accountType === value
                    ? "border-action bg-surface"
                    : "border-line-strong bg-surface",
                )}
              >
                <input
                  type="radio"
                  name="accountType"
                  value={value}
                  checked={accountType === value}
                  onChange={() => setAccountType(value)}
                  className="accent-action"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Two to a row on the canvas, stacked on a phone — 420px of column
            does not hold two 46px fields side by side at 390px wide. */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Field label={t.fullNameLabel} required className="min-w-0 flex-1">
            <Input name="fullName" inputSize="lg" autoComplete="name" required />
          </Field>
          {isBusiness && (
            <Field label={t.companyLabel} required className="min-w-0 flex-1">
              <Input name="company" inputSize="lg" autoComplete="organization" required />
            </Field>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isBusiness && (
            <Field label={t.vatOrRegistrationLabel} className="min-w-0 flex-1">
              <Input name="vatNumber" inputSize="lg" />
            </Field>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
            <Label htmlFor="deliveryCountry" required>
              {t.deliveryCountryLabel}
            </Label>
            <CountrySelect id="deliveryCountry" name="deliveryCountry" required />
          </div>
        </div>

        <Field label={t.businessEmailLabel} required>
          <EmailInput
            name="email"
            inputSize="lg"
            autoComplete="email"
            required
            invalidMessage={t.errorEmail}
          />
        </Field>

        <Field label={t.passwordLabel} required hint={t.passwordHint}>
          <PasswordInput
            name="password"
            inputSize="lg"
            autoComplete="new-password"
            placeholder={dict.auth.login.passwordPlaceholder}
            required
          />
        </Field>

        <label className="text-muted flex items-start gap-2.5 text-[13.5px] leading-[1.55]">
          <input type="checkbox" name="terms" required className="accent-action mt-[3px]" />
          <span>
            {t.termsAccept}{" "}
            <Link href={`/${locale}/legal/terms`} variant="inline" className="font-semibold">
              {t.termsLink}
            </Link>{" "}
            {t.termsAnd}{" "}
            <Link href={`/${locale}/legal/privacy`} variant="inline" className="font-semibold">
              {t.privacyLink}
            </Link>
            .
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={pending}
          rightIcon={<AuthSubmitIcon />}
        >
          {t.submit}
        </Button>
      </form>

      <p className="text-muted m-0 text-center text-[14.5px]">
        {t.hasAccount}{" "}
        <Link href={`/${locale}/login`} variant="inline" className="font-semibold">
          {t.loginLink}
        </Link>
      </p>
    </>
  );
}
