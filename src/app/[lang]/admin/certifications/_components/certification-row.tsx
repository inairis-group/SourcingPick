"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CertificationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import { advanceCertificationAction } from "@/lib/certifications/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

export type CertRow = {
  id: string;
  reference: string;
  standard: string;
  body: string;
  bodyLabel: string;
  status: CertificationStatus;
  progress: number;
  factoryName: string;
  factoryLocation: string;
  sponsor: string | null;
  enrolledAt: string;
  preAuditDate: string | null;
  auditDate: string | null;
  etaDate: string | null;
  preAuditIso: string;
  auditIso: string;
  etaIso: string;
};

const TRANSITIONS: Record<CertificationStatus, CertificationStatus[]> = {
  DOSSIER: [
    CertificationStatus.AUDIT_PROGRAMME,
    CertificationStatus.REFUSE,
  ],
  AUDIT_PROGRAMME: [
    CertificationStatus.EN_COURS,
    CertificationStatus.REFUSE,
  ],
  EN_COURS: [CertificationStatus.CERTIFIE, CertificationStatus.REFUSE],
  CERTIFIE: [],
  REFUSE: [],
};

export function CertificationRow({ row }: { row: CertRow }) {
  const dict = useDictionary();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [nextStatus, setNextStatus] = useState<CertificationStatus | "">("");
  const [_, startTransition] = useTransition();

  const choices = TRANSITIONS[row.status];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await advanceCertificationAction(formData);
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <article className="rounded-lg border border-line bg-surface p-5">
      <header className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div className="min-w-0">
          <p className="text-xs font-mono uppercase tracking-wide text-faint">
            {row.reference}
          </p>
          <h3 className="text-base font-semibold text-headline">
            {row.standard}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            {row.bodyLabel} · {row.factoryName} · {row.factoryLocation}
            {row.sponsor && (
              <>
                {" · "}
                <span className="text-brand-700 font-medium">
                  {dict.admin.certifications.sponsorPrefix} {row.sponsor}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="text-end">
          <p className="text-[10px] uppercase tracking-wide text-faint">
            {dict.admin.certifications.enrolledOn}
          </p>
          <p className="text-xs text-fg">{row.enrolledAt}</p>
        </div>
      </header>

      <div className="mb-4">
        <div className="h-1.5 rounded-full bg-subtle overflow-hidden">
          <div
            className="h-full bg-action transition-all"
            style={{ width: `${row.progress}%` }}
          />
        </div>
        <p className="text-[10px] text-faint mt-1 uppercase tracking-wide">
          {row.progress}%
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-3">
        {row.preAuditDate && (
          <Detail
            label={dict.factory.certification.preAuditLabel}
            value={row.preAuditDate}
          />
        )}
        {row.auditDate && (
          <Detail
            label={dict.factory.certification.auditLabel}
            value={row.auditDate}
          />
        )}
        {row.etaDate && (
          <Detail
            label={dict.factory.certification.etaLabel}
            value={row.etaDate}
          />
        )}
      </div>

      {choices.length > 0 && (
        <div className="pt-3 border-t border-line-subtle flex items-center justify-end">
          {!open ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setOpen(true)}
            >
              {dict.admin.certifications.advanceCta}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              {dict.admin.certifications.cancel}
            </Button>
          )}
        </div>
      )}

      {open && (
        <form
          onSubmit={onSubmit}
          className="mt-3 rounded-md border border-line bg-subtle p-4 flex flex-col gap-3"
        >
          {error && <FormError>{error}</FormError>}
          <input type="hidden" name="certificationId" value={row.id} />

          <Field label={dict.admin.certifications.nextStatusLabel} required>
            <Select
              name="nextStatus"
              required
              value={nextStatus}
              onChange={(v) => setNextStatus(v as CertificationStatus)}
              placeholder={dict.admin.certifications.nextStatusPlaceholder}
              options={choices.map((s) => ({
                value: s,
                label: dict.factory.certification.statuses[s],
              }))}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label={dict.factory.certification.preAuditLabel}>
              <Input
                name="preAuditDate"
                type="date"
                defaultValue={row.preAuditIso}
              />
            </Field>
            <Field label={dict.factory.certification.auditLabel}>
              <Input
                name="auditDate"
                type="date"
                defaultValue={row.auditIso}
              />
            </Field>
            <Field label={dict.factory.certification.etaLabel}>
              <Input name="etaDate" type="date" defaultValue={row.etaIso} />
            </Field>
          </div>

          {nextStatus === CertificationStatus.CERTIFIE && (
            <div className="rounded-md border border-success-edge bg-success-soft/30 p-3 flex flex-col gap-3">
              <p className="text-xs font-semibold text-success uppercase tracking-wide">
                {dict.admin.certifications.certifiedRequiresAll}
              </p>
              <Field
                label={dict.admin.certifications.certificateUrlLabel}
                required
              >
                <Input
                  name="certificateUrl"
                  type="url"
                  required
                  placeholder="https://…"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label={dict.factory.certification.issuedLabel}
                  required
                >
                  <Input name="issuedAt" type="date" required />
                </Field>
                <Field
                  label={dict.factory.certification.expiresLabel}
                  required
                >
                  <Input name="expiresAt" type="date" required />
                </Field>
              </div>
            </div>
          )}

          <Field
            label={dict.admin.certifications.progressLabel}
            hint={dict.admin.certifications.progressHint}
          >
            <Input
              name="progress"
              type="number"
              min={0}
              max={100}
              placeholder={String(row.progress)}
            />
          </Field>

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={pending}
              disabled={!nextStatus}
            >
              {dict.admin.certifications.applyCta}
            </Button>
          </div>
        </form>
      )}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("flex flex-col")}>
      <span className="text-[10px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <span className="text-sm font-medium text-fg">{value}</span>
    </div>
  );
}
