import { notFound } from "next/navigation";
import { Role, ThreadContextType } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { formatLeadTime } from "@/lib/marketplace/lead-time";
import { ContextThread } from "@/components/messaging/context-thread";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/agent/requests/[id]/tenders/[tenderId]">) {
  const { lang, tenderId } = await params;
  if (!isLocale(lang)) return {};
  const t = await prisma.tenderInvitation.findUnique({
    where: { id: tenderId },
    select: { factoryOrg: { select: { displayName: true } } },
  });
  return { title: t?.factoryOrg.displayName ?? "" };
}

export default async function AgentTenderDetailPage({
  params,
}: PageProps<"/[lang]/agent/requests/[id]/tenders/[tenderId]">) {
  const { lang, id, tenderId } = await params;
  if (!isLocale(lang)) notFound();
  const agent = await requireRole(Role.AGENT);
  const dict = await getDictionary(lang);

  const tender = await prisma.tenderInvitation.findFirst({
    where: {
      id: tenderId,
      requestId: id,
      request: { agentId: agent.id },
    },
    include: {
      factoryOrg: {
        select: {
          displayName: true,
          country: true,
          city: true,
          factoryProfile: {
            select: {
              category: true,
              languages: true,
              capabilities: true,
              certifications: true,
              rating: true,
              totalOrders: true,
            },
          },
        },
      },
      request: {
        select: {
          reference: true,
          title: true,
          category: true,
        },
      },
    },
  });
  if (!tender) notFound();

  // Find any quote this factory submitted on this request.
  const quote = await prisma.quote.findFirst({
    where: {
      requestId: id,
      factoryOrgId: tender.factoryOrgId,
    },
    select: {
      id: true,
      unitPriceCentsFactory: true,
      unitPriceCentsClient: true,
      totalCentsClient: true,
      quantity: true,
      leadTimeDays: true,
      leadTimeUnit: true,
      validUntil: true,
      status: true,
    },
  });

  const isExpired = tender.expiresAt < new Date();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/agent/requests/${id}`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.agent.tenders.backToRequest}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {tender.request.reference} · {dict.agent.tenders.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {tender.factoryOrg.displayName}
        </h1>
        <p className="text-sm text-muted mt-1">
          {tender.factoryOrg.city}, {tender.factoryOrg.country} ·{" "}
          {dict.categories[tender.request.category]}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Section title={dict.agent.tenders.sectionInvitation}>
          <Detail label={dict.agent.tenders.statusLabel}>
            <StatusPill status={tender.status} dict={dict} expired={isExpired} />
          </Detail>
          <Detail label={dict.agent.tenders.invitedAtLabel}>
            {formatDate(tender.invitedAt, lang, "medium")}
          </Detail>
          {tender.viewedAt && (
            <Detail label={dict.agent.tenders.viewedAtLabel}>
              {formatDate(tender.viewedAt, lang, "medium")}
            </Detail>
          )}
          <Detail label={dict.agent.tenders.expiresAtLabel}>
            {formatDate(tender.expiresAt, lang, "medium")}
          </Detail>
          <Detail label={dict.agent.tenders.matchScoreLabel}>
            {tender.matchingScore}/100
          </Detail>
        </Section>

        <Section title={dict.agent.tenders.sectionFactory}>
          {tender.factoryOrg.factoryProfile ? (
            <>
              <Detail label={dict.agent.tenders.languagesLabel}>
                {tender.factoryOrg.factoryProfile.languages.join(", ") || "—"}
              </Detail>
              <Detail label={dict.agent.tenders.totalOrdersLabel}>
                {tender.factoryOrg.factoryProfile.totalOrders}
              </Detail>
              {tender.factoryOrg.factoryProfile.capabilities.length > 0 && (
                <Detail label={dict.agent.tenders.capabilitiesLabel}>
                  {tender.factoryOrg.factoryProfile.capabilities.join(", ")}
                </Detail>
              )}
              {tender.factoryOrg.factoryProfile.certifications.length > 0 && (
                <Detail label={dict.client.requests.certsLabel}>
                  {tender.factoryOrg.factoryProfile.certifications.join(", ")}
                </Detail>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">
              {dict.agent.tenders.noFactoryProfile}
            </p>
          )}
        </Section>
      </div>

      {quote && (
        <Section title={dict.agent.tenders.sectionQuote} className="mb-6">
          <Detail label={dict.agent.quotes.factoryPrice}>
            {formatEUR(quote.unitPriceCentsFactory / 100, lang)}
          </Detail>
          <Detail label={dict.agent.quotes.clientPrice}>
            {formatEUR(quote.unitPriceCentsClient / 100, lang)}
          </Detail>
          <Detail label={dict.agent.quotes.total}>
            {formatEUR(quote.totalCentsClient / 100, lang)}
          </Detail>
          <Detail label={dict.factory.tenders.leadTimeLabel}>
            {formatLeadTime(quote.leadTimeDays, quote.leadTimeUnit, dict)}
          </Detail>
          <Detail label={dict.agent.quotes.validUntil}>
            {formatDate(quote.validUntil, lang, "medium")}
          </Detail>
        </Section>
      )}

      <ContextThread
        contextType={ThreadContextType.TENDER}
        contextId={tender.id}
        lang={lang}
      />
    </div>
  );
}

function StatusPill({
  status,
  dict,
  expired,
}: {
  status: string;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  expired: boolean;
}) {
  if (expired) {
    return (
      <span className="inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide bg-subtle text-faint border-line">
        {dict.factory.tenders.statusExpired}
      </span>
    );
  }
  const map: Record<string, string> = {
    INVITED: "bg-info-soft text-info border-info-edge",
    VIEWED: "bg-info-soft text-info border-info-edge",
    RESPONDED: "bg-success-soft text-success border-success-edge",
    DECLINED: "bg-danger-soft text-danger border-danger-edge",
    EXPIRED: "bg-subtle text-faint border-line",
  };
  const labelMap: Record<string, string> = {
    INVITED: dict.factory.tenders.statusInvited,
    VIEWED: dict.factory.tenders.statusViewed,
    RESPONDED: dict.factory.tenders.statusResponded,
    DECLINED: dict.factory.tenders.statusDeclined,
    EXPIRED: dict.factory.tenders.statusExpired,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide whitespace-nowrap",
        map[status] ?? map.INVITED,
      )}
    >
      {labelMap[status] ?? status}
    </span>
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
