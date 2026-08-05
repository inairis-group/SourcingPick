"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { GuestChatTeam, GuestConversationStatus } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatEUR } from "@/lib/i18n/formatters";
import {
  assignGuestTeam,
  escalateGuestToDispute,
  escalateGuestToTicket,
  findGuestAccount,
  listDisputableOrders,
  setGuestConversationStatus,
  type GuestEscalationState,
} from "@/lib/support/guest-escalation";
import type { Locale } from "@/lib/i18n/config";
import type { InboxConversation } from "./chat-inbox";

/**
 * Routing and escalation for one conversation.
 *
 * Routing is always available — it needs nothing but a queue name. Escalation
 * is not: a ticket needs a requester and a dispute needs an order, and a
 * visitor who typed a name into a widget has neither. So the panel resolves
 * the email to an account first and states plainly when it can't, rather than
 * offering buttons that would fail.
 */

const TEAMS = Object.values(GuestChatTeam);

type Account = Awaited<ReturnType<typeof findGuestAccount>>;
type Order = Awaited<ReturnType<typeof listDisputableOrders>>[number];

function escalationError(
  state: GuestEscalationState | null,
  copy: Record<string, string>,
): string | null {
  if (!state || state.ok) return null;
  return copy[`gcErr_${state.error}`] ?? copy.gcErr_generic;
}

export function EscalationPanel({
  conversation,
  lang,
  copy,
  teamLabels,
  onChanged,
}: {
  conversation: InboxConversation;
  lang: Locale;
  copy: Record<string, string>;
  teamLabels: Record<string, string>;
  onChanged: () => void;
}) {
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderId, setOrderId] = useState("");
  const [resolved, setResolved] = useState(false);

  const [teamState, teamAction] = useActionState(assignGuestTeam, null);
  const [statusState, statusAction] = useActionState(
    setGuestConversationStatus,
    null,
  );
  const [ticketState, ticketAction, ticketPending] = useActionState(
    escalateGuestToTicket,
    null,
  );
  const [disputeState, disputeAction, disputePending] = useActionState(
    escalateGuestToDispute,
    null,
  );

  const escalated = Boolean(
    conversation.escalatedTicketId || conversation.escalatedDisputeId,
  );

  /**
   * Look the visitor up when the selection changes. The lookup is by email and
   * costs a query, so it runs once per conversation rather than per render —
   * `resolved` also lets us tell "no account" apart from "not looked up yet",
   * which is the difference between a useful message and a misleading one.
   */
  useEffect(() => {
    let cancelled = false;

    // No state reset here: the parent keys this component on the conversation
    // id, so a different visitor gets a fresh mount with fresh initial state.
    // Resetting would be a synchronous setState in an effect for no gain.
    //
    // Every setState below runs after an await, so there is no synchronous
    // cascade for the rule to object to.
    void (async () => {
      const found = await findGuestAccount(conversation.email);
      if (cancelled) return;
      setAccount(found);
      setResolved(true);
      if (!found) return;
      const list = await listDisputableOrders(conversation.id);
      if (cancelled) return;
      setOrders(list);
      setOrderId(list[0]?.id ?? "");
    })();

    return () => {
      cancelled = true;
    };
  }, [conversation.id, conversation.email]);

  // Any successful mutation invalidates the list the parent is showing.
  useEffect(() => {
    for (const s of [teamState, statusState, ticketState, disputeState]) {
      if (s?.ok) {
        onChanged();
        break;
      }
    }
  }, [teamState, statusState, ticketState, disputeState, onChanged]);

  const error =
    escalationError(ticketState, copy) ??
    escalationError(disputeState, copy) ??
    escalationError(teamState, copy) ??
    escalationError(statusState, copy);

  const closed = conversation.status === GuestConversationStatus.CLOSED;

  return (
    <aside className="border-line bg-subtle/40 flex flex-col gap-5 border-s p-4 text-sm">
      {/* Routing — available for every conversation, escalated or not. */}
      <div>
        <p className="text-faint mb-1.5 text-xs font-medium">
          {copy.routeLabel}
        </p>
        <Select
          size="sm"
          value={conversation.team ?? ""}
          onChange={(v) => {
            const fd = new FormData();
            fd.set("conversationId", conversation.id);
            fd.set("team", v);
            // useActionState's dispatch has to run inside a transition when
            // it's fired from an event handler rather than a form action.
            startTransition(() => teamAction(fd));
          }}
          options={[
            { value: "", label: copy.routeNone },
            ...TEAMS.map((t) => ({ value: t, label: teamLabels[t] })),
          ]}
        />
      </div>

      {/* Who is this? Everything below depends on the answer. */}
      <div>
        <p className="text-faint mb-1.5 text-xs font-medium">
          {copy.accountTitle}
        </p>
        {!resolved ? (
          <p className="text-faint text-xs">…</p>
        ) : account ? (
          <div className="border-success-edge bg-success-soft text-success rounded-md border px-3 py-2 text-xs">
            <p className="font-semibold">{copy.accountMatched}</p>
            <p className="mt-0.5">
              {account.firstName} {account.lastName}
              {account.organization
                ? ` · ${account.organization.displayName}`
                : ""}
            </p>
          </div>
        ) : (
          <div className="border-line bg-surface text-muted rounded-md border px-3 py-2 text-xs">
            <p className="text-fg font-semibold">{copy.accountNone}</p>
            <p className="mt-1 leading-snug">{copy.accountHint}</p>
          </div>
        )}
      </div>

      <div>
        <p className="text-faint mb-1.5 text-xs font-medium">
          {copy.escalateTitle}
        </p>

        {escalated ? (
          <div className="flex flex-col gap-2">
            {conversation.escalatedTicketId && (
              <p className="text-muted text-xs">
                {copy.escalatedTicket}{" "}
                <Link
                  href={`/${lang}/admin/support`}
                  className="text-info font-medium"
                >
                  {conversation.escalatedTicket?.reference ?? copy.openLink}
                </Link>
              </p>
            )}
            {conversation.escalatedDisputeId && (
              <p className="text-muted text-xs">
                {copy.escalatedDispute}{" "}
                <Link
                  href={`/${lang}/admin/disputes`}
                  className="text-info font-medium"
                >
                  {conversation.escalatedDispute?.reference ?? copy.openLink}
                </Link>
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-faint text-xs leading-snug">
              {copy.transcriptNote}
            </p>

            <form action={ticketAction}>
              <input
                type="hidden"
                name="conversationId"
                value={conversation.id}
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="w-full"
                disabled={!account || ticketPending}
              >
                {copy.escalateTicket}
              </Button>
            </form>

            {/* A dispute is order-scoped, so it only appears once we know the
                customer and they have an order that isn't already disputed. */}
            {account && (
              <form action={disputeAction} className="flex flex-col gap-2">
                <input
                  type="hidden"
                  name="conversationId"
                  value={conversation.id}
                />
                <input type="hidden" name="orderId" value={orderId} />
                {orders.length === 0 ? (
                  <p className="text-faint text-xs">{copy.noOrders}</p>
                ) : (
                  <>
                    <p className="text-faint text-xs">{copy.pickOrder}</p>
                    <Select
                      size="sm"
                      value={orderId}
                      onChange={setOrderId}
                      options={orders.map((o) => ({
                        value: o.id,
                        label: `${o.reference} · ${formatEUR(o.totalCents / 100, lang)}`,
                      }))}
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      disabled={disputePending || !orderId}
                    >
                      {copy.escalateDispute}
                    </Button>
                  </>
                )}
              </form>
            )}
          </div>
        )}
      </div>

      <form action={statusAction} className="mt-auto">
        <input type="hidden" name="conversationId" value={conversation.id} />
        <input
          type="hidden"
          name="status"
          value={
            closed
              ? GuestConversationStatus.OPEN
              : GuestConversationStatus.CLOSED
          }
        />
        <Button type="submit" variant="ghost" size="sm" className="w-full">
          {closed ? copy.reopenCta : copy.closeCta}
        </Button>
      </form>

      {error && (
        <p className="border-danger-edge bg-danger-soft text-danger rounded-md border px-3 py-2 text-xs">
          {error}
        </p>
      )}
    </aside>
  );
}
