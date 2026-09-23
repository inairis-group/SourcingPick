import { notFound } from "next/navigation";
import {
  AdminScope,
  AttachmentContext,
  QuoteRequestKind,
  QuoteRequestService,
  QuoteRequestStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { countryNameFor } from "@/lib/countries";
import { formatBytes } from "@/lib/quotes/files";
import { DashboardHeader, DashboardSection, KpiCard } from "@/components/dashboard/primitives";

/**
 * Quote requests from the public form.
 *
 * Every row is somebody without an account, so there is nothing to link
 * through to — which is exactly why the whole record is laid out here rather
 * than summarised. An operator answering one of these needs the measurements,
 * the cities and the message in front of them, not a list of names they have
 * to open one by one.
 */

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/quote-requests">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.quoteRequests.title };
}

export default async function AdminQuoteRequestsPage({
  params,
}: PageProps<"/[lang]/admin/quote-requests">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.REQUESTS);
  const dict = await getDictionary(lang);
  const t = dict.admin.quoteRequests;

  const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [newCount, weekCount, total, rows] = await Promise.all([
    prisma.quoteRequest.count({ where: { status: QuoteRequestStatus.NEW } }),
    prisma.quoteRequest.count({ where: { createdAt: { gte: week } } }),
    prisma.quoteRequest.count(),
    prisma.quoteRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        reference: true,
        service: true,
        kind: true,
        products: true,
        quantity: true,
        volume: true,
        goodsValue: true,
        supplierCount: true,
        supplierCities: true,
        destinationCountry: true,
        destinationCity: true,
        arrivalDate: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        message: true,
        locale: true,
        createdAt: true,
        linkedUserId: true,
      },
    }),
  ]);

  // Attachments hang off the context id rather than a relation, so they are
  // fetched for the whole page in one go and grouped here.
  const attachments = rows.length
    ? await prisma.attachment.findMany({
        where: {
          contextType: AttachmentContext.QUOTE_REQUEST,
          contextId: { in: rows.map((r) => r.id) },
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          contextId: true,
          originalName: true,
          sizeBytes: true,
          mimeType: true,
        },
      })
    : [];
  const filesFor = new Map<string, typeof attachments>();
  for (const a of attachments) {
    const list = filesFor.get(a.contextId) ?? [];
    list.push(a);
    filesFor.set(a.contextId, list);
  }

  const serviceLabel = (s: QuoteRequestService) =>
    s === QuoteRequestService.SOURCING_LOGISTICS ? t.serviceSourcing : t.serviceLogistics;

  const kindLabel = (k: QuoteRequestKind) =>
    k === QuoteRequestKind.INDIVIDUAL ? t.kindIndividual : t.kindBusiness;

  /** Only render a measurement the visitor actually filled in. */
  const facts = (r: (typeof rows)[number]) =>
    (
      [
        [t.quantity, r.quantity],
        [t.volume, r.volume],
        [t.value, r.goodsValue],
        [t.suppliers, r.supplierCount],
        [t.cities, r.supplierCities],
        [t.arrival, r.arrivalDate],
        [t.phone, r.phone],
      ] as const
    ).filter(([, v]) => Boolean(v));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader title={t.title} description={t.subtitle} />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <KpiCard
          label={t.kpiNew}
          value={String(newCount)}
          tone={newCount > 0 ? "warning" : "neutral"}
        />
        <KpiCard label={t.kpiWeek} value={String(weekCount)} />
        <KpiCard label={t.kpiTotal} value={String(total)} />
      </div>

      <DashboardSection title={t.title}>
        {rows.length === 0 ? (
          <p className="text-faint py-12 text-center">{t.empty}</p>
        ) : (
          <ul className="divide-line-subtle divide-y">
            {rows.map((r) => (
              <li key={r.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-faint font-mono text-[11px]">{r.reference}</span>
                  <span className="text-headline font-semibold">{r.name}</span>
                  {r.company && <span className="text-muted text-sm">· {r.company}</span>}
                  <span className="text-muted text-sm">· {kindLabel(r.kind)}</span>
                  {r.linkedUserId && (
                    <span className="bg-subtle text-muted rounded px-1.5 py-0.5 text-[11px]">
                      {t.hasAccount}
                    </span>
                  )}
                  <span className="text-faint ms-auto text-[11px] whitespace-nowrap">
                    {formatDate(r.createdAt, lang, "short")}
                  </span>
                </div>

                <div className="text-muted mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <a href={`mailto:${r.email}`} className="text-link" dir="ltr">
                    {r.email}
                  </a>
                  <span>{serviceLabel(r.service)}</span>
                  <span>
                    {[countryNameFor(r.destinationCountry, lang), r.destinationCity]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  <span className="uppercase">{r.locale}</span>
                </div>

                <p className="text-fg mt-2 text-sm">{r.products}</p>

                {facts(r).length > 0 && (
                  <dl className="text-muted mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
                    {facts(r).map(([label, value]) => (
                      <div key={label} className="flex gap-1.5">
                        <dt className="text-faint">{label}</dt>
                        <dd className="text-fg">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {(filesFor.get(r.id) ?? []).length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {(filesFor.get(r.id) ?? []).map((a) => (
                      <li key={a.id}>
                        <a
                          href={`/api/attachments/${a.id}`}
                          className="border-line-subtle hover:bg-subtle inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12.5px]"
                          // Downloaded rather than previewed: these arrive
                          // from strangers, and a PDF opened in a tab is a
                          // document the browser has agreed to run.
                          download={a.originalName}
                        >
                          <span className="text-fg max-w-[220px] truncate">{a.originalName}</span>
                          <span className="text-faint">{formatBytes(a.sizeBytes, lang)}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {r.message && (
                  <p className="border-line-subtle text-muted mt-2 border-s-2 ps-3 text-[13px] whitespace-pre-line">
                    {r.message}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}
