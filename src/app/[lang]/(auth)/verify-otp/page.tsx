import { notFound } from "next/navigation";
import { OtpForm } from "./_components/otp-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/verify-otp">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.otp.title };
}

export default async function VerifyOtpPage({ params }: PageProps<"/[lang]/verify-otp">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <OtpForm />;
}
