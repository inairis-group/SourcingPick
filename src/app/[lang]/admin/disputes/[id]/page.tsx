import { notFound } from "next/navigation";
import { AdminScope, DisputeStatus } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { computeDisputeRefund } from "@/lib/orders/pricing";
import { AdminDisputeResolver } from "./_components/dispute-resolver";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/disputes/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const dispute = await prisma.dispute.findUnique({
    where: { id },
    select: { reference: true },
  });
  return { title: dispute?.reference ?? "Dispute" };
}

export default async function AdminDisputeDetailPage({
  params,
}: PageProps<"/[lang]/admin/disputes/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.DISPUTES);
  const dict = await getDictionary(lang);
  const t = dict.admin.disputes;

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    select: {
      id: true,
      reference: true,
      status: true,
      outcome: true,
      buyerStatement: true,
      factoryStatement: true,
      adminDecision: true,
      refundCents: true,
      retainedCents: true,
      platformShareCents: true,
      supplierShareCents: true,
      openedAt: true,
      respondedAt: true,
      resolvedAt: true,
      openedBy: {
        select: { firstName: true, lastName: true, email: true },
      },
      resolvedBy: {
        select: { firstName: true, lastName: true, email: true },
      },
      order: {
        select: {
          id: true,
          reference: true,
          totalCents: true,
          depositCents: true,
          balanceCents: true,
          status: true,
          clientOrg: {
            select: { id: true, displayName: true, country: true },
          },
          factoryOrg: {
            select: { id: true, displayName: true, country: true },
          },
          escrows: {
            select: {
              id: true,
              reference: true,
              amountCents: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
  if (!dispute) notFound();

  // Live preview of the refund cents math for each outcome so admin
  // sees what the numbers would actually be before clicking the radio.
  const disputedCents = dispute.order.escrows
    .filter((e) => e.status === "DISPUTED" || e.status === "HELD")
    .reduce((sum, e) => sum + e.amountCents, 0);
  const standardSplit = computeDisputeRefund(disputedCents, "STANDARD");
  const customSplit = computeDisputeRefund(disputedCents, "CUSTOM");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/admin/disputes`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {t.backToList}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-[11px] font-mono uppercase tracking-wide text-faint">
          {dispute.reference} ·{" "}
          <Link
            href={`/${lang}/admin/audit?targetId=${dispute.order.id}`}
            variant="muted"
            className="text-link hover:text-link-hover"
          >
            {dispute.order.reference}
          </Link>
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {t.detailTitle}
        </h1>
        <p className="text-sm text-muted">
          {dispute.order.clientOrg.displayName} ({dispute.order.clientOrg.country}) ↔{" "}
          {dispute.order.factoryOrg.displayName} ({dispute.order.factoryOrg.country})
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <SummaryCard label={t.summaryTotal} value={formatEUR(dispute.order.totalCents / 100, lang)} />
        <SummaryCard label={t.summaryDeposit} value={formatEUR(dispute.order.depositCents / 100, lang)} />
        <SummaryCard label={t.summaryBalance} value={formatEUR(dispute.order.balanceCents / 100, lang)} />
      </div>

      <section className="flex flex-col gap-4 mb-6">
        <Statement
          eyebrow={`${t.openedBy} ${dispute.openedBy.firstName} ${dispute.openedBy.lastName} · ${formatDate(dispute.openedAt, lang, "medium")}`}
          label={t.buyerLabel}
          value={dispute.buyerStatement}
          tone="buyer"
        />
        {dispute.factoryStatement ? (
          <Statement
            eyebrow={
              dispute.respondedAt
                ? `${t.respondedOn} ${formatDate(dispute.respondedAt, lang, "medium")}`
                : ""
            }
            label={t.factoryLabel}
            value={dispute.factoryStatement}
            tone="factory"
          />
        ) : (
          <div className="rounded-md border border-line bg-subtle/40 p-3 text-sm text-muted italic">
            {t.factoryNoResponse}
          </div>
        )}
        {dispute.status === DisputeStatus.RESOLVED && dispute.adminDecision && (
          <Statement
            eyebrow={
              dispute.resolvedBy
                ? `${t.resolvedBy} ${dispute.resolvedBy.firstName} ${dispute.resolvedBy.lastName} · ${dispute.resolvedAt ? formatDate(dispute.resolvedAt, lang, "medium") : ""}`
                : ""
            }
            label={t.adminLabel}
            value={dispute.adminDecision}
            tone="admin"
          />
        )}
      </section>

      {dispute.status !== DisputeStatus.RESOLVED && (
        <AdminDisputeResolver
          disputeId={dispute.id}
          disputedCents={disputedCents}
          standard={standardSplit}
          custom={customSplit}
          lang={lang}
        />
      )}

      {dispute.status === DisputeStatus.RESOLVED && dispute.outcome && (
        <div className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-headline mb-3">
            {t.resolutionTitle}
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Detail label={t.outcomeLabel} value={t.outcomes[dispute.outcome]} />
            {dispute.refundCents != null && (
              <Detail
                label={t.refundCents}
                value={formatEUR(dispute.refundCents / 100, lang)}
              />
            )}
            {dispute.retainedCents != null && (
              <Detail
                label={t.retainedCents}
                value={formatEUR(dispute.retainedCents / 100, lang)}
              />
            )}
            {dispute.platformShareCents != null && (
              <Detail
                label={t.platformCents}
                value={formatEUR(dispute.platformShareCents / 100, lang)}
              />
            )}
            {dispute.supplierShareCents != null && (
              <Detail
                label={t.supplierCents}
                value={formatEUR(dispute.supplierShareCents / 100, lang)}
              />
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-faint mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold text-headline">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-faint">{label}</dt>
      <dd className="text-sm font-medium text-fg">{value}</dd>
    </div>
  );
}

function Statement({
  eyebrow,
  label,
  value,
  tone,
}: {
  eyebrow: string;
  label: string;
  value: string;
  tone: "buyer" | "factory" | "admin";
}) {
  const toneClass =
    tone === "admin"
      ? "border-brand-edge bg-brand-50/40"
      : tone === "factory"
        ? "border-line bg-surface"
        : "border-warning-edge bg-warning-soft/30";
  return (
    <div className={`rounded-md border p-4 ${toneClass}`}>
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-wide text-faint mb-1">
          {eyebrow}
        </p>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint mb-1">
        {label}
      </p>
      <p className="text-sm text-fg whitespace-pre-wrap wrap-break-word leading-relaxed">
        {value}
      </p>
    </div>
  );
}
