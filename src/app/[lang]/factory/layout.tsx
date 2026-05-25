import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/permissions/guards";
import { onboardingPath } from "@/lib/auth/redirects";
import { isLocale } from "@/lib/i18n/config";

export default async function FactoryLayout({
  children,
  params,
}: LayoutProps<"/[lang]/factory">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  if (!user.hasOnboarded) redirect(onboardingPath(lang));

  return (
    <RoleShell locale={lang} role={Role.FACTORY}>
      {children}
    </RoleShell>
  );
}
