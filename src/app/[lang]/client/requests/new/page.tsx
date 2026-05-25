import { notFound } from "next/navigation";
import { Role, SourcingRegion } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { getSourcingAllowlist } from "@/lib/platform/settings";
import { countryNameFor } from "@/lib/countries";
import { NewRequestWizard } from "./_components/new-request-wizard";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/requests/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.client.requests.newTitle };
}

export default async function NewRequestPage({
  params,
}: PageProps<"/[lang]/client/requests/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.CLIENT);

  const allowlist = await getSourcingAllowlist();

  // Materialise the allowlist into the shape the wizard needs. Fall back to
  // ASIA/CN when the admin has somehow cleared the list — never leave the
  // user with an unsubmittable form.
  const regions = allowlist.regions.length > 0
    ? allowlist.regions
    : [SourcingRegion.ASIA];
  const countries = allowlist.countries.length > 0
    ? allowlist.countries
    : ["CN"];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <NewRequestWizard
        allowedRegions={regions}
        allowedCountries={countries.map((code) => ({
          code,
          name: countryNameFor(code, lang),
        }))}
      />
    </div>
  );
}
