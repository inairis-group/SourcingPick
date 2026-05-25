import { notFound } from "next/navigation";
import { ResetPasswordForm } from "./_components/reset-form";
import { Link } from "@/components/ui/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/reset-password">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.reset.title };
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: PageProps<"/[lang]/reset-password">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const { token } = await searchParams;
  const tokenStr = typeof token === "string" ? token : null;

  if (!tokenStr) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.auth.reset.missingTokenTitle}
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          {dict.auth.reset.missingTokenBody}
        </p>
        <Link
          href={`/${lang}/forgot-password`}
          variant="inline"
          className="text-sm mt-4 self-center"
        >
          {dict.auth.reset.requestNew}
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={tokenStr} />;
}
