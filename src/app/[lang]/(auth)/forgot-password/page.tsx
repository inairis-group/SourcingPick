import { notFound } from "next/navigation";
import { ForgotPasswordForm } from "./_components/forgot-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/forgot-password">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.forgot.title };
}

export default async function ForgotPasswordPage({
  params,
}: PageProps<"/[lang]/forgot-password">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <ForgotPasswordForm />;
}
