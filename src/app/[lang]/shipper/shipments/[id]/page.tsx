import { notFound } from "next/navigation";
import { Role, ShipmentStatus } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { getShipmentForShipper } from "@/lib/shipments/queries";
import { SHIPMENT_STATUS_ORDER } from "@/lib/shipments/status";
import { ShipmentStatusBadge } from "@/components/shipments/status-badge";
import { QuoteForm, StatusForm } from "./_components/shipment-forms";

export default async function ShipperShipmentDetailPage({
  params,
}: PageProps<"/[lang]/shipper/shipments/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.SHIPPER);
  const dict = await getDictionary(lang);
  const t = dict.shipper;

  // Returns null when the shipment belongs to another shipper org, so an
  // out-of-scope id 404s rather than confirming the record exists.
  const s = await getShipmentForShipper(id, user.organizationId);
  if (!s) notFound();

  const money = (cents: number, currency: string) =>
    new Intl.NumberFormat(lang, { style: "currency", currency }).format(cents / 100);

  // INCIDENT and CANCELLED sit outside the linear flow and can be entered from
  // anywhere, so they're offered alongside the ordered steps.
  const selectableStatuses = [
    ...SHIPMENT_STATUS_ORDER,
    ShipmentStatus.INCIDENT,
    ShipmentStatus.CANCELLED,
  ];

  const card = "border-line bg-surface rounded-lg border p-5";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline font-mono text-xl font-bold">{s.reference}</h1>
          <p className="text-muted mt-1 font-mono text-xs">{s.order.reference}</p>
        </div>
        <ShipmentStatusBadge status={s.status} dict={dict} />
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* §2.2 — everything the internal team is obliged to supply. */}
        <section className={card}>
          <h2 className="text-headline mb-4 text-sm font-semibold">{t.orderData}</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-faint">{t.method}</dt>
              <dd className="text-fg">{s.shippingMethod}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-faint">{t.weight}</dt>
              <dd className="text-fg tabular-nums">{String(s.totalWeightKg)} kg</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-faint">{t.dimensions}</dt>
              <dd className="text-fg tabular-nums">
                {String(s.lengthCm)} × {String(s.widthCm)} × {String(s.heightCm)} cm
              </dd>
            </div>
            <div className="border-line-subtle mt-2 border-t pt-2">
              <dt className="text-faint mb-1">{t.destination}</dt>
              <dd className="text-fg leading-relaxed">
                {s.destName}
                <br />
                {s.destAddress}
                <br />
                {s.destPostalCode} {s.destCity}, {s.destCountry}
              </dd>
            </div>
          </dl>
        </section>

        {/* §2.1 — per-product data. Unit price is the goods' declared value
            for customs, not a logistics price. */}
        <section className={card}>
          <h2 className="text-headline mb-4 text-sm font-semibold">{t.items}</h2>
          <ul className="flex flex-col gap-3">
            {s.items.map((item) => (
              <li
                key={item.id}
                className="border-line-subtle flex items-center gap-3 border-b pb-3 last:border-b-0 last:pb-0"
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="border-line h-12 w-12 shrink-0 rounded-md border object-cover"
                  />
                ) : (
                  <span className="border-line bg-subtle h-12 w-12 shrink-0 rounded-md border" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-headline truncate text-sm font-medium">{item.label}</p>
                  <p className="text-faint text-xs">
                    {item.nature} · {t.qty} {item.quantity}
                  </p>
                </div>
                <span className="text-fg shrink-0 font-mono text-sm tabular-nums">
                  {money(item.unitPriceCents, "CNY")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* §3 — quote submission / revision. */}
      <section className={`${card} mt-5`}>
        <h2 className="text-headline mb-4 text-sm font-semibold">{t.quote}</h2>

        {/* §3.2 — the brief moved after the price was locked, so the fixed
            price no longer applies and a justified revision is owed. */}
        {s.quoteStale && (
          <p className="border-warning-edge bg-warning-soft text-warning mb-4 rounded-md border px-3 py-2 text-sm">
            {t.staleQuoteHint}
          </p>
        )}

        <QuoteForm
          shipmentId={s.id}
          isRevision={s.quotes.length > 0}
          copy={t as unknown as Record<string, string>}
        />

        {s.quotes.length > 0 && (
          <div className="border-line-subtle mt-6 border-t pt-4">
            <h3 className="text-faint mb-3 text-xs font-semibold tracking-wide uppercase">
              {t.quoteHistory}
            </h3>
            <ul className="flex flex-col gap-3">
              {s.quotes.map((q) => (
                <li key={q.id} className="text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-headline font-mono font-semibold tabular-nums">
                      {money(q.amountCents, q.currency)}
                    </span>
                    <span className="text-faint text-xs">
                      {t.validUntil} {formatDate(q.validUntil, lang)}
                    </span>
                  </div>
                  <p className="text-muted mt-0.5 text-xs">{q.conditions}</p>
                  {q.revisionReason && (
                    <p className="text-warning mt-0.5 text-xs">{q.revisionReason}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* §4 — status transitions. */}
      <section className={`${card} mt-5`}>
        <h2 className="text-headline mb-4 text-sm font-semibold">{t.statusUpdate}</h2>
        <StatusForm
          shipmentId={s.id}
          current={s.status}
          statuses={selectableStatuses}
          labels={t.statuses}
          copy={t as unknown as Record<string, string>}
        />

        <div className="border-line-subtle mt-6 border-t pt-4">
          <h3 className="text-faint mb-3 text-xs font-semibold tracking-wide uppercase">
            {t.history}
          </h3>
          <ul className="flex flex-col gap-3">
            {s.events.map((e) => (
              <li key={e.id} className="flex items-start gap-3 text-sm">
                <ShipmentStatusBadge status={e.status} dict={dict} />
                <div className="min-w-0 flex-1">
                  {e.note && <p className="text-fg">{e.note}</p>}
                  <p className="text-faint text-xs">
                    {formatDate(e.createdAt, lang)} ·{" "}
                    {/* Makes the §1.2 boundary visible to the shipper: they can
                        see which events reached the client and which did not,
                        without ever having a channel to the client. */}
                    {e.clientVisible ? t.clientRelayed : t.internalOnly}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
