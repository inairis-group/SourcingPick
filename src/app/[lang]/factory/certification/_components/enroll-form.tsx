"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CertificationBody } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Select } from "@/components/ui/select";
import { enrollCertificationAction } from "@/lib/certifications/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

const BODY_LABELS: Record<CertificationBody, string> = {
  BUREAU_VERITAS: "Bureau Veritas",
  AFNOR: "AFNOR",
  SGS: "SGS",
  LNE: "LNE",
};

const STANDARD_SUGGESTIONS = [
  "ISO 9001:2015",
  "ISO 14001:2015",
  "ISO 45001:2018",
  "CE",
  "GOTS",
  "OEKO-TEX Standard 100",
  "FSC",
  "BSCI",
];

export function EnrollForm({ disabled }: { disabled?: boolean }) {
  const dict = useDictionary();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await enrollCertificationAction(formData);
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      (e.target as HTMLFormElement).reset();
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && <FormError>{error}</FormError>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={dict.factory.certification.standardLabel}
          required
          hint={dict.factory.certification.standardHint}
        >
          <>
            <Input
              name="standard"
              list="cert-standards"
              required
              maxLength={120}
              disabled={disabled}
              placeholder="ISO 9001:2015"
            />
            <datalist id="cert-standards">
              {STANDARD_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </>
        </Field>
        <Field
          label={dict.factory.certification.bodyLabel}
          required
        >
          <Select
            name="body"
            required
            disabled={disabled}
            placeholder={dict.factory.certification.bodyPlaceholder}
            options={Object.entries(BODY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Field>
      </div>
      <Field
        label={dict.factory.certification.targetMonthsLabel}
        hint={dict.factory.certification.targetMonthsHint}
      >
        <Input
          name="targetMonths"
          type="number"
          min={1}
          max={24}
          disabled={disabled}
          placeholder="6"
        />
      </Field>
      <div className="pt-1 flex items-center justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={pending}
          disabled={disabled}
        >
          {dict.factory.certification.enrollCta}
        </Button>
      </div>
    </form>
  );
}
