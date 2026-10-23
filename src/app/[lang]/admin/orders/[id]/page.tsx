import { notFound } from "next/navigation";
import { AdminScope } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { OrderStatusView } from "@/components/saas/order-status-view";
import { orderTimeline } from "@/lib/orders/stage";
import type { OrderStage, OrderState } from "@/lib/orders/lifecycle";

/**
 * An administrator's order screen. The same form an agent has — "L'administration
 * dispose de tous les droits d'un agent" — on any order rather than only the
 * assigned ones. Reached from the order's request, which is where the admin
 * area lists orders today.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/admin/orders/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const order = await prisma.order.findUnique({ where: { id }, select: { reference: true } });
  return { title: order?.reference ?? "" };
}

export default async function AdminOrderPage({ params }: PageProps<"/[lang]/admin/orders/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.REQUESTS);
  const dict = await getDictionary(lang);

  const order = await prisma.order.findFirst({
    where: { id, deletedAt: null },
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

  const events = await orderTimeline(order.id, false);

  return (
    <OrderStatusView
      lang={lang}
      dict={dict}
      backHref={`/${lang}/admin/requests/${order.request.id}`}
      requestHref={`/${lang}/admin/requests/${order.request.id}`}
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
