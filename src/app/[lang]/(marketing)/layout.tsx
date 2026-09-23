import { notFound } from "next/navigation";
import { SiteHeader } from "./_design/site-header";
import { SiteFooter } from "./_design/site-footer";
import { PublicContactButton } from "@/components/marketing/public-contact-button";
import { isLocale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/session";
import styles from "./_design/board.module.css";

/**
 * Chrome for every public page, transcribed from the canvas.
 *
 * The artboards are 1440px frames: a near-white column holding the
 * announcement strip, the header and the page, sitting on the navy the footer
 * is painted in. That is reproduced here rather than approximated — the frame
 * is centred and capped at the canvas width, and `board.module.css` is the
 * only thing that reflows it, because the design has no tablet artboards and
 * inventing them is exactly the drift we are trying to avoid.
 *
 * The header and footer are generated once: all thirteen artboards draw them
 * identically, which the porter checks rather than assumes.
 */
export default async function MarketingLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const user = await getCurrentUser();

  return (
    <div className={`theme-light ${styles.frame}`}>
      <div className={styles.page}>
        <SiteHeader lang={lang} />
        <main>{children}</main>
      </div>
      <SiteFooter lang={lang} />
      {/* Partner #17: lightweight pre-signup contact dock. Not part of the
          canvas — it is an operations affordance, and it hides itself once
          somebody has an account to message us from. */}
      {!user && <PublicContactButton />}
    </div>
  );
}
