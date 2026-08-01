import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { getShipmentForInternal } from "@/lib/shipments/queries";
import { isReportOverdue } from "@/lib/shipments/status";
import { ShipmentStatusBadge } from "@/components/shipments/status-badge";
import { AttachInvoiceForm, ReviseBriefForm } from "./_components/internal-forms";

/**
 * Internal counterpart to the shipper's detail page (§7.1).
 *
 * Shows what the shipper cannot see — their identity, the quoted prices, and
 * every event including the internal-only ones — because this is the surface
 * the team decides from when relaying to the client.
 */
export default async function AdminShipmentDetailPage({
  params,
}: PageProps<"/[lang]/admin/shipments/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN, Role.AGENT);
  const dict = await getDictionary(lang);
  const t = dict.shipper;

  const s = await getShipmentForInternal(id);
  if (!s) notFound();

  const money = (cents: number, currency: string) =>
    new Intl.NumberFormat(lang, { style: "currency", currency }).format(cents / 100);
  const card = "border-line bg-surface rounded-lg border p-5";
  const overdue = s.events[0] && isReportOverdue(s.status, s.events[0].createdAt);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline font-mono text-xl font-bold">{s.reference}</h1>
          <p className="text-muted mt-1 text-xs">
            <span className="font-mono">{s.order.reference}</span>
            {s.shipperOrg && ` · ${t.assignedTo}: ${s.shipperOrg.displayName}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <ShipmentStatusBadge status={s.status} dict={dict} />
          {overdue && (
            <span className="border-danger-edge bg-danger-soft text-danger inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium">
              {t.overdue}
            </span>
          )}
          {s.quoteStale && (
            <span className="border-warning-edge bg-warning-soft text-warning inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium">
              {t.staleQuote}
            </span>
          )}
        </div>
      </header>

      <section className={`${card} mb-5`}>
        <h2 className="text-headline mb-4 text-sm font-semibold">{t.attachInvoice}</h2>
        <AttachInvoiceForm shipmentId={s.id} copy={t as unknown as Record<string, string>} />
      </section>

      <section className={`${card} mb-5`}>
        <h2 className="text-headline mb-4 text-sm font-semibold">{t.items}</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {s.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4">
              <span className="text-fg">
                {item.label}{" "}
                <span className="text-faint text-xs">
                  · {item.nature} · {t.qty} {item.quantity}
                </span>
              </span>
              <span className="text-fg shrink-0 font-mono tabular-nums">
                {money(item.unitPriceCents, "CNY")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${card} mb-5`}>
        <h2 className="text-headline mb-4 text-sm font-semibold">{t.quoteHistory}</h2>
        {s.quotes.length === 0 ? (
          <p className="text-muted text-sm">{t.noQuote}</p>
        ) : (
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
                {q.notes && <p className="text-faint mt-0.5 text-xs">{q.notes}</p>}
                {q.revisionReason && (
                  <p className="text-warning mt-0.5 text-xs">{q.revisionReason}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${card} mb-5`}>
        <h2 className="text-headline mb-4 text-sm font-semibold">{t.reviseBrief}</h2>
        <ReviseBriefForm
          shipmentId={s.id}
          defaults={{
            shippingMethod: s.shippingMethod,
            totalWeightKg: String(s.totalWeightKg),
            lengthCm: String(s.lengthCm),
            widthCm: String(s.widthCm),
            heightCm: String(s.heightCm),
            destAddress: s.destAddress,
            destCity: s.destCity,
            destCountry: s.destCountry,
          }}
          copy={t as unknown as Record<string, string>}
        />
      </section>

      <section className={card}>
        <h2 className="text-headline mb-4 text-sm font-semibold">{t.history}</h2>
        <ul className="flex flex-col gap-3">
          {s.events.map((e) => (
            <li key={e.id} className="flex items-start gap-3 text-sm">
              <ShipmentStatusBadge status={e.status} dict={dict} />
              <div className="min-w-0 flex-1">
                {e.note && <p className="text-fg">{e.note}</p>}
                <p className="text-faint text-xs">
                  {formatDate(e.createdAt, lang)} ·{" "}
                  {e.clientVisible ? t.clientRelayed : t.internalOnly}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
