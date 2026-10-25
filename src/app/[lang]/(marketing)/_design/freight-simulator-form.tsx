"use client";

import { useActionState, useEffect } from "react";
import { localeDirections, type Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/formatters";
import { requestFreightEstimate, type FreightEstimateState } from "@/lib/freight/actions";
import { ARROW_PATHS, BODY, DISPLAY, MONO, localType } from "./locale-type";
import type { FreightFormCopy } from "@/content/freight/simulator";
import { MODE_PICTURES, ShipmentFields, TEXT_INPUT, fill, surchargeList, useShipment } from "./freight-shipment";

/**
 * The public freight simulator on /livraisons: the shipment's fields, and a
 * panel that keeps the price for the e-mail. "Voir le prix" (or "Recevoir mon
 * devis" when the card has no price for the request) sends it to
 * requestFreightEstimate, then the visitor goes on to create their account
 * (/inscription).
 */
export function FreightSimulatorForm({ lang, copy: c }: { lang: Locale; copy: FreightFormCopy }) {
  const s = useShipment(c);
  const [state, formAction, pending] = useActionState<FreightEstimateState | null, FormData>(requestFreightEstimate, null);
  const ty = (style: React.CSSProperties) => localType(lang, style);
  const n = (v: number, digits = 1) => formatNumber(v, lang, { maximumFractionDigits: digits });
  const [shaft, head] = ARROW_PATHS[localeDirections[lang]];
  const surcharges = surchargeList(c, s, lang);
  const quote = s.reason !== null;

  // Once the e-mail is on its way, on to the account. /inscription is the
  // client area's (another app behind the same domain): a full page load.
  useEffect(() => {
    if (state?.ok) {
      const t = window.setTimeout(() => window.location.assign(new URL("/inscription", window.location.href).href), 2500);
      return () => window.clearTimeout(t);
    }
  }, [state]);

  const darkInput = { ...TEXT_INPUT, minHeight: "46px" };
  const darkLabel = { fontSize: "14px", fontWeight: 600, color: "#E3EBFF" } as const;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "var(--sp-grid-fr-500, minmax(0, 1fr) 500px)", gap: "var(--sp-gap-48, 48px)", alignItems: "start", padding: "var(--sp-pad-48, 48px)", borderRadius: "32px", background: "#FFFFFF", border: "1px solid #DCE3F2" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "22px", minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={ty({ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "8px", fontFamily: MONO, fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155DFC" })}>{c.eyebrow}</div>
          <h2 style={ty({ margin: 0, fontFamily: DISPLAY, fontSize: "calc(var(--sp-fs-40, 40px) * 0.95)", lineHeight: 1.12, fontWeight: 600, letterSpacing: "-0.03em", color: "#0E1A3D", textWrap: "balance" })}>{c.title}</h2>
          <p style={{ margin: 0, fontSize: "var(--sp-fs-17, 17px)", lineHeight: 1.6, color: "#4A5578" }}>{c.intro}</p>
        </div>
        <ShipmentFields lang={lang} copy={c} s={s} idPrefix="sea" />
      </div>

      <div className="sp-sim-panel" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "var(--sp-pad-32, 32px)", borderRadius: "26px", background: "#162456", color: "#FFFFFF", position: "sticky", top: "calc(var(--sp-header-h, 84px) + 16px)" }}>
        <h3 style={ty({ margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-22, 22px)", lineHeight: 1.2, fontWeight: 600, letterSpacing: "-0.03em", color: "#FFFFFF" })}>{c.estimate.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <img src={MODE_PICTURES[s.mode]} alt="" style={{ width: "88px", height: "auto", flexShrink: 0, background: "#FFFFFF", borderRadius: "12px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
            <span style={{ fontSize: "15px", fontWeight: 600 }}>
              {c.mode.names[s.mode]} · {c.formula.names[s.formula]}
            </span>
            <span style={{ fontSize: "13.5px", color: "#C3CDEB" }}>
              {c.estimate.delayLabel}{c.sep}{c.estimate.delays[s.mode]}
            </span>
            <span style={{ fontFamily: MONO, fontSize: "13.5px", color: "#FFC247" }}>
              {n(s.bracket.billedKg)} kg · {s.bracket.label} kg
            </span>
          </div>
        </div>
        {surcharges.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#8DB2FF" }}>{c.estimate.surcharges}</span>
            {surcharges.map((x) => (
              <span key={x} style={{ fontSize: "14px", color: "#E3EBFF" }}>
                · {x}
              </span>
            ))}
          </div>
        )}

        {quote ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px 14px", borderRadius: "14px", background: "rgba(141,178,255,0.12)", border: "1px solid rgba(141,178,255,0.35)" }}>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#FFFFFF" }}>{c.gate.lockedQuote}</span>
            <span style={{ fontSize: "14px", lineHeight: 1.5, color: "#E3EBFF" }}>{s.reason ? c.quote.reasons[s.reason] : null}</span>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "14px", background: "rgba(255,194,71,0.12)", border: "1px solid rgba(255,194,71,0.35)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFC247" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 018 0v3" />
              </svg>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#FFC247" }}>{c.gate.locked}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {c.gate.points.map((p) => (
                <li key={p} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "15px", lineHeight: 1.45, color: "#E3EBFF" }}>
                  <span style={{ flexShrink: 0, display: "inline-flex", width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,194,71,0.2)", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFC247" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {state?.ok ? (
          <p role="status" style={{ margin: 0, padding: "14px", borderRadius: "14px", background: "rgba(59,214,138,0.14)", border: "1px solid rgba(59,214,138,0.4)", fontSize: "15px", lineHeight: 1.5, color: "#FFFFFF" }}>
            {fill(state.priced ? c.gate.sent : c.gate.sentQuote, { email: state.email })}
          </p>
        ) : (
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="hidden" name="request" value={JSON.stringify(s.request)} />
            <input type="hidden" name="lang" value={lang} />
            <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)", opacity: 0, pointerEvents: "none" }} />
            <label htmlFor="sim-name" style={darkLabel}>
              {c.gate.name}
            </label>
            <input id="sim-name" name="name" autoComplete="name" maxLength={120} style={darkInput} />
            <label htmlFor="sim-phone" style={darkLabel}>
              {c.gate.phone}
            </label>
            <input id="sim-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} style={darkInput} />
            <label htmlFor="sim-email" style={darkLabel}>
              {c.gate.email}
            </label>
            <input id="sim-email" name="email" type="email" required autoComplete="email" placeholder={c.gate.emailPlaceholder} style={darkInput} />
            {s.blocking && <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5, color: "#FFC247" }}>{s.blocking}</p>}
            {state && !state.ok && <p role="alert" style={{ margin: 0, fontSize: "14px", lineHeight: 1.5, color: "#FF9FB2" }}>{c.gate.errors[state.error]}</p>}
            <button type="submit" disabled={pending || Boolean(s.blocking)} className="spm-cta" style={ty({ display: "inline-flex", alignItems: "center", gap: "10px", width: "100%", justifyContent: "center", boxSizing: "border-box", minHeight: "44px", padding: "14px 22px", borderRadius: "12px", fontFamily: BODY, fontWeight: 600, fontSize: "var(--sp-fs-16, 16px)", background: "#FFC247", color: "#0E1A3D", border: "1.5px solid #FFC247", cursor: pending || s.blocking ? "default" : "pointer", opacity: s.blocking ? 0.6 : 1 })}>
              <span>{pending ? c.gate.sending : quote ? c.gate.ctaQuote : c.gate.cta}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={shaft} />
                <path d={head} />
              </svg>
            </button>
            <a href="/connexion" style={ty({ display: "inline-flex", alignItems: "center", gap: "10px", width: "100%", justifyContent: "center", boxSizing: "border-box", minHeight: "44px", padding: "14px 22px", borderRadius: "12px", fontFamily: BODY, fontWeight: 600, fontSize: "var(--sp-fs-16, 16px)", background: "transparent", color: "#FFFFFF", border: "1.5px solid rgba(255,255,255,0.28)" })}>
              <span>{c.gate.already}</span>
            </a>
          </form>
        )}
        <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: "#B8C4E6" }}>{c.gate.note}</p>
      </div>
    </div>
  );
}
