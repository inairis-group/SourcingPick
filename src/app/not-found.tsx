import { cookies, headers } from "next/headers";
import { JetBrains_Mono, Onest, Unbounded } from "next/font/google";
import { SiteHeader } from "@/app/[lang]/(marketing)/_design/site-header";
import { SiteFooter } from "@/app/[lang]/(marketing)/_design/site-footer";
import { NotFoundBoard } from "@/app/[lang]/(marketing)/_design/boards/notFound";
import styles from "@/app/[lang]/(marketing)/_design/board.module.css";
import { defaultLocale, directionFor, isLocale, localeCookieName } from "@/lib/i18n/config";
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
 * Root not-found — catches URLs that don't match any route at all.
 *
 * The canvas draws a 404 with the site's full chrome on it, so that is what
 * this renders: same header, same footer, Picky and the magnifying glass. The
 * locale cannot come from a route parameter here, because there is no matched
 * route; the cookie and the proxy's `x-locale` header are what is left, and
 * French is the fallback.
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

  return (
    <html
      lang={lang}
      dir={directionFor(lang)}
      className={`${display.variable} ${body.variable} ${mono.variable} light`}
      suppressHydrationWarning
    >
      <body style={{ margin: 0 }}>
        <div className={`theme-light ${styles.frame}`}>
          <div className={styles.page}>
            <SiteHeader lang={lang} />
            <main>
              <NotFoundBoard lang={lang} />
            </main>
          </div>
          <SiteFooter lang={lang} />
        </div>
      </body>
    </html>
  );
}
