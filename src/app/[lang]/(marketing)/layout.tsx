import { notFound } from "next/navigation";
import { SiteHeader } from "./_design/site-header";
import { SiteFooter } from "./_design/site-footer";
import { FRAME_FIT_SCRIPT } from "./_design/frame-fit";
import { FrameFitEffect } from "./_design/frame-fit-effect";
import { MotionLayer } from "./_design/motion-layer";
import { StepStack } from "./_design/step-stack";
import { PublicContactButton } from "@/components/marketing/public-contact-button";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";
import { getDictionary } from "@/lib/i18n/get-dictionary";
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
  const dict = await getDictionary(lang);

  return (
    <>
      {/* Between 821 and 1439px the frame is the artboard scaled to the
          window; this measures the window before the frame is drawn. */}
      <script id="sp-frame-fit" dangerouslySetInnerHTML={{ __html: FRAME_FIT_SCRIPT }} />
      <FrameFitEffect />
      <div className={`theme-light ${styles.frame}`}>
        <div className={`${styles.page} sp-motion`}>
          <SiteHeader lang={lang} />
          <main>{children}</main>
        </div>
        {/* The previous site's motion, on the same design (motion-layer.tsx). */}
        <MotionLayer />
        <StepStack />
        <SiteFooter lang={lang} />
        {/* Partner #17: lightweight pre-signup contact dock. Not part of the
            canvas — it is an operations affordance, and it hides itself once
            somebody has an account to message us from. */}
        {!user && <PublicContactButton />}
        <WhatsAppButton label={dict.marketing.whatsappButton} aboveChat={!user} />
      </div>
    </>
  );
}
