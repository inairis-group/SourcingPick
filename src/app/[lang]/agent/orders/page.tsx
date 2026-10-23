import { notFound } from "next/navigation";
import { OrderStatus, Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

/**
 * Agent orders index (partner item #21 — close the access gap so agents
 * can browse every order on their assigned requests, not just the one
 * surfaced inside each request page). Read-only — production actions
 * stay on the factory side, payment + dispute actions on the buyer side.
 * Clicking a row deep-links to the owning request, which already renders
 * the order summary + thread.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/agent/orders">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.agent.orders.title };
}

export default async function AgentOrdersPage({
  params,
}: PageProps<"/[lang]/agent/orders">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const agent = await requireRole(Role.AGENT);
  const dict = await getDictionary(lang);

  const orders = await prisma.order.findMany({
    where: { agentId: agent.id, deletedAt: null },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      reference: true,
      status: true,
      totalCents: true,
      estimatedEta: true,
      createdAt: true,
      clientOrg: { select: { displayName: true, country: true } },
      factoryOrg: { select: { displayName: true } },
      request: { select: { id: true, reference: true, title: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.agent.orders.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.agent.orders.title}
        </h1>
        <p className="text-sm text-muted">{dict.agent.orders.description}</p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-medium text-headline mb-2">
            {dict.agent.orders.emptyTitle}
          </p>
          <p className="text-sm text-muted">{dict.agent.orders.emptyBody}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/${lang}/agent/orders/${o.id}`}
                variant="muted"
                className="block rounded-lg border border-line bg-surface p-4 hover:bg-subtle transition-colors duration-fast"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs font-mono uppercase tracking-wide text-faint">
                      {o.reference} · {o.request.reference}
                    </p>
                    <h3 className="text-base font-semibold text-headline">
                      {o.request.title}
                    </h3>
                    <p className="text-xs text-muted mt-1">
                      {o.clientOrg.displayName} ({o.clientOrg.country}) ·{" "}
                      {o.factoryOrg.displayName}
                    </p>
                  </div>
                  <OrderStatusPill status={o.status} dict={dict} />
                </div>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-line-subtle text-xs text-muted">
                  <span className="font-medium text-fg">
                    {formatEUR(o.totalCents / 100, lang)}
                  </span>
                  {o.estimatedEta && (
                    <span>
                      {dict.client.orders.eta}{" "}
                      {formatDate(o.estimatedEta, lang, "short")}
                    </span>
                  )}
                  <span className="ms-auto text-[11px]">
                    {dict.agent.orders.createdAt}{" "}
                    {formatDate(o.createdAt, lang, "short")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderStatusPill({
  status,
  dict,
}: {
  status: OrderStatus;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const map: Record<OrderStatus, string> = {
    PAYMENT_PENDING: "bg-warning-soft text-warning border-warning-edge",
    PREPARATION: "bg-info-soft text-info border-info-edge",
    QC: "bg-info-soft text-info border-info-edge",
    SHIPPED: "bg-info-soft text-info border-info-edge",
    IN_TRANSIT: "bg-info-soft text-info border-info-edge",
    COMPLETED: "bg-success-soft text-success border-success-edge",
    CANCELLED: "bg-subtle text-faint border-line",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide whitespace-nowrap",
        map[status],
      )}
    >
      {dict.orders.statuses[status]}
    </span>
  );
}
