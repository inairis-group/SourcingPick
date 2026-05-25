import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/permissions/guards";
import { isLocale } from "@/lib/i18n/config";

export default async function AgentLayout({
  children,
  params,
}: LayoutProps<"/[lang]/agent">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.AGENT);

  return (
    <RoleShell locale={lang} role={Role.AGENT}>
      {children}
    </RoleShell>
  );
}
