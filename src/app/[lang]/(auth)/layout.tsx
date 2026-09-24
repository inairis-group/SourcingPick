import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { LocaleDropdown } from "@/components/layout/locale-dropdown";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { AuthShell } from "./_design/auth-shell";

/**
 * Access screens, in the 2026-09 SaaS canvas's two-pane frame.
 *
 * The canvas gives the wordmark and the language control no home of their own
 * — an artboard has no need to switch language — so they sit over the form
 * pane, which is where the reader's attention already is.
 */
export default async function AuthLayout({
  children,
  params,
}: LayoutProps<"/[lang]"> & { children: React.ReactNode }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await getDictionary(lang); // ensures dict is preloaded for hydration

  return (
    <AuthShell lang={lang}>
      <div className="flex items-center justify-between gap-4">
        <Link href={`/${lang}`} variant="muted" aria-label="SourcingPick">
          <Image
            src="/design/logo.svg"
            alt="SourcingPick"
            width={132}
            height={30}
            priority
            className="h-[30px] w-auto"
          />
        </Link>
        <LocaleDropdown display="compact" />
      </div>
      {children}
    </AuthShell>
  );
}
