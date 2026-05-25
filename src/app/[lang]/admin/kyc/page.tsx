import { KycStatus, OrgType } from "@prisma/client";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { KycQueue } from "./_components/kyc-queue";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/kyc">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.kyc.title };
}

export default async function AdminKycPage({
  params,
}: PageProps<"/[lang]/admin/kyc">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  // Pending + flagged + recently verified — the operator wants the full
  // queue view, not just "to do". Recently rejected/verified rows give
  // context for what just happened.
  const orgs = await prisma.organization.findMany({
    where: {
      type: OrgType.FACTORY,
      deletedAt: null,
    },
    orderBy: [
      // Pending first, then flagged, then rest — order by kycStatus enum is
      // alphabetical by default; we sort explicitly client-side too.
      { kycStatus: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      displayName: true,
      legalName: true,
      country: true,
      city: true,
      kycStatus: true,
      kycVerifiedAt: true,
      createdAt: true,
      vatNumber: true,
      address: true,
      factoryProfile: {
        select: {
          category: true,
          capabilities: true,
          languages: true,
        },
      },
      kycDocuments: {
        select: {
          id: true,
          kind: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
          uploadedAt: true,
        },
        orderBy: { uploadedAt: "asc" },
      },
      users: {
        where: { subRole: "OWNER" },
        select: { id: true, firstName: true, lastName: true, email: true },
        take: 1,
      },
    },
  });

  // Sort: PENDING > FLAGGED > VERIFIED > REJECTED
  const order: Record<KycStatus, number> = {
    [KycStatus.PENDING]: 0,
    [KycStatus.FLAGGED]: 1,
    [KycStatus.VERIFIED]: 2,
    [KycStatus.REJECTED]: 3,
  };
  orgs.sort((a, b) => order[a.kycStatus] - order[b.kycStatus]);

  return <KycQueue orgs={orgs} />;
}
