import { notFound } from "next/navigation";
import { Link } from "@/components/ui/link";
import { Logo } from "@/components/marketing/logo";
import { LocaleDropdown } from "@/components/layout/locale-dropdown";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export default async function AuthLayout({
  children,
  params,
}: LayoutProps<"/[lang]"> & { children: React.ReactNode }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await getDictionary(lang); // ensures dict is preloaded for hydration

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href={`/${lang}`} variant="muted" aria-label="SourcingPick">
          <Logo height={24} priority />
        </Link>
        <LocaleDropdown display="compact" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-4 py-6 sm:px-6 lg:px-8 text-xs text-faint text-center">
        © {new Date().getFullYear()} SourcingPick
      </footer>
    </div>
  );
}
