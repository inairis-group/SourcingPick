"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/formatters";
import { goodsLabel, type FreightFormCopy } from "@/content/freight/simulator";
import {
  ALL_COUNTRIES,
  CONTAINER_TYPES,
  DISCOURAGED,
  FORMULAS,
  GOODS,
  MAX_DDP_PRODUCTS,
  MIN_KG_DEFAULT,
  MIN_KG_PER_CARTON,
  MODES,
  PRICED_MODES,
  bracketOf,
  carrierFees,
  carrierOf,
  goodsClass,
  routeOf,
  servesCountry,
  sides,
  wholeKg,
  type ContainerType,
  type Formula,
  type Mode,
} from "@/lib/freight/modes";
import { productWeights, totalWeights, type Product } from "@/lib/freight/weights";
import { BODY, DISPLAY, MONO, localType } from "./locale-type";

/**
 * The shipment the freight simulator describes — mode, formula, address and
 * products — and its fields. Shared by the public simulator (price by e-mail)
 * and the admin's (price on screen); each adds its own panel. No prices here:
 * the line the cartons call for, the weights, the bracket and the surcharges
 * that will apply, as you type.
 */

type Row = Product & { id: number };

const newRow = (id: number, example = false): Row => ({
  id,
  name: "",
  goods: "ordinary",
  cartons: example ? 20 : 1,
  length: example ? 60 : 0,
  width: example ? 40 : 0,
  height: example ? 40 : 0,
  weight: example ? 18 : 0,
  units: 0,
  battery: false,
  reinforce: false,
});

export const MODE_PICTURES: Record<Mode, string> = {
  sea: "/design/container-ship.svg",
  air: "/design/train-plane-sketch.svg",
  container: "/design/forklift-loading.svg",
  truck: "/design/truck-unloading.svg",
  rail: "/design/train-plane-sketch.svg",
};

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

export function useShipment(copy: FreightFormCopy) {
  const [mode, setModeState] = useState<Mode>("sea");
  const [formula, setFormula] = useState<Formula>("ddp");
  const [address, setAddress] = useState({ street: "", postcode: "", city: "", country: "FR" });
  const [rows, setRows] = useState<Row[]>([newRow(1, true)]);
  const [container, setContainer] = useState<{ type: ContainerType; count: number }>({ type: "40", count: 1 });
  const [declaration, setDeclaration] = useState(false);
  const [goodsReset, setGoodsReset] = useState(false);

  // A class another mode does not have goes back to "ordinary", and the
  // visitor is told to check.
  const setMode = (next: Mode) => {
    const updated = rows.map((r) => (goodsClass(next, r.goods) ? r : { ...r, goods: "ordinary" as const, units: 0 }));
    setGoodsReset(updated.some((r, i) => r !== rows[i]));
    setRows(updated);
    setModeState(next);
  };
  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const add = () => setRows((rs) => [...rs, newRow(Math.max(0, ...rs.map((r) => r.id)) + 1)]);
  const remove = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id));

  const active = rows.filter((r) => r.cartons > 0);
  // The line the cartons call for, decided as the server will.
  const { line, zone, reason } = routeOf({ formula, mode, country: address.country, postcode: address.postcode, products: active });
  const minKg = line ? MIN_KG_PER_CARTON[line] : MIN_KG_DEFAULT;
  const totals = totalWeights(active, minKg);
  const bracket = line ? bracketOf(line, totals.chargeable) : null;
  const billedKg = bracket ? bracket.billedKg : wholeKg(totals.chargeable);
  const refusedGoods = active.some((r) => goodsClass(mode, r.goods)?.kind === "refused");
  const complete = active.length > 0 && (mode === "container" || active.every((r) => r.length && r.width && r.height && r.weight));
  const blocking = refusedGoods
    ? copy.warnings.refusedGoods
    : !complete
      ? mode === "container"
        ? copy.warnings.noProductsContainer
        : copy.warnings.noProducts
      : null;

  // What will be added, counted as the server will price it.
  const cartonsOf = (r: Row) => Math.round(r.cartons);
  const parcel = line === "sea" || line === "air" ? carrierOf(line, address.country) : null;
  const added = {
    oversize: parcel ? active.filter((r) => carrierFees(parcel, r, false).size > 0).reduce((s, r) => s + cartonsOf(r), 0) : 0,
    crate: parcel ? active.filter((r) => r.reinforce).reduce((s, r) => s + cartonsOf(r), 0) : 0,
    overlength: line === "seaHeavy" ? active.filter((r) => sides(r).a > 240).reduce((s, r) => s + cartonsOf(r), 0) : 0,
    extraNames: line === "seaHeavy" || line === "airHeavy" ? Math.max(0, active.length - MAX_DDP_PRODUCTS) : 0,
    singleCarton: Boolean(line && line !== "seaHeavy" && totals.cartons === 1),
    batteryRates: line === "airHeavy" && active.some((r) => r.battery),
  };
  const reinforcedM3 = active.filter((r) => r.reinforce).reduce((s, r) => s + productWeights(r).volume, 0);

  const request = {
    formula,
    mode,
    address,
    products: rows.map((r) => ({ name: r.name, goods: r.goods, cartons: r.cartons, length: r.length, width: r.width, height: r.height, weight: r.weight, units: r.units, battery: r.battery, reinforce: r.reinforce })),
    declaration: declaration && line !== null,
    container: mode === "container" ? container : null,
  };

  return {
    mode, setMode, formula, setFormula, address, setAddress, rows, update, add, remove,
    container, setContainer, declaration, setDeclaration, goodsReset,
    active, line, zone, totals, bracket, billedKg, reason, blocking, added, reinforcedM3, request,
  };
}

export type Shipment = ReturnType<typeof useShipment>;

const INPUT: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  minHeight: "48px",
  padding: "0 12px",
  borderRadius: "12px",
  border: "1.5px solid #DCE3F2",
  background: "#FFFFFF",
  fontFamily: MONO,
  fontSize: "17px",
  fontWeight: 600,
  color: "#0E1A3D",
};
export const TEXT_INPUT: CSSProperties = { ...INPUT, fontFamily: BODY, fontSize: "16px", fontWeight: 500, padding: "0 14px" };
const SELECT: CSSProperties = { ...TEXT_INPUT, appearance: "auto" };
const LABEL: CSSProperties = { fontSize: "14px", fontWeight: 600, color: "#0E1A3D" };
export const HINT: CSSProperties = { fontSize: "13px", lineHeight: 1.5, color: "#4A5578", margin: 0 };
const SMALL_LABEL: CSSProperties = { display: "block", marginBottom: "6px", fontFamily: MONO, fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#4A5578" };
const CHECK: CSSProperties = { display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "15px", lineHeight: 1.45, color: "#0E1A3D", cursor: "pointer" };
const BOX: CSSProperties = { marginTop: "3px", accentColor: "#155DFC", width: "18px", height: "18px", flexShrink: 0 };

function Segmented<T extends string>({ value, options, onChange, lang }: { value: T; options: { value: T; label: string; tag?: string }[]; onChange: (v: T) => void; lang: Locale }) {
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
            style={localType(lang, { flex: "1 1 auto", display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", minHeight: "44px", padding: "6px 12px", borderRadius: "12px", border: 0, fontFamily: BODY, fontSize: "15px", fontWeight: 600, cursor: "pointer", background: on ? "#155DFC" : "transparent", color: on ? "#FFFFFF" : "#0E1A3D" })}
          >
            <span>{o.label}</span>
            {o.tag && <span style={{ fontSize: "11.5px", fontWeight: 600, opacity: 0.8 }}>{o.tag}</span>}
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
        value={Number.isFinite(value) && value ? value : ""}
        placeholder="0"
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        style={INPUT}
      />
    </div>
  );
}

export function ShipmentFields({ lang, copy: c, s, idPrefix = "sim" }: { lang: Locale; copy: FreightFormCopy; s: Shipment; idPrefix?: string }) {
  const ty = (style: CSSProperties) => localType(lang, style);
  const n = (v: number, digits = 1) => formatNumber(v, lang, { maximumFractionDigits: digits });
  const kg = (v: number) => `${n(v)} kg`;
  const m3 = (v: number) => `${formatNumber(v, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³`;
  const regions = useMemo(() => {
    try {
      return new Intl.DisplayNames([lang], { type: "region" });
    } catch {
      return null;
    }
  }, [lang]);
  const countryName = (iso: string) => regions?.of(iso) ?? iso;
  const countries = [...ALL_COUNTRIES].sort((a, b) => countryName(a).localeCompare(countryName(b), lang));
  const setAddr = (patch: Partial<Shipment["address"]>) => s.setAddress({ ...s.address, ...patch });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px", minWidth: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={LABEL}>{c.mode.label}</span>
        <Segmented
          lang={lang}
          value={s.mode}
          onChange={s.setMode}
          options={MODES.map((m) => ({ value: m, label: c.mode.names[m], tag: m === "sea" ? c.mode.recommended : m === "container" ? c.mode.onQuote : DISCOURAGED.includes(m) ? c.mode.discouraged : undefined }))}
        />
        <p style={HINT}>{c.mode.hints[s.mode]}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={LABEL}>{c.formula.label}</span>
        <Segmented lang={lang} value={s.formula} onChange={s.setFormula} options={FORMULAS.map((f) => ({ value: f, label: c.formula.names[f] }))} />
        <p style={HINT}>{c.formula.hints[s.formula]}</p>
      </div>

      {s.mode === "container" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "10px", alignItems: "end" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
              <span style={ty(SMALL_LABEL)}>{c.container.type}</span>
              <select value={s.container.type} onChange={(e) => s.setContainer({ ...s.container, type: e.target.value as ContainerType })} style={SELECT}>
                {CONTAINER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {c.container.types[t]}
                  </option>
                ))}
              </select>
            </label>
            <NumberField lang={lang} id={`${idPrefix}-containers`} label={c.container.count} value={s.container.count} onChange={(v) => s.setContainer({ ...s.container, count: Math.max(1, Math.round(v)) })} />
          </div>
          <p style={HINT}>{c.container.hint}</p>
        </div>
      )}

      <fieldset style={{ margin: 0, padding: 0, border: 0, display: "flex", flexDirection: "column", gap: "10px", minWidth: 0 }}>
        <legend style={{ ...LABEL, padding: 0, marginBottom: "10px" }}>{c.address.title}</legend>
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={ty(SMALL_LABEL)}>{c.address.street}</span>
          <input name="street" autoComplete="street-address" value={s.address.street} onChange={(e) => setAddr({ street: e.target.value })} style={TEXT_INPUT} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: "10px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
            <span style={ty(SMALL_LABEL)}>{c.address.postcode}</span>
            <input name="postcode" autoComplete="postal-code" value={s.address.postcode} onChange={(e) => setAddr({ postcode: e.target.value })} style={TEXT_INPUT} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
            <span style={ty(SMALL_LABEL)}>{c.address.city}</span>
            <input name="city" autoComplete="address-level2" value={s.address.city} onChange={(e) => setAddr({ city: e.target.value })} style={TEXT_INPUT} />
          </label>
        </div>
        {s.mode === "sea" && <p style={HINT}>{c.address.postcodeHint}</p>}
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={ty(SMALL_LABEL)}>{c.address.country}</span>
          <select value={s.address.country} onChange={(e) => setAddr({ country: e.target.value })} style={SELECT}>
            {countries.map((iso) => (
              <option key={iso} value={iso}>
                {countryName(iso)}
                {s.formula === "ddp" && PRICED_MODES.includes(s.mode) && !servesCountry(s.mode, iso) ? ` (${c.quote.title})` : ""}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <span style={LABEL}>{c.products.title}</span>
        {s.goodsReset && <p style={{ ...HINT, color: "#9A5B00" }}>{c.products.goodsReset}</p>}
        {s.rows.map((r, i) => {
          const g = goodsClass(s.mode, r.goods);
          const w = productWeights(r);
          const id = `${idPrefix}-${r.id}`;
          return (
            <div key={r.id} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "18px", background: "#F5F7FC", border: "1px solid #DCE3F2" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <span style={ty({ fontFamily: DISPLAY, fontSize: "16px", fontWeight: 600, color: "#0E1A3D" })}>{fill(c.products.item, { n: i + 1 })}</span>
                {s.rows.length > 1 && (
                  <button type="button" aria-label={`${fill(c.products.item, { n: i + 1 })} — ${c.products.remove}`} onClick={() => s.remove(r.id)} style={ty({ minHeight: "40px", padding: "0 10px", border: 0, background: "transparent", color: "#C8364F", fontFamily: BODY, fontWeight: 600, fontSize: "14px", cursor: "pointer" })}>
                    {c.products.remove}
                  </button>
                )}
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={ty(SMALL_LABEL)}>{c.products.name}</span>
                <input value={r.name} maxLength={120} placeholder={c.products.namePlaceholder} onChange={(e) => s.update(r.id, { name: e.target.value })} style={TEXT_INPUT} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={ty(SMALL_LABEL)}>{c.products.goods}</span>
                <select value={r.goods} onChange={(e) => s.update(r.id, { goods: e.target.value as Row["goods"] })} style={SELECT}>
                  {GOODS[s.mode].map((cls) => (
                    <option key={cls.key} value={cls.key}>
                      {goodsLabel(c, s.mode, cls.key)}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))", gap: "10px", alignItems: "end" }}>
                  <NumberField lang={lang} id={`${id}-q`} label={c.products.cartons} value={r.cartons} onChange={(v) => s.update(r.id, { cartons: Math.round(v) })} />
                  <NumberField lang={lang} id={`${id}-l`} label={c.products.length} value={r.length} onChange={(v) => s.update(r.id, { length: v })} />
                  <NumberField lang={lang} id={`${id}-w`} label={c.products.width} value={r.width} onChange={(v) => s.update(r.id, { width: v })} />
                  <NumberField lang={lang} id={`${id}-h`} label={c.products.height} value={r.height} onChange={(v) => s.update(r.id, { height: v })} />
                  <NumberField lang={lang} id={`${id}-kg`} label={c.products.weight} value={r.weight} step={0.1} onChange={(v) => s.update(r.id, { weight: v })} />
                </div>
                <p style={{ ...HINT, marginTop: "6px" }}>{s.mode === "container" ? c.products.cartonHintContainer : c.products.cartonHint}</p>
              </div>
              {(g?.kind === "piece" || g?.kind === "eur") && (
                <div style={{ maxWidth: "220px" }}>
                  <NumberField lang={lang} id={`${id}-u`} label={c.products.units} value={r.units} onChange={(v) => s.update(r.id, { units: Math.round(v) })} />
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px" }}>
                <label style={CHECK}>
                  <input type="checkbox" checked={r.battery} onChange={(e) => s.update(r.id, { battery: e.target.checked })} style={BOX} />
                  <span>{c.products.battery}</span>
                </label>
                <label style={CHECK}>
                  <input type="checkbox" checked={r.reinforce} onChange={(e) => s.update(r.id, { reinforce: e.target.checked })} style={BOX} />
                  <span>
                    {c.products.reinforce}
                    <br />
                    <span style={HINT}>{c.products.reinforceHint}</span>
                  </span>
                </label>
              </div>
              {w.cartons > 0 && (
                <p aria-live="polite" style={{ margin: 0, fontFamily: MONO, fontSize: "13px", lineHeight: 1.5, color: "#155DFC" }}>
                  {fill(c.products.summary, { m3: m3(w.volume), volumetric: kg(w.volumetric) })}
                </p>
              )}
            </div>
          );
        })}
        <button type="button" onClick={s.add} style={ty({ alignSelf: "flex-start", minHeight: "44px", padding: "0 16px", borderRadius: "12px", border: "1.5px solid #155DFC", background: "#FFFFFF", color: "#155DFC", fontFamily: BODY, fontWeight: 600, fontSize: "15px", cursor: "pointer" })}>
          {c.products.add}
        </button>
      </div>

      {s.line && (
        <label style={CHECK}>
          <input type="checkbox" checked={s.declaration} onChange={(e) => s.setDeclaration(e.target.checked)} style={BOX} />
          <span>
            {c.options.declaration}
            <br />
            <span style={HINT}>{c.options.declarationHints[s.line]}</span>
          </span>
        </label>
      )}

      {s.mode !== "container" && (
        <div aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "18px", borderRadius: "18px", background: "#EAF1FF", border: "1.5px solid #155DFC" }}>
          {s.line && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingBottom: "10px", marginBottom: "4px", borderBottom: "1px solid #C9D8FB" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#4A5578" }}>{c.lines.label}</span>
              <span style={{ fontSize: "16px", fontWeight: 600, color: "#0E1A3D" }}>{c.lines.names[s.line]}</span>
              <span style={{ fontSize: "12.5px", lineHeight: 1.45, color: "#4A5578" }}>{c.lines.hints[s.line]}</span>
            </div>
          )}
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#4A5578" }}>{c.calc.title}</span>
          <span style={{ fontFamily: MONO, fontSize: "var(--sp-fs-24, 24px)", fontWeight: 600, color: "#0E1A3D" }}>
            {n(s.billedKg)} <span style={{ fontSize: "15px", color: "#4A5578" }}>kg</span>
          </span>
          <span style={{ fontSize: "12.5px", lineHeight: 1.45, color: "#4A5578" }}>{c.calc.rule}</span>
          <span style={{ fontSize: "13.5px", color: "#4A5578" }}>
            {fill(c.calc.volume, { m3: m3(s.totals.volume) })} · {c.calc.volumetric} {kg(s.totals.volumetric)}
            {s.bracket ? ` · ${c.calc.bracket} ${s.bracket.label} kg` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

/** What will be added to the shipment, as words: no prices. */
export function surchargeList(c: FreightFormCopy, s: Shipment, lang: Locale): string[] {
  const m3 = formatNumber(s.reinforcedM3, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const count = (template: string, v: number) => (v > 0 ? fill(template, { n: formatNumber(v, lang) }) : null);
  return [
    s.added.batteryRates ? c.estimate.batteryRates : null,
    count(c.estimate.oversize, s.added.oversize),
    count(c.estimate.crate, s.added.crate),
    count(c.estimate.overlength, s.added.overlength),
    count(c.estimate.extraNames, s.added.extraNames),
    s.added.singleCarton ? c.estimate.singleCarton : null,
    s.reinforcedM3 > 0 ? fill(c.estimate.reinforcement, { m3: `${m3} m³` }) : null,
    s.request.declaration ? c.estimate.declaration : null,
  ].filter(Boolean) as string[];
}
