import type { ReactNode } from "react";
import { Link } from "@/components/ui/link";
import { PageHeader } from "@/components/saas/page-header";
import { EmptyLine, Panel } from "@/components/saas/panel";
import { StatusPill } from "@/components/saas/status-pill";
import { OrderStatusForm } from "@/components/saas/order-status-form";
import { toneForStage, STATE_TONE, type OrderStage, type OrderState } from "@/lib/orders/lifecycle";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";

export type StatusViewEvent = {
  id: string;
  state: OrderState;
  stage: OrderStage | null;
  comment: string | null;
  clientVisible: boolean;
  createdAt: Date;
  actor: { name: string | null } | null;
};

/**
 * The order screen the status form lives on, for agents and administrators.
 *
 * Left: where the order is, and the form that moves it. Right: what has been
 * recorded, newest first, with the steps the client does not see marked as
 * such — which is the one thing an operator needs to remember about this
 * screen, since everything they write in the comment box is read by someone.
 */
export function OrderStatusView({
  lang,
  dict,
  backHref,
  requestHref,
  order,
  events,
  actions,
}: {
  lang: Locale;
  dict: Dictionary;
  backHref: string;
  requestHref: string;
  order: {
    id: string;
    reference: string;
    title: string;
    clientName: string;
    state: OrderState | null;
    stage: OrderStage | null;
  };
  events: readonly StatusViewEvent[];
  actions?: ReactNode;
}) {
  const t = dict.orders.statusForm;
  const tone = order.stage ? toneForStage(order.stage) : order.state ? STATE_TONE[order.state] : "idle";
  const where = order.stage
    ? dict.lifecycle.stage[order.stage]
    : order.state
      ? dict.lifecycle.state[order.state]
      : t.notStarted;
  const newestFirst = [...events].reverse();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link href={backHref} variant="muted" className="text-sm">
        ← {t.back}
      </Link>

      <PageHeader
        eyebrow={order.reference}
        title={order.title}
        subtitle={order.clientName}
        status={<StatusPill tone={tone} size="md">{where}</StatusPill>}
        actions={actions}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title={t.title} subtitle={order.state ? dict.lifecycle.state[order.state] : undefined}>
          <OrderStatusForm orderId={order.id} currentStage={order.stage} currentState={order.state} />
        </Panel>

        <Panel
          title={t.historyTitle}
          action={{ href: requestHref, label: t.openRequest }}
        >
          {newestFirst.length === 0 ? (
            <EmptyLine>{t.historyEmpty}</EmptyLine>
          ) : (
            <ol className="m-0 flex list-none flex-col p-0">
              {newestFirst.map((e) => (
                <li key={e.id} className="border-line flex flex-col gap-1 border-b py-3 last:border-b-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-fg text-base font-semibold">
                      {e.stage ? dict.lifecycle.stage[e.stage] : dict.lifecycle.state[e.state]}
                    </span>
                    <time dateTime={e.createdAt.toISOString()} className="text-faint font-mono text-xs">
                      {formatDate(e.createdAt, lang, "medium")}
                    </time>
                  </div>
                  <span className="text-muted text-[13.5px]">
                    {dict.lifecycle.state[e.state]}
                    {!e.clientVisible && <> · {t.internal}</>}
                    {e.actor?.name && <> · {e.actor.name}</>}
                  </span>
                  {e.comment && <p className="text-fg m-0 text-sm">{e.comment}</p>}
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </div>
  );
}
