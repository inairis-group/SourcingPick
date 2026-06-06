import { notFound } from "next/navigation";
import {AdminScope, SourcingRegion} from "@prisma/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import {
  getDeliveryEtas,
  getSourcingAllowlist,
} from "@/lib/platform/settings";
import { countriesFor } from "@/lib/countries";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { SourcingAllowlistForm } from "./_components/allowlist-form";
import { DeliveryEtasForm } from "./_components/delivery-etas-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/settings/sourcing">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.sourcingAllowlist.title };
}

export default async function AdminSourcingSettingsPage({
  params,
}: PageProps<"/[lang]/admin/settings/sourcing">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.SETTINGS);
  const dict = await getDictionary(lang);

  const [allowlist, countries, etas] = await Promise.all([
    getSourcingAllowlist(),
    Promise.resolve(countriesFor(lang)),
    getDeliveryEtas(),
  ]);

  const allRegions = Object.values(SourcingRegion);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.sourcingAllowlist.eyebrow}
        title={dict.admin.sourcingAllowlist.title}
        description={dict.admin.sourcingAllowlist.description}
      />

      <SourcingAllowlistForm
        allRegions={allRegions.map((r) => ({
          value: r,
          label: dict.client.requests.regions[r],
        }))}
        allCountries={countries.map((c) => ({
          value: c.code,
          label: `${c.name} · ${c.code}`,
        }))}
        initialRegions={allowlist.regions}
        initialCountries={allowlist.countries}
      />

      <div className="mt-8">
        <DeliveryEtasForm initial={etas} />
      </div>
    </div>
  );
}
