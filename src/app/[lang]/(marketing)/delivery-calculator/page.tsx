import { notFound } from "next/navigation";
import { Incoterm } from "@prisma/client";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import {
  availableDeliveryCountries,
  estimateDeliveryFee,
} from "@/lib/delivery/calculator";
import { DeliveryEstimateCard } from "@/components/delivery/delivery-estimate-card";
import { CtaSection } from "@/components/marketing/cta-section";

/**
 * Public standalone delivery-fee calculator — Phase 3.
 *
 * Lets prospective buyers play with origin/destination/incoterm/weight
 * before they sign up, and surfaces the same "approximate" estimate
 * shown elsewhere in the product flow. Server-rendered: the form
 * submits as a GET so each result has a shareable URL and Google can
 * crawl the page without a JS bundle.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/delivery-calculator">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.delivery.calculator.title };
}

const INCOTERMS: Incoterm[] = [Incoterm.FOB, Incoterm.DAP, Incoterm.DDP];

export default async function DeliveryCalculatorPage({
  params,
  searchParams,
}: PageProps<"/[lang]/delivery-calculator">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.delivery.calculator;

  const { origins, destinations } = await availableDeliveryCountries();
  const originCountry =
    typeof search?.origin === "string" && origins.includes(search.origin)
      ? search.origin
      : (origins[0] ?? "CN");
  const destinationCountry =
    typeof search?.destination === "string" &&
    destinations.includes(search.destination)
      ? search.destination
      : (destinations[0] ?? "FR");
  const incoterm =
    typeof search?.incoterm === "string" &&
    INCOTERMS.includes(search.incoterm as Incoterm)
      ? (search.incoterm as Incoterm)
      : Incoterm.DAP;
  const weightRaw =
    typeof search?.weight === "string" ? Number(search.weight) : 50;
  const weightKg = Number.isFinite(weightRaw) ? Math.max(0, weightRaw) : 50;

  const estimate = await estimateDeliveryFee({
    originCountry,
    destinationCountry,
    incoterm,
    weightKg,
  });

  return (
    <>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-12">
        <div className="animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-wide text-info mb-3">
            {t.eyebrow}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-headline tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm text-muted mt-3 max-w-prose leading-relaxed">
            {t.description}
          </p>
        </div>

        <form
          method="GET"
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-line bg-surface p-4"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-fg">{t.originLabel}</span>
            <select
              name="origin"
              defaultValue={originCountry}
              className="h-10 px-3 rounded-md border border-line bg-page text-sm"
            >
              {origins.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-fg">
              {t.destinationLabel}
            </span>
            <select
              name="destination"
              defaultValue={destinationCountry}
              className="h-10 px-3 rounded-md border border-line bg-page text-sm"
            >
              {destinations.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-fg">
              {t.incotermLabel}
            </span>
            <select
              name="incoterm"
              defaultValue={incoterm}
              className="h-10 px-3 rounded-md border border-line bg-page text-sm"
            >
              {INCOTERMS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-fg">
              {t.weightLabel}
            </span>
            <input
              type="number"
              inputMode="numeric"
              name="weight"
              min={0}
              step={1}
              defaultValue={weightKg}
              className="h-10 px-3 rounded-md border border-line bg-page text-sm"
            />
          </label>

          <div className="sm:col-span-2 flex items-center justify-end">
            <button
              type="submit"
              className="inline-flex items-center h-10 px-4 rounded-md bg-action text-on-action text-sm font-semibold"
            >
              {t.computeCta}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <DeliveryEstimateCard
            estimate={estimate}
            dict={dict}
            locale={lang}
            weightKg={weightKg}
          />
        </div>

        <p className="text-xs text-faint mt-6 leading-relaxed">{t.disclaimer}</p>
      </section>

      <CtaSection dict={dict} locale={lang} />
    </>
  );
}
