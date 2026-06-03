import { notFound } from "next/navigation";
import { KycStatus, Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { AuctionForm } from "../_components/auction-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/auctions/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.factory.auctions.newCta };
}

export default async function NewAuctionPage({
  params,
}: PageProps<"/[lang]/factory/auctions/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { kycStatus: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/factory/auctions`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.factory.auctions.backToList}
      </Link>

      <DashboardHeader
        eyebrow={dict.factory.auctions.eyebrow}
        title={dict.factory.auctions.newTitle}
        description={dict.factory.auctions.newBody}
      />

      {org?.kycStatus !== KycStatus.VERIFIED ? (
        <div className="mt-6 rounded-lg border border-warning-edge bg-warning-soft/40 p-5 text-sm text-fg">
          <p className="font-semibold text-headline">
            {dict.factory.auctions.kycRequiredTitle}
          </p>
          <p className="text-xs text-muted mt-1">
            {dict.factory.auctions.kycRequiredBody}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-line bg-surface p-6">
          <AuctionForm lang={lang} />
        </div>
      )}
    </div>
  );
}
