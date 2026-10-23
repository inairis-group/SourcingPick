"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

/**
 * The SEO pack's free tool (05_Code_Technique_SEO_et_Simulateur_CBM,
 * ImportSimulator.tsx), in the site's design: the cartons of several
 * suppliers add up to a consolidated volume, the volume suggests a way to
 * ship, and the two commissions are worked out from the visitor's own
 * figures. French only, like the page it sits on.
 *
 * Kept from the pack: the volume (L × l × h ÷ 1 000 000 per carton), the
 * thresholds (under 15 m³ groupage, up to 28 m³ a 20-foot, 58 m³ a 40-foot,
 * 68 m³ a 40-foot High Cube) and the 2 % / 3 %. Two changes, both so the
 * figures are true: each line has its weight field (the pack totals a weight
 * nobody can enter), and past 68 m³ the advice is several containers instead
 * of one full to 100 %.
 *
 * It prices nothing of ours beyond the two published rates: warehouse work
 * is quoted line by line, as the page says.
 */

type Line = { id: number; supplier: string; length: number; width: number; height: number; weight: number; quantity: number };

const MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace";
const DISPLAY = "'Unbounded', 'Trebuchet MS', sans-serif";
const BODY = "'Onest', 'Segoe UI', system-ui, sans-serif";

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

const FIELD: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  minHeight: "48px",
  padding: "0 14px",
  borderRadius: "12px",
  border: "1.5px solid #DCE3F2",
  background: "#FFFFFF",
  fontFamily: MONO,
  fontSize: "16px",
  fontWeight: 600,
  color: "#0E1A3D",
};
const LABEL: CSSProperties = { display: "block", marginBottom: "6px", fontFamily: MONO, fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#4A5578" };
const CARD: CSSProperties = { display: "flex", flexDirection: "column", gap: "16px", padding: "var(--sp-pad-28, 28px)", borderRadius: "24px", background: "#FFFFFF", border: "1px solid #DCE3F2" };
const H3: CSSProperties = { margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-20, 20px)", lineHeight: 1.25, fontWeight: 600, letterSpacing: "-0.03em", color: "#0E1A3D" };

function plan(cbm: number): { label: string; capacity: number } {
  if (cbm < 15) return { label: "Groupage maritime LCL (port de Nansha)", capacity: 15 };
  if (cbm <= 28) return { label: "Conteneur 20 pieds Dry (capacité utile ~28 m³)", capacity: 28 };
  if (cbm <= 58) return { label: "Conteneur 40 pieds Dry (capacité utile ~58 m³)", capacity: 58 };
  if (cbm <= 68) return { label: "Conteneur 40 pieds High Cube (capacité utile ~68 m³)", capacity: 68 };
  const n = Math.ceil(cbm / 68);
  return { label: `${n} conteneurs 40 pieds High Cube (~68 m³ chacun)`, capacity: 68 * n };
}

function Num({ id, label, value, onChange, step = 1 }: { id: string; label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <label htmlFor={id} style={LABEL}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        style={FIELD}
      />
    </div>
  );
}

export function ImportSimulator({ quoteHref }: { quoteHref: string }) {
  const [goods, setGoods] = useState(15000);
  const [sourcing, setSourcing] = useState(true);
  const [freight, setFreight] = useState(1800);
  const [crates, setCrates] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    { id: 1, supplier: "Fournisseur 1", length: 60, width: 40, height: 50, weight: 18, quantity: 50 },
    { id: 2, supplier: "Fournisseur 2", length: 50, width: 50, height: 40, weight: 14, quantity: 40 },
  ]);

  const update = (id: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const add = () =>
    setLines((ls) => [
      ...ls,
      { id: Math.max(0, ...ls.map((l) => l.id)) + 1, supplier: `Fournisseur ${ls.length + 1}`, length: 50, width: 40, height: 40, weight: 15, quantity: 20 },
    ]);
  const remove = (id: number) => setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.id !== id) : ls));

  const totals = useMemo(() => {
    let cbm = 0;
    let kg = 0;
    let cartons = 0;
    for (const l of lines) {
      cbm += ((l.length * l.width * l.height) / 1_000_000) * l.quantity;
      kg += l.weight * l.quantity;
      cartons += l.quantity;
    }
    const p = plan(cbm);
    const sourcingFee = sourcing ? goods * 0.02 : 0;
    const freightFee = freight * 0.03;
    return {
      cbm,
      kg,
      cartons,
      plan: p,
      fill: p.capacity ? Math.min(100, Math.round((cbm / p.capacity) * 100)) : 0,
      sourcingFee,
      freightFee,
      commission: sourcingFee + freightFee,
    };
  }, [lines, goods, sourcing, freight]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "8px" }}>
      <section style={CARD} aria-labelledby="sim-lines">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <h2 id="sim-lines" style={H3}>
            1. Vos livraisons fournisseurs à consolider à Guangzhou ({lines.length} fournisseur{lines.length > 1 ? "s" : ""})
          </h2>
          <button type="button" onClick={add} style={{ minHeight: "44px", padding: "0 18px", borderRadius: "12px", border: "1.5px solid #155DFC", background: "#FFFFFF", color: "#155DFC", fontFamily: BODY, fontWeight: 600, fontSize: "15px", cursor: "pointer" }}>
            + Ajouter un fournisseur
          </button>
        </div>
        {lines.map((l) => (
          <div key={l.id} className="sp-sim-row" style={{ padding: "16px", borderRadius: "18px", background: "#F5F7FC", border: "1px solid #DCE3F2" }}>
            <div className="sp-sim-name">
              <label htmlFor={`sim-${l.id}-name`} style={LABEL}>
                Fournisseur / lot
              </label>
              <input id={`sim-${l.id}-name`} type="text" value={l.supplier} onChange={(e) => update(l.id, { supplier: e.target.value })} style={{ ...FIELD, fontFamily: BODY }} />
            </div>
            <Num id={`sim-${l.id}-l`} label="Long. (cm)" value={l.length} onChange={(v) => update(l.id, { length: v })} />
            <Num id={`sim-${l.id}-w`} label="Larg. (cm)" value={l.width} onChange={(v) => update(l.id, { width: v })} />
            <Num id={`sim-${l.id}-h`} label="Haut. (cm)" value={l.height} onChange={(v) => update(l.id, { height: v })} />
            <Num id={`sim-${l.id}-kg`} label="Poids (kg)" value={l.weight} step={0.1} onChange={(v) => update(l.id, { weight: v })} />
            <Num id={`sim-${l.id}-q`} label="Cartons" value={l.quantity} onChange={(v) => update(l.id, { quantity: Math.round(v) })} />
            <div className="sp-sim-sub" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "10px" }}>
              <div>
                <span style={LABEL}>Sous-total</span>
                <span style={{ fontFamily: MONO, fontSize: "16px", fontWeight: 600, color: "#0E1A3D" }}>
                  {num.format(((l.length * l.width * l.height) / 1_000_000) * l.quantity)} m³
                </span>
              </div>
              {lines.length > 1 && (
                <button type="button" onClick={() => remove(l.id)} aria-label={`Retirer ${l.supplier}`} style={{ minHeight: "44px", padding: "0 12px", border: 0, background: "transparent", color: "#C8364F", fontFamily: BODY, fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
                  Retirer
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      <section style={CARD} aria-labelledby="sim-money">
        <h2 id="sim-money" style={H3}>
          2. Montants
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", gap: "24px" }}>
          <div>
            <Num id="sim-goods" label="Montant total des marchandises fournisseurs (€)" value={goods} step={500} onChange={setGoods} />
            <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "12px", fontSize: "15px", lineHeight: 1.5, color: "#0E1A3D", cursor: "pointer" }}>
              <input type="checkbox" checked={sourcing} onChange={(e) => setSourcing(e.target.checked)} style={{ marginTop: "4px", accentColor: "#155DFC", width: "18px", height: "18px" }} />
              Sourcing Pick achète et paie les fournisseurs pour moi (commission 2 %)
            </label>
          </div>
          <div>
            <Num id="sim-freight" label="Coût du fret maritime estimé depuis Nansha (€)" value={freight} step={100} onChange={setFreight} />
            <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "12px", fontSize: "15px", lineHeight: 1.5, color: "#0E1A3D", cursor: "pointer" }}>
              <input type="checkbox" checked={crates} onChange={(e) => setCrates(e.target.checked)} style={{ marginTop: "4px", accentColor: "#155DFC", width: "18px", height: "18px" }} />
              Besoin de caisses en bois sur mesure certifiées NIMP 15 (chiffrées sur devis)
            </label>
          </div>
        </div>
      </section>

      <section aria-live="polite" style={{ display: "grid", gridTemplateColumns: "var(--sp-grid-r3, repeat(3, minmax(0, 1fr)))", gap: "24px", padding: "var(--sp-pad-32, 32px)", borderRadius: "28px", background: "#0B1433", color: "#FFFFFF" }}>
        <div>
          <span style={{ ...LABEL, color: "#8DB2FF" }}>Volume consolidé à Baiyun</span>
          <p style={{ margin: "4px 0 0", fontFamily: DISPLAY, fontSize: "var(--sp-fs-34, 34px)", fontWeight: 700, letterSpacing: "-0.03em" }}>{num.format(totals.cbm)} m³</p>
          <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#C3CDEB" }}>
            {num.format(totals.cartons)} cartons · poids total estimé : {num.format(totals.kg)} kg
          </p>
        </div>
        <div>
          <span style={{ ...LABEL, color: "#8DB2FF" }}>Unité maritime recommandée</span>
          <p style={{ margin: "4px 0 0", fontSize: "17px", fontWeight: 600, lineHeight: 1.4 }}>{totals.plan.label}</p>
          <div style={{ marginTop: "10px", height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${totals.fill}%`, background: "#3BD68A", transition: "width 200ms ease" }} />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#C3CDEB" }}>Taux d’occupation estimé : {totals.fill} %</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}>
          <div>
            <span style={{ ...LABEL, color: "#8DB2FF" }}>Commissions Sourcing Pick</span>
            <p style={{ margin: "4px 0 0", fontFamily: DISPLAY, fontSize: "var(--sp-fs-34, 34px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#FFC247" }}>{eur.format(totals.commission)}</p>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#C3CDEB" }}>
              Sourcing (2 %) : {eur.format(totals.sourcingFee)} · Fret (3 %) : {eur.format(totals.freightFee)}
            </p>
            {crates && <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#C3CDEB" }}>Caisses NIMP 15 : chiffrées sur une ligne séparée de votre devis.</p>}
          </div>
          <a href={quoteHref} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", minHeight: "44px", padding: "14px 20px", borderRadius: "12px", background: "#FFFFFF", color: "#0E1A3D", fontFamily: BODY, fontWeight: 600, fontSize: "15px", textAlign: "center" }}>
            Demander mon devis ligne par ligne →
          </a>
        </div>
      </section>
    </div>
  );
}
