import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { JetBrains_Mono, Onest, Unbounded } from "next/font/google";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { TopProgressBar } from "@/components/layout/top-progress";
import { I18nProvider } from "@/lib/i18n/client-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import { directionFor, isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { THEME_COOKIE, isStoredTheme } from "@/lib/theme/config";
import { getSiteUrl } from "@/lib/seo/site";
import "@/styles/globals.css";

/**
 * The approved 2026-09 redesign's type system.
 *
 * Unbounded carries the headlines, Onest the body, JetBrains Mono the
 * references and figures. Weights are pinned to the ones the design actually
 * uses — shipping the full variable range would cost bytes nothing renders.
 *
 * `next/font/google` self-hosts these, so the design's Google Fonts <link>
 * becomes no external request and no layout shift.
 *
 * The Latin subset only: Arabic and Chinese fall through to the system stack
 * set on `--font-sans` below, which is correct — neither face covers those
 * scripts, and forcing them would render tofu.
 */
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

const DESCRIPTION =
  "Sourcing international industrialisé avec séquestre intégré.";

export const metadata: Metadata = {
  // Anchors every relative metadata/OG/canonical URL to the public origin so
  // crawlers and social scrapers resolve absolute links in prod.
  metadataBase: new URL(getSiteUrl()),
  title: { default: "SourcingPick", template: "%s · SourcingPick" },
  description: DESCRIPTION,
  applicationName: "SourcingPick",
  // iOS standalone behaviour for "Add to Home Screen". The home-screen icon
  // falls back to favicon.ico (no dedicated apple-touch PNG yet).
  appleWebApp: {
    capable: true,
    title: "SourcingPick",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    siteName: "SourcingPick",
    title: "SourcingPick",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "SourcingPick",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  // Tints the mobile browser UI (address bar) to the brand blue. Matches
  // the manifest theme_color so the installed PWA and the browser agree.
  themeColor: "#155dfc",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  // Read the theme cookie so the className matches reality before the JS
  // runs. Without this, React reconciles <html> on locale change and
  // wipes the runtime-applied .dark/.light class. Default to "light" when
  // the user hasn't picked anything — we don't want OS dark mode to win
  // for first-time visitors (per brand: launch in light, opt into dark).
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE)?.value;
  const themeClass = isStoredTheme(themeCookie) ? ` ${themeCookie}` : " light";

  return (
    <html
      lang={lang}
      dir={directionFor(lang)}
      className={`${display.variable} ${body.variable} ${mono.variable}${themeClass}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <ServiceWorkerRegister />
        {/* Suspense wraps the top progress bar because useSearchParams
            opts the subtree into client-side rendering for the search-
            params change detection — App Router requires a boundary. */}
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <I18nProvider locale={lang} dict={dict}>
          {children}
          <CookieBanner />
        </I18nProvider>
      </body>
    </html>
  );
}
