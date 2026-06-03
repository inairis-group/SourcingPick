import { notFound } from "next/navigation";
import { Role, TenderInvitationStatus, ThreadContextType } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { formatLeadTime } from "@/lib/marketplace/lead-time";
import { ContextThread } from "@/components/messaging/context-thread";
import { cn } from "@/lib/utils";
import { QuoteForm } from "./_components/quote-form";

export default async function FactoryTenderDetailPage({
  params,
}: PageProps<"/[lang]/factory/tenders/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

  const tender = await prisma.tenderInvitation.findFirst({
    where: { id, factoryOrgId: user.organizationId },
    include: {
      request: {
        include: {
          products: true,
          clientOrg: { select: { displayName: true, country: true } },
        },
      },
    },
  });
  if (!tender) notFound();

  // Mark as VIEWED if first visit
  if (tender.status === TenderInvitationStatus.INVITED && !tender.viewedAt) {
    await prisma.tenderInvitation.update({
      where: { id: tender.id },
      data: { status: TenderInvitationStatus.VIEWED, viewedAt: new Date() },
    });
  }

  const existingQuote = await prisma.quote.findFirst({
    where: {
      requestId: tender.requestId,
      factoryOrgId: user.organizationId,
    },
    select: {
      id: true,
      unitPriceCentsFactory: true,
      quantity: true,
      leadTimeDays: true,
      leadTimeUnit: true,
      moq: true,
      incoterm: true,
      validUntil: true,
      notes: true,
      status: true,
      createdAt: true,
    },
  });

  const isExpired = tender.expiresAt.getTime() < Date.now();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/factory/tenders`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.factory.tenders.backToList}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {tender.request.reference}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {tender.request.title}
        </h1>
        <p className="text-sm text-muted mt-1">
          {tender.request.clientOrg.displayName} · {tender.request.clientOrg.country}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Section title={dict.client.requests.sectionProduct}>
          <Detail label={dict.client.requests.categoryLabel}>
            {dict.categories[tender.request.category]}
          </Detail>
          {tender.request.products.map((p) => (
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
              <Detail label={dict.client.requests.quantityLabel}>
                {formatNumber(p.quantity, lang)}
              </Detail>
              <Detail label={dict.client.requests.targetPriceLabel}>
                {p.targetPriceCents
                  ? formatEUR(p.targetPriceCents / 100, lang)
                  : "—"}
              </Detail>
            </div>
          ))}
        </Section>

        <Section title={dict.client.requests.sectionLogistics}>
          <Detail label={dict.client.requests.deadlineLabel}>
            {formatDate(tender.request.deadline, lang, "medium")}
          </Detail>
          <Detail label={dict.client.requests.addressLabel}>
            {tender.request.deliveryAddress}
          </Detail>
          <Detail label={dict.client.requests.incotermLabel}>
            {tender.request.incoterm} —{" "}
            {dict.client.requests.incoterms[tender.request.incoterm]}
          </Detail>
          {tender.request.requiredCerts.length > 0 && (
            <Detail label={dict.client.requests.certsLabel}>
              {tender.request.requiredCerts.join(", ")}
            </Detail>
          )}
        </Section>
      </div>

      {existingQuote ? (
        <Section title={dict.factory.tenders.quoteSubmittedTitle} className="mb-4">
          <div className="rounded-md border border-success-edge bg-success-soft p-4 text-sm text-success mb-3">
            {dict.factory.tenders.quoteSubmittedBody}
          </div>
          <Detail label={dict.factory.tenders.unitPriceLabel}>
            {formatEUR(existingQuote.unitPriceCentsFactory / 100, lang)}
          </Detail>
          <Detail label={dict.client.requests.quantityLabel}>
            {formatNumber(existingQuote.quantity, lang)}
          </Detail>
          <Detail label={dict.factory.tenders.leadTimeLabel}>
            {formatLeadTime(
              existingQuote.leadTimeDays,
              existingQuote.leadTimeUnit,
              dict,
            )}
          </Detail>
          <Detail label={dict.factory.tenders.moqLabel}>
            {formatNumber(existingQuote.moq, lang)}
          </Detail>
          <Detail label={dict.client.requests.incotermLabel}>
            {existingQuote.incoterm}
          </Detail>
          <Detail label={dict.factory.tenders.validUntilLabel}>
            {formatDate(existingQuote.validUntil, lang, "medium")}
          </Detail>
        </Section>
      ) : isExpired ? (
        <div
          className={cn(
            "rounded-md border border-danger-edge bg-danger-soft p-4 text-sm text-danger",
          )}
        >
          {dict.factory.tenders.expiredBanner}
        </div>
      ) : (
        <Section title={dict.factory.tenders.submitQuoteTitle}>
          <p className="text-sm text-muted mb-4">
            {dict.factory.tenders.submitQuoteBody}
          </p>
          <QuoteForm
            invitationId={tender.id}
            defaultQuantity={tender.request.quantity}
            defaultIncoterm={tender.request.incoterm}
          />
        </Section>
      )}

      <div className="mt-6">
        <ContextThread
          contextType={ThreadContextType.TENDER}
          contextId={tender.id}
          lang={lang}
        />
      </div>
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
