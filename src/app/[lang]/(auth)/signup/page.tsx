import { notFound } from "next/navigation";
import { SignupForm } from "./_components/signup-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/signup">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.signup.title };
}

/**
 * Signup.
 *
 * This route used to be a chooser — buyer or factory — leading to two
 * wizards. The 2026-09 SaaS canvas draws one form instead, so that is what
 * this is. The factory wizard still exists at /signup/factory and is not
 * linked from anywhere; it goes when the undrawn surfaces are hidden.
 */
export default async function SignupPage({ params }: PageProps<"/[lang]/signup">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <SignupForm />;
}
