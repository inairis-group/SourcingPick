import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { BannerCard } from "@/components/marketplace/banner-rail";
import { CreateBannerForm } from "./_components/create-banner-form";
import { BannerRow } from "./_components/banner-row";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/marketplace/banners">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.banners.title };
}

export default async function AdminBannersPage({
  params,
}: PageProps<"/[lang]/admin/marketplace/banners">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);

  const banners = await prisma.marketplaceBanner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      subtitle: true,
      ctaLabel: true,
      ctaHref: true,
      tone: true,
      background: true,
      gradientFrom: true,
      gradientVia: true,
      gradientTo: true,
      gradientAngle: true,
      mediaUrl: true,
      overlayOpacity: true,
      active: true,
      sortOrder: true,
      startsAt: true,
      endsAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/admin/marketplace`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.admin.banners.backToMarketplace}
      </Link>

      <DashboardHeader
        eyebrow={dict.admin.banners.eyebrow}
        title={dict.admin.banners.title}
        description={dict.admin.banners.description}
      />

      <section className="mt-6 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold text-headline mb-4">
          {dict.admin.banners.createTitle}
        </h2>
        <CreateBannerForm />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-headline mb-3">
          {dict.admin.banners.listTitle}
        </h2>
        {banners.length === 0 ? (
          <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
            <p className="text-sm text-muted">{dict.admin.banners.empty}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {banners.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-line bg-surface p-4 flex flex-col gap-3"
              >
                <BannerCard banner={b} />
                <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-muted">
                  <span>
                    {dict.admin.banners.toneLabel}: {b.tone}
                    {" · "}
                    {dict.admin.banners.orderLabel}: {b.sortOrder}
                    {b.startsAt && (
                      <>
                        {" · "}
                        {dict.admin.banners.fromLabel}{" "}
                        {formatDate(b.startsAt, lang, "short")}
                      </>
                    )}
                    {b.endsAt && (
                      <>
                        {" · "}
                        {dict.admin.banners.toLabel}{" "}
                        {formatDate(b.endsAt, lang, "short")}
                      </>
                    )}
                  </span>
                  <BannerRow id={b.id} active={b.active} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
