import { notFound } from "next/navigation";
import {
  AttachmentContext,
  OrderStatus,
  QuoteStatus,
  Role,
  SourcingRequestOrigin,
  SourcingStatus,
} from "@prisma/client";
import { Link } from "@/components/ui/link";
import { Card } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { Hero } from "@/components/saas/hero";
import { StatCard, StatRow } from "@/components/saas/stat-card";
import { Panel, EmptyLine } from "@/components/saas/panel";
import { DataTable, Ref, type Column } from "@/components/saas/data-table";
import { StatusPill } from "@/components/saas/status-pill";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { formatEUR } from "@/lib/i18n/formatters";
import { STATE_TONE, STAGES, type OrderStage, type OrderState } from "@/lib/orders/lifecycle";
import { WAREHOUSE_ADDRESS_ZH, WAREHOUSE_PHONE, warehouseAddress } from "@/content/warehouse-address";

export async function generateMetadata({ params }: PageProps<"/[lang]/client/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.nav.dashboard };
}

const OPEN_REQUESTS = [
  SourcingStatus.REQUEST_RECEIVED,
  SourcingStatus.ASSIGNED,
  SourcingStatus.QUOTE_SENT,
] as const;

/**
 * How an order's stored status reads in the canvas's vocabulary.
 *
 * `Order.state` is the canvas's own column and is authoritative once set.
 * Orders that predate the lifecycle have none, so `OrderStatus` stands in —
 * which is the whole reason that column is nullable. See lifecycle.ts.
 */
const STATE_OF_ORDER: Record<OrderStatus, OrderState> = {
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PREPARATION: "PREPARATION_COMPLETE",
  QC: "PREPARATION_COMPLETE",
  SHIPPED: "SHIPPED",
  IN_TRANSIT: "IN_TRANSIT",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

type OrderRow = {
  id: string;
  reference: string;
  totalCents: number;
  status: OrderStatus;
  state: OrderState | null;
  stage: OrderStage | null;
  request: { title: string };
};

export default async function ClientDashboardPage({
  params,
}: PageProps<"/[lang]/client/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);
  const t = dict.client.dashboard;
  const org = user.organizationId;

  const { openRequests, quotesToSign, inTransit, docsThisWeek, toPay, orders } =
    await dashboardData(org);

  // The canvas's "what we need from you" list: quotations waiting for a
  // signature, then deposits waiting for a payment. Both are things only the
  // client can unblock, which is what earns the panel its position.
  const todo = [
    ...quotesToSign.map((q) => ({
      key: `q-${q.id}`,
      title: t.signQuote.replace("{ref}", q.request.reference),
      detail: `${q.request.title} · ${formatEUR(q.totalCentsClient, lang)}`,
      href: `/${lang}/client/requests/${q.request.id}`,
    })),
    ...toPay.map((o) => ({
      key: `o-${o.id}`,
      title: t.payDeposit.replace("{ref}", o.reference),
      detail: `${o.request.title} · ${formatEUR(o.depositCents, lang)}`,
      href: `/${lang}/client/orders/${o.id}`,
    })),
  ];

  const name = user.firstName || user.name || "";

  return (
    <>
      <Hero
        badge={dict.nav.role.client}
        title={t.greeting.replace("{name}", name).trim()}
        body={t.body}
        actions={
          <>
            <Link
              href={`/${lang}/client/requests/new`}
              variant="muted"
              className={buttonClass({ variant: "onNavy", size: "md" })}
            >
              {dict.client.requests.newRequest}
            </Link>
            <Link
              href={`/${lang}/client/orders`}
              variant="muted"
              className={buttonClass({ variant: "onNavyGhost", size: "md" })}
            >
              {dict.nav.orders}
            </Link>
          </>
        }
      />

      <StatRow>
        <StatCard label={t.kpiOpenRequests} value={openRequests} icon="list" tone="new" />
        <StatCard label={t.kpiQuotesToSign} value={quotesToSign.length} icon="document" tone="quote" />
        <StatCard label={t.kpiInTransit} value={inTransit} icon="cube" tone="moving" />
        <StatCard
          label={t.kpiDocsThisWeek}
          value={docsThisWeek}
          icon="paperclip"
          tone="done"
        />
      </StatRow>

      <Panel title={t.todoTitle}>
        {todo.length === 0 ? (
          <EmptyLine>{t.todoEmpty}</EmptyLine>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {todo.map((item, i) => (
              <li
                key={item.key}
                className={
                  "border-line flex flex-wrap items-center justify-between gap-3 py-3.5" +
                  (i > 0 ? " border-t" : "")
                }
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-fg text-md font-semibold">{item.title}</span>
                  <span className="text-muted text-base">{item.detail}</span>
                </span>
                <Link href={item.href} variant="inline" className="font-semibold">
                  {t.open}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Card>
        <div className="mb-3.5 flex items-start justify-between gap-4">
          <h2 className="font-display text-headline m-0 text-lg leading-snug font-semibold tracking-[-0.02em]">
            {t.openOrdersTitle}
          </h2>
          <Link href={`/${lang}/client/orders`} variant="inline" className="font-semibold">
            {t.seeAll} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <DataTable<OrderRow>
          caption={t.openOrdersTitle}
          columns={orderColumns(lang, dict)}
          rows={orders}
          rowKey={(o) => o.id}
          rowHref={(o) => `/${lang}/client/orders/${o.id}`}
          empty={<EmptyLine>{t.ordersEmpty}</EmptyLine>}
        />
      </Card>

      {/* The public pages give the warehouse address after sign-up: here. */}
      <Panel title={t.warehouse.title} subtitle={t.warehouse.intro}>
        <dl className="m-0 grid gap-4 sm:grid-cols-2">
          {[
            [t.warehouse.chinese, <span key="zh" lang="zh-Hans">{WAREHOUSE_ADDRESS_ZH}</span>],
            [t.warehouse.latin, warehouseAddress[lang].latin],
            [t.warehouse.hours, warehouseAddress[lang].hours],
            [t.warehouse.phone, <span key="tel" dir="ltr">{WAREHOUSE_PHONE}</span>],
          ].map(([label, value], i) => (
            <div key={i} className="flex flex-col gap-1">
              <dt className="text-muted text-[13.5px]">{label}</dt>
              <dd className="text-fg text-md m-0 font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </>
  );
}


function orderColumns(lang: Locale, dict: Dictionary): Column<OrderRow>[] {
  const t = dict.client.dashboard;
  return [
    {
      key: "reference",
      header: t.colReference,
      width: "18%",
      primary: true,
      cell: (o) => <Ref>{o.reference}</Ref>,
    },
    { key: "product", header: t.colProduct, width: "30%", cell: (o) => o.request.title },
    {
      key: "state",
      header: t.colState,
      width: "26%",
      // The canvas shows both: the pill carries the main state, and the
      // sub-state sits under it in plain text. That pairing is the point of
      // the lifecycle — "In transit" is a category, "At sea" is an answer.
      cell: (o) => {
        const state = o.state ?? STATE_OF_ORDER[o.status];
        const stage = o.stage && STAGES[o.stage].state === state ? o.stage : null;
        return (
          <span className="flex flex-col items-start gap-1">
            <StatusPill tone={STATE_TONE[state]}>{dict.lifecycle.state[state]}</StatusPill>
            {stage && <span className="text-muted text-sm">{dict.lifecycle.stage[stage]}</span>}
          </span>
        );
      },
    },
    {
      key: "amount",
      header: t.colAmount,
      width: "18%",
      align: "end",
      cell: (o) => <span className="font-mono font-semibold">{formatEUR(o.totalCents, lang)}</span>,
    },
    {
      key: "open",
      header: "",
      width: "8%",
      hideOnCard: true,
      cell: (o) => (
        <Link href={`/${lang}/client/orders/${o.id}`} variant="inline" className="font-semibold">
          {t.open}
        </Link>
      ),
    },
  ];
}

/**
 * Everything the dashboard shows, in one round trip.
 *
 * Lifted out of the component body because these queries need the current
 * time, and a component is supposed to be pure — the rule is right even
 * though an async server component gets away with it in practice.
 */
async function dashboardData(org: string) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  // Needed before the attachment count can be scoped to this client's file.
  const orderIds = (
    await prisma.order.findMany({
      where: { clientOrgId: org, deletedAt: null },
      select: { id: true },
    })
  ).map((o) => o.id);

  const [openRequests, quotesToSign, inTransit, docsThisWeek, toPay, orders] =
    await Promise.all([

      prisma.sourcingRequest.count({
        where: {
          clientOrgId: org,
          origin: SourcingRequestOrigin.SOURCING_FLOW,
          status: { in: [...OPEN_REQUESTS] },
        },
      }),
      prisma.quote.findMany({
        where: { status: QuoteStatus.SENT_TO_CLIENT, request: { clientOrgId: org } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          totalCentsClient: true,
          request: { select: { id: true, reference: true, title: true } },
        },
      }),
      prisma.order.count({
        where: { clientOrgId: org, deletedAt: null, status: OrderStatus.IN_TRANSIT },
      }),
      // "Documents added this week" — the canvas counts what landed in the
      // client's own file, not everything the platform touched.
      prisma.attachment.count({
        where: {
          createdAt: { gte: weekAgo },
          contextType: AttachmentContext.ORDER,
          contextId: { in: orderIds },
        },
      }),
      prisma.order.findMany({
        where: { clientOrgId: org, deletedAt: null, status: OrderStatus.PAYMENT_PENDING },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, reference: true, depositCents: true, request: { select: { title: true } } },
      }),
      prisma.order.findMany({
        where: {
          clientOrgId: org,
          deletedAt: null,
          status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          reference: true,
          totalCents: true,
          status: true,
          state: true,
          stage: true,
          request: { select: { title: true } },
        },
      }),
    ]);

  return { openRequests, quotesToSign, inTransit, docsThisWeek, toPay, orders };
}
