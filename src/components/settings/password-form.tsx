"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import {
  changePasswordAction,
  type PasswordActionState,
} from "@/lib/settings/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

const INITIAL: PasswordActionState = {};

export function PasswordForm() {
  const dict = useDictionary();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    INITIAL,
  );

  // Reset the form on successful save so the password fields clear out.
  if (state.saved && formRef.current) {
    formRef.current.reset();
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {state.error && <FormError>{state.error}</FormError>}
      {state.saved && (
        <div
          role="status"
          className="rounded-md border border-success-edge bg-success-soft px-3 py-2 text-sm text-success"
        >
          {dict.settings.security.saved}
        </div>
      )}

      <Field label={dict.settings.security.currentPasswordLabel} required>
        <PasswordInput
          name="currentPassword"
          autoComplete="current-password"
          required
        />
      </Field>

      <Field
        label={dict.settings.security.newPasswordLabel}
        required
        hint={dict.auth.signup.passwordHint}
      >
        <PasswordInput
          name="newPassword"
          autoComplete="new-password"
          required
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

      <div className="pt-2">
        <Button type="submit" variant="primary" size="md" loading={pending}>
          {dict.settings.security.submit}
        </Button>
      </div>
    </form>
  );
}
