"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { EmailInput } from "@/components/ui/email-input";
import { CountrySelect } from "@/components/ui/country-select";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/link";
import {
  signupClientAction,
  type SignupActionState,
} from "@/lib/auth/signup-actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";

const INITIAL: SignupActionState = {};

export function ClientSignupForm() {
  const dict = useDictionary();
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    signupClientAction,
    INITIAL,
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.auth.signup.clientEyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.auth.signup.clientTitle}
        </h1>
        <p className="text-sm text-muted">{dict.auth.signup.clientBody}</p>
      </header>

      <form action={formAction} className="flex flex-col gap-4">
        {state.error && <FormError>{state.error}</FormError>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={dict.auth.signup.firstNameLabel} required>
            <Input
              type="text"
              name="firstName"
              autoComplete="given-name"
              required
              autoFocus
            />
          </Field>
          <Field label={dict.auth.signup.lastNameLabel} required>
            <Input
              type="text"
              name="lastName"
              autoComplete="family-name"
              required
            />
          </Field>
        </div>

        <Field label={dict.auth.signup.orgNameLabel} required hint={dict.auth.signup.orgNameHint}>
          <Input
            type="text"
            name="orgName"
            autoComplete="organization"
            required
          />
        </Field>

        <Field label={dict.auth.signup.countryLabel} required>
          <CountrySelect
            name="country"
            required
            placeholder={dict.auth.signup.countryPlaceholder}
          />
        </Field>

        <Field label={dict.auth.login.emailLabel} required>
          <EmailInput
            name="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
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
            name="phone"
            autoComplete="tel"
            required
            maxLength={32}
            placeholder="+33 6 12 34 56 78"
          />
        </Field>

        <Field
          label={dict.auth.login.passwordLabel}
          required
          hint={dict.auth.signup.passwordHint}
        >
          <PasswordInput
            name="password"
            autoComplete="new-password"
            required
            minLength={12}
          />
        </Field>

        <div className="pt-1">
          <Checkbox name="terms" value="on" label={
            <>
              {dict.auth.signup.termsAccept}{" "}
              <Link href={`/${locale}/legal/terms`} variant="inline" className="text-sm">
                {dict.auth.signup.termsLink}
              </Link>
              {" "}{dict.auth.signup.termsAnd}{" "}
              <Link href={`/${locale}/legal/privacy`} variant="inline" className="text-sm">
                {dict.auth.signup.privacyLink}
              </Link>
              .
            </>
          } />
        </div>

        <Button type="submit" variant="primary" size="md" fullWidth loading={pending}>
          {dict.auth.signup.submit}
        </Button>
      </form>

      <p className="text-sm text-muted text-center">
        {dict.auth.signup.hasAccount}{" "}
        <Link href={`/${locale}/login`} variant="inline" className="text-sm">
          {dict.auth.signup.loginLink}
        </Link>
      </p>
    </div>
  );
}
