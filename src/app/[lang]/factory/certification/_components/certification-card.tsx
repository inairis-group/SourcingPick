"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CertificationBody, CertificationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { withdrawCertificationAction } from "@/lib/certifications/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

const BODY_LABELS: Record<CertificationBody, string> = {
  BUREAU_VERITAS: "Bureau Veritas",
  AFNOR: "AFNOR",
  SGS: "SGS",
  LNE: "LNE",
};

export type CertCardData = {
  id: string;
  reference: string;
  standard: string;
  body: CertificationBody;
  status: CertificationStatus;
  progress: number;
  preAuditDate: string | null;
  auditDate: string | null;
  etaDate: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  certificateUrl: string | null;
  sponsor: string | null;
};

export function CertificationCard({
  cert,
  lang,
}: {
  cert: CertCardData;
  lang: string;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  void lang;

  const onWithdraw = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await withdrawCertificationAction(cert.id);
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const canWithdraw =
    cert.status === CertificationStatus.DOSSIER ||
    cert.status === CertificationStatus.AUDIT_PROGRAMME;

  return (
    <article className="rounded-lg border border-line bg-surface p-5">
      <header className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div className="min-w-0">
          <p className="text-xs font-mono uppercase tracking-wide text-faint">
            {cert.reference}
          </p>
          <h3 className="text-base font-semibold text-headline">
            {cert.standard}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            {BODY_LABELS[cert.body]}
            {cert.sponsor && (
              <>
                {" · "}
                <span className="font-medium text-brand-700">
                  {dict.factory.certification.sponsoredBy} {cert.sponsor}
                </span>
              </>
            )}
          </p>
        </div>
        <StatusPill status={cert.status} dict={dict} />
      </header>

      <div className="mb-4">
        <div className="h-1.5 rounded-full bg-subtle overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-base",
              cert.status === CertificationStatus.CERTIFIE
                ? "bg-success"
                : cert.status === CertificationStatus.REFUSE
                  ? "bg-danger"
                  : "bg-action",
            )}
            style={{ width: `${cert.progress}%` }}
          />
        </div>
        <p className="text-[10px] text-faint mt-1 uppercase tracking-wide">
          {cert.progress}%
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {cert.preAuditDate && (
          <Detail
            label={dict.factory.certification.preAuditLabel}
            value={cert.preAuditDate}
          />
        )}
        {cert.auditDate && (
          <Detail
            label={dict.factory.certification.auditLabel}
            value={cert.auditDate}
          />
        )}
        {cert.etaDate && (
          <Detail
            label={dict.factory.certification.etaLabel}
            value={cert.etaDate}
          />
        )}
        {cert.issuedAt && (
          <Detail
            label={dict.factory.certification.issuedLabel}
            value={cert.issuedAt}
          />
        )}
        {cert.expiresAt && (
          <Detail
            label={dict.factory.certification.expiresLabel}
            value={cert.expiresAt}
          />
        )}
      </div>

      {(cert.certificateUrl || canWithdraw) && (
        <div className="mt-4 pt-3 border-t border-line-subtle flex items-center justify-end gap-2 flex-wrap">
          {error && <FormError>{error}</FormError>}
          {cert.certificateUrl && (
            <a
              href={cert.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-link hover:text-link-hover underline underline-offset-2"
            >
              {dict.factory.certification.viewCertificate}
            </a>
          )}
          {canWithdraw && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onWithdraw}
              loading={pending}
            >
              {dict.factory.certification.withdrawCta}
            </Button>
          )}
        </div>
      )}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <span className="text-sm font-medium text-fg">{value}</span>
    </div>
  );
}

function StatusPill({
  status,
  dict,
}: {
  status: CertificationStatus;
  dict: ReturnType<typeof useDictionary>;
}) {
  const map: Record<CertificationStatus, string> = {
    DOSSIER: "bg-subtle text-muted border-line",
    AUDIT_PROGRAMME: "bg-info-soft text-info border-info-edge",
    EN_COURS: "bg-warning-soft text-warning border-warning-edge",
    CERTIFIE: "bg-success-soft text-success border-success-edge",
    REFUSE: "bg-danger-soft text-danger border-danger-edge",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
        map[status],
      )}
    >
      {dict.factory.certification.statuses[status]}
    </span>
  );
}
