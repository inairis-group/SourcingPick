"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import { updateDeliveryEtasAction } from "@/lib/platform/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

type Etas = {
  africa: string | null;
  europe: string | null;
  americas: string | null;
  asia: string | null;
};

/**
 * Admin form for the per-continent estimated delivery windows. Free-text so
 * the admin can express ranges ("20–35 days") or qualifiers ("usually under
 * 4 weeks") without us baking units in.
 */
export function DeliveryEtasForm({ initial }: { initial: Etas }) {
  const dict = useDictionary();
  const router = useRouter();
  const [africa, setAfrica] = useState(initial.africa ?? "");
  const [europe, setEurope] = useState(initial.europe ?? "");
  const [americas, setAmericas] = useState(initial.americas ?? "");
  const [asia, setAsia] = useState(initial.asia ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateDeliveryEtasAction({
        africa,
        europe,
        americas,
        asia,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-headline">
          {dict.admin.deliveryEtas.title}
        </h2>
        <p className="text-xs text-muted mt-0.5">
          {dict.admin.deliveryEtas.description}
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && <FormError>{error}</FormError>}
        {saved && (
          <div className="rounded-md border border-success-edge bg-success-soft/30 px-3 py-2 text-xs text-success">
            {dict.admin.deliveryEtas.saved}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={dict.admin.deliveryEtas.africaLabel}>
            <Input
              value={africa}
              onChange={(e) => setAfrica(e.target.value)}
              placeholder="25–40 days"
              maxLength={120}
            />
          </Field>
          <Field label={dict.admin.deliveryEtas.europeLabel}>
            <Input
              value={europe}
              onChange={(e) => setEurope(e.target.value)}
              placeholder="10–18 days"
              maxLength={120}
            />
          </Field>
          <Field label={dict.admin.deliveryEtas.americasLabel}>
            <Input
              value={americas}
              onChange={(e) => setAmericas(e.target.value)}
              placeholder="20–35 days"
              maxLength={120}
            />
          </Field>
          <Field label={dict.admin.deliveryEtas.asiaLabel}>
            <Input
              value={asia}
              onChange={(e) => setAsia(e.target.value)}
              placeholder="7–14 days"
              maxLength={120}
            />
          </Field>
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" variant="primary" size="sm" loading={pending}>
            {dict.admin.deliveryEtas.save}
          </Button>
        </div>
      </form>
    </section>
  );
}
