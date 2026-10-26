import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { Panel } from "@/components/saas/panel";
import { freightCopy } from "@/content/freight/simulator";
import type { FreightEstimate, FreightRequest } from "@/lib/freight/estimate";
import { describeTransport, formulaName, quoteStanding, transportDelay } from "@/lib/freight-quotes/describe";
import { FreightQuoteAnswer } from "./_components/freight-quote-answer";

/**
 * A freight quote the team sent from the freight calculator, as the client
 * reads it: the amount in euros, what it covers, and — while it is open —
 * accept (which issues the freight invoice) or decline.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/client/freight-quotes/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const user = await requireRole(Role.CLIENT);
  const q = await prisma.freightQuote.findFirst({
    where: { id, organizationId: user.organizationId },
    select: { reference: true },
  });
  return { title: q?.reference ?? "" };
}

const TONE: Record<string, string> = {
  SENT: "bg-warning-soft text-warning border-warning-edge",
  ACCEPTED: "bg-success-soft text-success border-success-edge",
  DECLINED: "bg-subtle text-faint border-line",
  CANCELLED: "bg-subtle text-faint border-line",
  EXPIRED: "bg-subtle text-faint border-line",
};

function countryName(iso: string, lang: Locale): string {
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(iso) ?? iso;
  } catch {
    return iso;
  }
}

export default async function ClientFreightQuotePage({ params }: PageProps<"/[lang]/client/freight-quotes/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);
  const t = dict.client.freightQuote;
  const c = freightCopy(lang);

  const q = await prisma.freightQuote.findFirst({
    where: { id, organizationId: user.organizationId },
    select: {
      id: true,
      reference: true,
      status: true,
      request: true,
      estimate: true,
      mode: true,
      formula: true,
      line: true,
      amountEurCents: true,
      validUntil: true,
      notes: true,
      createdAt: true,
      order: { select: { id: true, reference: true } },
      invoice: { select: { reference: true } },
    },
  });
  if (!q) notFound();

  const request = q.request as unknown as FreightRequest;
  const estimate = q.estimate as unknown as Extract<FreightEstimate, { ok: true }>;
  const status = quoteStanding(q.status, q.validUntil);
  const expired = status === "EXPIRED";
  const amount = formatEUR(q.amountEurCents / 100, lang);
  const a = request.address;
  const measured = estimate.weights.real > 0;
  const orderHref = q.order ? `/${lang}/client/orders/${q.order.id}` : null;
  const transport = describeTransport(c, { mode: q.mode, line: q.line, container: request.container });
  const rows: [string, string][] = [
    [t.formula, formulaName(c, q.formula)],
    [t.delay, transportDelay(c, q)],
    [t.destination, [a.street, [a.postcode, a.city].filter(Boolean).join(" "), countryName(a.country, lang)].filter(Boolean).join(", ")],
    ...(measured
      ? ([
          [t.cartons, `${formatNumber(estimate.weights.cartons, lang)} · ${formatNumber(estimate.weights.volume, lang, { maximumFractionDigits: 2 })} m³`],
          [t.billedWeight, `${formatNumber(estimate.billedKg, lang)} kg`],
        ] as [string, string][])
      : []),
    [
      t.products,
      estimate.products
        .map((p, i) => `${p.name || c.products.item.replace("{n}", String(i + 1))} (${formatNumber(p.cartons, lang)})`)
        .join(", "),
    ],
  ];

  return (
    <>
      <DashboardHeader title={t.title.replace("{reference}", q.reference)} description={t.intro} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title={transport}>
          <dl className="m-0 flex flex-col">
            {rows.map(([k, v]) => (
              <div key={k} className="border-line-subtle flex flex-wrap justify-between gap-x-6 gap-y-1 border-b py-2.5 text-sm last:border-b-0">
                <dt className="text-faint">{k}</dt>
                <dd className="text-fg m-0 text-end">{v}</dd>
              </div>
            ))}
          </dl>
          {q.notes && (
            <div className="border-line-subtle mt-4 border-t pt-3 text-sm">
              <p className="text-faint m-0">{t.notes}</p>
              <p className="text-fg m-0 mt-1 whitespace-pre-wrap">{q.notes}</p>
            </div>
          )}
        </Panel>

        <aside className="border-line bg-surface flex flex-col gap-4 rounded-lg border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-faint m-0 text-sm">{t.amount}</p>
              <p className="text-headline m-0 text-2xl font-semibold tabular-nums">{amount}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONE[status]}`}>{t.status[status as keyof typeof t.status]}</span>
          </div>
          <dl className="m-0 text-sm">
            <div className="flex justify-between gap-4 py-1">
              <dt className="text-faint">{t.validUntil}</dt>
              <dd className={expired ? "text-danger m-0" : "text-fg m-0"}>{formatDate(q.validUntil, lang)}</dd>
            </div>
            {q.order && orderHref && (
              <div className="flex justify-between gap-4 py-1">
                <dt className="text-faint">{t.order}</dt>
                <dd className="m-0">
                  <Link href={orderHref} variant="inline">
                    {q.order.reference}
                  </Link>
                </dd>
              </div>
            )}
          </dl>

          {status === "SENT" ? (
            <FreightQuoteAnswer
              quoteId={q.id}
              amount={amount}
              invoicesHref={`/${lang}/client/invoices`}
              orderHref={orderHref}
              copy={{
                accept: t.accept,
                accepting: t.accepting,
                acceptHint: t.acceptHint,
                decline: t.decline,
                declineReason: t.declineReason,
                declineSubmit: t.declineSubmit,
                back: t.back,
                accepted: t.accepted,
                declined: t.declined,
                seeInvoices: t.seeInvoices,
                seeOrder: t.seeOrder,
                errors: t.errors,
              }}
            />
          ) : status === "ACCEPTED" ? (
            <div className="border-success-edge bg-success-soft rounded-lg border p-4 text-sm">
              <p className="text-success m-0 font-semibold">{t.accepted.replace("{invoice}", q.invoice?.reference ?? "")}</p>
              <p className="m-0 mt-2 flex flex-wrap gap-4">
                <Link href={`/${lang}/client/invoices`} variant="inline">
                  {t.seeInvoices}
                </Link>
                {orderHref && (
                  <Link href={orderHref} variant="inline">
                    {t.seeOrder}
                  </Link>
                )}
              </p>
            </div>
          ) : (
            <p className="border-line bg-subtle text-fg m-0 rounded-lg border p-4 text-sm">
              {status === "DECLINED" ? t.declined : status === "CANCELLED" ? t.cancelled : t.expired}
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
