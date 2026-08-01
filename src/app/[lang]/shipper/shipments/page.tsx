import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { listShipmentsForShipper } from "@/lib/shipments/queries";
import { ShipmentStatusBadge } from "@/components/shipments/status-badge";

export async function generateMetadata({ params }: PageProps<"/[lang]/shipper/shipments">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.shipper.title };
}

export default async function ShipperShipmentsPage({
  params,
}: PageProps<"/[lang]/shipper/shipments">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.SHIPPER);
  const dict = await getDictionary(lang);
  const t = dict.shipper;

  const shipments = await listShipmentsForShipper(user.organizationId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-headline text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted mt-1 text-sm">{t.subtitle}</p>
      </header>

      {/* §5 — the 24h reporting duty, stated where the work happens rather
          than buried in a partner agreement. */}
      <p className="border-warning-edge bg-warning-soft text-warning mb-6 rounded-lg border px-4 py-3 text-sm">
        {t.slaNotice}
      </p>

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
                <th className="px-4 py-3 font-medium">{t.colStatus}</th>
                <th className="px-4 py-3 font-medium">{t.colUpdated}</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr
                  key={s.id}
                  className="border-line-subtle hover:bg-subtle/50 border-b last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/${lang}/shipper/shipments/${s.id}`}
                      className="font-mono font-medium"
                    >
                      {s.reference}
                    </Link>
                  </td>
                  <td className="text-muted px-4 py-3 font-mono text-xs">{s.order.reference}</td>
                  <td className="text-muted px-4 py-3">
                    {s.destCity}, {s.destCountry}
                  </td>
                  <td className="px-4 py-3">
                    <ShipmentStatusBadge status={s.status} dict={dict} />
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
