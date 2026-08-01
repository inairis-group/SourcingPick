import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/permissions/guards";
import { isLocale } from "@/lib/i18n/config";

/**
 * Expéditeur Sourcing Pick.
 *
 * No onboarding redirect, unlike the client/factory shells: shipper accounts
 * are provisioned by the internal team rather than self-registering, so there
 * is no onboarding flow for them to be sent through.
 */
export default async function ShipperLayout({ children, params }: LayoutProps<"/[lang]/shipper">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.SHIPPER);

  return (
    <RoleShell locale={lang} role={Role.SHIPPER}>
      {children}
    </RoleShell>
  );
}
