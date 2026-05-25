"use client";

import { useActionState } from "react";
import { Incoterm } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Select } from "@/components/ui/select";
import { submitQuoteAction, type SubmitQuoteState } from "@/lib/sourcing/tender-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

const INITIAL: SubmitQuoteState = {};
const INCOTERMS: Incoterm[] = [
  Incoterm.EXW,
  Incoterm.FOB,
  Incoterm.DAP,
  Incoterm.DDP,
  Incoterm.CIF,
];

export function QuoteForm({
  invitationId,
  defaultQuantity,
  defaultIncoterm,
}: {
  invitationId: string;
  defaultQuantity: number;
  defaultIncoterm: Incoterm;
}) {
  const dict = useDictionary();
  const [state, formAction, pending] = useActionState(submitQuoteAction, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormError>{state.error}</FormError>}
      <input type="hidden" name="invitationId" value={invitationId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={dict.factory.tenders.unitPriceLabel} required hint={dict.client.requests.priceHintEur}>
          <Input
            type="number"
            name="unitPriceEur"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
          />
        </Field>
        <Field label={dict.client.requests.quantityLabel} required>
          <Input
            type="number"
            name="quantity"
            inputMode="numeric"
            min="1"
            required
            defaultValue={defaultQuantity}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={dict.factory.tenders.leadTimeLabel}
          required
          hint={dict.factory.tenders.daysSuffix}
        >
          <Input
            type="number"
            name="leadTimeDays"
            inputMode="numeric"
            min="1"
            required
          />
        </Field>
        <Field label={dict.factory.tenders.moqLabel} required>
          <Input
            type="number"
            name="moq"
            inputMode="numeric"
            min="0"
            required
            defaultValue="0"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={dict.client.requests.incotermLabel} required>
          <Select
            name="incoterm"
            required
            defaultValue={defaultIncoterm}
            options={INCOTERMS.map((i) => ({
              value: i,
              label: `${i} — ${dict.client.requests.incoterms[i]}`,
            }))}
          />
        </Field>
        <Field
          label={dict.factory.tenders.validityLabel}
          hint={dict.factory.tenders.validityHint}
        >
          <Input
            type="number"
            name="validityDays"
            inputMode="numeric"
            min="1"
            max="60"
            defaultValue="14"
          />
        </Field>
      </div>

      <Field
        label={dict.factory.tenders.notesLabel}
        hint={dict.factory.tenders.notesHint}
      >
        <textarea
          name="notes"
          rows={4}
          className={cn(
            "w-full rounded-sm border bg-surface text-fg placeholder:text-faint p-3 text-base resize-y",
            "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
          )}
          placeholder={dict.factory.tenders.notesPlaceholder}
        />
      </Field>

      <div className="pt-2">
        <Button type="submit" variant="primary" size="md" loading={pending}>
          {dict.factory.tenders.submitQuote}
        </Button>
      </div>
    </form>
  );
}
