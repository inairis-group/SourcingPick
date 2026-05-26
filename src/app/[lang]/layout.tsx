import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { I18nProvider } from "@/lib/i18n/client-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import { directionFor, isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { THEME_COOKIE, isStoredTheme } from "@/lib/theme/config";
import "@/styles/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "SourcingPick", template: "%s · SourcingPick" },
  description: "Sourcing international industrialisé avec séquestre intégré.",
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
      className={`${geistSans.variable} ${geistMono.variable}${themeClass}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <I18nProvider locale={lang} dict={dict}>
          {children}
          <CookieBanner />
        </I18nProvider>
      </body>
    </html>
  );
}
