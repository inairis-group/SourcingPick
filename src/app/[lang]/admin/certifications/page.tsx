import { notFound } from "next/navigation";
import { CertificationBody, CertificationStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { CertificationRow } from "./_components/certification-row";

const BODY_LABELS: Record<CertificationBody, string> = {
  BUREAU_VERITAS: "Bureau Veritas",
  AFNOR: "AFNOR",
  SGS: "SGS",
  LNE: "LNE",
};

const ACTIVE_STATUSES: CertificationStatus[] = [
  CertificationStatus.DOSSIER,
  CertificationStatus.AUDIT_PROGRAMME,
  CertificationStatus.EN_COURS,
];

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/certifications">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.certifications.title };
}

export default async function AdminCertificationsPage({
  params,
}: PageProps<"/[lang]/admin/certifications">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);

  const certs = await prisma.certification.findMany({
    where: { status: { in: ACTIVE_STATUSES } },
    orderBy: [{ status: "asc" }, { updatedAt: "asc" }],
    select: {
      id: true,
      reference: true,
      standard: true,
      body: true,
      status: true,
      progress: true,
      preAuditDate: true,
      auditDate: true,
      etaDate: true,
      createdAt: true,
      factoryOrg: {
        select: { displayName: true, country: true, city: true },
      },
      sponsorClientOrg: { select: { displayName: true } },
    },
  });

  const rows = certs.map((c) => ({
    id: c.id,
    reference: c.reference,
    standard: c.standard,
    body: c.body,
    bodyLabel: BODY_LABELS[c.body],
    status: c.status,
    progress: c.progress,
    factoryName: c.factoryOrg.displayName,
    factoryLocation: `${c.factoryOrg.city}, ${c.factoryOrg.country}`,
    sponsor: c.sponsorClientOrg?.displayName ?? null,
    enrolledAt: formatDate(c.createdAt, lang, "short"),
    preAuditDate: c.preAuditDate
      ? formatDate(c.preAuditDate, lang, "short")
      : null,
    auditDate: c.auditDate ? formatDate(c.auditDate, lang, "short") : null,
    etaDate: c.etaDate ? formatDate(c.etaDate, lang, "short") : null,
    preAuditIso: c.preAuditDate?.toISOString().slice(0, 10) ?? "",
    auditIso: c.auditDate?.toISOString().slice(0, 10) ?? "",
    etaIso: c.etaDate?.toISOString().slice(0, 10) ?? "",
  }));

  const grouped = new Map<CertificationStatus, typeof rows>();
  for (const r of rows) {
    if (!grouped.has(r.status)) grouped.set(r.status, []);
    grouped.get(r.status)!.push(r);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.admin.certifications.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.admin.certifications.title}
        </h1>
        <p className="text-sm text-muted">
          {dict.admin.certifications.description}
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-sm text-muted">
            {dict.admin.certifications.empty}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {ACTIVE_STATUSES.filter(
            (s) => (grouped.get(s)?.length ?? 0) > 0,
          ).map((status) => (
            <section key={status}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-faint mb-3">
                {dict.factory.certification.statuses[status]} ·{" "}
                {grouped.get(status)!.length}
              </h2>
              <div className="flex flex-col gap-3">
                {grouped.get(status)!.map((c) => (
                  <CertificationRow key={c.id} row={c} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
