import { notFound } from "next/navigation";
import { Link } from "@/components/ui/link";
import { Logo } from "@/components/marketing/logo";
import { LocaleDropdown } from "@/components/layout/locale-dropdown";
import { LogoutButton } from "@/components/auth/logout-button";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export default async function OnboardingLayout({
  children,
  params,
}: LayoutProps<"/[lang]"> & { children: React.ReactNode }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await getDictionary(lang);

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href={`/${lang}`} variant="muted" aria-label="SourcingPick">
          <Logo height={24} priority />
        </Link>
        <div className="flex items-center gap-2">
          <LocaleDropdown display="compact" />
          <LogoutButton variant="icon" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
