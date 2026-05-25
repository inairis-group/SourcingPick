"use client";

import { useActionState } from "react";
import { Locale } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import {
  updateProfileAction,
  type ProfileActionState,
} from "@/lib/settings/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { localeLabels, locales } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const INITIAL: ProfileActionState = {};

type Props = {
  defaultValues: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    locale: Locale;
  };
};

export function ProfileForm({ defaultValues }: Props) {
  const dict = useDictionary();
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    INITIAL,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormError>{state.error}</FormError>}
      {state.saved && (
        <div
          role="status"
          className="rounded-md border border-success-edge bg-success-soft px-3 py-2 text-sm text-success"
        >
          {dict.settings.profile.saved}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={dict.auth.signup.firstNameLabel} required>
          <Input
            type="text"
            name="firstName"
            autoComplete="given-name"
            required
            defaultValue={defaultValues.firstName}
          />
        </Field>
        <Field label={dict.auth.signup.lastNameLabel} required>
          <Input
            type="text"
            name="lastName"
            autoComplete="family-name"
            required
            defaultValue={defaultValues.lastName}
          />
        </Field>
      </div>

      <Field
        label={dict.auth.login.emailLabel}
        hint={dict.settings.profile.emailHint}
      >
        <Input type="email" value={defaultValues.email} disabled readOnly />
      </Field>

      <Field label={dict.settings.profile.phoneLabel}>
        <Input
          type="tel"
          name="phone"
          autoComplete="tel"
          defaultValue={defaultValues.phone ?? ""}
          placeholder="+33 1 23 45 67 89"
        />
      </Field>

      <Field
        label={dict.settings.profile.localeLabel}
        hint={dict.settings.profile.localeHint}
      >
        <Select
          name="locale"
          defaultValue={defaultValues.locale}
          options={locales.map((loc) => ({
            value: loc,
            label: localeLabels[loc],
          }))}
        />
      </Field>

      <div className="pt-2">
        <Button type="submit" variant="primary" size="md" loading={pending}>
          {dict.common.actions.save}
        </Button>
      </div>
    </form>
  );
}
