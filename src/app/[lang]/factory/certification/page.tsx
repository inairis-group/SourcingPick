import { notFound } from "next/navigation";
import { CertificationStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";
import { EnrollForm } from "./_components/enroll-form";
import { CertificationCard } from "./_components/certification-card";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/certification">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.factory.certification.title };
}

export default async function FactoryCertificationPage({
  params,
}: PageProps<"/[lang]/factory/certification">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

  const [certs, org] = await Promise.all([
    prisma.certification.findMany({
      where: { factoryOrgId: user.organizationId },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
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
        certificateUrl: true,
        issuedAt: true,
        expiresAt: true,
      },
    }),
    prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { kycStatus: true },
    }),
  ]);

  const kycVerified = org?.kycStatus === "VERIFIED";

  const active = certs.filter(
    (c) =>
      c.status !== CertificationStatus.CERTIFIE &&
      c.status !== CertificationStatus.REFUSE,
  );
  const closed = certs.filter(
    (c) =>
      c.status === CertificationStatus.CERTIFIE ||
      c.status === CertificationStatus.REFUSE,
  );

  const renderCard = (c: (typeof certs)[number]) => (
    <CertificationCard
      key={c.id}
      lang={lang}
      cert={{
        id: c.id,
        reference: c.reference,
        standard: c.standard,
        body: c.body,
        status: c.status,
        progress: c.progress,
        preAuditDate: c.preAuditDate ? formatDate(c.preAuditDate, lang, "medium") : null,
        auditDate: c.auditDate ? formatDate(c.auditDate, lang, "medium") : null,
        etaDate: c.etaDate ? formatDate(c.etaDate, lang, "medium") : null,
        issuedAt: c.issuedAt ? formatDate(c.issuedAt, lang, "medium") : null,
        expiresAt: c.expiresAt ? formatDate(c.expiresAt, lang, "medium") : null,
        certificateUrl: c.certificateUrl,
        sponsor: null,
      }}
    />
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.factory.certification.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.factory.certification.title}
        </h1>
        <p className="text-sm text-muted max-w-2xl">
          {dict.factory.certification.description}
        </p>
      </header>

      {!kycVerified && (
        <div className="rounded-lg border border-warning-edge bg-warning-soft/40 px-4 py-3 mb-6 text-sm text-fg">
          <p className="font-semibold text-headline">
            {dict.factory.certification.kycRequiredTitle}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {dict.factory.certification.kycRequiredBody}
          </p>
        </div>
      )}

      <section className="rounded-lg border border-line bg-surface p-5 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-2">
          {dict.factory.certification.enrollTitle}
        </h2>
        <p className="text-xs text-muted mb-4">
          {dict.factory.certification.enrollDescription}
        </p>
        <EnrollForm disabled={!kycVerified} />
      </section>

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-faint mb-3">
            {dict.factory.certification.activeTitle} · {active.length}
          </h2>
          <div className="flex flex-col gap-3">{active.map(renderCard)}</div>
        </section>
      )}

      {closed.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-faint mb-3">
            {dict.factory.certification.closedTitle} · {closed.length}
          </h2>
          <div className="flex flex-col gap-3">{closed.map(renderCard)}</div>
        </section>
      )}

      {certs.length === 0 && (
        <div
          className={cn(
            "rounded-lg border border-line bg-surface px-6 py-12 text-center",
          )}
        >
          <p className="text-sm text-muted">
            {dict.factory.certification.empty}
          </p>
        </div>
      )}
    </div>
  );
}
