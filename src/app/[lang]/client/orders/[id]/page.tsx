import { notFound } from "next/navigation";
import { AttachmentContext, OrderStatus, Role, ThreadContextType } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { OrderTimeline } from "@/components/orders/timeline";
import { ClientShipmentProgress } from "@/components/shipments/client-progress";
import { getClientVisibleShipmentEvents } from "@/lib/shipments/queries";
import { ContextThread } from "@/components/messaging/context-thread";
import { MediaGrid } from "@/components/attachments/media-grid";
import { OrderActions } from "./_components/order-actions";
import { OrgAvatar } from "@/components/org/org-avatar";
import { InsuredBadge } from "@/components/orders/insured-badge";
import { TrackingDisplay } from "./_components/tracking-display";
import { WiseWirePanel } from "./_components/wise-wire-panel";
import { BuyerDisputePanel } from "./_components/dispute-panel";
import { buildWireReference, platformWireAccount } from "@/lib/wise/platform-account";

export async function generateMetadata({ params }: PageProps<"/[lang]/client/orders/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const order = await prisma.order.findUnique({
    where: { id },
    select: { reference: true },
  });
  return { title: order?.reference ?? "" };
}

export default async function ClientOrderDetailPage({
  params,
  searchParams,
}: PageProps<"/[lang]/client/orders/[id]">) {
  const { lang, id } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);
  const paymentStatus = typeof search?.payment === "string" ? search.payment : undefined;

  const order = await prisma.order.findFirst({
    where: { id, clientOrgId: user.organizationId, deletedAt: null },
    include: {
      factoryOrg: {
        select: {
          id: true,
          displayName: true,
          country: true,
          city: true,
          logoUrl: true,
        },
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
        },
      },
      quote: {
        select: {
          unitPriceCentsClient: true,
          leadTimeDays: true,
          moq: true,
          notes: true,
        },
      },
      invoices: {
        select: {
          id: true,
          reference: true,
          type: true,
          amountCents: true,
          status: true,
          issuedAt: true,
          paidAt: true,
        },
        orderBy: { issuedAt: "asc" },
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
          refundCents: true,
        },
        orderBy: { openedAt: "desc" },
      },
    },
  });
  if (!order) notFound();

  // Only the events flagged clientVisible; the query selects no shipper
  // identity and no logistics price (§1.2).
  const shipmentEvents = await getClientVisibleShipmentEvents(order.id, user.organizationId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/${lang}/client/orders`} variant="muted" className="mb-4 inline-block text-sm">
        ← {dict.client.orders.backToList}
      </Link>

      <header className="mb-6 flex flex-col gap-1">
        <p className="text-faint font-mono text-xs tracking-wide uppercase">
          {order.reference} · {order.request.reference}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-headline text-2xl font-bold tracking-tight">{order.request.title}</h1>
          <InsuredBadge covered={order.insuranceCovered} dict={dict} size="md" />
        </div>
        <div className="text-muted mt-2 flex items-center gap-2 text-sm">
          <OrgAvatar
            orgId={order.factoryOrg.id}
            name={order.factoryOrg.displayName}
            hasLogo={Boolean(order.factoryOrg.logoUrl)}
            size="sm"
          />
          <span>
            {dict.client.orders.factoryLabel} · {order.factoryOrg.displayName} (
            {order.factoryOrg.city}, {order.factoryOrg.country})
          </span>
        </div>
      </header>

      {paymentStatus === "success" && (
        <div className="border-success-edge bg-success-soft/40 mb-6 rounded-md border p-4">
          <p className="text-success text-sm font-semibold">
            {dict.client.orders.paymentSuccessTitle}
          </p>
          <p className="text-muted mt-0.5 text-xs">{dict.client.orders.paymentSuccessBody}</p>
        </div>
      )}
      {paymentStatus === "cancelled" && (
        <div className="border-warning-edge bg-warning-soft/40 mb-6 rounded-md border p-4">
          <p className="text-warning text-sm font-semibold">
            {dict.client.orders.paymentCancelledTitle}
          </p>
          <p className="text-muted mt-0.5 text-xs">{dict.client.orders.paymentCancelledBody}</p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat
          label={dict.client.orders.totalLabel}
          value={formatEUR(order.totalCents / 100, lang)}
        />
        <Stat
          label={dict.client.orders.depositLabel}
          value={formatEUR(order.depositCents / 100, lang)}
          hint={dict.client.orders.depositHint}
        />
        <Stat
          label={dict.client.orders.balanceLabel}
          value={formatEUR(order.balanceCents / 100, lang)}
          hint={dict.client.orders.balanceHint}
        />
      </div>

      {/* §7.1 — logistics progress the internal team allows to auto-surface.
          Renders nothing for orders with no shipper leg. */}
      <ClientShipmentProgress events={shipmentEvents} lang={lang} dict={dict} />

      <div className="border-line bg-surface mb-6 rounded-lg border p-5">
        <h2 className="text-brand-700 mb-4 text-sm font-semibold tracking-wide uppercase">
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

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section title={dict.client.orders.sectionLogistics}>
          <Detail label={dict.client.requests.addressLabel}>{order.request.deliveryAddress}</Detail>
          <Detail label={dict.client.requests.incotermLabel}>
            {order.request.incoterm} — {dict.client.requests.incoterms[order.request.incoterm]}
          </Detail>
          <Detail label={dict.client.requests.quantityLabel}>
            {formatNumber(order.request.quantity, lang)}
          </Detail>
          {order.estimatedEta && (
            <Detail label={dict.client.orders.eta}>
              {formatDate(order.estimatedEta, lang, "medium")}
            </Detail>
          )}
        </Section>

        <Section title={dict.client.orders.sectionTracking}>
          {order.trackingNumber ? (
            <div className="flex flex-col gap-3">
              <TrackingDisplay
                carrier={order.trackingCarrier}
                trackingNumber={order.trackingNumber}
                trackingUrl={order.trackingUrl}
              />
              {order.shippedAt && (
                <Detail label={dict.client.orders.shippedAtLabel}>
                  {formatDate(order.shippedAt, lang, "medium")}
                </Detail>
              )}
            </div>
          ) : (
            <p className="text-muted text-sm">{dict.client.orders.trackingPending}</p>
          )}
        </Section>
      </div>

      {/* Contact section is only meaningful when there's an assigned agent.
          Marketplace orders intentionally have no agent — support runs
          through the messaging thread (client ↔ admin), so showing the
          section would just confuse the buyer. */}
      {order.agent && (
        <Section title={dict.client.orders.sectionContact} className="mb-6">
          <Detail label={dict.client.requests.agentLabel}>
            {order.agent.firstName} {order.agent.lastName} ({order.agent.email})
          </Detail>
        </Section>
      )}

      {(() => {
        // Wise bank-wire path. Visible whenever (a) the platform's Wise
        // IBAN env vars are set AND (b) the order is in a state that
        // expects a payment. The webhook handler matches incoming
        // wires by the per-payment reference shown in the panel.
        //
        // Partner #13: previously, when the env vars were missing we
        // silently rendered nothing — the buyer landed on a
        // PAYMENT_PENDING order with no instructions and no way to
        // pay. Now we show a clear "contact support" fallback so the
        // page is never a dead end.
        const platform = platformWireAccount();
        const needsPayment =
          order.status === OrderStatus.PAYMENT_PENDING ||
          order.status === OrderStatus.SHIPPED ||
          order.status === OrderStatus.IN_TRANSIT;

        if (!needsPayment) return null;

        if (!platform) {
          return (
            <div className="border-warning-edge bg-warning-soft/40 mt-4 rounded-lg border p-5">
              <p className="text-headline text-sm font-semibold">
                {dict.client.orders.payConfigMissingTitle}
              </p>
              <p className="text-muted mt-1 text-xs leading-snug">
                {dict.client.orders.payConfigMissingBody}
              </p>
            </div>
          );
        }

        if (order.status === OrderStatus.PAYMENT_PENDING) {
          return (
            <WiseWirePanel
              {...platform}
              reference={buildWireReference(order.reference, "DEP")}
              amountCents={order.depositCents}
              currency="EUR"
              lang={lang}
            />
          );
        }
        // SHIPPED or IN_TRANSIT — balance due before COMPLETED can
        // close out (see F1b in the CTO audit).
        return (
          <WiseWirePanel
            {...platform}
            reference={buildWireReference(order.reference, "BAL")}
            amountCents={order.balanceCents}
            currency="EUR"
            lang={lang}
          />
        );
      })()}

      <OrderActions orderId={order.id} status={order.status} lang={lang} />

      {(() => {
        // Dispute eligibility — must mirror openDisputeAction's gate.
        const eligibleStatus =
          order.status === OrderStatus.SHIPPED ||
          order.status === OrderStatus.IN_TRANSIT ||
          order.status === OrderStatus.COMPLETED;
        const windowOpen =
          !order.deliveredAt ||
          (Date.now() - order.deliveredAt.getTime()) / (1000 * 60 * 60 * 24) <= 7;
        const activeDispute = order.disputes.find((d) => d.status !== "RESOLVED") ?? null;
        const mostRecent = order.disputes[0] ?? null;
        return (
          <BuyerDisputePanel
            orderId={order.id}
            eligibleNow={eligibleStatus && windowOpen && !activeDispute}
            dispute={activeDispute ?? mostRecent}
          />
        );
      })()}

      {order.invoices.length > 0 && (
        <Section title={dict.client.orders.sectionInvoices} className="mt-6">
          <ul className="divide-line-subtle divide-y">
            {order.invoices.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-fg text-sm font-medium">
                    {inv.reference} ·{" "}
                    {inv.type === "DEPOSIT"
                      ? dict.client.orders.invoiceTypeDeposit
                      : inv.type === "BALANCE"
                        ? dict.client.orders.invoiceTypeBalance
                        : inv.type}
                  </p>
                  <p className="text-faint mt-0.5 text-xs">
                    {inv.paidAt
                      ? `${dict.client.orders.invoicePaidOn} ${formatDate(inv.paidAt, lang, "short")}`
                      : `${dict.client.orders.invoiceIssuedOn} ${formatDate(inv.issuedAt, lang, "short")}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-headline text-sm font-semibold">
                    {formatEUR(inv.amountCents / 100, lang)}
                  </span>
                  <span
                    className={
                      inv.status === "PAID"
                        ? "bg-success-soft text-success border-success-edge inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-medium tracking-wide uppercase"
                        : "bg-warning-soft text-warning border-warning-edge inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-medium tracking-wide uppercase"
                    }
                  >
                    {dict.client.orders.invoiceStatuses[inv.status]}
                  </span>
                  {/* Partner #11: server-rendered PDF — Article 226 +
                      French CGI + reverse-charge wording included. */}
                  <a
                    href={`/api/invoices/${inv.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link hover:text-link-hover text-[11px] underline underline-offset-2"
                  >
                    {dict.client.invoices.downloadPdf}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <MediaGrid
        contextType={AttachmentContext.ORDER}
        contextId={order.id}
        title={dict.client.requests.mediaTitle}
        className="mt-6"
      />

      {/* QC + shipment photo proofs uploaded by the factory. Read-only on
          the buyer side — galleries render only when at least one photo
          exists, the MediaGrid component already short-circuits on empty. */}
      <MediaGrid
        contextType={AttachmentContext.ORDER_QC_PROOF}
        contextId={order.id}
        title={dict.client.orders.qcProofTitle}
        className="mt-6"
      />
      <MediaGrid
        contextType={AttachmentContext.ORDER_SHIPMENT_PROOF}
        contextId={order.id}
        title={dict.client.orders.shipmentProofTitle}
        className="mt-6"
      />

      <div className="mt-6">
        <ContextThread contextType={ThreadContextType.ORDER} contextId={order.id} lang={lang} />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="border-line bg-surface rounded-md border px-4 py-3">
      <p className="text-faint text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="text-headline mt-0.5 text-lg font-semibold">{value}</p>
      {hint && <p className="text-faint mt-0.5 text-[11px]">{hint}</p>}
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
      className={`border-line bg-surface rounded-lg border p-5${className ? ` ${className}` : ""}`}
    >
      <h2 className="text-brand-700 mb-3 text-sm font-semibold tracking-wide uppercase">{title}</h2>
      <dl className="flex flex-col gap-2">{children}</dl>
    </section>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-3">
      <dt className="text-faint text-xs font-medium tracking-wide uppercase">{label}</dt>
      <dd className="text-fg text-sm wrap-break-word sm:col-span-2">{children}</dd>
    </div>
  );
}
