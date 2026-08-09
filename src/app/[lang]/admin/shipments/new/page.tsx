import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { listShippableOrders, listShipperOrgs } from "@/lib/shipments/queries";
import { CreateShipmentForm } from "./_components/create-shipment-form";

/**
 * §2 — the internal team hands an order to a shipper.
 *
 * This is the entry point for the whole role: until an order passes through
 * here, the shipper's queue is empty by definition.
 */
export default async function NewShipmentPage({
  params,
}: PageProps<"/[lang]/admin/shipments/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN, Role.AGENT);
  const dict = await getDictionary(lang);
  const t = dict.shipper;

  const [orders, shippers] = await Promise.all([listShippableOrders(), listShipperOrgs()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-headline mb-6 text-2xl font-bold tracking-tight">{t.create}</h1>

      {shippers.length === 0 ? (
        <p className="border-warning-edge bg-warning-soft text-warning rounded-lg border px-4 py-3 text-sm">
          {t.noShippers}{" "}
          <Link href={`/${lang}/admin/shipments/partners`} className="underline">
            {t.partnerTitle}
          </Link>
        </p>
      ) : orders.length === 0 ? (
        <p className="border-line bg-surface text-muted rounded-lg border p-8 text-center text-sm">
          {t.noOrders}
        </p>
      ) : (
        <CreateShipmentForm
          lang={lang}
          orders={orders.map((o) => ({
            id: o.id,
            // Origin and status matter when choosing: a marketplace order and
            // a custom build move differently, and briefing freight before
            // payment lands is legitimate but should be a visible choice.
            label: `${o.reference} · ${o.clientOrg.displayName} · ${
              o.request?.origin ?? "—"
            } · ${o.status}`,
          }))}
          shippers={shippers.map((s) => ({ id: s.id, label: s.displayName }))}
          copy={t as unknown as Record<string, string>}
        />
      )}
    </div>
  );
}
