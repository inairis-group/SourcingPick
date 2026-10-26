"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { formatEUR } from "@/lib/i18n/formatters";
import type { FreightEstimate } from "@/lib/freight/estimate";
import { formatMoney } from "@/lib/freight/format";
import {
  createFreightQuote,
  freightQuoteClientOrders,
  freightQuoteRates,
  searchFreightQuoteClients,
  type ClientOrderHit,
  type ClientOrgHit,
  type CreateFreightQuoteResult,
} from "@/lib/freight-quotes/actions";
import { eurCentsFromParts, partsFromTotal, rateIsSane, toMicros } from "@/lib/freight-quotes/convert";
import { Button } from "@/components/ui/button";

export type QuoteComposerCopy = {
  title: string;
  intro: string;
  client: string;
  clientSearch: string;
  clientNone: string;
  change: string;
  order: string;
  noOrder: string;
  orderBilled: string;
  prices: string;
  noPrice: string;
  rateCny: string;
  rateUsd: string;
  rateEcb: string;
  rateEnv: string;
  rateNone: string;
  converted: string;
  amount: string;
  amountHint: string;
  validUntil: string;
  notes: string;
  send: string;
  sending: string;
  sent: string;
  needResult: string;
  errors: Record<string, string>;
};

const FIELD = "border-line bg-surface text-fg w-full rounded-md border px-3 py-2 text-sm";
const LABEL = "text-fg flex flex-col gap-1 text-sm font-medium";

/** Today + `days`, as the YYYY-MM-DD a date input takes. */
function dayFromNow(days: number): string {
  const d = new Date(Date.now() + days * 24 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

const parseNumber = (v: string) => {
  const n = Number(v.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Under the admin calculator's result: send that result to a client as a
 * freight quote. Pick the client (and the order, when the freight is an
 * order's), check the euro amount — the calculator's price converted at the
 * day's rate, adjustable — and send. The server prices the shipment again
 * and re-checks everything (createFreightQuote).
 */
export function FreightQuoteComposer({
  lang,
  copy: c,
  request,
  result,
  blocked,
}: {
  lang: Locale;
  copy: QuoteComposerCopy;
  /** The calculator's request, as it would be sent. */
  request: unknown;
  result: FreightEstimate | { ok: false; reason: "invalid" } | null;
  /** The form has a blocking problem (refused goods, missing dimensions). */
  blocked: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<ClientOrgHit[] | null>(null);
  const [client, setClient] = useState<ClientOrgHit | null>(null);
  const [orders, setOrders] = useState<ClientOrderHit[]>([]);
  const [orderId, setOrderId] = useState("");
  const [rates, setRates] = useState<{ cny: string; usd: string; note: string }>({ cny: "", usd: "", note: "" });
  const [amount, setAmount] = useState("");
  const [amountTouched, setAmountTouched] = useState(false);
  const [validUntil, setValidUntil] = useState(dayFromNow(14));
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState<CreateFreightQuoteResult | null>(null);
  const [pending, startTransition] = useTransition();

  // The day's rates, once.
  useEffect(() => {
    freightQuoteRates()
      .then((r) =>
        setRates({
          cny: r.cnyEur ? String(r.cnyEur) : "",
          usd: r.usdEur ? String(r.usdEur) : "",
          note: r.source === "ecb" ? c.rateEcb.replace("{date}", r.date ?? "") : r.source === "env" ? c.rateEnv : c.rateNone,
        }),
      )
      .catch(() => setRates((x) => ({ ...x, note: c.rateNone })));
  }, [c.rateEcb, c.rateEnv, c.rateNone]);

  // Client search, a moment after typing stops.
  const searching = !client && query.trim().length >= 2;
  useEffect(() => {
    if (!searching) return;
    const t = window.setTimeout(() => {
      searchFreightQuoteClients(query).then(setHits).catch(() => setHits([]));
    }, 300);
    return () => window.clearTimeout(t);
  }, [query, searching]);

  const pick = (hit: ClientOrgHit) => {
    setClient(hit);
    setOrderId("");
    setOutcome(null);
    freightQuoteClientOrders(hit.id).then(setOrders).catch(() => setOrders([]));
  };

  const ok = result && result.ok ? result : null;
  const priced = ok && ok.priced ? ok : null;
  const parts = useMemo(() => partsFromTotal(priced?.total), [priced]);
  const cny = parseNumber(rates.cny);
  const usd = parseNumber(rates.usd);
  const suggested = priced
    ? eurCentsFromParts(parts, {
        cnyEur: rateIsSane("cnyEur", cny) ? toMicros(cny) : null,
        usdEur: rateIsSane("usdEur", usd) ? toMicros(usd) : null,
      })
    : null;

  // Until the team types their own amount, it follows the conversion.
  const amountValue = amountTouched ? amount : suggested !== null ? (suggested / 100).toFixed(2) : "";

  const canSend = Boolean(ok) && !blocked && Boolean(client) && parseNumber(amountValue) > 0 && !pending;

  const send = () => {
    if (!client) return;
    setOutcome(null);
    startTransition(async () => {
      const res = await createFreightQuote({
        request,
        organizationId: client.id,
        orderId: orderId || null,
        amountEur: parseNumber(amountValue),
        fxCnyEur: parts.rmbCents > 0 && rateIsSane("cnyEur", cny) ? cny : null,
        fxUsdEur: parts.usdCents > 0 && rateIsSane("usdEur", usd) ? usd : null,
        validUntil,
        notes,
      });
      setOutcome(res);
      if (res.ok) {
        setNotes("");
        router.refresh();
      }
    });
  };

  return (
    <section className="border-line bg-surface flex flex-col gap-4 rounded-2xl border p-5" aria-busy={pending}>
      <div>
        <h2 className="text-headline m-0 text-lg font-semibold">{c.title}</h2>
        <p className="text-muted m-0 mt-1 text-sm">{c.intro}</p>
      </div>

      {(!ok || blocked) && <p className="text-warning m-0 text-sm">{c.needResult}</p>}

      <div className={LABEL}>
        {c.client}
        {client ? (
          <div className="border-line flex items-center justify-between gap-3 rounded-md border px-3 py-2">
            <span className="min-w-0">
              <b>{client.name}</b>
              <span className="text-muted"> · {[client.clientCode, client.email].filter(Boolean).join(" · ")}</span>
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={() => setClient(null)}>
              {c.change}
            </Button>
          </div>
        ) : (
          <>
            <input className={FIELD} value={query} placeholder={c.clientSearch} onChange={(e) => setQuery(e.target.value)} />
            {searching && hits && (
              <ul className="border-line m-0 flex list-none flex-col rounded-md border p-0">
                {hits.length === 0 && <li className="text-muted px-3 py-2 text-sm">{c.clientNone}</li>}
                {hits.map((h) => (
                  <li key={h.id}>
                    <button type="button" onClick={() => pick(h)} className="hover:bg-subtle w-full cursor-pointer px-3 py-2 text-start text-sm">
                      <b>{h.name}</b>
                      <span className="text-muted"> · {[h.clientCode, h.email, h.country].filter(Boolean).join(" · ")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {client && (
        <label className={LABEL}>
          {c.order}
          <select className={FIELD} value={orderId} onChange={(e) => setOrderId(e.target.value)}>
            <option value="">{c.noOrder}</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id} disabled={o.freightBilled}>
                {o.reference} · {o.status}
                {o.freightBilled ? ` (${c.orderBilled})` : ""}
              </option>
            ))}
          </select>
        </label>
      )}

      {priced ? (
        <div className="bg-subtle flex flex-col gap-3 rounded-md p-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-muted">{c.prices}</span>
            <b className="tabular-nums">{formatMoney(priced.total, lang)}</b>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {parts.rmbCents > 0 && (
              <label className={LABEL}>
                {c.rateCny}
                <input className={FIELD} inputMode="decimal" value={rates.cny} onChange={(e) => setRates({ ...rates, cny: e.target.value })} />
              </label>
            )}
            {parts.usdCents > 0 && (
              <label className={LABEL}>
                {c.rateUsd}
                <input className={FIELD} inputMode="decimal" value={rates.usd} onChange={(e) => setRates({ ...rates, usd: e.target.value })} />
              </label>
            )}
          </div>
          <p className="text-faint m-0 text-xs">{rates.note}</p>
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-muted">{c.converted}</span>
            <b className="tabular-nums">{suggested !== null ? formatEUR(suggested / 100, lang) : "—"}</b>
          </div>
        </div>
      ) : (
        ok && <p className="text-muted m-0 text-sm">{c.noPrice}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={LABEL}>
          {c.amount}
          <input
            className={FIELD}
            inputMode="decimal"
            value={amountValue}
            onChange={(e) => {
              setAmountTouched(true);
              setAmount(e.target.value);
            }}
          />
        </label>
        <label className={LABEL}>
          {c.validUntil}
          <input className={FIELD} type="date" value={validUntil} min={dayFromNow(0)} onChange={(e) => setValidUntil(e.target.value)} />
        </label>
      </div>
      <p className="text-faint m-0 text-xs">{c.amountHint}</p>
      <label className={LABEL}>
        {c.notes}
        <textarea className={FIELD} rows={3} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      {outcome && !outcome.ok && (
        <p role="alert" className="text-danger m-0 text-sm">
          {c.errors[outcome.error] ?? c.errors.generic}
        </p>
      )}
      {outcome?.ok && (
        <p role="status" className="text-success m-0 text-sm font-semibold">
          {c.sent.replace("{reference}", outcome.reference).replace("{client}", outcome.client)}
        </p>
      )}
      <Button type="button" onClick={send} disabled={!canSend}>
        {pending ? c.sending : c.send}
      </Button>
    </section>
  );
}
