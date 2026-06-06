import { notFound } from "next/navigation";
import { AdminScope, DisputeStatus } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ScrollIcon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import {
  DashboardHeader,
  KpiCard,
} from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/disputes">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.disputes.title };
}

export default async function AdminDisputesPage({
  params,
}: PageProps<"/[lang]/admin/disputes">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.DISPUTES);
  const dict = await getDictionary(lang);
  const t = dict.admin.disputes;

  const [open, responded, resolved, disputes] = await Promise.all([
    prisma.dispute.count({ where: { status: DisputeStatus.OPEN } }),
    prisma.dispute.count({ where: { status: DisputeStatus.RESPONDED } }),
    prisma.dispute.count({ where: { status: DisputeStatus.RESOLVED } }),
    prisma.dispute.findMany({
      orderBy: [{ status: "asc" }, { openedAt: "asc" }],
      take: 100,
      select: {
        id: true,
        reference: true,
        status: true,
        openedAt: true,
        respondedAt: true,
        order: {
          select: {
            reference: true,
            clientOrg: { select: { displayName: true } },
            factoryOrg: { select: { displayName: true } },
          },
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard label={t.kpiOpen} value={open} tone="warning" />
        <KpiCard label={t.kpiResponded} value={responded} tone="info" />
        <KpiCard label={t.kpiResolved} value={resolved} tone="neutral" />
      </div>

      {disputes.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-medium text-headline mb-2">
            {t.emptyTitle}
          </p>
          <p className="text-sm text-muted">{t.emptyBody}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {disputes.map((d) => (
            <li key={d.id}>
              <Link
                href={`/${lang}/admin/disputes/${d.id}`}
                variant="muted"
                className="block rounded-lg border border-line bg-surface p-4 hover:bg-subtle/30 transition-colors duration-fast"
              >
                <div className="flex items-start gap-3 flex-wrap">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning">
                    <HugeiconsIcon
                      icon={ScrollIcon}
                      size={16}
                      strokeWidth={1.5}
                    />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono uppercase tracking-wide text-faint">
                      {d.reference} · {d.order.reference}
                    </p>
                    <p className="text-sm font-semibold text-headline">
                      {d.order.clientOrg.displayName} ↔{" "}
                      {d.order.factoryOrg.displayName}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {t.openedOn}{" "}
                      {formatDate(d.openedAt, lang, "short")}
                      {d.respondedAt && (
                        <>
                          {" · "}
                          {t.respondedOn}{" "}
                          {formatDate(d.respondedAt, lang, "short")}
                        </>
                      )}
                    </p>
                  </div>
                  <StatusPill status={d.status} t={t.statuses} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusPill({
  status,
  t,
}: {
  status: DisputeStatus;
  t: Record<DisputeStatus, string>;
}) {
  const tones: Record<DisputeStatus, string> = {
    OPEN: "bg-warning-soft text-warning border-warning-edge",
    RESPONDED: "bg-info-soft text-info border-info-edge",
    RESOLVED: "bg-subtle text-muted border-line",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
        tones[status],
      )}
    >
      {t[status]}
    </span>
  );
}
