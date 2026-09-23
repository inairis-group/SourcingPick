import { cookies, headers } from "next/headers";
import { JetBrains_Mono, Onest, Unbounded } from "next/font/google";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  defaultLocale,
  directionFor,
  isLocale,
  localeCookieName,
} from "@/lib/i18n/config";
import { THEME_COOKIE, isStoredTheme } from "@/lib/theme/config";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

// Owns its own <html>, so it must load the type system itself — the
// [lang] layout never runs for a truly off-route URL. Same three faces as
// the rest of the app; loading Geist here would ship a fourth family for
// one page.
const display = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});
const body = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

/**
 * Root not-found — catches URLs that don't match any route at all (the
 * `[lang]/not-found.tsx` only fires for `notFound()` calls from inside
 * matched routes). Owns its own <html>/<body> because there is no parent
 * layout to inherit from when the URL is truly off-route.
 */
export default async function GlobalNotFound() {
  const cookieStore = await cookies();
  const h = await headers();
  const fromCookie = cookieStore.get(localeCookieName)?.value;
  const fromProxy = h.get("x-locale");
  const lang =
    fromCookie && isLocale(fromCookie)
      ? fromCookie
      : fromProxy && isLocale(fromProxy)
        ? fromProxy
        : defaultLocale;
  const dict = await getDictionary(lang);

  const themeCookie = cookieStore.get(THEME_COOKIE)?.value;
  const themeClass = isStoredTheme(themeCookie) ? ` ${themeCookie}` : " light";

  return (
    <html
      lang={lang}
      dir={directionFor(lang)}
      className={`${display.variable} ${body.variable} ${mono.variable}${themeClass}`}
      suppressHydrationWarning
    >
      <body className="bg-page text-fg">
        <main className="min-h-dvh flex flex-col">
          <header className="px-6 py-5">
            <Link href={`/${lang}`} variant="muted">
              <Logo height={24} />
              <span className="sr-only">SourcingPick</span>
            </Link>
          </header>
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-md w-full text-center flex flex-col gap-4">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-faint">
                404
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-headline tracking-tight">
                {dict.errors.notFound.title}
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                {dict.errors.notFound.body}
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <Link
                  href={`/${lang}`}
                  className={cn(buttonClass({ variant: "primary", size: "md" }))}
                >
                  {dict.errors.notFound.home}
                </Link>
                <Link
                  href={`/${lang}/marketplace`}
                  className={cn(buttonClass({ variant: "secondary", size: "md" }))}
                >
                  {dict.errors.notFound.browse}
                </Link>
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
