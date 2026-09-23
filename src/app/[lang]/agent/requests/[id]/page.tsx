import { notFound } from "next/navigation";
import { Role, ThreadContextType } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Mail01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { ResearchFeeControl } from "./_components/research-fee-control";
import { AgentDirectQuoteDialog } from "./_components/agent-direct-quote-dialog";
import { KycStatus, OrgType } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { requiresPreTenderApproval } from "@/lib/sourcing/pre-tender-gate";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { OrderTimeline } from "@/components/orders/timeline";
import { ContextThread } from "@/components/messaging/context-thread";
import { cn } from "@/lib/utils";
import { QuotesTable } from "./_components/quotes-table";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/agent/requests/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const req = await prisma.sourcingRequest.findUnique({
    where: { id },
    select: { reference: true },
  });
  return { title: req?.reference ?? "" };
}

export default async function AgentRequestDetailPage({
  params,
}: PageProps<"/[lang]/agent/requests/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const agent = await requireRole(Role.AGENT);
  const dict = await getDictionary(lang);

  const req = await prisma.sourcingRequest.findFirst({
    where: { id, agentId: agent.id },
    include: {
      products: true,
      clientOrg: { select: { displayName: true, country: true, city: true } },
      createdBy: {
        select: { firstName: true, lastName: true, email: true, phone: true },
      },
      tenderInvitations: {
        select: {
          id: true,
          status: true,
          invitedAt: true,
          factoryOrg: { select: { displayName: true } },
        },
        orderBy: { invitedAt: "desc" },
      },
      quotes: {
        select: {
          id: true,
          unitPriceCentsFactory: true,
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
          createdAt: true,
          factoryOrg: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      orders: {
        select: {
          id: true,
          reference: true,
          status: true,
          totalCents: true,
          estimatedEta: true,
          shippedAt: true,
          deliveredAt: true,
          trackingNumber: true,
          trackingCarrier: true,
          factoryOrg: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!req) notFound();

  // Partner #21: conditional pre-tender gate. Below thresholds the
  // agent can dispatch without admin sign-off; above, they wait. The
  // rule lives in pre-tender-gate.ts so server + UI agree.
  const gateNeeded = requiresPreTenderApproval({
    category: req.category,
    budgetCents: req.budgetCents,
  });

  // Partner round 4: shortlist of registered factories for the
  // agent-direct quote picker. Same category, KYC verified, not
  // shadow. Top 20.
  const shortlistFactories = (
    await prisma.organization.findMany({
      where: {
        type: OrgType.FACTORY,
        kycStatus: KycStatus.VERIFIED,
        isShadowOrg: false,
        deletedAt: null,
        OR: [
          { factoryProfile: { category: req.category } },
          { factoryProfile: { is: null } },
        ],
      },
      orderBy: { displayName: "asc" },
      take: 20,
      select: { id: true, displayName: true, country: true },
    })
  ).map((f) => ({ id: f.id, displayName: f.displayName, country: f.country }));

  const order = req.orders[0];

  const quoteRows = req.quotes.map((q) => ({
    id: q.id,
    factoryName: q.factoryOrg.displayName,
    unitPriceCentsFactory: q.unitPriceCentsFactory,
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
    createdAt: q.createdAt,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/agent/requests`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.agent.requests.backToList}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {req.reference}
        </p>
        <div className="flex items-start justify-between gap-4 flex-wrap">
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
        <p className="text-sm text-muted mt-1">
          {dict.agent.requests.clientLabel} · {req.clientOrg.displayName} ({req.clientOrg.city}, {req.clientOrg.country})
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Stat
          label={dict.client.requests.quantityLabel}
          value={formatNumber(req.quantity, lang)}
        />
        <Stat
          label={dict.client.requests.budgetLabel}
          value={req.budgetCents ? formatEUR(req.budgetCents / 100, lang) : "—"}
        />
        <Stat
          label={dict.client.requests.deadlineLabel}
          value={formatDate(req.deadline, lang, "medium")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Section title={dict.client.requests.sectionProduct}>
          <Detail label={dict.client.requests.categoryLabel}>
            {dict.categories[req.category]}
          </Detail>
          {req.products.map((p) => (
            <div
              key={p.id}
              className="border-t border-line-subtle pt-2 mt-2 first:border-0 first:pt-0 first:mt-0"
            >
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

      <ResearchFeeControl
        requestId={req.id}
        lang={lang}
        current={{
          status: req.researchFeeStatus,
          unit: req.researchFeeUnit,
          quantity: req.researchFeeQuantity,
          cents: req.researchFeeCents,
        }}
      />

      <Section title={dict.agent.requests.sectionTenders} className="mb-6">
        {/* Partner #21: pre-tender approval is now conditional. The
            PreTenderGate component still renders the approval banner
            when an admin has actioned it; when the brief is exempt,
            we skip the gate entirely. */}
        {gateNeeded && (
          <PreTenderGate
            approvedAt={req.preTenderApprovedAt}
            rejectedAt={req.preTenderRejectedAt}
            rejectionReason={req.preTenderRejectionReason}
            dict={dict}
            lang={lang}
          />
        )}
        {!gateNeeded && (
          <div className="mb-4 rounded-md border border-info-edge bg-info-soft/30 p-3 text-xs text-fg">
            <p className="font-semibold text-headline mb-0.5">
              {dict.tender.exemptTitle}
            </p>
            <p className="text-muted leading-snug">
              {dict.tender.exemptBody}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <p className="text-sm text-muted">
            {dict.tender.invitedCount.replace(
              "{n}",
              String(req.tenderInvitations.length),
            )}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Partner round 4: agent-direct quote — bypass the
                tender flow entirely if the agent already negotiated
                with a factory (typically Chinese, off-platform). */}
            <AgentDirectQuoteDialog
              requestId={req.id}
              factories={shortlistFactories}
            />
            {!gateNeeded || req.preTenderApprovedAt ? (
              <Link
                href={`/${lang}/agent/requests/${req.id}/tender`}
                className={cn(buttonClass({ variant: "primary", size: "sm" }))}
              >
                <HugeiconsIcon icon={Mail01Icon} size={14} strokeWidth={1.5} />
                <span className="ms-1.5">{dict.tender.sendCta}</span>
              </Link>
            ) : (
              <span
                className={cn(
                  buttonClass({ variant: "primary", size: "sm" }),
                  "opacity-50 cursor-not-allowed pointer-events-none",
                )}
                aria-disabled="true"
              >
                <HugeiconsIcon icon={Mail01Icon} size={14} strokeWidth={1.5} />
                <span className="ms-1.5">{dict.tender.sendCta}</span>
              </span>
            )}
          </div>
        </div>

        {req.tenderInvitations.length > 0 && (
          <ul className="divide-y divide-line-subtle rounded-md border border-line bg-subtle">
            {req.tenderInvitations.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/${lang}/agent/requests/${req.id}/tenders/${t.id}`}
                  variant="muted"
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-surface transition-colors duration-fast"
                >
                  <span className="text-sm text-fg">
                    {t.factoryOrg.displayName}
                  </span>
                  <span className="text-xs text-faint">
                    {formatDate(t.invitedAt, lang, "short")} ·{" "}
                    <span className="font-medium">
                      {dict.factory.tenders[
                        `status${t.status[0]}${t.status.slice(1).toLowerCase()}` as never
                      ] ?? t.status}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={dict.agent.requests.sectionQuotes}>
        <QuotesTable quotes={quoteRows} />
      </Section>

      {order && (
        <Section title={dict.agent.requests.sectionOrder} className="mt-6">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div className="min-w-0">
              <p className="text-xs font-mono uppercase tracking-wide text-faint">
                {order.reference}
              </p>
              <p className="text-sm text-fg mt-0.5">
                {order.factoryOrg.displayName} ·{" "}
                {formatEUR(order.totalCents / 100, lang)}
              </p>
              {order.trackingNumber && (
                <p className="text-xs text-muted mt-0.5">
                  {dict.client.orders.carrierLabel}: {order.trackingCarrier} ·{" "}
                  {order.trackingNumber}
                </p>
              )}
            </div>
          </div>
          <OrderTimeline
            status={order.status}
            shippedAt={order.shippedAt}
            deliveredAt={order.deliveredAt}
            estimatedEta={order.estimatedEta}
            lang={lang}
            dict={dict}
          />
        </Section>
      )}

      <div className="mt-6">
        <ContextThread
          contextType={ThreadContextType.REQUEST}
          contextId={req.id}
          lang={lang}
        />
      </div>

      <Section title={dict.agent.requests.sectionContact} className="mt-6">
        <Detail label={dict.admin.kyc.contactName}>
          {req.createdBy.firstName} {req.createdBy.lastName}
        </Detail>
        <Detail label={dict.admin.kyc.contactEmail}>{req.createdBy.email}</Detail>
        {req.createdBy.phone && (
          <Detail label={dict.settings.profile.phoneLabel}>
            {req.createdBy.phone}
          </Detail>
        )}
      </Section>

      <div className="mt-6">
        <Link
          href={`/${lang}/agent/factories?category=${req.category}&region=${req.sourcingRegion}`}
          variant="muted"
          className="text-sm inline-flex items-center gap-1"
        >
          {dict.agent.requests.browseFactories}
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={1.5} />
        </Link>
      </div>
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

function PreTenderGate({
  approvedAt,
  rejectedAt,
  rejectionReason,
  dict,
  lang,
}: {
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  lang: Locale;
}) {
  const t = dict.agent.requests.preTender;
  if (approvedAt) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-success-edge bg-success-soft px-3 py-2 mb-3">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={14}
          strokeWidth={2}
          className="text-success mt-0.5 shrink-0"
        />
        <p className="text-xs text-success font-medium">
          {t.approvedBanner.replace(
            "{date}",
            formatDate(approvedAt, lang, "short"),
          )}
        </p>
      </div>
    );
  }
  if (rejectedAt && rejectionReason) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-danger-edge bg-danger-soft px-3 py-2 mb-3">
        <HugeiconsIcon
          icon={AlertCircleIcon}
          size={14}
          strokeWidth={2}
          className="text-danger mt-0.5 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-danger">
            {t.rejectedBanner.replace(
              "{date}",
              formatDate(rejectedAt, lang, "short"),
            )}
          </p>
          <p className="text-xs text-muted mt-0.5 leading-relaxed wrap-break-word">
            {rejectionReason}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 rounded-md border border-warning-line bg-warning-subtle px-3 py-2 mb-3">
      <HugeiconsIcon
        icon={AlertCircleIcon}
        size={14}
        strokeWidth={2}
        className="text-warning mt-0.5 shrink-0"
      />
      <p className="text-xs text-warning font-medium">{t.pendingBanner}</p>
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-faint">
        {label}
      </dt>
      <dd className="text-sm text-fg sm:col-span-2 wrap-break-word">{children}</dd>
    </div>
  );
}
