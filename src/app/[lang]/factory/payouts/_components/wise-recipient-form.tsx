"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  setupWiseRecipientAction,
  type SetupRecipientState,
} from "@/lib/wise/recipient-actions";
import { useDictionary } from "@/lib/i18n/client-provider";

const INITIAL: SetupRecipientState = {};

type RecipientType = "IBAN" | "SWIFT" | "CHINESE_LOCAL";

export function WiseRecipientForm() {
  const dict = useDictionary();
  const [state, formAction, pending] = useActionState(
    setupWiseRecipientAction,
    INITIAL,
  );

  // Controlled so the conditional fields swap cleanly. The hidden `type`
  // input on the form still posts the value because the Select component
  // renders one with `name="type"`.
  const [type, setType] = useState<RecipientType>("IBAN");

  const t = dict.factory.payouts.wise;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormError>{state.error}</FormError>}

      <Field label={t.typeLabel} required>
        <Select
          name="type"
          value={type}
          onChange={(v) => setType(v as RecipientType)}
          options={[
            { value: "IBAN", label: t.types.IBAN },
            { value: "SWIFT", label: t.types.SWIFT },
            { value: "CHINESE_LOCAL", label: t.types.CHINESE_LOCAL },
          ]}
        />
      </Field>

      <Field label={t.holderNameLabel} required hint={t.holderNameHint}>
        <Input
          name="holderName"
          required
          maxLength={140}
          autoComplete="organization"
        />
      </Field>

      <Field label={t.currencyLabel} required>
        {type === "CHINESE_LOCAL" ? (
          <Input name="currency" value="CNY" readOnly />
        ) : (
          <Input
            name="currency"
            required
            maxLength={3}
            defaultValue={type === "IBAN" ? "EUR" : "USD"}
            placeholder={type === "IBAN" ? "EUR" : "USD"}
            className="uppercase"
          />
        )}
      </Field>

      {type === "IBAN" && (
        <Field label={t.ibanLabel} required hint={t.ibanHint}>
          <Input
            name="iban"
            required
            maxLength={34}
            placeholder="PT50 0002 0123 1234 5678 9012 1"
            className="font-mono"
          />
        </Field>
      )}

      {type === "SWIFT" && (
        <>
          <Field label={t.swiftCodeLabel} required hint={t.swiftCodeHint}>
            <Input
              name="swiftCode"
              required
              maxLength={11}
              placeholder="BNPAFRPP"
              className="font-mono uppercase"
            />
          </Field>
          <Field label={t.accountNumberLabel} required>
            <Input
              name="accountNumber"
              required
              maxLength={40}
              className="font-mono"
            />
          </Field>
        </>
      )}

      {type === "CHINESE_LOCAL" && (
        <>
          <Field label={t.bankCodeLabel} required hint={t.bankCodeHint}>
            <Input
              name="bankCode"
              required
              maxLength={20}
              placeholder="ICBC"
              className="font-mono uppercase"
            />
          </Field>
          <Field label={t.accountNumberLabel} required>
            <Input
              name="accountNumber"
              required
              maxLength={40}
              className="font-mono"
            />
          </Field>
        </>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="md" loading={pending}>
          {t.submitCta}
        </Button>
      </div>
    </form>
  );
}
