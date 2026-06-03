import { notFound } from "next/navigation";
import { OrderStatus, Role, ThreadContextType } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import {
  DashboardHeader,
  DashboardSection,
} from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/support">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.support.title };
}

export default async function AdminSupportPage({
  params,
}: PageProps<"/[lang]/admin/support">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);

  // Marketplace ORDER threads (no agent) are the support queue.
  const supportThreads = await prisma.thread.findMany({
    where: {
      contextType: ThreadContextType.ORDER,
    },
    orderBy: { lastMessageAt: "desc" },
    take: 50,
    select: {
      id: true,
      contextId: true,
      lastMessageAt: true,
      _count: { select: { messages: true } },
    },
  });

  const orderIds = supportThreads.map((t) => t.contextId);
  const orders = await prisma.order.findMany({
    where: {
      id: { in: orderIds },
      agentId: null, // marketplace orders only
    },
    select: {
      id: true,
      reference: true,
      status: true,
      clientOrg: { select: { displayName: true } },
      factoryOrg: { select: { displayName: true } },
      request: { select: { title: true } },
    },
  });
  const orderMap = new Map(orders.map((o) => [o.id, o]));

  const rows = supportThreads
    .map((t) => {
      const order = orderMap.get(t.contextId);
      if (!order) return null;
      return { thread: t, order };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.support.eyebrow}
        title={dict.admin.support.title}
        description={dict.admin.support.description}
      />

      <DashboardSection title={dict.admin.support.tableTitle}>
        {rows.length === 0 ? (
          <p className="text-sm text-faint text-center py-8">
            {dict.admin.support.empty}
          </p>
        ) : (
          <ul className="divide-y divide-line-subtle -my-2.5">
            {rows.map(({ thread, order }) => (
              <li key={thread.id} className="py-2.5">
                <Link
                  href={`/${lang}/client/orders/${order.id}`}
                  variant="muted"
                  className="block"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg truncate">
                        {order.request.title}
                      </p>
                      <p className="text-[11px] text-muted">
                        <span className="font-mono">{order.reference}</span> ·{" "}
                        {order.clientOrg.displayName}
                        <span className="text-faint"> → </span>
                        {order.factoryOrg.displayName}
                      </p>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="text-[11px] text-fg">
                        {dict.orders.statuses[order.status]}
                      </p>
                      <p className="text-[11px] text-faint">
                        {thread._count.messages}{" "}
                        <span className="lowercase">
                          {dict.admin.support.messagesSuffix}
                        </span>{" "}
                        ·{" "}
                        {formatDate(thread.lastMessageAt, lang, "short")}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

      <p
        className={cn(
          "text-[11px] text-faint mt-3 text-center",
        )}
      >
        {dict.admin.support.note}
      </p>
    </div>
  );
}
