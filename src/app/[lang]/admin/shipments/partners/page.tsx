import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { listShipperOrgs } from "@/lib/shipments/queries";
import { CreatePartnerForm } from "./_components/create-partner-form";

/**
 * Phase 1 — provisioning. Admin-only (not AGENT): this mints credentials, and
 * the rest of the app has no user-creation surface at all, so it is the one
 * place an account can be brought into existence outside the seed.
 */
export default async function ShipperPartnersPage({
  params,
}: PageProps<"/[lang]/admin/shipments/partners">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);
  const t = dict.shipper;

  const partners = await listShipperOrgs();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-headline mb-1 text-2xl font-bold tracking-tight">{t.partnerTitle}</h1>
      <p className="text-muted mb-6 text-sm">{t.partnerIntro}</p>

      {partners.length > 0 && (
        <section className="border-line bg-surface mb-6 rounded-lg border p-4">
          <h2 className="text-faint mb-3 text-xs font-semibold tracking-wide uppercase">
            {t.managePartners}
          </h2>
          <ul className="flex flex-col gap-1 text-sm">
            {partners.map((p) => (
              <li key={p.id} className="text-fg">
                {p.displayName}
              </li>
            ))}
          </ul>
        </section>
      )}

      <CreatePartnerForm copy={t as unknown as Record<string, string>} />
    </div>
  );
}
