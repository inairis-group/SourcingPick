import { cookies, headers } from "next/headers";
import { SiteHeader } from "./(marketing)/_design/site-header";
import { SiteFooter } from "./(marketing)/_design/site-footer";
import { NotFoundBoard } from "./(marketing)/_design/boards/notFound";
import styles from "./(marketing)/_design/board.module.css";
import { defaultLocale, isLocale, localeCookieName } from "@/lib/i18n/config";

/**
 * 404 for anything under /[lang] — a page calling notFound(), or a path that
 * matches no route.
 *
 * The canvas draws this page with the site's chrome on it, but `not-found.tsx`
 * sits outside the (marketing) route group and so inherits none of it; the
 * header and footer are therefore mounted here by hand. They are the same two
 * generated components the group's layout uses, not copies of them.
 *
 * `lang` cannot come from params — Next strips the segment for this file — so
 * it is resolved from the locale cookie, then the proxy's `x-locale`, then the
 * default.
 */
export default async function NotFoundPage() {
  const [cookieStore, h] = await Promise.all([cookies(), headers()]);
  const fromCookie = cookieStore.get(localeCookieName)?.value;
  const fromProxy = h.get("x-locale");
  const lang =
    fromCookie && isLocale(fromCookie)
      ? fromCookie
      : fromProxy && isLocale(fromProxy)
        ? fromProxy
        : defaultLocale;

  return (
    <div className={`theme-light ${styles.frame}`}>
      <div className={styles.page}>
        <SiteHeader lang={lang} />
        <main>
          <NotFoundBoard lang={lang} />
        </main>
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
