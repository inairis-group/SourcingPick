import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { SettingsView } from "@/components/settings/settings-view";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/shipper/settings">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.settings.title };
}

/**
 * Shipper settings — the shared SettingsView, same as every other role.
 *
 * This used to redirect to the queue on the reasoning that there was no
 * shipper-specific configuration to hold. That was wrong: the shared surface
 * carries profile, password and **locale**, and locale matters more here than
 * anywhere else — shipper accounts are created in Mandarin (§1.3) and the
 * language is switchable by decision, so this is where a partner changes it.
 *
 * SettingsView keys its sections off role, so payouts and org-logo blocks that
 * don't apply to a logistics partner simply don't render.
 */
export default async function ShipperSettingsPage({
  params,
}: PageProps<"/[lang]/shipper/settings">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.SHIPPER);
  return <SettingsView locale={lang} />;
}
