import { notFound } from "next/navigation";
import { SettingsView } from "@/components/settings/settings-view";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/settings">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.settings.title };
}

export default async function FactorySettingsPage({
  params,
}: PageProps<"/[lang]/factory/settings">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <SettingsView locale={lang} />;
}
