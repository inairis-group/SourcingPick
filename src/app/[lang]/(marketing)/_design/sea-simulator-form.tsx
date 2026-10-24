"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { localeDirections, type Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/formatters";
import type { SeaSimulatorCopy } from "@/content/freight/sea-simulator";
import { requestSeaEstimate, type SeaEstimateState } from "@/lib/freight/actions";
import {
  SEA_LINES,
  seaCountries,
  seaCountryLines,
  seaWarehouseLines,
  type GoodsClass,
  type SeaLine,
  type SeaRegime,
} from "@/lib/freight/sea-europe-options";
import { cartonRefused, cartonWeights, oversizeSurcharge, type Carton } from "@/lib/freight/weights";
import { ARROW_PATHS, BODY, DISPLAY, MONO, localType } from "./locale-type";

/**
 * The form and the estimate panel of the sea simulator (sea-simulator.tsx).
 *
 * The visitor describes the shipment; the chargeable weight, the bracket and
 * the surcharges that will apply are worked out as they type (no prices: the
 * rates stay on the server). "Voir le prix" sends the request to
 * requestSeaEstimate, which prices it with the carrier's sea rate card and
 * e-mails the detail, then the visitor goes on to create their account
 * (/inscription).
 */

/** The copy the form shows: everything but the rules and the e-mail. */
export type SeaFormCopy = Omit<SeaSimulatorCopy, "rules" | "email"> & { sep: string };

type Line = Carton & { id: number };
type DeliverTo = "amazon" | "other" | "thirdParty";

const INPUT: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  minHeight: "54px",
  padding: "0 16px",
  borderRadius: "14px",
  border: "1.5px solid #DCE3F2",
  background: "#FFFFFF",
  fontFamily: MONO,
  fontSize: "var(--sp-fs-20, 20px)",
  fontWeight: 600,
  color: "#0E1A3D",
};
const SELECT: CSSProperties = { ...INPUT, fontFamily: BODY, fontSize: "16px", appearance: "auto" };
const LABEL: CSSProperties = { fontSize: "14px", fontWeight: 600, color: "#0E1A3D" };
const HINT: CSSProperties = { fontSize: "13px", lineHeight: 1.5, color: "#4A5578", margin: 0 };
const SMALL_LABEL: CSSProperties = { display: "block", marginBottom: "6px", fontFamily: MONO, fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#4A5578" };

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

function Segmented<T extends string>({ value, options, onChange, lang }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; lang: Locale }) {
  return (
    <span role="radiogroup" style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "16px", background: "#F5F7FC", border: "1.5px solid #DCE3F2", flexWrap: "wrap" }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            style={localType(lang, { flex: "1 1 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "44px", padding: "0 12px", borderRadius: "12px", border: 0, fontFamily: BODY, fontSize: "15px", fontWeight: 600, cursor: "pointer", background: on ? "#155DFC" : "transparent", color: on ? "#FFFFFF" : "#0E1A3D" })}
          >
            {o.label}
          </button>
        );
      })}
    </span>
  );
}

function NumberField({ id, label, value, onChange, step = 1, lang }: { id: string; label: string; value: number; onChange: (v: number) => void; step?: number; lang: Locale }) {
  return (
    <div style={{ minWidth: 0 }}>
      <label htmlFor={id} style={localType(lang, SMALL_LABEL)}>
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
        style={{ ...INPUT, fontSize: "17px", minHeight: "48px", padding: "0 12px", borderRadius: "12px" }}
      />
    </div>
  );
}

export function SeaSimulatorForm({ lang, copy: c }: { lang: Locale; copy: SeaFormCopy }) {
  const ty = (s: CSSProperties) => localType(lang, s);
  const n = (v: number, digits = 1) => formatNumber(v, lang, { maximumFractionDigits: digits });
  const regions = useMemo(() => {
    try {
      return new Intl.DisplayNames([lang], { type: "region" });
    } catch {
      return null;
    }
  }, [lang]);
  const countryName = (iso: string) => regions?.of(iso) ?? iso;

  const [regime, setRegime] = useState<SeaRegime>("ddp");
  const [deliverTo, setDeliverTo] = useState<DeliverTo>("amazon");
  const [warehouse, setWarehouse] = useState<string>("country");
  const [country, setCountry] = useState("FR");
  const [carrier, setCarrier] = useState<SeaLine["carrier"]>("upsDpd");
  const [goods, setGoods] = useState<GoodsClass>("ordinary");
  const [phones, setPhones] = useState(0);
  const [scooters, setScooters] = useState(0);
  const [bikes, setBikes] = useState(0);
  const [designations, setDesignations] = useState(1);
  const [declaration, setDeclaration] = useState(false);
  const [signature, setSignature] = useState(false);
  const [lines, setLines] = useState<Line[]>([{ id: 1, quantity: 20, length: 60, width: 40, height: 40, weight: 18 }]);
  const [state, formAction, pending] = useActionState<SeaEstimateState | null, FormData>(requestSeaEstimate, null);

  const countries = seaCountries(regime);
  const pickedCountry = countries.includes(country) ? country : countries[0];
  const warehouses = seaWarehouseLines(regime).filter((l) => (deliverTo === "thirdParty" ? l.kind === "thirdParty" : l.kind === "amazon"));
  const countryLines = seaCountryLines(regime, pickedCountry);

  const line: SeaLine | undefined = (() => {
    if (deliverTo === "thirdParty") return warehouses[0];
    if (deliverTo === "amazon" && warehouse !== "country") return warehouses.find((l) => l.id === warehouse) ?? countryLines[0];
    return countryLines.find((l) => l.carrier === carrier) ?? countryLines[0];
  })();

  // A regime change can leave a choice that no longer exists under the other one.
  const changeRegime = (next: SeaRegime) => {
    setRegime(next);
    if (next === "ddp" && deliverTo === "thirdParty") setDeliverTo("amazon");
    if (warehouse !== "country" && !SEA_LINES.some((l) => l.id === warehouse && l.regime === next)) setWarehouse("country");
  };

  // Once the price is on its way, on to the account. /inscription is the
  // client area's (another app behind the same domain): a full page load.
  useEffect(() => {
    if (state?.ok) {
      const t = window.setTimeout(() => window.location.assign(new URL("/inscription", window.location.href).href), 2500);
      return () => window.clearTimeout(t);
    }
  }, [state]);

  const minPerCarton = line?.minKgPerCarton ?? 12;
  const w = cartonWeights(lines, minPerCarton);
  // As estimateSea brackets and bills it: from 70 kg on, at least 71 kg.
  const bracket = w.chargeable >= 300 ? "300+ kg" : w.chargeable > 70 || line?.minShipmentKg === 71 ? "71–299 kg" : "21–70 kg";
  const billed = Math.max(w.chargeable, bracket === "300+ kg" ? 0 : bracket === "71–299 kg" ? 71 : 21);
  const refusedCarton = lines.some((l) => l.quantity > 0 && cartonRefused(l));
  const oversize = lines.reduce((sum, l) => sum + (l.quantity > 0 && oversizeSurcharge(l) ? l.quantity : 0), 0);
  const nonAmazon = deliverTo === "other";
  const tooManyDesignations = regime === "ddp" && designations > 5;
  const hasCartons = w.cartons > 0 && lines.every((l) => !l.quantity || (l.length && l.width && l.height && l.weight));
  const blocking = goods === "refused" ? c.warnings.refusedGoods : refusedCarton ? c.warnings.refusedCarton : tooManyDesignations ? c.warnings.tooManyDesignations : !hasCartons ? c.warnings.noCartons : null;

  const request = {
    regime,
    lineId: line?.id ?? "",
    nonAmazon,
    goods,
    cartons: lines.map(({ quantity, length, width, height, weight }) => ({ quantity, length, width, height, weight })),
    designations,
    phones,
    scooters,
    bikes,
    separateDeclaration: declaration,
    signature: signature && line?.carrier === "ups",
  };

  const update = (lineId: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === lineId ? { ...l, ...patch } : l)));
  const [shaft, head] = ARROW_PATHS[localeDirections[lang]];
  const surcharges = [
    oversize ? fill(c.estimate.oversize, { n: n(oversize, 0) }) : null,
    w.cartons === 1 ? c.estimate.singleCarton : null,
    nonAmazon && line?.nonAmazonAllowed ? c.estimate.nonAmazon : null,
    regime === "vat" ? c.estimate.vatClearance : null,
  ].filter(Boolean) as string[];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "var(--sp-grid-fr-500, minmax(0, 1fr) 500px)", gap: "var(--sp-gap-48, 48px)", alignItems: "start", padding: "var(--sp-pad-48, 48px)", borderRadius: "32px", background: "#FFFFFF", border: "1px solid #DCE3F2" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "22px", minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={ty({ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "8px", fontFamily: MONO, fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155DFC" })}>{c.eyebrow}</div>
          <h2 style={ty({ margin: 0, fontFamily: DISPLAY, fontSize: "calc(var(--sp-fs-40, 40px) * 0.95)", lineHeight: 1.12, fontWeight: 600, letterSpacing: "-0.03em", color: "#0E1A3D", textWrap: "balance" })}>{c.title}</h2>
          <p style={{ margin: 0, fontSize: "var(--sp-fs-17, 17px)", lineHeight: 1.6, color: "#4A5578" }}>{c.intro}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={LABEL}>{c.regime.label}</span>
          <Segmented lang={lang} value={regime} onChange={changeRegime} options={[{ value: "ddp", label: c.regime.ddp }, { value: "vat", label: c.regime.vat }]} />
          <p style={HINT}>{regime === "ddp" ? c.regime.ddpHint : c.regime.vatHint}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={LABEL}>{c.deliverTo.label}</span>
          <Segmented
            lang={lang}
            value={deliverTo}
            onChange={setDeliverTo}
            options={[
              { value: "amazon", label: c.deliverTo.amazon },
              { value: "other", label: c.deliverTo.other },
              ...(regime === "vat" ? [{ value: "thirdParty" as const, label: c.deliverTo.thirdParty }] : []),
            ]}
          />
        </div>

        {deliverTo === "thirdParty" ? (
          <p style={{ ...HINT, fontSize: "15px", color: "#0E1A3D" }}>{warehouses[0]?.warehouses} · {c.carrier.truck}</p>
        ) : (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {deliverTo === "amazon" && (
              <label style={{ flex: "1 1 100%", minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={LABEL}>{c.warehouse.label}</span>
                <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} style={SELECT}>
                  <option value="country">{c.warehouse.byCountry}</option>
                  {warehouses.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.warehouses}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {(deliverTo === "other" || warehouse === "country") && (
              <label style={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={LABEL}>{c.country}</span>
                <select value={pickedCountry} onChange={(e) => setCountry(e.target.value)} style={SELECT}>
                  {[...countries].sort((a, b) => countryName(a).localeCompare(countryName(b), lang)).map((iso) => (
                    <option key={iso} value={iso}>
                      {countryName(iso)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {(deliverTo === "other" || warehouse === "country") && countryLines.length > 1 && (
              <div style={{ flex: "1 1 100%", display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={LABEL}>{c.carrier.label}</span>
                <Segmented lang={lang} value={line?.carrier ?? carrier} onChange={setCarrier} options={countryLines.map((l) => ({ value: l.carrier, label: c.carrier[l.carrier] }))} />
              </div>
            )}
            {(deliverTo === "other" || warehouse === "country") && countryLines.length === 1 && line && (
              <p style={{ ...HINT, flex: "1 1 100%" }}>
                {c.carrier.label}{c.sep}{c.carrier[line.carrier]}
              </p>
            )}
          </div>
        )}

        <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={LABEL}>{c.goods.label}</span>
          <select value={goods} onChange={(e) => setGoods(e.target.value as GoodsClass)} style={SELECT}>
            <option value="ordinary">{c.goods.ordinary}</option>
            <option value="plus1">{c.goods.plus1}</option>
            <option value="plus3">{c.goods.plus3}</option>
            <option value="plus4">{c.goods.plus4}</option>
            <option value="refused">{c.goods.refused}</option>
          </select>
          <p style={HINT}>{c.goods.hint}</p>
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={LABEL}>{c.units.label}</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", alignItems: "end" }}>
            <NumberField lang={lang} id="sea-phones" label={c.units.phones} value={phones} onChange={(v) => setPhones(Math.round(v))} />
            <NumberField lang={lang} id="sea-scooters" label={c.units.scooters} value={scooters} onChange={(v) => setScooters(Math.round(v))} />
            <NumberField lang={lang} id="sea-bikes" label={c.units.bikes} value={bikes} onChange={(v) => setBikes(Math.round(v))} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <span style={LABEL}>{c.cartons.title}</span>
            <button type="button" onClick={() => setLines((ls) => [...ls, { id: Math.max(0, ...ls.map((l) => l.id)) + 1, quantity: 10, length: 50, width: 40, height: 40, weight: 15 }])} style={ty({ minHeight: "44px", padding: "0 16px", borderRadius: "12px", border: "1.5px solid #155DFC", background: "#FFFFFF", color: "#155DFC", fontFamily: BODY, fontWeight: 600, fontSize: "15px", cursor: "pointer" })}>
              {c.cartons.add}
            </button>
          </div>
          {lines.map((l, i) => (
            <div key={l.id} className="sp-carton-row" style={{ padding: "14px", borderRadius: "18px", background: "#F5F7FC", border: "1px solid #DCE3F2" }}>
              <NumberField lang={lang} id={`sea-${l.id}-q`} label={c.cartons.quantity} value={l.quantity} onChange={(v) => update(l.id, { quantity: Math.round(v) })} />
              <NumberField lang={lang} id={`sea-${l.id}-l`} label={c.cartons.length} value={l.length} onChange={(v) => update(l.id, { length: v })} />
              <NumberField lang={lang} id={`sea-${l.id}-w`} label={c.cartons.width} value={l.width} onChange={(v) => update(l.id, { width: v })} />
              <NumberField lang={lang} id={`sea-${l.id}-h`} label={c.cartons.height} value={l.height} onChange={(v) => update(l.id, { height: v })} />
              <NumberField lang={lang} id={`sea-${l.id}-kg`} label={c.cartons.weight} value={l.weight} step={0.1} onChange={(v) => update(l.id, { weight: v })} />
              <div className="sp-carton-remove" style={{ display: "flex", alignItems: "flex-end" }}>
                {lines.length > 1 && (
                  <button type="button" aria-label={`${fill(c.cartons.line, { n: i + 1 })} — ${c.cartons.remove}`} onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} style={ty({ minHeight: "48px", padding: "0 10px", border: 0, background: "transparent", color: "#C8364F", fontFamily: BODY, fontWeight: 600, fontSize: "14px", cursor: "pointer" })}>
                    {c.cartons.remove}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "var(--sp-grid-r2, repeat(2, minmax(0, 1fr)))", gap: "16px" }}>
          <div>
            <NumberField lang={lang} id="sea-designations" label={c.designations.label} value={designations} onChange={(v) => setDesignations(Math.max(1, Math.round(v)))} />
            <p style={{ ...HINT, marginTop: "6px" }}>{c.designations.hint}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "15px", lineHeight: 1.45, color: "#0E1A3D", cursor: "pointer" }}>
              <input type="checkbox" checked={declaration} onChange={(e) => setDeclaration(e.target.checked)} style={{ marginTop: "3px", accentColor: "#155DFC", width: "18px", height: "18px" }} />
              <span>
                {c.options.declaration}
                <br />
                <span style={HINT}>{c.options.declarationHint}</span>
              </span>
            </label>
            {line?.carrier === "ups" && (
              <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "15px", lineHeight: 1.45, color: "#0E1A3D", cursor: "pointer" }}>
                <input type="checkbox" checked={signature} onChange={(e) => setSignature(e.target.checked)} style={{ marginTop: "3px", accentColor: "#155DFC", width: "18px", height: "18px" }} />
                <span>
                  {c.options.signature}
                  <br />
                  <span style={HINT}>{c.options.signatureHint}</span>
                </span>
              </label>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={LABEL}>{c.calc.title}</span>
          <div style={{ display: "grid", gridTemplateColumns: "var(--sp-grid-r3, repeat(3, minmax(0, 1fr)))", gap: "12px" }} aria-live="polite">
            {[
              [c.calc.real, w.real, fill(c.calc.cartons, { n: n(w.cartons, 0) })],
              [c.calc.volumetric, w.volumetric, c.calc.formula],
              [c.calc.chargeable, w.chargeable, c.calc.chargeableHint],
            ].map(([label, value, detail], k) => (
              <div key={k} style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "18px", borderRadius: "18px", background: k === 2 ? "#EAF1FF" : "#F5F7FC", border: `1.5px solid ${k === 2 ? "#155DFC" : "#DCE3F2"}` }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#4A5578" }}>{label as string}</span>
                <span style={{ fontFamily: MONO, fontSize: "var(--sp-fs-24, 24px)", fontWeight: 600, color: "#0E1A3D" }}>
                  {n(value as number)} <span style={{ fontSize: "15px", color: "#4A5578" }}>kg</span>
                </span>
                <span style={{ fontSize: "12.5px", lineHeight: 1.45, color: "#4A5578" }}>{detail as string}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: "13.5px", color: "#4A5578" }}>
            {fill(c.calc.volume, { m3: `${formatNumber(w.volume, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³` })} · {c.calc.bracket} {bracket} · {fill(c.calc.billed, { kg: n(billed) })}
          </span>
        </div>
      </div>

      <div className="sp-sim-panel" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "var(--sp-pad-32, 32px)", borderRadius: "26px", background: "#162456", color: "#FFFFFF", position: "sticky", top: "calc(var(--sp-header-h, 84px) + 16px)" }}>
        <h3 style={ty({ margin: 0, fontFamily: DISPLAY, fontSize: "var(--sp-fs-22, 22px)", lineHeight: 1.2, fontWeight: 600, letterSpacing: "-0.03em", color: "#FFFFFF" })}>{c.estimate.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <img src="/design/container-ship.svg" alt="" style={{ width: "88px", height: "auto", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
            <span style={{ fontSize: "15px", fontWeight: 600 }}>{c.estimate.mode}</span>
            <span style={{ fontSize: "13.5px", color: "#C3CDEB" }}>
              {c.estimate.delayLabel}{c.sep}{c.estimate.delay}
            </span>
            <span style={{ fontFamily: MONO, fontSize: "13.5px", color: "#FFC247" }}>
              {n(billed)} kg · {bracket}
            </span>
          </div>
        </div>
        {surcharges.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#8DB2FF" }}>{c.estimate.surcharges}</span>
            {surcharges.map((s) => (
              <span key={s} style={{ fontSize: "14px", color: "#E3EBFF" }}>
                · {s}
              </span>
            ))}
          </div>
        )}

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

        {state?.ok ? (
          <p role="status" style={{ margin: 0, padding: "14px", borderRadius: "14px", background: "rgba(59,214,138,0.14)", border: "1px solid rgba(59,214,138,0.4)", fontSize: "15px", lineHeight: 1.5, color: "#FFFFFF" }}>
            {fill(c.gate.sent, { email: state.email })}
          </p>
        ) : (
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="hidden" name="request" value={JSON.stringify(request)} />
            <input type="hidden" name="lang" value={lang} />
            <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)", opacity: 0, pointerEvents: "none" }} />
            <label htmlFor="sea-email" style={{ fontSize: "14px", fontWeight: 600, color: "#E3EBFF" }}>
              {c.gate.email}
            </label>
            <input id="sea-email" name="email" type="email" required autoComplete="email" placeholder={c.gate.emailPlaceholder} style={{ ...INPUT, fontFamily: BODY, fontSize: "16px", minHeight: "48px", borderRadius: "12px" }} />
            {blocking && <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5, color: "#FFC247" }}>{blocking}</p>}
            {state && !state.ok && <p role="alert" style={{ margin: 0, fontSize: "14px", lineHeight: 1.5, color: "#FF9FB2" }}>{c.gate.errors[state.error]}</p>}
            <button type="submit" disabled={pending || Boolean(blocking) || !line} className="spm-cta" style={ty({ display: "inline-flex", alignItems: "center", gap: "10px", width: "100%", justifyContent: "center", boxSizing: "border-box", minHeight: "44px", padding: "14px 22px", borderRadius: "12px", fontFamily: BODY, fontWeight: 600, fontSize: "var(--sp-fs-16, 16px)", background: "#FFC247", color: "#0E1A3D", border: "1.5px solid #FFC247", cursor: pending || blocking ? "default" : "pointer", opacity: blocking ? 0.6 : 1 })}>
              <span>{pending ? c.gate.sending : c.gate.cta}</span>
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
