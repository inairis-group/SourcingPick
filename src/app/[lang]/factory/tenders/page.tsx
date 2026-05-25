import { notFound } from "next/navigation";
import { Role, TenderInvitationStatus } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatNumber } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/tenders">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.factory.tenders.title };
}

export default async function FactoryTendersPage({
  params,
}: PageProps<"/[lang]/factory/tenders">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

  const tenders = await prisma.tenderInvitation.findMany({
    where: { factoryOrgId: user.organizationId },
    orderBy: [{ status: "asc" }, { invitedAt: "desc" }],
    select: {
      id: true,
      status: true,
      invitedAt: true,
      respondedAt: true,
      expiresAt: true,
      matchingScore: true,
      request: {
        select: {
          reference: true,
          title: true,
          category: true,
          quantity: true,
          deadline: true,
          sourcingRegion: true,
          incoterm: true,
        },
      },
    },
  });

  const now = Date.now();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.factory.tenders.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.factory.tenders.title}
        </h1>
        <p className="text-sm text-muted">{dict.factory.tenders.description}</p>
      </header>

      {tenders.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-medium text-headline mb-2">
            {dict.factory.tenders.emptyTitle}
          </p>
          <p className="text-sm text-muted max-w-md mx-auto">
            {dict.factory.tenders.emptyBody}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {tenders.map((t) => {
            const isExpired = t.expiresAt.getTime() < now;
            const effectiveStatus =
              isExpired && t.status === TenderInvitationStatus.INVITED
                ? TenderInvitationStatus.EXPIRED
                : t.status;
            const canRespond = effectiveStatus === TenderInvitationStatus.INVITED;
            return (
              <li key={t.id}>
                <Link
                  href={`/${lang}/factory/tenders/${t.id}`}
                  variant="muted"
                  className="block rounded-lg border border-line bg-surface p-4 hover:bg-subtle transition-colors duration-fast"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-xs font-mono uppercase tracking-wide text-faint">
                        {t.request.reference}
                      </p>
                      <h3 className="text-base font-semibold text-headline">
                        {t.request.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <MatchPill score={t.matchingScore} dict={dict} />
                      <TenderStatusPill status={effectiveStatus} dict={dict} />
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-line-subtle text-xs text-muted">
                    <span>{dict.categories[t.request.category]}</span>
                    <span>{formatNumber(t.request.quantity, lang)} units</span>
                    <span>{t.request.incoterm}</span>
                    <span>{dict.client.requests.regions[t.request.sourcingRegion]}</span>
                    <span>
                      {dict.factory.tenders.respondBy}{" "}
                      {formatDate(t.expiresAt, lang, "short")}
                    </span>
                    {canRespond && (
                      <span className="ms-auto text-action font-medium">
                        {dict.factory.tenders.respondCta} →
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TenderStatusPill({
  status,
  dict,
}: {
  status: TenderInvitationStatus;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const map: Record<
    TenderInvitationStatus,
    { label: string; classes: string }
  > = {
    INVITED: {
      label: dict.factory.tenders.statusInvited,
      classes: "bg-info-soft text-info border-info-edge",
    },
    VIEWED: {
      label: dict.factory.tenders.statusViewed,
      classes: "bg-warning-soft text-warning border-warning-edge",
    },
    RESPONDED: {
      label: dict.factory.tenders.statusResponded,
      classes: "bg-success-soft text-success border-success-edge",
    },
    DECLINED: {
      label: dict.factory.tenders.statusDeclined,
      classes: "bg-subtle text-muted border-line",
    },
    EXPIRED: {
      label: dict.factory.tenders.statusExpired,
      classes: "bg-subtle text-faint border-line",
    },
  };
  const { label, classes } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide whitespace-nowrap",
        classes,
      )}
    >
      {label}
    </span>
  );
}

function MatchPill({
  score,
  dict,
}: {
  score: number;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const tone = score >= 80 ? "success" : score >= 60 ? "info" : "warn";
  const toneClasses = {
    success: "bg-success-soft text-success border-success-edge",
    info: "bg-info-soft text-info border-info-edge",
    warn: "bg-warning-soft text-warning border-warning-edge",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium whitespace-nowrap",
        toneClasses[tone],
      )}
    >
      {dict.factory.tenders.matchScore}: {score}
    </span>
  );
}
