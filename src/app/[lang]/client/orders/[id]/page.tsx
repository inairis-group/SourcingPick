import { notFound } from "next/navigation";
import { AttachmentContext, Role, ThreadContextType } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { OrderTimeline } from "@/components/orders/timeline";
import { ContextThread } from "@/components/messaging/context-thread";
import { MediaGrid } from "@/components/attachments/media-grid";
import { OrderActions } from "./_components/order-actions";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/orders/[id]">) {
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
  const paymentStatus =
    typeof search?.payment === "string" ? search.payment : undefined;

  const order = await prisma.order.findFirst({
    where: { id, clientOrgId: user.organizationId, deletedAt: null },
    include: {
      factoryOrg: {
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
    },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${lang}/client/orders`}
        variant="muted"
        className="text-sm mb-4 inline-block"
      >
        ← {dict.client.orders.backToList}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {order.reference} · {order.request.reference}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {order.request.title}
        </h1>
        <p className="text-sm text-muted mt-1">
          {dict.client.orders.factoryLabel} · {order.factoryOrg.displayName} (
          {order.factoryOrg.city}, {order.factoryOrg.country})
        </p>
      </header>

      {paymentStatus === "success" && (
        <div className="rounded-md border border-success-edge bg-success-soft/40 p-4 mb-6">
          <p className="text-sm font-semibold text-success">
            {dict.client.orders.paymentSuccessTitle}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {dict.client.orders.paymentSuccessBody}
          </p>
        </div>
      )}
      {paymentStatus === "cancelled" && (
        <div className="rounded-md border border-warning-edge bg-warning-soft/40 p-4 mb-6">
          <p className="text-sm font-semibold text-warning">
            {dict.client.orders.paymentCancelledTitle}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {dict.client.orders.paymentCancelledBody}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        <Section title={dict.client.orders.sectionLogistics}>
          <Detail label={dict.client.requests.addressLabel}>
            {order.request.deliveryAddress}
          </Detail>
          <Detail label={dict.client.requests.incotermLabel}>
            {order.request.incoterm} —{" "}
            {dict.client.requests.incoterms[order.request.incoterm]}
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
            <>
              <Detail label={dict.client.orders.carrierLabel}>
                {order.trackingCarrier}
              </Detail>
              <Detail label={dict.client.orders.trackingNumberLabel}>
                {order.trackingUrl ? (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-brand-700"
                  >
                    {order.trackingNumber}
                  </a>
                ) : (
                  order.trackingNumber
                )}
              </Detail>
              {order.shippedAt && (
                <Detail label={dict.client.orders.shippedAtLabel}>
                  {formatDate(order.shippedAt, lang, "medium")}
                </Detail>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">
              {dict.client.orders.trackingPending}
            </p>
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

      <OrderActions
        orderId={order.id}
        status={order.status}
        lang={lang}
      />

      {order.invoices.length > 0 && (
        <Section title={dict.client.orders.sectionInvoices} className="mt-6">
          <ul className="divide-y divide-line-subtle">
            {order.invoices.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between py-2.5 gap-3 flex-wrap"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">
                    {inv.reference} ·{" "}
                    {inv.type === "DEPOSIT"
                      ? dict.client.orders.invoiceTypeDeposit
                      : inv.type === "BALANCE"
                        ? dict.client.orders.invoiceTypeBalance
                        : inv.type}
                  </p>
                  <p className="text-xs text-faint mt-0.5">
                    {inv.paidAt
                      ? `${dict.client.orders.invoicePaidOn} ${formatDate(inv.paidAt, lang, "short")}`
                      : `${dict.client.orders.invoiceIssuedOn} ${formatDate(inv.issuedAt, lang, "short")}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-headline">
                    {formatEUR(inv.amountCents / 100, lang)}
                  </span>
                  <span
                    className={
                      inv.status === "PAID"
                        ? "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide bg-success-soft text-success border-success-edge"
                        : "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide bg-warning-soft text-warning border-warning-edge"
                    }
                  >
                    {dict.client.orders.invoiceStatuses[inv.status]}
                  </span>
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
