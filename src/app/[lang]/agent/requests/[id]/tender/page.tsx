import { notFound } from "next/navigation";
import { KycStatus, OrgType, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { isLocale } from "@/lib/i18n/config";
import { TenderSelection } from "./_components/tender-selection";

export default async function TenderSelectionPage({
  params,
}: PageProps<"/[lang]/agent/requests/[id]/tender">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const agent = await requireRole(Role.AGENT);

  const req = await prisma.sourcingRequest.findFirst({
    where: { id, agentId: agent.id },
    include: {
      tenderInvitations: { select: { factoryOrgId: true } },
    },
  });
  if (!req) notFound();

  const alreadyInvited = new Set(req.tenderInvitations.map((t) => t.factoryOrgId));

  const factories = await prisma.organization.findMany({
    where: {
      type: OrgType.FACTORY,
      kycStatus: KycStatus.VERIFIED,
      deletedAt: null,
      // Prioritise category match in the query order
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

  const withProfile = factories
    .filter((f) => f.factoryProfile !== null)
    .map((f) => ({
      id: f.id,
      displayName: f.displayName,
      country: f.country,
      city: f.city,
      profile: f.factoryProfile!,
      alreadyInvited: alreadyInvited.has(f.id),
    }));

  // Sort: matching category first, then by rating
  withProfile.sort((a, b) => {
    const aMatch = a.profile.category === req.category ? 1 : 0;
    const bMatch = b.profile.category === req.category ? 1 : 0;
    if (aMatch !== bMatch) return bMatch - aMatch;
    return b.profile.rating - a.profile.rating;
  });

  return (
    <TenderSelection
      request={{
        id: req.id,
        reference: req.reference,
        title: req.title,
        category: req.category,
        sourcingRegion: req.sourcingRegion,
      }}
      factories={withProfile}
    />
  );
}
