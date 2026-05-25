import { notFound } from "next/navigation";
import { CertificationBody, CertificationStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { SponsorButton } from "./_components/sponsor-button";
import { cn } from "@/lib/utils";

const BODY_LABELS: Record<CertificationBody, string> = {
  BUREAU_VERITAS: "Bureau Veritas",
  AFNOR: "AFNOR",
  SGS: "SGS",
  LNE: "LNE",
};

const STATUS_TONE: Record<CertificationStatus, string> = {
  DOSSIER: "bg-subtle text-muted border-line",
  AUDIT_PROGRAMME: "bg-info-soft text-info border-info-edge",
  EN_COURS: "bg-warning-soft text-warning border-warning-edge",
  CERTIFIE: "bg-success-soft text-success border-success-edge",
  REFUSE: "bg-danger-soft text-danger border-danger-edge",
};

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/certifications">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.client.certifications.title };
}

export default async function ClientCertificationsPage({
  params,
}: PageProps<"/[lang]/client/certifications">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);

  // Sponsorable: in-flight + no sponsor yet
  const [sponsorable, mine] = await Promise.all([
    prisma.certification.findMany({
      where: {
        sponsorClientOrgId: null,
        status: {
          in: [
            CertificationStatus.DOSSIER,
            CertificationStatus.AUDIT_PROGRAMME,
            CertificationStatus.EN_COURS,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        reference: true,
        standard: true,
        body: true,
        status: true,
        progress: true,
        etaDate: true,
        factoryOrg: {
          select: { displayName: true, country: true, city: true },
        },
      },
    }),
    prisma.certification.findMany({
      where: { sponsorClientOrgId: user.organizationId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        reference: true,
        standard: true,
        body: true,
        status: true,
        progress: true,
        issuedAt: true,
        expiresAt: true,
        factoryOrg: { select: { displayName: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.client.certifications.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.client.certifications.title}
        </h1>
        <p className="text-sm text-muted max-w-2xl">
          {dict.client.certifications.description}
        </p>
      </header>

      {mine.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
            {dict.client.certifications.mineTitle} · {mine.length}
          </h2>
          <ul className="flex flex-col gap-3">
            {mine.map((c) => (
              <li
                key={c.id}
                className="rounded-md border border-line bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs font-mono uppercase tracking-wide text-faint">
                      {c.reference}
                    </p>
                    <p className="text-sm font-semibold text-headline">
                      {c.standard}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {BODY_LABELS[c.body]} · {c.factoryOrg.displayName}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
                      STATUS_TONE[c.status],
                    )}
                  >
                    {dict.factory.certification.statuses[c.status]}
                  </span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-subtle overflow-hidden">
                  <div
                    className="h-full bg-action transition-all"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                {c.expiresAt && (
                  <p className="text-[11px] text-faint mt-2">
                    {dict.factory.certification.expiresLabel}{" "}
                    {formatDate(c.expiresAt, lang, "medium")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
          {dict.client.certifications.sponsorableTitle} · {sponsorable.length}
        </h2>
        {sponsorable.length === 0 ? (
          <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
            <p className="text-sm text-muted">
              {dict.client.certifications.empty}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {sponsorable.map((c) => (
              <li
                key={c.id}
                className="rounded-md border border-line bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="min-w-0">
                    <p className="text-xs font-mono uppercase tracking-wide text-faint">
                      {c.reference}
                    </p>
                    <p className="text-sm font-semibold text-headline">
                      {c.standard}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {BODY_LABELS[c.body]} · {c.factoryOrg.displayName} ·{" "}
                      {c.factoryOrg.city}, {c.factoryOrg.country}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
                      STATUS_TONE[c.status],
                    )}
                  >
                    {dict.factory.certification.statuses[c.status]}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-subtle overflow-hidden mb-3">
                  <div
                    className="h-full bg-action transition-all"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-line-subtle">
                  <span className="text-[11px] text-faint">
                    {c.etaDate
                      ? `${dict.factory.certification.etaLabel} ${formatDate(c.etaDate, lang, "short")}`
                      : ""}
                  </span>
                  <SponsorButton certificationId={c.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
