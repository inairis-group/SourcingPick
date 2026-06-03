import { notFound } from "next/navigation";
import { RoleShell } from "@/components/layout/role-shell";
import { requireAuth } from "@/lib/permissions/guards";
import { isLocale } from "@/lib/i18n/config";

/**
 * Cross-role wrapper for the global messages page. The route is
 * accessible to any signed-in role (client / factory / agent / admin),
 * so we resolve the role from the session and pass it to RoleShell —
 * the rest of the chrome (topnav, role pill, bells) is then identical
 * to the role-specific surfaces.
 */
export default async function MessagesLayout({
  children,
  params,
}: LayoutProps<"/[lang]/messages">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireAuth();

  return (
    <RoleShell locale={lang} role={user.role}>
      {children}
    </RoleShell>
  );
}
