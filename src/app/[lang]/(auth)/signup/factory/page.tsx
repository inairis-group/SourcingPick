import { notFound } from "next/navigation";
import { FactorySignupForm } from "./_components/factory-signup-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/signup/factory">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.signup.factoryTitle };
}

export default async function FactorySignupPage({
  params,
}: PageProps<"/[lang]/signup/factory">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <FactorySignupForm />;
}
