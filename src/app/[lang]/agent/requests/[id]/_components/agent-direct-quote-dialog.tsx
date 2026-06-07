"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Incoterm } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogActions,
} from "@/components/ui/dialog";
import { agentSubmitDirectQuoteAction } from "@/lib/sourcing/agent-quote-actions";
import { useDictionary } from "@/lib/i18n/client-provider";

type ExistingFactory = {
  id: string;
  displayName: string;
  country: string;
};

/**
 * Agent-direct quote entry — partner round 4. The agent picks a
 * registered factory OR enters an off-platform one (we mint a shadow
 * Organization), enters the offer details, and a Quote lands at
 * SENT_TO_CLIENT ready for the buyer to act on.
 */
export function AgentDirectQuoteDialog({
  requestId,
  factories,
}: {
  requestId: string;
  factories: ExistingFactory[];
}) {
  const dict = useDictionary();
  const t = dict.agent.directQuote;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_, startTransition] = useTransition();

  // Source selector
  const [source, setSource] = useState<"registered" | "offplatform">(
    factories.length > 0 ? "registered" : "offplatform",
  );

  // Form state
  const [factoryOrgId, setFactoryOrgId] = useState(factories[0]?.id ?? "");
  const [factoryName, setFactoryName] = useState("");
  const [factoryCountry, setFactoryCountry] = useState("CN");
  const [factoryCity, setFactoryCity] = useState("");
  const [unitPriceEur, setUnitPriceEur] = useState("");
  const [quantity, setQuantity] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [moq, setMoq] = useState("1");
  const [incoterm, setIncoterm] = useState<Incoterm>(Incoterm.DAP);
  const [depositPercentage, setDepositPercentage] = useState("30");
  const [validityDays, setValidityDays] = useState("14");
  const [notes, setNotes] = useState("");

  const submit = () => {
    setError(null);
    const cents = Math.round(Number(unitPriceEur) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      setError(t.errorPrice);
      return;
    }
    setPending(true);
    startTransition(async () => {
      const r = await agentSubmitDirectQuoteAction({
        requestId,
        factoryOrgId: source === "registered" ? factoryOrgId : undefined,
        factoryName: source === "offplatform" ? factoryName : undefined,
        factoryCountry: source === "offplatform" ? factoryCountry : undefined,
        factoryCity:
          source === "offplatform" && factoryCity ? factoryCity : undefined,
        unitPriceCentsFactory: cents,
        quantity: Number(quantity),
        leadTimeDays: Number(leadTimeDays),
        moq: Number(moq),
        incoterm,
        depositPercentage: Number(depositPercentage),
        validityDays: Number(validityDays),
        notes: notes.trim() || undefined,
      });
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        {t.openCta}
      </Button>

      <Dialog
        open={open}
        onClose={(v) => !pending && setOpen(v)}
        size="lg"
      >
        <DialogTitle>{t.dialogTitle}</DialogTitle>
        <DialogDescription>{t.dialogBody}</DialogDescription>

        {error && <FormError className="mb-3">{error}</FormError>}

        <div className="flex flex-col gap-3">
          {/* Source picker */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setSource("registered")}
              disabled={factories.length === 0}
              className={`h-7 px-3 rounded-full text-[11px] font-medium ${
                source === "registered"
                  ? "bg-action text-on-action"
                  : "bg-subtle text-muted"
              } disabled:opacity-50`}
            >
              {t.sourceRegistered}
            </button>
            <button
              type="button"
              onClick={() => setSource("offplatform")}
              className={`h-7 px-3 rounded-full text-[11px] font-medium ${
                source === "offplatform"
                  ? "bg-action text-on-action"
                  : "bg-subtle text-muted"
              }`}
            >
              {t.sourceOffPlatform}
            </button>
          </div>

          {source === "registered" ? (
            <Field label={t.factoryLabel} required>
              <Select
                inline
                value={factoryOrgId}
                onChange={(v) => setFactoryOrgId(v)}
                options={factories.map((f) => ({
                  value: f.id,
                  label: `${f.displayName} (${f.country})`,
                }))}
              />
            </Field>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label={t.offPlatformName} required>
                <Input
                  value={factoryName}
                  onChange={(e) => setFactoryName(e.target.value)}
                  maxLength={200}
                  placeholder="Shenzhen Acme Mfg Co."
                />
              </Field>
              <Field label={t.offPlatformCountry} required hint="ISO 2">
                <Input
                  value={factoryCountry}
                  onChange={(e) =>
                    setFactoryCountry(
                      e.target.value.toUpperCase().slice(0, 2),
                    )
                  }
                  minLength={2}
                  maxLength={2}
                  className="font-mono uppercase"
                  placeholder="CN"
                />
              </Field>
              <Field label={t.offPlatformCity}>
                <Input
                  value={factoryCity}
                  onChange={(e) => setFactoryCity(e.target.value)}
                  maxLength={100}
                  placeholder="Shenzhen"
                />
              </Field>
            </div>
          )}

          {/* Offer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={t.unitPriceLabel} required>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={unitPriceEur}
                onChange={(e) => setUnitPriceEur(e.target.value)}
                placeholder="12.50"
              />
            </Field>
            <Field label={t.quantityLabel} required>
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Field>
            <Field label={t.leadTimeLabel} required>
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                placeholder="30"
              />
            </Field>
            <Field label={t.moqLabel} required>
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={moq}
                onChange={(e) => setMoq(e.target.value)}
              />
            </Field>
            <Field label={t.incotermLabel} required>
              <Select
                inline
                value={incoterm}
                onChange={(v) => setIncoterm(v as Incoterm)}
                options={(
                  [
                    Incoterm.EXW,
                    Incoterm.FOB,
                    Incoterm.DAP,
                    Incoterm.DDP,
                    Incoterm.CIF,
                  ] as const
                ).map((i) => ({ value: i, label: i }))}
              />
            </Field>
            <Field label={t.depositLabel} required hint="30–50%">
              <Input
                type="number"
                inputMode="numeric"
                min="30"
                max="50"
                step="1"
                value={depositPercentage}
                onChange={(e) => setDepositPercentage(e.target.value)}
              />
            </Field>
            <Field label={t.validityLabel} required>
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                max="60"
                step="1"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
              />
            </Field>
          </div>

          <Field label={t.notesLabel} hint={t.notesHint}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:outline-2 focus:outline-focus focus:outline-offset-1"
            />
          </Field>
        </div>

        <DialogActions>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            {t.cancelCta}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={submit}
            loading={pending}
          >
            {t.submitCta}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
