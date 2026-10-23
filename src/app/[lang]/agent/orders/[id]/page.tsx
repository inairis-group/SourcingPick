import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { OrderStatusView } from "@/components/saas/order-status-view";
import { orderTimeline } from "@/lib/orders/stage";
import type { OrderStage, OrderState } from "@/lib/orders/lifecycle";

/**
 * An agent's order screen: where it stands, and "Mettre à jour l'état".
 * An agent sees the orders assigned to them and no others.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/agent/orders/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const order = await prisma.order.findUnique({ where: { id }, select: { reference: true } });
  return { title: order?.reference ?? "" };
}

export default async function AgentOrderPage({ params }: PageProps<"/[lang]/agent/orders/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const agent = await requireRole(Role.AGENT);
  const dict = await getDictionary(lang);

  const order = await prisma.order.findFirst({
    where: { id, agentId: agent.id, deletedAt: null },
    select: {
      id: true,
      reference: true,
      state: true,
      stage: true,
      clientOrg: { select: { displayName: true } },
      request: { select: { id: true, title: true } },
    },
  });
  if (!order) notFound();

  // An agent sees every step, internal ones included.
  const events = await orderTimeline(order.id, false);

  return (
    <OrderStatusView
      lang={lang}
      dict={dict}
      backHref={`/${lang}/agent/orders`}
      requestHref={`/${lang}/agent/requests/${order.request.id}`}
      order={{
        id: order.id,
        reference: order.reference,
        title: order.request.title,
        clientName: order.clientOrg.displayName,
        state: order.state as OrderState | null,
        stage: order.stage as OrderStage | null,
      }}
      events={events}
    />
  );
}
