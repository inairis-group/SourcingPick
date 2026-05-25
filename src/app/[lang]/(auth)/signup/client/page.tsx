import { notFound } from "next/navigation";
import { ClientSignupForm } from "./_components/client-signup-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/signup/client">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.signup.clientTitle };
}

export default async function ClientSignupPage({
  params,
}: PageProps<"/[lang]/signup/client">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <ClientSignupForm />;
}
