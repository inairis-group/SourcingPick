import { notFound } from "next/navigation";
import { Role, SourcingRegion } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { getSourcingAllowlist } from "@/lib/platform/settings";
import { countriesFor } from "@/lib/countries";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { SourcingAllowlistForm } from "./_components/allowlist-form";

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
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);

  const [allowlist, countries] = await Promise.all([
    getSourcingAllowlist(),
    Promise.resolve(countriesFor(lang)),
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
    </div>
  );
}
