import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/redirects";
import { isLocale } from "@/lib/i18n/config";
import { ClientOnboarding } from "./_components/client-onboarding";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/onboarding/client">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {};
}

export default async function ClientOnboardingPage({
  params,
}: PageProps<"/[lang]/onboarding/client">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/login`);
  if (user.role !== Role.CLIENT) redirect(dashboardPathForRole(user.role, lang));
  if (user.hasOnboarded) redirect(dashboardPathForRole(Role.CLIENT, lang));

  return (
    <ClientOnboarding firstName={user.firstName} orgName={user.organization.displayName} />
  );
}
