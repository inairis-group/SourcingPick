import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon } from "@hugeicons/core-free-icons";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { WHATSAPP_URL } from "@/lib/contact/whatsapp";
import { sitePath } from "@/lib/i18n/site-paths";

/**
 * What /entrepot shows while the warehouse moves: the page is in
 * maintenance. Not a canvas artboard — it is the Entrepôt hero's own
 * composition (eyebrow, heading, lead, the quay illustration beside them,
 * its column narrowed so the two buttons share a row)
 * with a notice in place of the warehouse's description, so the page still
 * reads as part of the site. The copy is French and English; the other
 * languages fall back to English, as every string not yet translated does.
 *
 * Two ways forward while the page is away: WhatsApp, then a quote request.
 */

export async function WarehouseMaintenance({ lang }: { lang: Locale }) {
  const t = (await getDictionary(lang)).marketing.warehouseMaintenance;

  return (
    <section style={{ "padding": "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", "display": "grid", "gridTemplateColumns": "var(--sp-grid-fr-560, minmax(0, 1fr) 560px)", "gap": "var(--sp-gap-48, 48px)", "alignItems": "center" }}>
      <div style={{ "display": "flex", "flexDirection": "column", "gap": "22px" }}>
        <div style={{ "display": "inline-flex", "alignSelf": "flex-start", "alignItems": "center", "gap": "8px", "background": "#FFFFFF", "padding": "6px 12px", "borderRadius": "999px", "border": "1px solid #DCE3F2", "fontFamily": "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", "fontSize": "12.5px", "fontWeight": "600", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "#155DFC" }}>
          {t.eyebrow}
        </div>
        <h1 style={{ "margin": "0", "fontFamily": "'Unbounded', 'Trebuchet MS', sans-serif", "fontSize": "var(--sp-fs-54, 54px)", "lineHeight": "1.06", "fontWeight": "600", "letterSpacing": "-0.03em", "color": "#0E1A3D", "textWrap": "balance" }}>
          {t.title}
        </h1>
        <p style={{ "margin": "0", "fontSize": "var(--sp-fs-19, 19px)", "lineHeight": "1.6", "color": "#4A5578" }}>
          {t.body}
        </p>
        <div style={{ "display": "flex", "flexWrap": "wrap", "gap": "14px", "marginTop": "8px" }}>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "gap": "10px", "boxSizing": "border-box", "minHeight": "44px", "padding": "18px 28px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "var(--sp-fs-17, 17px)", "background": "#155DFC", "color": "#FFFFFF", "border": "1.5px solid #155DFC", "textAlign": "center" }}>
            <HugeiconsIcon icon={WhatsappIcon} size={20} strokeWidth={1.8} />
            {t.whatsapp}
          </a>
          <a href={sitePath(lang, "/devis")} style={{ "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "gap": "10px", "boxSizing": "border-box", "minHeight": "44px", "padding": "18px 28px", "borderRadius": "12px", "fontFamily": "'Onest', 'Segoe UI', system-ui, sans-serif", "fontWeight": "600", "fontSize": "var(--sp-fs-17, 17px)", "background": "#FFFFFF", "color": "#0E1A3D", "border": "1.5px solid #DCE3F2", "textAlign": "center" }}>
            {t.quote}
          </a>
        </div>
      </div>
      <div dir="ltr" style={{ "width": "560px", "height": "auto", "maxWidth": "100%" }}>
        <Image src="/design/hero-warehouse-quay-ship.svg" alt="" aria-hidden="true" width={760} height={560} unoptimized style={{ "width": "560px", "height": "auto", "maxWidth": "100%" }} />
      </div>
    </section>
  );
}
