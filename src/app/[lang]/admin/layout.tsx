import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/permissions/guards";
import { isLocale } from "@/lib/i18n/config";

export default async function AdminLayout({
  children,
  params,
}: LayoutProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);

  return (
    <RoleShell locale={lang} role={Role.ADMIN}>
      {children}
    </RoleShell>
  );
}
