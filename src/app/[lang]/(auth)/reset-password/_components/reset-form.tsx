"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "@/lib/auth/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

const INITIAL: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const dict = useDictionary();
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    INITIAL,
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.auth.reset.title}
        </h1>
        <p className="text-sm text-muted">{dict.auth.reset.description}</p>
      </header>

      <form action={formAction} className="flex flex-col gap-4">
        {state.error && <FormError>{state.error}</FormError>}
        <input type="hidden" name="token" value={token} />

        <Field
          label={dict.auth.reset.newPasswordLabel}
          required
          hint={dict.auth.reset.passwordHint}
        >
          <PasswordInput
            name="password"
            autoComplete="new-password"
            required
            autoFocus
            minLength={12}
          />
        </Field>

        <Field label={dict.auth.reset.confirmPasswordLabel} required>
          <PasswordInput
            name="confirm"
            autoComplete="new-password"
            required
            minLength={12}
          />
        </Field>

        <Button type="submit" variant="primary" size="md" fullWidth loading={pending}>
          {dict.auth.reset.submit}
        </Button>
      </form>
    </div>
  );
}
