import { notFound } from "next/navigation";
import { AuctionStatus, Role } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/auctions">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.factory.auctions.title };
}

export default async function FactoryAuctionsPage({
  params,
}: PageProps<"/[lang]/factory/auctions">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

  const auctions = await prisma.auction.findMany({
    where: {
      factoryOrgId: user.organizationId,
      deletedAt: null,
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      reference: true,
      title: true,
      status: true,
      startingBidCents: true,
      reserveCents: true,
      startsAt: true,
      endsAt: true,
      _count: { select: { bids: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.factory.auctions.eyebrow}
        title={dict.factory.auctions.title}
        description={dict.factory.auctions.description}
        actions={
          <Link
            href={`/${lang}/factory/auctions/new`}
            variant="muted"
            className={cn(
              "inline-flex items-center gap-2 h-9 px-3.5 rounded-md text-sm font-medium",
              "bg-action text-on-action hover:bg-action-hover transition-colors duration-fast",
            )}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={1.75} />
            {dict.factory.auctions.newCta}
          </Link>
        }
      />

      {auctions.length === 0 ? (
        <div className="mt-8 rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-semibold text-headline">
            {dict.factory.auctions.emptyTitle}
          </p>
          <p className="text-xs text-muted mt-1">
            {dict.factory.auctions.emptyBody}
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {auctions.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-line bg-surface p-4 hover:bg-subtle transition-colors duration-fast"
            >
              <Link
                href={`/${lang}/factory/auctions/${a.id}`}
                variant="muted"
                className="block"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono uppercase tracking-wide text-faint">
                      {a.reference}
                    </p>
                    <p className="text-sm font-medium text-fg mt-0.5 truncate">
                      {a.title}
                    </p>
                    <div className="text-xs text-muted mt-1 flex items-center gap-2 flex-wrap">
                      <span>
                        {dict.factory.auctions.startingBidLabel}:{" "}
                        {formatEUR(a.startingBidCents / 100, lang)}
                      </span>
                      <span>·</span>
                      <span>
                        {dict.factory.auctions.endsAtLabel}{" "}
                        {formatDate(a.endsAt, lang, "short")}
                      </span>
                      <span>·</span>
                      <span>
                        {a._count.bids} {dict.factory.auctions.bidsSuffix}
                      </span>
                    </div>
                  </div>
                  <StatusPill status={a.status} dict={dict} />
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
  dict,
}: {
  status: AuctionStatus;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const map: Record<AuctionStatus, { label: string; classes: string }> = {
    DRAFT: {
      label: dict.factory.auctions.statuses.DRAFT,
      classes: "bg-subtle text-muted border-line",
    },
    PENDING_REVIEW: {
      label: dict.factory.auctions.statuses.PENDING_REVIEW,
      classes: "bg-warning-soft text-warning border-warning-edge",
    },
    REJECTED: {
      label: dict.factory.auctions.statuses.REJECTED,
      classes: "bg-danger-soft text-danger border-danger-edge",
    },
    ACTIVE: {
      label: dict.factory.auctions.statuses.ACTIVE,
      classes: "bg-success-soft text-success border-success-edge",
    },
    ENDED: {
      label: dict.factory.auctions.statuses.ENDED,
      classes: "bg-info-soft text-info border-info-edge",
    },
    SOLD: {
      label: dict.factory.auctions.statuses.SOLD,
      classes: "bg-success-soft text-success border-success-edge",
    },
    CANCELLED: {
      label: dict.factory.auctions.statuses.CANCELLED,
      classes: "bg-danger-soft text-danger border-danger-edge",
    },
  };
  const { label, classes } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
        classes,
      )}
    >
      {label}
    </span>
  );
}
