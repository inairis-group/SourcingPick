"use client";

import { useActionState, useState } from "react";
import { signIn } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { EmailInput } from "@/components/ui/email-input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Link } from "@/components/ui/link";
import { loginAction, type LoginActionState } from "@/lib/auth/actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";

const INITIAL: LoginActionState = {};

export function LoginForm() {
  const dict = useDictionary();
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  const [googlePending, setGooglePending] = useState(false);

  return (
    // Self-constrain — the auth layout's wider `max-w-xl` exists for
    // the signup wizards; login itself wants a tighter column.
    <div className="flex flex-col gap-6 mx-auto w-full max-w-md">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.auth.login.title}
        </h1>
        <p className="text-sm text-muted">
          {dict.auth.login.noAccount}{" "}
          <Link href={`/${locale}/signup`} variant="inline" className="text-sm font-medium">
            {dict.auth.login.signupLink}
          </Link>
        </p>
      </header>

      <Button
        type="button"
        variant="secondary"
        size="md"
        fullWidth
        loading={googlePending}
        leftIcon={<HugeiconsIcon icon={GoogleIcon} size={18} strokeWidth={1.5} />}
        onClick={() => {
          setGooglePending(true);
          signIn("google", { callbackUrl: `/${locale}/dashboard` });
        }}
      >
        {dict.auth.login.google}
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-line" />
        <span className="text-xs uppercase tracking-wide text-faint">
          {dict.auth.login.divider}
        </span>
        <div className="flex-1 h-px bg-line" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state.error && <FormError>{state.error}</FormError>}

        <Field label={dict.auth.login.emailLabel} required>
          <EmailInput
            name="email"
            autoComplete="email"
            required
            autoFocus
            placeholder="you@example.com"
            invalidMessage={dict.auth.signup.errorEmail}
          />
        </Field>

        <Field
          label={dict.auth.login.passwordLabel}
          required
          hint={
            <Link
              href={`/${locale}/forgot-password`}
              variant="inline"
              className="text-sm"
            >
              {dict.auth.login.forgotPassword}
            </Link>
          }
        >
          <PasswordInput name="password" autoComplete="current-password" required />
        </Field>

        <Button type="submit" variant="primary" size="md" fullWidth loading={pending}>
          {dict.auth.login.submit}
        </Button>
      </form>
    </div>
  );
}
