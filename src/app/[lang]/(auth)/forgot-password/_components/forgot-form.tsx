"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { EmailInput } from "@/components/ui/email-input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Link } from "@/components/ui/link";
import {
  forgotPasswordAction,
  type ForgotPasswordState,
} from "@/lib/auth/actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";

const INITIAL: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const dict = useDictionary();
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    INITIAL,
  );

  if (state.sent) {
    return (
      <div className="flex flex-col gap-4 text-center mx-auto w-full max-w-md">
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.auth.forgot.sentTitle}
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          {dict.auth.forgot.sentBody}
        </p>
        <Link
          href={`/${locale}/login`}
          variant="muted"
          className="text-sm mt-4 self-center"
        >
          ← {dict.auth.forgot.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mx-auto w-full max-w-md">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.auth.forgot.title}
        </h1>
        <p className="text-sm text-muted">{dict.auth.forgot.description}</p>
      </header>

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
        <Button type="submit" variant="primary" size="md" fullWidth loading={pending}>
          {dict.auth.forgot.submit}
        </Button>
      </form>

      <p className="text-sm text-muted text-center">
        <Link href={`/${locale}/login`} variant="inline" className="text-sm">
          ← {dict.auth.forgot.backToLogin}
        </Link>
      </p>
    </div>
  );
}
