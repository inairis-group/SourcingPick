import { notFound } from "next/navigation";
import { AuctionStatus, Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import { ProductImageGallery } from "@/components/marketplace/product-image-gallery";
import { OrgAvatar } from "@/components/org/org-avatar";
import { AuctionModerationActions } from "./_components/auction-moderation-actions";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/auctions">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.auctions.title };
}

export default async function AdminAuctionsPage({
  params,
}: PageProps<"/[lang]/admin/auctions">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);

  const pending = await prisma.auction.findMany({
    where: {
      status: AuctionStatus.PENDING_REVIEW,
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
    include: {
      factoryOrg: {
        select: {
          id: true,
          displayName: true,
          country: true,
          city: true,
          logoUrl: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.auctions.eyebrow}
        title={dict.admin.auctions.title}
        description={dict.admin.auctions.description}
      />

      {pending.length === 0 ? (
        <div className="mt-8 rounded-lg border border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-semibold text-headline">
            {dict.admin.auctions.emptyTitle}
          </p>
          <p className="text-xs text-muted mt-1">
            {dict.admin.auctions.emptyBody}
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-6">
          {pending.map((a) => {
            const imageUrls = a.images.map(
              (_, i) => `/api/auctions/image/${a.id}/${i}`,
            );
            return (
              <li
                key={a.id}
                className="rounded-lg border border-line bg-surface p-5 flex flex-col gap-4"
              >
                <header className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs font-mono uppercase tracking-wide text-faint">
                      {a.reference}
                    </p>
                    <h2 className="text-lg font-semibold text-headline mt-0.5">
                      {a.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                      <OrgAvatar
                        orgId={a.factoryOrg.id}
                        name={a.factoryOrg.displayName}
                        hasLogo={Boolean(a.factoryOrg.logoUrl)}
                        size="xs"
                      />
                      <span>
                        {a.factoryOrg.displayName} · {a.factoryOrg.city},{" "}
                        {a.factoryOrg.country} ·{" "}
                        {dict.categories[a.category]}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/${lang}/admin/auctions/${a.id}`}
                    variant="muted"
                    className="text-xs underline-offset-2 underline"
                  >
                    {dict.admin.auctions.openCta}
                  </Link>
                </header>

                {imageUrls.length > 0 && (
                  <ProductImageGallery
                    imageUrls={imageUrls}
                    productName={a.title}
                  />
                )}

                <MarkdownDisplay source={a.description} />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-line-subtle">
                  <Metric
                    label={dict.factory.auctions.startingBidLabel}
                    value={formatEUR(a.startingBidCents / 100, lang)}
                  />
                  {a.reserveCents !== null && (
                    <Metric
                      label={dict.factory.auctions.reserveLabel}
                      value={formatEUR(a.reserveCents / 100, lang)}
                    />
                  )}
                  {a.buyNowCents !== null && (
                    <Metric
                      label={dict.factory.auctions.buyNowLabel}
                      value={formatEUR(a.buyNowCents / 100, lang)}
                    />
                  )}
                  <Metric
                    label={dict.factory.auctions.endsAtLabel}
                    value={formatDate(a.endsAt, lang, "medium")}
                  />
                </div>

                <AuctionModerationActions auctionId={a.id} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <span className="text-sm font-semibold text-headline">{value}</span>
    </div>
  );
}
