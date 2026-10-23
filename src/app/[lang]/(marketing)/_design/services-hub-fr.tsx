import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { sitePath } from "@/lib/i18n/site-paths";
import { SERVICES_HUB } from "@/content/seo/services-hub";
import { services as content } from "./content/services";
import { SeoInline } from "./seo-markdown";

/**
 * /services in French with the SEO pack's text (content/seo/services-hub.ts).
 *
 * The markup is the services board's own (boards/services/fr.tsx), repeated
 * here rather than generated because the pack's lists are longer than the
 * canvas's and each operation gains a link to its page: the same hero, the
 * same six step cards that park and stack (.sp-step-card), the navy sourcing
 * band, the rail-and-air note and the closing band. Every string the pack does
 * not rewrite — the eyebrows, "Étape 1/6", the column labels, the image
 * descriptions, the note and the band — is the board's, read from its content
 * file. The other languages keep the board.
 */

const MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace";
const DISPLAY = "'Unbounded', 'Trebuchet MS', sans-serif";
const BODY = "'Onest', 'Segoe UI', system-ui, sans-serif";

const LABEL: CSSProperties = { fontFamily: MONO, fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155DFC" };
const ROW: CSSProperties = { display: "flex", gap: "12px", alignItems: "flex-start", fontSize: "var(--sp-fs-15_5, 15.5px)", lineHeight: 1.55, color: "#0E1A3D" };
const LIST: CSSProperties = { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" };

const STEP_IMAGES = [
  "/design/truck-unloading.svg",
  "/design/carton-inspection.svg",
  "/design/consolidated-pallet.svg",
  "/design/wooden-crate.svg",
  "/design/forklift-loading.svg",
  "/design/container-ship.svg",
];

function Check() {
  return (
    <span style={{ flexShrink: 0, display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", alignItems: "center", justifyContent: "center", background: "#E3F6EC", marginTop: "1px" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F8F55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

/** The board's two "what you receive" markers: a camera for pictures, a page otherwise. */
function Received({ photo }: { photo: boolean }) {
  return (
    <span style={{ flexShrink: 0, display: "inline-flex", width: "24px", height: "24px", borderRadius: "8px", alignItems: "center", justifyContent: "center", background: "#EAF1FF" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {photo ? (
          <>
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </>
        ) : (
          <>
            <path d="M6 3h8l4 4v14H6z" />
            <path d="M14 3v4h4" />
            <path d="M9 13h6" />
            <path d="M9 17h6" />
          </>
        )}
      </svg>
    </span>
  );
}

function Arrow() {
  return (
    <span style={{ display: "inline-flex", flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

function More({ href, children, onDark = false }: { href: string; children: ReactNode; onDark?: boolean }) {
  return (
    <Link
      href={href}
      style={{ display: "inline-flex", alignItems: "center", gap: "8px", alignSelf: "flex-start", fontFamily: BODY, fontWeight: 600, fontSize: "var(--sp-fs-16, 16px)", color: onDark ? "#FFFFFF" : "#155DFC" }}
    >
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}

export function ServicesHubFR() {
  const t = content.text.fr;
  const hub = SERVICES_HUB;

  return (
    <>
      <section className="sp-two-track" style={{ padding: "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(72px * var(--sp-vs, 1))", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--sp-gap-64, 64px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "22px", maxWidth: "760px" }}>
          <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "8px", background: "#FFFFFF", padding: "6px 12px", borderRadius: "999px", border: "1px solid #DCE3F2", fontFamily: MONO, fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155DFC" }}>
            {t[0]}
          </div>
          <h1 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-56, 56px)", lineHeight: 1.06, fontWeight: 600, letterSpacing: "-0.03em", color: "#0E1A3D", textWrap: "balance" }}>
            {hub.h1}
          </h1>
          <p style={{ margin: 0, fontSize: "var(--sp-fs-19, 19px)", lineHeight: 1.6, color: "#4A5578", maxWidth: "680px", textWrap: "pretty" }}>
            <SeoInline>{hub.lead}</SeoInline>
          </p>
        </div>
        <div className="sp-hero-figure" style={{ flexShrink: 0, width: "440px", height: "380px", borderRadius: "28px", background: "#EEF3FF", border: "1px solid #DCE3F2", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <img src="/design/consolidated-pallet.svg" alt={t[3]} style={{ width: "400px", height: "340px", objectFit: "contain", maxWidth: "100%" }} />
        </div>
      </section>

      <section style={{ padding: "calc(8px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(96px * var(--sp-vs, 1))", display: "flex", flexDirection: "column", gap: "28px" }}>
        {hub.steps.map((step, k) => (
          <article key={k} className="sp-step-card" style={{ display: "grid", gridTemplateColumns: "var(--sp-grid-400-fr, 400px minmax(0, 1fr))", gap: "var(--sp-gap-48, 48px)", alignItems: "stretch", padding: "var(--sp-pad-32, 32px)", background: "#FFFFFF", border: "1px solid #DCE3F2", borderRadius: "26px" }}>
            <div style={{ borderRadius: "20px", background: "#EEF3FF", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
              <img src={STEP_IMAGES[k]} alt={t[4 + 12 * k]} style={{ width: "300px", height: "auto", maxWidth: "100%" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px", justifyContent: "center", padding: "8px 8px 8px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontFamily: MONO, fontSize: "15px", fontWeight: 600, color: "#155DFC" }}>{t[5 + 12 * k]}</span>
                <span style={{ height: "1px", width: "40px", background: "#DCE3F2" }} />
                <span style={{ ...LABEL, color: "#4A5578" }}>{t[6 + 12 * k]}</span>
              </div>
              <h2 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-34, 34px)", lineHeight: 1.15, fontWeight: 600, letterSpacing: "-0.03em", color: "#0E1A3D", textWrap: "balance" }}>
                {step.title}
              </h2>
              <p style={{ margin: 0, fontSize: "var(--sp-fs-18, 18px)", lineHeight: 1.55, color: "#4A5578" }}>
                <SeoInline>{step.lead}</SeoInline>
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", gap: "28px", paddingTop: "6px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <span style={LABEL}>{t[9]}</span>
                  <ul style={LIST}>
                    {step.weDo.map((item, i) => (
                      <li key={i} style={ROW}>
                        <Check />
                        <span>
                          <SeoInline>{item}</SeoInline>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <span style={LABEL}>{t[13]}</span>
                  <ul style={LIST}>
                    {step.youGet.map((item, i) => (
                      <li key={i} style={ROW}>
                        <Received photo={/photo|vidéo/i.test(item)} />
                        <span>
                          <SeoInline>{item}</SeoInline>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {"more" in step && step.more && <More href={sitePath("fr", step.more.href)}>{step.more.label}</More>}
            </div>
          </article>
        ))}
      </section>

      <section style={{ background: "#0B1433", padding: "calc(96px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(96px * var(--sp-vs, 1))", display: "flex", flexDirection: "column", gap: "var(--sp-gap-40, 40px)" }}>
        <div className="sp-two-track" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--sp-gap-48, 48px)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "760px" }}>
            <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "8px", fontFamily: MONO, fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8DB2FF" }}>
              {t[77]}
            </div>
            <h2 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-44, 44px)", lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.03em", color: "#FFFFFF", textWrap: "balance" }}>
              {hub.sourcing.title}
            </h2>
            <p className="sp-on-dark" style={{ margin: 0, fontSize: "var(--sp-fs-17, 17px)", lineHeight: 1.6, color: "#B8C4E6" }}>
              <SeoInline>{hub.sourcing.lead}</SeoInline>
            </p>
          </div>
          <img src="/design/picky-factory-visit.svg" alt="" style={{ width: "240px", height: "auto", flexShrink: 0, maxWidth: "100%" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "var(--sp-grid-r4, repeat(4, minmax(0, 1fr)))", gap: "18px" }}>
          {hub.sourcing.steps.map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "var(--sp-pad-24, 24px)", borderRadius: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span style={{ display: "inline-flex", width: "34px", height: "34px", borderRadius: "50%", background: "#155DFC", color: "#FFFFFF", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: "14px", fontWeight: 600 }}>
                {i + 1}
              </span>
              <h3 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-18, 18px)", lineHeight: 1.25, fontWeight: 600, letterSpacing: "-0.03em", color: "#FFFFFF", textWrap: "balance" }}>
                {s.title}
              </h3>
              <p className="sp-on-dark" style={{ margin: 0, fontSize: "15px", lineHeight: 1.55, color: "#C3CDEB" }}>
                <SeoInline>{s.text}</SeoInline>
              </p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <Link href={sitePath("fr", "/pricing#remuneration")} style={{ display: "inline-flex", alignItems: "center", gap: "10px", boxSizing: "border-box", minHeight: "44px", padding: "14px 22px", borderRadius: "12px", fontFamily: BODY, fontWeight: 600, fontSize: "var(--sp-fs-16, 16px)", background: "#FFFFFF", color: "#0E1A3D", border: "1.5px solid #FFFFFF", textAlign: "center" }}>
            <span>{t[92]}</span>
            <Arrow />
          </Link>
          <More href={sitePath("fr", hub.sourcing.more.href)} onDark>
            {hub.sourcing.more.label}
          </More>
        </div>
      </section>

      <section style={{ padding: "calc(72px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(40px * var(--sp-vs, 1))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "32px", padding: "var(--sp-pad-28-32, 28px 32px)", border: "1.5px dashed #B7C5E6", borderRadius: "24px" }}>
          <img src="/design/train-plane-sketch.svg" alt={t[93]} style={{ width: "150px", height: "auto", flexShrink: 0, maxWidth: "100%" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-22, 22px)", lineHeight: 1.25, fontWeight: 600, letterSpacing: "-0.03em", color: "#0E1A3D", textWrap: "balance" }}>
              {t[94]}
            </h3>
            <p style={{ margin: 0, fontSize: "var(--sp-fs-16, 16px)", lineHeight: 1.6, color: "#4A5578" }}>{t[95]}</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "calc(64px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))" }}>
        <div className="sp-cta-band" style={{ position: "relative", overflow: "hidden", borderRadius: "32px", background: "#155DFC", padding: "var(--sp-pad-72, 72px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "48px" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(30deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(150deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "44px 25.4px" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "22px", maxWidth: "700px" }}>
            <h2 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-48, 48px)", lineHeight: 1.08, fontWeight: 600, letterSpacing: "-0.03em", color: "#FFFFFF", textWrap: "balance" }}>
              {t[96]}
            </h2>
            <p style={{ margin: 0, fontSize: "var(--sp-fs-18, 18px)", lineHeight: 1.6, color: "#E3EBFF" }}>{t[97]}</p>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
              <a href={sitePath("fr", "/devis")} style={{ display: "inline-flex", alignItems: "center", gap: "10px", boxSizing: "border-box", minHeight: "44px", padding: "18px 28px", borderRadius: "12px", fontFamily: BODY, fontWeight: 600, fontSize: "var(--sp-fs-17, 17px)", background: "#FFFFFF", color: "#0E1A3D", border: "1.5px solid #FFFFFF", textAlign: "center" }}>
                <span>{t[98]}</span>
                <Arrow />
              </a>
              <a href="mailto:contact@sourcingpick.com" style={{ display: "inline-flex", alignItems: "center", gap: "10px", boxSizing: "border-box", minHeight: "44px", padding: "18px 28px", borderRadius: "12px", fontFamily: BODY, fontWeight: 600, fontSize: "var(--sp-fs-17, 17px)", background: "transparent", color: "#FFFFFF", border: "1.5px solid rgba(255,255,255,0.28)", textAlign: "center" }}>
                <span>
                  <span dir="ltr">{t[99]}</span>
                </span>
              </a>
            </div>
          </div>
          <div className="sp-cta-mascot" style={{ position: "relative", width: "300px", height: "300px", flexShrink: 0 }}>
            <div style={{ position: "absolute", left: "-60px", top: "6px", maxWidth: "220px", padding: "12px 16px", borderRadius: "18px 18px 4px 18px", background: "#FFFFFF", color: "#0E1A3D", fontSize: "15px", fontWeight: 600, boxShadow: "0 16px 32px -16px rgba(14,26,61,0.5)", boxSizing: "content-box" }}>
              {t[100]}
            </div>
            <img src="/design/picky-arms-up.svg" alt={t[101]} style={{ width: "300px", height: "auto", maxWidth: "100%" }} />
          </div>
        </div>
      </section>
    </>
  );
}
