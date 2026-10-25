import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { freightCopy, freightFormCopy } from "@/content/freight/simulator";
import { FREIGHT_LEAD_PREFIX } from "@/lib/freight/record";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { AdminFreightCalculator } from "./_components/admin-freight-calculator";

/**
 * The freight simulator of /livraisons, for the team: the same fields and the
 * same engine (src/lib/freight), with the detailed price on screen as soon as
 * the shipment is described. Under it, the requests the public simulator has
 * received, with everything the visitor entered and what they were sent. The
 * admin layout already requires the ADMIN role; the calculation checks it
 * again on the server.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/admin/freight-calculator">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.freightCalculator.title };
}

async function simulatorRequests() {
  try {
    return await prisma.quoteRequest.findMany({
      where: { message: { startsWith: FREIGHT_LEAD_PREFIX } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        reference: true,
        createdAt: true,
        name: true,
        email: true,
        phone: true,
        destinationCountry: true,
        destinationCity: true,
        products: true,
        message: true,
      },
    });
  } catch (err) {
    // The calculator works without the database; the list just stays empty.
    console.error("[freight-calculator] could not read the simulator requests", err);
    return [];
  }
}

export default async function AdminFreightCalculatorPage({ params }: PageProps<"/[lang]/admin/freight-calculator">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.admin.freightCalculator;
  const { email } = freightCopy(lang);
  const rows = await simulatorRequests();
  let regions: Intl.DisplayNames | null = null;
  try {
    regions = new Intl.DisplayNames([lang], { type: "region" });
  } catch {
    regions = null;
  }

  return (
    <>
      <DashboardHeader title={t.title} description={t.intro} />
      <AdminFreightCalculator
        lang={lang}
        copy={freightFormCopy(lang)}
        labels={{
          result: t.result,
          items: email.items,
          subtotal: email.subtotal,
          commission: email.commission,
          total: email.total,
          rateRow: email.summary.bracket,
          productsTitle: email.productsTitle,
        }}
      />

      <section className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-headline mb-4">{t.requests}</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">{t.requestsEmpty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {rows.map((r) => (
              <li key={r.id} className="py-3">
                <details>
                  <summary className="cursor-pointer flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                    <span className="font-mono text-muted">{formatDate(r.createdAt, lang)}</span>
                    <span className="font-mono text-muted">{r.reference}</span>
                    <span className="font-semibold text-headline">{r.name}</span>
                    <a className="underline" href={`mailto:${r.email}`}>
                      {r.email}
                    </a>
                    {r.phone && <span>{r.phone}</span>}
                    <span>
                      {[r.destinationCity, regions?.of(r.destinationCountry) ?? r.destinationCountry].filter(Boolean).join(", ")}
                    </span>
                    <span className="text-muted">{r.products}</span>
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-muted">{r.message}</pre>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
