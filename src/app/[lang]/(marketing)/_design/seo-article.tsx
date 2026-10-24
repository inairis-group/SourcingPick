import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon } from "@hugeicons/core-free-icons";
import { WHATSAPP_URL } from "@/lib/contact/whatsapp";
import { localeDirections, type Locale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { CTA_BAND } from "@/content/seo/cta-band";
import { ARROW_PATHS, BODY, DISPLAY, MONO, localType } from "./locale-type";
import { SeoInline } from "./seo-markdown";

/**
 * The page the SEO pack's long-form pages share (service pages, the
 * simulator, blog articles), built from the canvas's own pieces: the sub-page
 * hero of /services (eyebrow, heading, lead, the illustration in its pale
 * box), a reading column, and the blue closing band every page ends on —
 * its heading and line are the canvas's, its buttons the quote request and
 * WhatsApp, in the page's language (src/content/seo/cta-band.ts).
 *
 * The classes are the ones the stylesheet already reflows on a phone
 * (sp-two-track, sp-hero-figure, sp-cta-band).
 */

function Arrow({ lang }: { lang: Locale }) {
  const [shaft, head] = ARROW_PATHS[localeDirections[lang]];
  return (
    <span style={{ display: "inline-flex", flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={shaft} />
        <path d={head} />
      </svg>
    </span>
  );
}

export function SeoArticle({
  lang,
  eyebrow,
  back,
  h1,
  lead,
  image,
  imageAlt = "",
  wide = false,
  children,
}: {
  lang: Locale;
  eyebrow: string;
  /** Where the eyebrow leads back to (the hub page), if anywhere. */
  back?: { href: string; label: string };
  h1: string;
  /** Markdown, one or a few paragraphs. */
  lead: string;
  image?: string;
  imageAlt?: string;
  /** The body takes the full content column (a tool) rather than a reading width. */
  wide?: boolean;
  children: ReactNode;
}) {
  const leadParagraphs = lead.split(/\n\s*\n/).filter(Boolean);
  const cta = CTA_BAND[lang];
  const ty = (style: CSSProperties) => localType(lang, style);
  return (
    <>
      <section className="sp-two-track" style={{ padding: "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(56px * var(--sp-vs, 1))", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--sp-gap-64, 64px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "22px", maxWidth: "760px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {back && (
              <>
                <Link href={back.href} style={ty({ fontFamily: MONO, fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A5578" })}>
                  {back.label}
                </Link>
                <span aria-hidden="true" style={{ color: "#9FACD3" }}>/</span>
              </>
            )}
            <div style={ty({ display: "inline-flex", alignItems: "center", gap: "8px", background: "#FFFFFF", padding: "6px 12px", borderRadius: "999px", border: "1px solid #DCE3F2", fontFamily: MONO, fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155DFC" })}>
              {eyebrow}
            </div>
          </div>
          <h1 style={ty({ margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-48, 48px)", lineHeight: 1.08, fontWeight: 600, letterSpacing: "-0.03em", color: "#0E1A3D", textWrap: "balance" })}>
            {h1}
          </h1>
          {leadParagraphs.map((p, i) => (
            <p key={i} style={{ margin: 0, fontSize: "var(--sp-fs-19, 19px)", lineHeight: 1.6, color: "#4A5578", maxWidth: "680px", textWrap: "pretty" }}>
              <SeoInline>{p}</SeoInline>
            </p>
          ))}
        </div>
        {image && (
          <div className="sp-hero-figure" style={{ flexShrink: 0, width: "440px", height: "380px", borderRadius: "28px", background: "#EEF3FF", border: "1px solid #DCE3F2", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img src={image} alt={imageAlt} style={{ width: "400px", height: "340px", objectFit: "contain", maxWidth: "100%" }} />
          </div>
        )}
      </section>

      <section style={{ padding: "0 var(--sp-gutter, 120px) calc(40px * var(--sp-vs, 1))" }}>
        <div style={{ maxWidth: wide ? "none" : "880px" }}>{children}</div>
      </section>

      <section style={{ padding: "calc(64px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))" }}>
        <div className="sp-cta-band" style={{ position: "relative", overflow: "hidden", borderRadius: "32px", background: "#155DFC", padding: "var(--sp-pad-72, 72px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "48px" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(30deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(150deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "44px 25.4px" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "22px", maxWidth: "700px" }}>
            <h2 style={ty({ margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-48, 48px)", lineHeight: 1.08, fontWeight: 600, letterSpacing: "-0.03em", color: "#FFFFFF", textWrap: "balance" })}>
              {cta.heading}
            </h2>
            <p style={{ margin: 0, fontSize: "var(--sp-fs-18, 18px)", lineHeight: 1.6, color: "#E3EBFF" }}>
              {cta.line}
            </p>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
              <a href={sitePath(lang, "/devis")} style={ty({ display: "inline-flex", alignItems: "center", gap: "10px", boxSizing: "border-box", minHeight: "44px", padding: "18px 28px", borderRadius: "12px", fontFamily: BODY, fontWeight: 600, fontSize: "var(--sp-fs-17, 17px)", background: "#FFFFFF", color: "#0E1A3D", border: "1.5px solid #FFFFFF", textAlign: "center" })}>
                <span>{cta.quote}</span>
                <Arrow lang={lang} />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={ty({ display: "inline-flex", alignItems: "center", gap: "10px", boxSizing: "border-box", minHeight: "44px", padding: "18px 28px", borderRadius: "12px", fontFamily: BODY, fontWeight: 600, fontSize: "var(--sp-fs-17, 17px)", background: "transparent", color: "#FFFFFF", border: "1.5px solid rgba(255,255,255,0.28)", textAlign: "center" })}>
                <HugeiconsIcon icon={WhatsappIcon} size={20} strokeWidth={1.8} />
                <span>{cta.whatsapp}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
