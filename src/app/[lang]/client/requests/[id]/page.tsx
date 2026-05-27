import { notFound } from "next/navigation";
import {
  AttachmentContext,
  QuoteStatus,
  Role,
  ThreadContextType,
} from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { ContextThread } from "@/components/messaging/context-thread";
import { MediaGrid } from "@/components/attachments/media-grid";
import { cn } from "@/lib/utils";
import { ClientQuotesPanel } from "./_components/client-quotes-panel";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/requests/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const req = await prisma.sourcingRequest.findUnique({
    where: { id },
    select: { reference: true },
  });
  return { title: req?.reference ?? "" };
}

export default async function RequestDetailPage({
  params,
}: PageProps<"/[lang]/client/requests/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);

  const req = await prisma.sourcingRequest.findFirst({
    where: { id, clientOrgId: user.organizationId },
    include: {
      products: true,
      agent: { select: { firstName: true, lastName: true, email: true } },
      _count: { select: { quotes: true, tenderInvitations: true } },
      quotes: {
        where: {
          status: {
            in: [
              QuoteStatus.SENT_TO_CLIENT,
              QuoteStatus.ACCEPTED,
              QuoteStatus.REJECTED,
            ],
          },
        },
        select: {
          id: true,
          unitPriceCentsClient: true,
          totalCentsClient: true,
          quantity: true,
          leadTimeDays: true,
          moq: true,
          incoterm: true,
          validUntil: true,
          qualificationScore: true,
          status: true,
          notes: true,
          factoryOrg: { select: { displayName: true } },
        },
        orderBy: [{ status: "asc" }, { qualificationScore: "desc" }],
      },
      orders: {
        select: { id: true, reference: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!req) notFound();

  // Highest qualificationScore among SENT_TO_CLIENT marks the agent pick.
  const recommendedId = req.quotes
    .filter((q) => q.status === QuoteStatus.SENT_TO_CLIENT)
    .sort((a, b) => b.qualificationScore - a.qualificationScore)[0]?.id;

  const quoteRows = req.quotes.map((q) => ({
    id: q.id,
    factoryName: q.factoryOrg.displayName,
    unitPriceCentsClient: q.unitPriceCentsClient,
    totalCentsClient: q.totalCentsClient,
    quantity: q.quantity,
    leadTimeDays: q.leadTimeDays,
    moq: q.moq,
    incoterm: q.incoterm,
    validUntil: q.validUntil,
    qualificationScore: q.qualificationScore,
    status: q.status,
    notes: q.notes,
    agentRecommendation: q.id === recommendedId,
  }));

  const existingOrder = req.orders[0];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/client/requests`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.client.requests.backToList}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {req.reference}
        </p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-headline tracking-tight">
            {req.title}
          </h1>
          <span
            className={cn(
              "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide whitespace-nowrap",
              "bg-info-soft text-info border-info-edge",
            )}
          >
            {dict.client.requests.statuses[req.status]}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Stat
          label={dict.client.requests.quantityLabel}
          value={formatNumber(req.quantity, lang)}
        />
        <Stat
          label={dict.client.requests.budgetLabel}
          value={
            req.budgetCents
              ? formatEUR(req.budgetCents / 100, lang)
              : "—"
          }
        />
        <Stat
          label={dict.client.requests.deadlineLabel}
          value={formatDate(req.deadline, lang, "medium")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title={dict.client.requests.sectionProduct}>
          <Detail label={dict.client.requests.categoryLabel}>
            {dict.categories[req.category]}
          </Detail>
          {req.products.map((p) => (
            <div key={p.id} className="border-t border-line-subtle pt-2 mt-2 first:border-0 first:pt-0 first:mt-0">
              <Detail label={dict.client.requests.productNameLabel}>{p.name}</Detail>
              {p.description && (
                <Detail label={dict.client.requests.productDescriptionLabel}>
                  {p.description}
                </Detail>
              )}
              <Detail label={dict.client.requests.targetPriceLabel}>
                {p.targetPriceCents
                  ? formatEUR(p.targetPriceCents / 100, lang)
                  : "—"}
              </Detail>
            </div>
          ))}
        </Section>

        <Section title={dict.client.requests.sectionLogistics}>
          <Detail label={dict.client.requests.addressLabel}>
            {req.deliveryAddress}
          </Detail>
          <Detail label={dict.client.requests.incotermLabel}>
            {req.incoterm} — {dict.client.requests.incoterms[req.incoterm]}
          </Detail>
          <Detail label={dict.client.requests.regionLabel}>
            {dict.client.requests.regions[req.sourcingRegion]}
          </Detail>
          {req.requiredCerts.length > 0 && (
            <Detail label={dict.client.requests.certsLabel}>
              {req.requiredCerts.join(", ")}
            </Detail>
          )}
        </Section>
      </div>

      <Section title={dict.client.requests.sectionAgent} className="mt-6">
        {req.agent ? (
          <Detail label={dict.client.requests.agentLabel}>
            {req.agent.firstName} {req.agent.lastName} ({req.agent.email})
          </Detail>
        ) : (
          <p className="text-sm text-muted">
            {dict.client.requests.agentPending}
          </p>
        )}
        <div className="mt-2 flex items-center gap-4 text-sm text-muted">
          <span>
            {dict.client.requests.tenderInvitationsCount.replace(
              "{n}",
              String(req._count.tenderInvitations),
            )}
          </span>
          <span>
            {dict.client.requests.quotesCount.replace(
              "{n}",
              String(req._count.quotes),
            )}
          </span>
        </div>
      </Section>

      <MediaGrid
        contextType={AttachmentContext.SOURCING_REQUEST}
        contextId={req.id}
        title={dict.client.requests.mediaTitle}
        className="mt-6"
      />

      <div className="mt-6">
        <ContextThread
          contextType={ThreadContextType.REQUEST}
          contextId={req.id}
          lang={lang}
        />
      </div>

      <Section title={dict.client.quotes.sectionTitle} className="mt-6">
        {existingOrder ? (
          <div className="rounded-md border border-success-edge bg-success-soft/40 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-fg">
              <p className="font-medium text-headline">
                {dict.client.quotes.orderCreatedTitle}
              </p>
              <p className="text-muted text-xs mt-0.5">
                {dict.client.quotes.orderCreatedBody.replace(
                  "{ref}",
                  existingOrder.reference,
                )}
              </p>
            </div>
            <Link
              href={`/${lang}/client/orders/${existingOrder.id}`}
              variant="default"
              className="text-sm font-medium"
            >
              {dict.client.quotes.viewOrder} →
            </Link>
          </div>
        ) : (
          <ClientQuotesPanel quotes={quoteRows} lang={lang} />
        )}
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-surface px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-faint">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold text-headline">{value}</p>
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
