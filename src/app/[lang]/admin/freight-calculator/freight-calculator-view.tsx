import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { freightCopy, freightFormCopy } from "@/content/freight/simulator";
import { FREIGHT_LEAD_PREFIX } from "@/lib/freight/record";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { describeTransport, quoteStanding } from "@/lib/freight-quotes/describe";
import type { FreightRequest } from "@/lib/freight/estimate";
import { AdminFreightCalculator } from "./_components/admin-freight-calculator";
import { CancelFreightQuote } from "./_components/cancel-freight-quote";

/**
 * The freight simulator of /livraisons, for the team: the same fields and the
 * same engine (src/lib/freight), with the detailed price on screen as soon as
 * the shipment is described, and the form that sends it to a client as a
 * freight quote. Under it, the freight quotes sent and — for the
 * administrators — the requests the public simulator has received.
 *
 * Rendered by /admin/freight-calculator and /agent/freight-calculator, whose
 * layouts check the role; every action checks it again on the server, and an
 * agent only reaches the clients they work for.
 */

type Staff = { id: string; role: Role };

async function freightQuotes(staff: Staff) {
  try {
    return await prisma.freightQuote.findMany({
      // An agent sees the quotes they sent and those of the clients they work for.
      where:
        staff.role === Role.ADMIN
          ? {}
          : {
              OR: [
                { createdById: staff.id },
                { organization: { clientSourcingRequests: { some: { agentId: staff.id } } } },
                { organization: { clientOrders: { some: { agentId: staff.id } } } },
              ],
            },
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
        createdById: true,
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

export async function FreightCalculatorView({ lang, staff }: { lang: Locale; staff: Staff }) {
  const dict = await getDictionary(lang);
  const t = dict.admin.freightCalculator;
  const copy = freightCopy(lang);
  const { email } = copy;
  // The simulator's leads are the administrators' to follow up.
  const rows = staff.role === Role.ADMIN ? await simulatorRequests() : [];
  const quotes = await freightQuotes(staff);
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

      <section
        id="freight-quotes"
        className="border-line bg-surface mt-8 rounded-2xl border p-5 sm:p-6"
      >
        <h2 className="text-headline mb-4 text-lg font-semibold">{q.listTitle}</h2>
        {quotes.length === 0 ? (
          <p className="text-muted text-sm">{q.listEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-faint text-start">
                  {[
                    q.cols.reference,
                    q.cols.date,
                    q.cols.client,
                    q.cols.order,
                    q.cols.transport,
                    q.cols.amount,
                    q.cols.validUntil,
                    q.cols.status,
                    q.cols.invoice,
                    "",
                  ].map((h, i) => (
                    <th key={i} className="py-2 pe-4 text-start font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {quotes.map((fq) => {
                  const status = quoteStanding(fq.status, fq.validUntil);
                  const request = fq.request as unknown as FreightRequest;
                  return (
                    <tr key={fq.id} className="align-top">
                      <td className="py-2 pe-4 font-mono">{fq.reference}</td>
                      <td className="py-2 pe-4 whitespace-nowrap">
                        {formatDate(fq.createdAt, lang)}
                      </td>
                      <td className="py-2 pe-4">
                        {fq.organization.displayName}
                        {fq.organization.clientCode ? (
                          <span className="text-muted"> · {fq.organization.clientCode}</span>
                        ) : null}
                      </td>
                      <td className="py-2 pe-4 font-mono">{fq.order?.reference ?? "—"}</td>
                      <td className="py-2 pe-4">
                        {describeTransport(copy, {
                          mode: fq.mode,
                          line: fq.line,
                          container: request?.container ?? null,
                        })}
                      </td>
                      <td className="py-2 pe-4 font-semibold whitespace-nowrap tabular-nums">
                        {formatEUR(fq.amountEurCents / 100, lang)}
                      </td>
                      <td className="py-2 pe-4 whitespace-nowrap">
                        {formatDate(fq.validUntil, lang)}
                      </td>
                      <td className="py-2 pe-4">
                        {q.status[status as keyof typeof q.status]}
                        {fq.declineReason ? (
                          <p className="text-muted m-0 text-xs">
                            {q.declinedReason.replace("{reason}", fq.declineReason)}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-2 pe-4 font-mono">{fq.invoice?.reference ?? "—"}</td>
                      <td className="py-2">
                        {status === "SENT" &&
                          (staff.role === Role.ADMIN || fq.createdById === staff.id) && (
                            <CancelFreightQuote
                              id={fq.id}
                              label={q.cancel}
                              confirm={q.cancelConfirm}
                            />
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {staff.role === Role.ADMIN && (
        <section className="border-line bg-surface mt-8 rounded-2xl border p-5 sm:p-6">
          <h2 className="text-headline mb-4 text-lg font-semibold">{t.requests}</h2>
          {rows.length === 0 ? (
            <p className="text-muted text-sm">{t.requestsEmpty}</p>
          ) : (
            <ul className="divide-line flex flex-col divide-y">
              {rows.map((r) => (
                <li key={r.id} className="py-3">
                  <details>
                    <summary className="flex cursor-pointer flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted font-mono">{formatDate(r.createdAt, lang)}</span>
                      <span className="text-muted font-mono">{r.reference}</span>
                      <span className="text-headline font-semibold">{r.name}</span>
                      <a className="underline" href={`mailto:${r.email}`}>
                        {r.email}
                      </a>
                      {r.phone && <span>{r.phone}</span>}
                      <span>
                        {[
                          r.destinationCity,
                          regions?.of(r.destinationCountry) ?? r.destinationCountry,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                      <span className="text-muted">{r.products}</span>
                    </summary>
                    <pre className="text-muted mt-2 font-sans text-sm whitespace-pre-wrap">
                      {r.message}
                    </pre>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
