import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { freightCopy, freightFormCopy } from "@/content/freight/simulator";
import { FREIGHT_LEAD_PREFIX } from "@/lib/freight/record";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { AdminFreightCalculator } from "./_components/admin-freight-calculator";
import { CancelFreightQuote } from "./_components/cancel-freight-quote";
import { formatEUR } from "@/lib/i18n/formatters";
import { describeTransport, quoteStanding } from "@/lib/freight-quotes/describe";
import type { FreightRequest } from "@/lib/freight/estimate";

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

async function freightQuotes() {
  try {
    return await prisma.freightQuote.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        reference: true,
        createdAt: true,
        status: true,
        mode: true,
        line: true,
        request: true,
        amountEurCents: true,
        validUntil: true,
        declineReason: true,
        organization: { select: { displayName: true, clientCode: true } },
        order: { select: { reference: true } },
        invoice: { select: { reference: true } },
      },
    });
  } catch (err) {
    console.error("[freight-calculator] could not read the freight quotes", err);
    return [];
  }
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
  const copy = freightCopy(lang);
  const { email } = copy;
  const rows = await simulatorRequests();
  const quotes = await freightQuotes();
  const q = t.quote;
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
          quote: t.quote,
        }}
      />

      <section id="freight-quotes" className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-headline mb-4">{q.listTitle}</h2>
        {quotes.length === 0 ? (
          <p className="text-sm text-muted">{q.listEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-start text-faint">
                  {[q.cols.reference, q.cols.date, q.cols.client, q.cols.order, q.cols.transport, q.cols.amount, q.cols.validUntil, q.cols.status, q.cols.invoice, ""].map((h, i) => (
                    <th key={i} className="py-2 pe-4 text-start font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {quotes.map((fq) => {
                  const status = quoteStanding(fq.status, fq.validUntil);
                  const request = fq.request as unknown as FreightRequest;
                  return (
                    <tr key={fq.id} className="align-top">
                      <td className="py-2 pe-4 font-mono">{fq.reference}</td>
                      <td className="py-2 pe-4 whitespace-nowrap">{formatDate(fq.createdAt, lang)}</td>
                      <td className="py-2 pe-4">
                        {fq.organization.displayName}
                        {fq.organization.clientCode ? <span className="text-muted"> · {fq.organization.clientCode}</span> : null}
                      </td>
                      <td className="py-2 pe-4 font-mono">{fq.order?.reference ?? "—"}</td>
                      <td className="py-2 pe-4">{describeTransport(copy, { mode: fq.mode, line: fq.line, container: request?.container ?? null })}</td>
                      <td className="py-2 pe-4 whitespace-nowrap tabular-nums font-semibold">{formatEUR(fq.amountEurCents / 100, lang)}</td>
                      <td className="py-2 pe-4 whitespace-nowrap">{formatDate(fq.validUntil, lang)}</td>
                      <td className="py-2 pe-4">
                        {q.status[status as keyof typeof q.status]}
                        {fq.declineReason ? <p className="m-0 text-xs text-muted">{q.declinedReason.replace("{reason}", fq.declineReason)}</p> : null}
                      </td>
                      <td className="py-2 pe-4 font-mono">{fq.invoice?.reference ?? "—"}</td>
                      <td className="py-2">
                        {status === "SENT" && <CancelFreightQuote id={fq.id} label={q.cancel} confirm={q.cancelConfirm} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
