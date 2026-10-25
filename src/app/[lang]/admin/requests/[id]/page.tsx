import { notFound } from "next/navigation";
import {AdminScope, AttachmentContext,
  SourcingRequestOrigin,
  ThreadContextType,} from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import {
  formatDate,
  formatEUR,
  formatNumber,
} from "@/lib/i18n/formatters";
import { ContextThread } from "@/components/messaging/context-thread";
import { MediaGrid } from "@/components/attachments/media-grid";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/requests/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const req = await prisma.sourcingRequest.findUnique({
    where: { id },
    select: { reference: true },
  });
  return { title: req?.reference ?? "" };
}

export default async function AdminRequestDetailPage({
  params,
}: PageProps<"/[lang]/admin/requests/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.REQUESTS);
  const dict = await getDictionary(lang);

  const req = await prisma.sourcingRequest.findUnique({
    where: { id },
    include: {
      products: true,
      clientOrg: {
        select: {
          id: true,
          displayName: true,
          legalName: true,
          country: true,
          city: true,
          kycStatus: true,
          clientCode: true,
        },
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      agent: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      tenderInvitations: {
        select: {
          id: true,
          status: true,
          invitedAt: true,
          respondedAt: true,
          expiresAt: true,
          matchingScore: true,
          factoryOrg: {
            select: { id: true, displayName: true, country: true, kycStatus: true },
          },
        },
        orderBy: { invitedAt: "desc" },
      },
      quotes: {
        select: {
          id: true,
          status: true,
          unitPriceCentsFactory: true,
          unitPriceCentsClient: true,
          totalCentsClient: true,
          marginCents: true,
          quantity: true,
          leadTimeDays: true,
          moq: true,
          incoterm: true,
          qualificationScore: true,
          createdAt: true,
          factoryOrg: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      orders: {
        select: {
          id: true,
          reference: true,
          status: true,
          totalCents: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!req) notFound();

  // Marketplace synthetic requests are routed through the marketplace order
  // detail page — admins shouldn't land on this view for those. Bounce to
  // the order detail of the linked order (there should always be exactly one
  // for a marketplace synthetic request).
  if (req.origin === SourcingRequestOrigin.MARKETPLACE) {
    const linkedOrder = req.orders[0];
    if (linkedOrder) {
      // Fall through and render — we still show the data for transparency,
      // but the page header surfaces the marketplace nature.
    }
  }

  const tQ = dict.client.requests;
  const tA = dict.admin.requestDetail;
  const isMarketplace = req.origin === SourcingRequestOrigin.MARKETPLACE;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/admin/requests`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {tA.backToDispatch}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {req.reference}
        </p>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-headline tracking-tight">
            {req.title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {isMarketplace && (
              <span className="inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide bg-warning-soft text-warning border-warning-edge whitespace-nowrap">
                {tA.marketplaceBadge}
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide whitespace-nowrap",
                "bg-info-soft text-info border-info-edge",
              )}
            >
              {tQ.statuses[req.status]}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted mt-1">
          {tA.createdBy} {req.createdBy.firstName} {req.createdBy.lastName}{" "}
          <span className="text-faint">·</span> {formatDate(req.createdAt, lang, "medium")}
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label={tQ.quantityLabel} value={formatNumber(req.quantity, lang)} />
        <Stat
          label={tQ.budgetLabel}
          value={req.budgetCents ? formatEUR(req.budgetCents / 100, lang) : "—"}
        />
        <Stat
          label={tQ.targetPriceLabel}
          value={
            req.targetUnitPriceCents
              ? formatEUR(req.targetUnitPriceCents / 100, lang)
              : "—"
          }
        />
        <Stat
          label={tQ.deadlineLabel}
          value={formatDate(req.deadline, lang, "medium")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title={tA.sectionClient}>
          <Detail label={tA.orgLabel}>
            <Link
              href={`/${lang}/admin/organizations`}
              variant="default"
              className="font-medium"
            >
              {req.clientOrg.displayName}
            </Link>
            {req.clientOrg.legalName !== req.clientOrg.displayName && (
              <span className="text-faint"> · {req.clientOrg.legalName}</span>
            )}
            {req.clientOrg.clientCode && (
              <span className="font-mono text-faint"> · {req.clientOrg.clientCode}</span>
            )}
          </Detail>
          <Detail label={tA.locationLabel}>
            {req.clientOrg.city ? `${req.clientOrg.city}, ` : ""}
            {req.clientOrg.country}
          </Detail>
          <Detail label={tA.kycLabel}>
            <KycPill status={req.clientOrg.kycStatus} />
          </Detail>
          <Detail label={tA.contactLabel}>
            <a
              href={`mailto:${req.createdBy.email}`}
              className="underline underline-offset-2 hover:text-brand-700"
            >
              {req.createdBy.email}
            </a>
          </Detail>
        </Section>

        <Section title={tQ.sectionProduct}>
          <Detail label={tQ.categoryLabel}>{dict.categories[req.category]}</Detail>
          {req.products.map((p) => (
            <div
              key={p.id}
              className="border-t border-line-subtle pt-2 mt-2 first:border-0 first:pt-0 first:mt-0"
            >
              <Detail label={tQ.productNameLabel}>{p.name}</Detail>
              {p.description && (
                <Detail label={tQ.productDescriptionLabel}>{p.description}</Detail>
              )}
              {p.targetPriceCents && (
                <Detail label={tQ.targetPriceLabel}>
                  {formatEUR(p.targetPriceCents / 100, lang)}
                </Detail>
              )}
            </div>
          ))}
        </Section>

        <Section title={tQ.sectionLogistics}>
          <Detail label={tQ.addressLabel}>{req.deliveryAddress}</Detail>
          <Detail label={tQ.incotermLabel}>
            {req.incoterm} — {tQ.incoterms[req.incoterm]}
          </Detail>
          <Detail label={tQ.regionLabel}>{tQ.regions[req.sourcingRegion]}</Detail>
          <Detail label={tA.countryLabel}>{req.sourcingCountry}</Detail>
          {req.requiredCerts.length > 0 && (
            <Detail label={tQ.certsLabel}>{req.requiredCerts.join(", ")}</Detail>
          )}
        </Section>

        <Section title={tA.sectionAssignment}>
          {req.agent ? (
            <>
              <Detail label={tA.agentLabel}>
                {req.agent.firstName} {req.agent.lastName}{" "}
                <span className="text-faint">({req.agent.email})</span>
              </Detail>
              {req.assignedAt && (
                <Detail label={tA.assignedAtLabel}>
                  {formatDate(req.assignedAt, lang, "medium")}
                </Detail>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">{tA.unassigned}</p>
          )}
          <Detail label={tA.invitationsLabel}>
            {req.tenderInvitations.length}
          </Detail>
          <Detail label={tA.quotesLabel}>{req.quotes.length}</Detail>
        </Section>
      </div>

      {req.tenderInvitations.length > 0 && (
        <Section title={tA.sectionInvitations} className="mt-6">
          <ul className="divide-y divide-line-subtle -my-2">
            {req.tenderInvitations.map((inv) => (
              <li
                key={inv.id}
                className="py-2 flex items-center justify-between gap-3 flex-wrap text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-fg">
                    {inv.factoryOrg.displayName}{" "}
                    <span className="text-faint">· {inv.factoryOrg.country}</span>
                  </p>
                  <p className="text-xs text-faint mt-0.5">
                    {tA.sentAt} {formatDate(inv.invitedAt, lang, "short")}
                    {inv.respondedAt && (
                      <>
                        {" "}
                        <span className="text-faint">·</span> {tA.respondedAt}{" "}
                        {formatDate(inv.respondedAt, lang, "short")}
                      </>
                    )}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide",
                    inv.status === "RESPONDED"
                      ? "bg-success-soft text-success border-success-edge"
                      : inv.status === "DECLINED"
                        ? "bg-danger-soft text-danger border-danger-edge"
                        : inv.status === "EXPIRED"
                          ? "bg-subtle text-muted border-line"
                          : inv.status === "VIEWED"
                            ? "bg-warning-soft text-warning border-warning-edge"
                            : "bg-info-soft text-info border-info-edge",
                  )}
                >
                  {tA.invitationStatuses[inv.status]}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {req.quotes.length > 0 && (
        <Section title={tA.sectionQuotes} className="mt-6">
          <ul className="divide-y divide-line-subtle -my-2">
            {req.quotes.map((q) => (
              <li
                key={q.id}
                className="py-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:gap-4 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-fg">
                    {q.factoryOrg.displayName}
                  </p>
                  <p className="text-xs text-faint mt-0.5 font-mono">
                    {tA.factoryUnit} {formatEUR(q.unitPriceCentsFactory / 100, lang)}{" "}
                    <span className="text-faint">·</span> {tA.clientUnit}{" "}
                    {formatEUR(q.unitPriceCentsClient / 100, lang)}{" "}
                    <span className="text-faint">·</span> {tA.margin}{" "}
                    {formatEUR(q.marginCents / 100, lang)}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {tA.leadTimeDays.replace("{n}", String(q.leadTimeDays))}{" "}
                    <span className="text-faint">·</span>{" "}
                    {tA.moqLabel.replace("{n}", formatNumber(q.moq, lang))}{" "}
                    <span className="text-faint">·</span> {q.incoterm}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-headline">
                    {formatEUR(q.totalCentsClient / 100, lang)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide",
                      q.status === "ACCEPTED"
                        ? "bg-success-soft text-success border-success-edge"
                        : q.status === "REJECTED"
                          ? "bg-danger-soft text-danger border-danger-edge"
                          : q.status === "EXPIRED"
                            ? "bg-subtle text-muted border-line"
                            : "bg-info-soft text-info border-info-edge",
                    )}
                  >
                    {tA.quoteStatuses[q.status]}
                  </span>
                  <span className="text-[10px] text-faint">
                    {tA.score} {q.qualificationScore}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {req.orders.length > 0 && (
        <Section title={tA.sectionOrders} className="mt-6">
          <ul className="divide-y divide-line-subtle -my-2">
            {req.orders.map((o) => (
              <li
                key={o.id}
                className="py-2 flex items-center justify-between gap-3 flex-wrap text-sm"
              >
                <div className="min-w-0">
                  <Link
                    href={`/${lang}/admin/orders/${o.id}`}
                    variant="inline"
                    className="font-mono text-xs uppercase tracking-wide"
                  >
                    {o.reference}
                  </Link>
                  <p className="text-xs text-faint mt-0.5">
                    {formatDate(o.createdAt, lang, "short")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-headline">
                  {formatEUR(o.totalCents / 100, lang)}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <MediaGrid
        contextType={AttachmentContext.SOURCING_REQUEST}
        contextId={req.id}
        title={tQ.mediaTitle}
        className="mt-6"
      />

      <div className="mt-6">
        <ContextThread
          contextType={ThreadContextType.REQUEST}
          contextId={req.id}
          lang={lang}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
      </p>
      <p className="mt-0.5 text-base font-semibold text-headline">{value}</p>
    </div>
  );
}

function Section({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("rounded-lg border border-line bg-surface p-5", className)}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
        {title}
      </h2>
      <dl className="flex flex-col gap-2">{children}</dl>
    </section>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-faint">
        {label}
      </dt>
      <dd className="text-sm text-fg sm:col-span-2 wrap-break-word">{children}</dd>
    </div>
  );
}

function KycPill({ status }: { status: string }) {
  const tone =
    status === "VERIFIED"
      ? "bg-success-soft text-success border-success-edge"
      : status === "REJECTED"
        ? "bg-danger-soft text-danger border-danger-edge"
        : status === "FLAGGED"
          ? "bg-warning-soft text-warning border-warning-edge"
          : "bg-subtle text-muted border-line";
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-1.5 rounded-full border text-[10px] font-medium uppercase tracking-wide",
        tone,
      )}
    >
      {status}
    </span>
  );
}
