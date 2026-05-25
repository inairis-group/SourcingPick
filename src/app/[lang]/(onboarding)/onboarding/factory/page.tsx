import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/redirects";
import { isLocale } from "@/lib/i18n/config";
import { prisma } from "@/lib/db/client";
import { FactoryOnboarding } from "./_components/factory-onboarding";

export default async function FactoryOnboardingPage({
  params,
}: PageProps<"/[lang]/onboarding/factory">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/login`);
  if (user.role !== Role.FACTORY) redirect(dashboardPathForRole(user.role, lang));
  if (user.hasOnboarded) redirect(dashboardPathForRole(Role.FACTORY, lang));

  // Fetch KYC status separately — getCurrentUser doesn't include it.
  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { displayName: true, kycStatus: true },
  });

  return (
    <FactoryOnboarding
      firstName={user.firstName}
      orgName={org?.displayName ?? user.organization.displayName}
      kycStatus={org?.kycStatus ?? "PENDING"}
    />
  );
}
