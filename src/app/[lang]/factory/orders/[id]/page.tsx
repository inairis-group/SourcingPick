import { notFound } from "next/navigation";
import {
  AttachmentContext,
  OrderStatus,
  Role,
  ThreadContextType,
} from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { OrderTimeline } from "@/components/orders/timeline";
import { ContextThread } from "@/components/messaging/context-thread";
import { MediaGrid } from "@/components/attachments/media-grid";
import { computeFactoryPayout } from "@/lib/orders/pricing";
import { formatLeadTime } from "@/lib/marketplace/lead-time";
import { FactoryOrderActions } from "./_components/factory-order-actions";
import { PhaseProofUploader } from "./_components/phase-proof-uploader";
import { ForwarderLinkPanel } from "./_components/forwarder-link-panel";
import { TrackingEditor } from "./_components/tracking-editor";
import { FactoryDisputeResponse } from "./_components/dispute-response";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/orders/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const order = await prisma.order.findUnique({
    where: { id },
    select: { reference: true },
  });
  return { title: order?.reference ?? "" };
}

export default async function FactoryOrderDetailPage({
  params,
}: PageProps<"/[lang]/factory/orders/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

  const order = await prisma.order.findFirst({
    where: { id, factoryOrgId: user.organizationId, deletedAt: null },
    include: {
      clientOrg: {
        select: { displayName: true, country: true, city: true },
      },
      agent: { select: { firstName: true, lastName: true, email: true } },
      request: {
        select: {
          id: true,
          reference: true,
          title: true,
          deliveryAddress: true,
          incoterm: true,
          quantity: true,
          deadline: true,
          requiredCerts: true,
        },
      },
      quote: {
        select: {
          unitPriceCentsFactory: true,
          leadTimeDays: true,
          leadTimeUnit: true,
          moq: true,
          notes: true,
        },
      },
      forwarderTokens: {
        where: { revokedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          token: true,
          label: true,
          expiresAt: true,
          lastUsedAt: true,
          uploadCount: true,
          createdAt: true,
        },
      },
      disputes: {
        select: {
          id: true,
          reference: true,
          status: true,
          outcome: true,
          openedAt: true,
          buyerStatement: true,
          factoryStatement: true,
          adminDecision: true,
        },
        orderBy: { openedAt: "desc" },
      },
    },
  });
  if (!order) notFound();

  const forwarderEligible =
    order.status === OrderStatus.PREPARATION ||
    order.status === OrderStatus.QC ||
    order.status === OrderStatus.SHIPPED ||
    order.status === OrderStatus.IN_TRANSIT;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const {
    grossCents: factoryRevenueCents,
    feeCents: supplierFeeCents,
    netCents: factoryNetCents,
  } = computeFactoryPayout(
    order.quote.unitPriceCentsFactory,
    order.request.quantity,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/factory/orders`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.factory.orders.backToList}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {order.reference} · {order.request.reference}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {order.request.title}
        </h1>
        <p className="text-sm text-muted mt-1">
          {dict.factory.orders.clientLabel} · {order.clientOrg.displayName} (
          {order.clientOrg.city}, {order.clientOrg.country})
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Stat
          label={dict.factory.orders.revenueLabel}
          value={formatEUR(factoryRevenueCents / 100, lang)}
        />
        <Stat
          label={dict.factory.orders.supplierFeeLabel}
          value={`− ${formatEUR(supplierFeeCents / 100, lang)}`}
          hint={dict.factory.orders.supplierFeeHint}
        />
        <Stat
          label={dict.factory.orders.netLabel}
          value={formatEUR(factoryNetCents / 100, lang)}
          hint={dict.factory.orders.netHint}
        />
      </div>

      <div className="rounded-lg border border-line bg-surface p-5 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-4">
          {dict.client.orders.timelineTitle}
        </h2>
        <OrderTimeline
          status={order.status}
          shippedAt={order.shippedAt}
          deliveredAt={order.deliveredAt}
          estimatedEta={order.estimatedEta}
          lang={lang}
          dict={dict}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Section title={dict.factory.orders.sectionSpec}>
          <Detail label={dict.client.requests.quantityLabel}>
            {formatNumber(order.request.quantity, lang)}
          </Detail>
          <Detail label={dict.factory.orders.deadlineLabel}>
            {formatDate(order.request.deadline, lang, "medium")}
          </Detail>
          <Detail label={dict.factory.tenders.leadTimeLabel}>
            {formatLeadTime(
              order.quote.leadTimeDays,
              order.quote.leadTimeUnit,
              dict,
            )}
          </Detail>
          {order.request.requiredCerts.length > 0 && (
            <Detail label={dict.client.requests.certsLabel}>
              {order.request.requiredCerts.join(", ")}
            </Detail>
          )}
        </Section>

        <Section title={dict.client.orders.sectionLogistics}>
          <Detail label={dict.client.requests.addressLabel}>
            {order.request.deliveryAddress}
          </Detail>
          <Detail label={dict.client.requests.incotermLabel}>
            {order.request.incoterm} —{" "}
            {dict.client.requests.incoterms[order.request.incoterm]}
          </Detail>
          {order.trackingNumber && (
            <>
              <Detail label={dict.client.orders.carrierLabel}>
                {order.trackingCarrier}
              </Detail>
              <Detail label={dict.client.orders.trackingNumberLabel}>
                {order.trackingNumber}
              </Detail>
            </>
          )}
        </Section>
      </div>

      <Section title={dict.client.orders.sectionContact} className="mb-6">
        {order.agent ? (
          <Detail label={dict.client.requests.agentLabel}>
            {order.agent.firstName} {order.agent.lastName} ({order.agent.email})
          </Detail>
        ) : (
          <p className="text-sm text-muted">
            {dict.client.requests.agentPending}
          </p>
        )}
      </Section>

      <FactoryOrderActions
        orderId={order.id}
        status={order.status}
      />

      {/* Active dispute panel — the factory sees the buyer's statement
          and can submit (or update) their response. Most recent dispute
          surfaces here; resolved ones stay visible for record. */}
      {order.disputes[0] && (
        <FactoryDisputeResponse dispute={order.disputes[0]} />
      )}

      {/* Tracking editor — only renders while shipped/in_transit so the
          factory can fix typos without rolling the order backwards. */}
      {(order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.IN_TRANSIT) &&
        order.trackingNumber && (
          <div className="mt-4">
            <TrackingEditor
              orderId={order.id}
              initial={{
                trackingNumber: order.trackingNumber,
                trackingCarrier: order.trackingCarrier,
                trackingUrl: order.trackingUrl,
              }}
            />
          </div>
        )}

      {/* QC proof photos — uploader visible during PREPARATION/QC,
          gallery always visible once any have been uploaded. */}
      {(order.status === OrderStatus.PREPARATION ||
        order.status === OrderStatus.QC) && (
        <section className="mt-6 rounded-lg border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
            {dict.factory.orders.proofs.qcSectionTitle}
          </h2>
          <p className="text-xs text-muted mb-4 leading-snug max-w-prose">
            {dict.factory.orders.proofs.qcSectionBody}
          </p>
          <PhaseProofUploader orderId={order.id} kind="QC" />
        </section>
      )}
      <MediaGrid
        contextType={AttachmentContext.ORDER_QC_PROOF}
        contextId={order.id}
        title={dict.factory.orders.proofs.qcGalleryTitle}
        className="mt-6"
        canManage
      />

      {/* Shipment proof photos — uploader visible from QC through
          IN_TRANSIT, gallery always visible if any exist. */}
      {(order.status === OrderStatus.QC ||
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.IN_TRANSIT) && (
        <section className="mt-6 rounded-lg border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
            {dict.factory.orders.proofs.shipmentSectionTitle}
          </h2>
          <p className="text-xs text-muted mb-4 leading-snug max-w-prose">
            {dict.factory.orders.proofs.shipmentSectionBody}
          </p>
          <PhaseProofUploader orderId={order.id} kind="SHIPMENT" />
        </section>
      )}
      <MediaGrid
        contextType={AttachmentContext.ORDER_SHIPMENT_PROOF}
        contextId={order.id}
        title={dict.factory.orders.proofs.shipmentGalleryTitle}
        className="mt-6"
        canManage
      />

      <ForwarderLinkPanel
        orderId={order.id}
        tokens={order.forwarderTokens}
        baseUrl={appUrl}
        canCreate={forwarderEligible}
      />

      <div className="mt-6">
        <ContextThread
          contextType={ThreadContextType.ORDER}
          contextId={order.id}
          lang={lang}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-line bg-surface px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-faint">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold text-headline">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-faint">{hint}</p>}
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
      className={`rounded-lg border border-line bg-surface p-5${className ? ` ${className}` : ""}`}
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
