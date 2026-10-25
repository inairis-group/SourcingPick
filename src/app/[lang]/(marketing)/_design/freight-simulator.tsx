import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n/config";
import { freightCopy, freightFormCopy } from "@/content/freight/simulator";
import { DISPLAY, localType } from "./locale-type";
import { FreightSimulatorForm } from "./freight-simulator-form";

/**
 * The freight simulator on /livraisons, in place of the estimator the canvas
 * draws there (the porter emits this component for `section#simulateur`).
 *
 * The form and its panel run in the browser (freight-simulator-form.tsx);
 * under them, every rule of the carrier's rate card, in plain words, rendered
 * here so it is in the page for readers and search engines alike.
 */
export function FreightSimulator({ lang, id, style }: { lang: Locale; id?: string; style?: CSSProperties }) {
  const { rules } = freightCopy(lang);

  return (
    <section id={id} style={style}>
      <FreightSimulatorForm lang={lang} copy={freightFormCopy(lang)} />

      <div style={{ marginTop: "24px", padding: "var(--sp-pad-48, 48px)", borderRadius: "32px", background: "#FFFFFF", border: "1px solid #DCE3F2", display: "flex", flexDirection: "column", gap: "14px" }}>
        <h2 style={localType(lang, { margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-28, 28px)", lineHeight: 1.2, fontWeight: 600, letterSpacing: "-0.03em", color: "#0E1A3D" })}>{rules.title}</h2>
        <p style={{ margin: 0, fontSize: "16px", lineHeight: 1.6, color: "#4A5578" }}>{rules.intro}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {rules.sections.map((s, i) => (
            <details key={s.title} open={i === 0} style={{ borderRadius: "16px", border: "1px solid #DCE3F2", background: "#F5F7FC", padding: "0 18px" }}>
              <summary style={{ cursor: "pointer", minHeight: "52px", display: "flex", alignItems: "center", fontSize: "16px", fontWeight: 600, color: "#0E1A3D" }}>{s.title}</summary>
              <p style={{ margin: "0 0 16px", fontSize: "15px", lineHeight: 1.65, color: "#4A5578" }}>{s.text}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
