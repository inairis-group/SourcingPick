import { notFound } from "next/navigation";
import { Category, KycStatus, OrgType, Role, SourcingRegion } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { FactoryPool } from "./_components/factory-pool";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/agent/factories">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.agent.factories.title };
}

export default async function AgentFactoriesPage({
  params,
  searchParams,
}: PageProps<"/[lang]/agent/factories">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.AGENT);

  const sp = await searchParams;
  const categoryParam = typeof sp.category === "string" ? sp.category : undefined;
  const regionParam = typeof sp.region === "string" ? sp.region : undefined;

  const initialCategory =
    categoryParam && isCategoryEnum(categoryParam) ? categoryParam : null;
  const initialRegion =
    regionParam && isRegionEnum(regionParam) ? regionParam : null;

  const factories = await prisma.organization.findMany({
    where: {
      type: OrgType.FACTORY,
      kycStatus: KycStatus.VERIFIED,
      deletedAt: null,
    },
    orderBy: [{ factoryProfile: { rating: "desc" } }],
    select: {
      id: true,
      displayName: true,
      country: true,
      city: true,
      factoryProfile: {
        select: {
          category: true,
          capabilities: true,
          languages: true,
          rating: true,
          totalOrders: true,
          certifications: true,
        },
      },
    },
  });

  // Filter out any without a factoryProfile (shouldn't happen for FACTORY-type orgs)
  const withProfile = factories.filter((f) => f.factoryProfile !== null);

  return (
    <FactoryPool
      factories={withProfile.map((f) => ({
        id: f.id,
        displayName: f.displayName,
        country: f.country,
        city: f.city,
        profile: f.factoryProfile!,
      }))}
      initialCategory={initialCategory}
      initialRegion={initialRegion}
    />
  );
}

function isCategoryEnum(v: string): v is Category {
  return (Object.values(Category) as string[]).includes(v);
}

function isRegionEnum(v: string): v is SourcingRegion {
  return (Object.values(SourcingRegion) as string[]).includes(v);
}
