import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
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
    <AppShell locale={lang} role={Role.AGENT}>
      {children}
    </AppShell>
  );
}
