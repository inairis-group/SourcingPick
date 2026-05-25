import { notFound } from "next/navigation";
import { LegalLayout, legalProps } from "@/components/marketing/legal-layout";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/legal/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.legal.privacy.title };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/legal/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <LegalLayout {...legalProps(dict, dict.legal.privacy)} />;
}
