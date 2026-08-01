import { notFound } from "next/navigation";
import { Link } from "@/components/ui/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/legal/mentions-legales">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.legal.mentionsLegales.title };
}

/**
 * Publisher identity, pulled from the same PLATFORM_* env vars the invoice
 * PDFs read (see lib/invoices/pdf.tsx `platformParticulars`). Falls back to a
 * placeholder dash when unset so the page never invents a SIREN / capital —
 * the draft-notice banner flags that real values are pending.
 */
function platformIdentity() {
  const dash = "—";
  const address = [
    process.env.PLATFORM_ADDRESS,
    process.env.PLATFORM_CITY,
    process.env.PLATFORM_COUNTRY,
  ]
    .filter((part) => part && part.trim() !== "")
    .join(", ");
  const siren = process.env.PLATFORM_SIREN?.trim() || "";
  const rcsCity = process.env.PLATFORM_RCS_CITY?.trim() || "";
  return {
    legalName: process.env.PLATFORM_LEGAL_NAME?.trim() || "SourcingPick SAS",
    legalForm: process.env.PLATFORM_LEGAL_FORM?.trim() || "SAS",
    shareCapital: process.env.PLATFORM_SHARE_CAPITAL?.trim() || dash,
    address: address || dash,
    rcs: siren && rcsCity ? `${rcsCity} ${siren}` : rcsCity || dash,
    siren: siren || dash,
    vat: process.env.PLATFORM_VAT_NUMBER?.trim() || dash,
    email: process.env.EMAIL_FROM?.trim() || "legal@sourcingpick.com",
  };
}

export default async function MentionsLegalesPage({
  params,
}: PageProps<"/[lang]/legal/mentions-legales">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const copy = dict.legal.mentionsLegales;
  const id = platformIdentity();

  const rows: Array<{ label: string; value: string }> = [
    { label: copy.labels.legalName, value: id.legalName },
    { label: copy.labels.legalForm, value: id.legalForm },
    { label: copy.labels.shareCapital, value: id.shareCapital },
    { label: copy.labels.address, value: id.address },
    { label: copy.labels.rcs, value: id.rcs },
    { label: copy.labels.siren, value: id.siren },
    { label: copy.labels.vat, value: id.vat },
    { label: copy.labels.email, value: id.email },
  ];

  return (
    <>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-8 lg:pt-24 lg:pb-12">
        <div className="animate-fade-up">
          <p className="text-sm font-medium text-info tracking-wide uppercase mb-4">
            {dict.legal.eyebrow}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-headline tracking-tight leading-tight">
            {copy.title}
          </h1>
          <p className="mt-4 text-sm text-muted">{dict.legal.lastUpdated}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-20 lg:pb-32">
        <div
          role="note"
          className="rounded-md border border-warning-edge bg-warning-soft px-4 py-3 mb-10 text-sm text-warning"
        >
          {dict.legal.draftNotice}
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-headline mb-3 tracking-tight">
              {copy.publisherHeading}
            </h2>
            <p className="text-base leading-relaxed text-fg mb-4">{copy.intro}</p>
            <dl className="divide-y divide-line-subtle rounded-lg border border-line-subtle">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-4 py-3"
                >
                  <dt className="text-sm font-medium text-muted">{row.label}</dt>
                  <dd className="sm:col-span-2 text-base text-fg break-words">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-headline mb-3 tracking-tight">
              {copy.directorHeading}
            </h2>
            <p className="text-base leading-relaxed text-fg">{copy.directorBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-headline mb-3 tracking-tight">
              {copy.hostHeading}
            </h2>
            <p className="text-base leading-relaxed text-fg">{copy.hostBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-headline mb-3 tracking-tight">
              {copy.ipHeading}
            </h2>
            <p className="text-base leading-relaxed text-fg">{copy.ipBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-headline mb-3 tracking-tight">
              {copy.dataHeading}
            </h2>
            <p className="text-base leading-relaxed text-fg">
              {copy.dataBody}{" "}
              <Link href={`/${lang}/legal/privacy`} variant="default">
                {copy.dataLink}
              </Link>
              .
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
