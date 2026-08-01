import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { listShipmentsForInternal } from "@/lib/shipments/queries";
import { ShipmentStatusBadge } from "@/components/shipments/status-badge";
import { isReportOverdue } from "@/lib/shipments/status";

/**
 * Internal-team counterpart to the shipper queue.
 *
 * This is the surface §7.1 describes: the team watches every logistics leg
 * here and relays progress to the client themselves. Unlike the shipper view
 * it spans all shipper orgs and shows the quoted price.
 */
export default async function AdminShipmentsPage({ params }: PageProps<"/[lang]/admin/shipments">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN, Role.AGENT);
  const dict = await getDictionary(lang);
  const t = dict.shipper;

  const shipments = await listShipmentsForInternal();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-headline mb-6 text-2xl font-bold tracking-tight">{t.title}</h1>

      {shipments.length === 0 ? (
        <p className="border-line bg-surface text-muted rounded-lg border p-8 text-center text-sm">
          {t.empty}
        </p>
      ) : (
        <div className="border-line overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="border-line bg-subtle text-faint border-b">
              <tr>
                <th className="px-4 py-3 font-medium">{t.colRef}</th>
                <th className="px-4 py-3 font-medium">{t.colOrder}</th>
                <th className="px-4 py-3 font-medium">{t.colDest}</th>
                <th className="px-4 py-3 font-medium">{t.quote}</th>
                <th className="px-4 py-3 font-medium">{t.colStatus}</th>
                <th className="px-4 py-3 font-medium">{t.colUpdated}</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-line-subtle border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/${lang}/admin/shipments/${s.id}`}
                      className="font-mono font-medium"
                    >
                      {s.reference}
                    </Link>
                  </td>
                  <td className="text-muted px-4 py-3 font-mono text-xs">{s.order.reference}</td>
                  <td className="text-muted px-4 py-3">
                    {s.destCity}, {s.destCountry}
                  </td>
                  <td className="text-fg px-4 py-3 font-mono text-xs tabular-nums">
                    {s.acceptedQuote
                      ? new Intl.NumberFormat(lang, {
                          style: "currency",
                          currency: s.acceptedQuote.currency,
                        }).format(s.acceptedQuote.amountCents / 100)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ShipmentStatusBadge status={s.status} dict={dict} />
                      {/* §5 — quiet for longer than the reporting window. */}
                      {s.events[0] && isReportOverdue(s.status, s.events[0].createdAt) && (
                        <span className="border-danger-edge bg-danger-soft text-danger inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium">
                          {t.overdue}
                        </span>
                      )}
                      {/* §3.2 — brief changed, fixed price no longer holds. */}
                      {s.quoteStale && (
                        <span className="border-warning-edge bg-warning-soft text-warning inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium">
                          {t.staleQuote}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-faint px-4 py-3 text-xs">{formatDate(s.updatedAt, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
