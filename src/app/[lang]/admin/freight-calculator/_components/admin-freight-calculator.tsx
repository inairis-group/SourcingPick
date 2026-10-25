"use client";

import { useEffect, useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/formatters";
import type { FreightSimulatorCopy } from "@/content/freight/simulator";
import { calculateFreightAsAdmin } from "@/lib/freight/admin-actions";
import { formatAmount, formatMoney } from "@/lib/freight/format";
import type { FreightEstimate } from "@/lib/freight/estimate";
import type { FreightFormCopy } from "@/content/freight/simulator";
import { ShipmentFields, fill, surchargeList, useShipment } from "@/app/[lang]/(marketing)/_design/freight-shipment";

type Labels = {
  result: string;
  items: FreightSimulatorCopy["email"]["items"];
  subtotal: string;
  commission: string;
  total: string;
  rateRow: string;
  productsTitle: string;
};

/**
 * The admin's calculator: the public simulator's fields, and a panel that
 * shows the price line by line. The shipment is priced on the server
 * (calculateFreightAsAdmin) a moment after each change.
 */
export function AdminFreightCalculator({ lang, copy: c, labels }: { lang: Locale; copy: FreightFormCopy; labels: Labels }) {
  const s = useShipment(c);
  const [result, setResult] = useState<FreightEstimate | { ok: false; reason: "invalid" } | null>(null);
  const [pending, startTransition] = useTransition();
  const key = JSON.stringify(s.request);
  const n = (v: number, digits = 2) => formatNumber(v, lang, { maximumFractionDigits: digits });

  useEffect(() => {
    const t = window.setTimeout(() => {
      startTransition(async () => {
        setResult(await calculateFreightAsAdmin(JSON.parse(key)));
      });
    }, 300);
    return () => window.clearTimeout(t);
  }, [key]);

  const surcharges = surchargeList(c, s, lang);
  const row = { display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "14px", lineHeight: 1.5 } as const;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] items-start">
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 min-w-0">
        <ShipmentFields lang={lang} copy={c} s={s} idPrefix="admin" />
      </div>
      <aside className="rounded-2xl border border-line bg-surface p-5 sm:p-6 lg:sticky lg:top-6 flex flex-col gap-4" aria-live="polite" aria-busy={pending}>
        <h2 className="text-lg font-semibold text-headline">{labels.result}</h2>
        <p className="text-sm text-muted">
          {c.mode.names[s.mode]} · {c.formula.names[s.formula]} · {c.estimate.delays[s.mode]}
        </p>
        {s.blocking && <p className="text-sm text-warning">{s.blocking}</p>}
        {result && result.ok && result.priced && !s.blocking && (
          <div className="flex flex-col gap-2">
            <div style={row}>
              <span className="text-muted">{labels.rateRow}</span>
              <span className="font-mono">
                {n(result.billedKg, 1)} kg · {result.bracket} kg · {n(result.rate)} RMB/kg
              </span>
            </div>
            <hr className="border-line" />
            {result.items.map((item, i) => (
              <div key={`${item.key}-${i}`} style={row}>
                <span>
                  {fill(labels.items[item.key], {
                    ...Object.fromEntries(Object.entries(item.detail).map(([k, v]) => [k, n(v)])),
                    product: item.product === undefined ? "" : result.products[item.product]?.name || fill(c.products.item, { n: item.product + 1 }),
                  })}
                </span>
                <b className="whitespace-nowrap">{formatAmount(item.amount, item.currency, lang)}</b>
              </div>
            ))}
            <hr className="border-line" />
            <div style={row}>
              <span>{labels.subtotal}</span>
              <b>{formatMoney(result.subtotal, lang)}</b>
            </div>
            <div style={row}>
              <span>{labels.commission}</span>
              <b>{formatMoney(result.commission, lang)}</b>
            </div>
            <div style={{ ...row, fontSize: "18px" }}>
              <b>{labels.total}</b>
              <b>{formatMoney(result.total, lang)}</b>
            </div>
          </div>
        )}
        {result && result.ok && !result.priced && !s.blocking && (
          <div className="flex flex-col gap-1">
            <p className="font-semibold">{c.quote.title}</p>
            <p className="text-sm text-muted">{c.quote.reasons[result.reason]}</p>
            <p className="text-sm font-mono">
              {n(result.billedKg, 1)} kg · {result.bracket} kg
            </p>
          </div>
        )}
        {surcharges.length > 0 && (
          <ul className="text-sm text-muted flex flex-col gap-1">
            {surcharges.map((x) => (
              <li key={x}>· {x}</li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
