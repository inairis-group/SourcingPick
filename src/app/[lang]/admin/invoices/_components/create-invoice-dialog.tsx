"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrgType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminCreateInvoiceAction,
  adminOrgSearchAction,
} from "@/lib/invoices/admin-actions";
import { useDictionary } from "@/lib/i18n/client-provider";

/**
 * Create-invoice dialog for the admin invoices index. Two stages
 * shown inline — pick recipient type → pick the actual org → fill
 * line + amount → submit.
 */
export function CreateInvoiceDialog() {
  const dict = useDictionary();
  const t = dict.admin.invoices.create;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_, startTransition] = useTransition();

  const [recipientType, setRecipientType] = useState<OrgType>(OrgType.CLIENT);
  const [orgQuery, setOrgQuery] = useState("");
  const [orgs, setOrgs] = useState<
    Array<{ id: string; displayName: string; country: string }>
  >([]);
  const [recipientOrgId, setRecipientOrgId] = useState<string>("");

  const [lineDescription, setLineDescription] = useState("");
  const [amountEur, setAmountEur] = useState("");
  const [vatPct, setVatPct] = useState("20");
  const [dueInDays, setDueInDays] = useState("14");
  const [orderRef, setOrderRef] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const id = setTimeout(async () => {
      try {
        const rows = await adminOrgSearchAction({
          type: recipientType,
          query: orgQuery,
        });
        if (cancelled) return;
        setOrgs(rows);
        // Reset selection whenever the underlying list changes — using
        // the effect's own `rows` rather than tying the deps to
        // `recipientOrgId` (which would cause refetch loops).
        setRecipientOrgId((current) =>
          rows.find((r) => r.id === current) ? current : (rows[0]?.id ?? ""),
        );
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Lookup failed.");
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [open, recipientType, orgQuery]);

  const submit = () => {
    setError(null);
    const cents = Math.round(Number(amountEur) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      setError(t.errorAmount);
      return;
    }
    if (!recipientOrgId) {
      setError(t.errorRecipient);
      return;
    }
    setPending(true);
    startTransition(async () => {
      const r = await adminCreateInvoiceAction({
        recipientOrgId,
        amountCents: cents,
        vatRateBps: Math.round(Number(vatPct) * 100),
        lineDescription: lineDescription.trim(),
        dueInDays: Number(dueInDays),
        orderId: orderRef.trim() || undefined,
      });
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setOpen(false);
      // Reset fields so the next open is clean.
      setLineDescription("");
      setAmountEur("");
      setOrderRef("");
      router.refresh();
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={() => setOpen(true)}
      >
        {t.openCta}
      </Button>

      <Dialog
        open={open}
        onClose={(v) => !pending && setOpen(v)}
        size="lg"
      >
        <DialogTitle>{t.title}</DialogTitle>
        <DialogDescription>{t.body}</DialogDescription>

        {error && <FormError className="mb-3">{error}</FormError>}

        <div className="flex flex-col gap-3">
          {/* Recipient type tabs. Agents live inside the PLATFORM
              org, so an "agent" invoice is technically issued to
              PLATFORM with the agent's name in the line. */}
          <div className="flex items-center gap-1 flex-wrap">
            {(
              [
                { v: OrgType.CLIENT, label: t.typeClient },
                { v: OrgType.FACTORY, label: t.typeFactory },
                { v: OrgType.PLATFORM, label: t.typeAgent },
              ] as const
            ).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => {
                  setRecipientType(opt.v);
                  setRecipientOrgId("");
                }}
                className={`h-7 px-3 rounded-full text-[11px] font-medium ${
                  recipientType === opt.v
                    ? "bg-action text-on-action"
                    : "bg-subtle text-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={t.searchOrgLabel}>
              <Input
                value={orgQuery}
                onChange={(e) => setOrgQuery(e.target.value)}
                placeholder={t.searchOrgPlaceholder}
                maxLength={100}
              />
            </Field>
            <Field label={t.recipientOrgLabel} required>
              <Select
                inline
                value={recipientOrgId}
                onChange={(v) => setRecipientOrgId(v)}
                options={
                  orgs.length === 0
                    ? [{ value: "", label: t.noMatches, disabled: true }]
                    : orgs.map((o) => ({
                        value: o.id,
                        label: `${o.displayName} (${o.country})`,
                      }))
                }
              />
            </Field>
          </div>

          <Field label={t.lineLabel} required>
            <textarea
              value={lineDescription}
              onChange={(e) => setLineDescription(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder={t.linePlaceholder}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:outline-2 focus:outline-focus focus:outline-offset-1"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label={t.amountLabel} required>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amountEur}
                onChange={(e) => setAmountEur(e.target.value)}
                placeholder="100.00"
              />
            </Field>
            <Field label={t.vatLabel} hint="0–30">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                max="30"
                step="0.1"
                value={vatPct}
                onChange={(e) => setVatPct(e.target.value)}
              />
            </Field>
            <Field label={t.dueDaysLabel}>
              <Input
                type="number"
                inputMode="numeric"
                min="0"
                max="180"
                step="1"
                value={dueInDays}
                onChange={(e) => setDueInDays(e.target.value)}
              />
            </Field>
          </div>

          <Field label={t.orderRefLabel} hint={t.orderRefHint}>
            <Input
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="cuid…"
              maxLength={50}
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
