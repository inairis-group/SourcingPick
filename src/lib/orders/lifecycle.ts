import type { StatusTone } from "@/components/saas/status-pill";

/**
 * The life of an order, as `SaaS-Flux-etats` defines it.
 *
 * Ten main states, thirty-nine sub-states. The board's own summary: "Chaque
 * état porte ses sous-états. Le client voit l'état principal et les sous-états
 * marqués comme publics ; l'agent et l'administration voient tout."
 *
 * This file is the vocabulary only — names, parents, tones and visibility. It
 * is deliberately pure and has no Prisma import, so the transitions can be
 * tested without a database and so the canvas's model can be compared against
 * the one the schema already had.
 *
 * **How this relates to `SourcingStatus`.** The application had eleven flat
 * values and no history at all. The canvas's main states map onto them almost
 * exactly — the two additions are `PAYMENT_RECEIVED`, which the old enum ran
 * together with `PREPARATION`, and `READY`, which it had no name for. The
 * thirty-nine sub-states are entirely new, and they are where the product
 * actually lives: "in transit" tells a client nothing, "arrived at port" tells
 * them when to expect the lorry.
 *
 * **Visibility is evidence, not preference.** `SaaS-Flux-etats` marks each
 * sub-state public (white) or internal (grey); fifteen are internal, and they
 * are marked so below. The transmission of 22 October 2026 (SaaS, section 3)
 * lists them by name. `SaaS-Admin-Statut` annotates five of the same fifteen
 * "Interne, non visible par le client".
 */

export const ORDER_STATES = [
  "REQUEST_RECEIVED",
  "AGENT_ASSIGNED",
  "QUOTE_SENT",
  "PAYMENT_PENDING",
  "PAYMENT_RECEIVED",
  "PREPARATION_COMPLETE",
  "SHIPPED",
  "IN_TRANSIT",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

export const ORDER_STAGES = [
  // Demande reçue
  "RECEIVED",
  "QUALIFYING",
  "INFO_MISSING",
  // Agent assigné
  "AGENT_ASSIGNED",
  "SOURCING",
  "SUPPLIERS_CONTACTED",
  "SUPPLIER_OFFER_RECEIVED",
  // Devis envoyé
  "QUOTE_SENT",
  "QUOTE_VIEWED",
  "QUOTE_SIGNED",
  "QUOTE_DECLINED",
  "QUOTE_EXPIRED",
  // Paiement en attente
  "DEPOSIT_INVOICE_ISSUED",
  "TRANSFER_DECLARED",
  "AWAITING_FUNDS",
  "PARTIAL_PAYMENT",
  // Paiement reçu
  "DEPOSIT_RECEIVED",
  "ORDER_PLACED_WITH_SUPPLIER",
  "PRODUCTION",
  // Préparation terminée
  "PARTIALLY_RECEIVED",
  "FULLY_RECEIVED",
  "INSPECTING",
  "ISSUE_REPORTED",
  "INSPECTION_PASSED",
  "CONSOLIDATION",
  "READY_TO_LOAD",
  // Expédié
  "BALANCE_PAID",
  "CONTAINER_LOADED",
  "EXPORT_DOCS_ISSUED",
  "BOOKING_CONFIRMED",
  // En transit
  "AT_SEA",
  "TRANSHIPMENT",
  "ARRIVED_AT_PORT",
  "CUSTOMS_CLEARANCE",
  // Terminé
  "GOODS_DELIVERED",
  "FILE_CLOSED",
  // Annulé
  "CANCELLED_BY_CLIENT",
  "CANCELLED_BY_SOURCINGPICK",
  "REFUND_ISSUED",
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number];

export type StageSpec = {
  /** The main state this sub-state belongs to. */
  state: OrderState;
  /**
   * Whether the client sees it. `false` means agents and administrators only
   * — the fifteen the flow board draws in grey.
   */
  clientVisible: boolean;
};

export const STAGES: Record<OrderStage, StageSpec> = {
  RECEIVED: { state: "REQUEST_RECEIVED", clientVisible: true },
  QUALIFYING: { state: "REQUEST_RECEIVED", clientVisible: true },
  INFO_MISSING: { state: "REQUEST_RECEIVED", clientVisible: true },

  AGENT_ASSIGNED: { state: "AGENT_ASSIGNED", clientVisible: true },
  SOURCING: { state: "AGENT_ASSIGNED", clientVisible: false },
  SUPPLIERS_CONTACTED: { state: "AGENT_ASSIGNED", clientVisible: false },
  SUPPLIER_OFFER_RECEIVED: { state: "AGENT_ASSIGNED", clientVisible: false },

  QUOTE_SENT: { state: "QUOTE_SENT", clientVisible: true },
  QUOTE_VIEWED: { state: "QUOTE_SENT", clientVisible: false },
  QUOTE_SIGNED: { state: "QUOTE_SENT", clientVisible: true },
  QUOTE_DECLINED: { state: "QUOTE_SENT", clientVisible: false },
  QUOTE_EXPIRED: { state: "QUOTE_SENT", clientVisible: false },

  DEPOSIT_INVOICE_ISSUED: { state: "PAYMENT_PENDING", clientVisible: true },
  TRANSFER_DECLARED: { state: "PAYMENT_PENDING", clientVisible: false },
  AWAITING_FUNDS: { state: "PAYMENT_PENDING", clientVisible: true },
  PARTIAL_PAYMENT: { state: "PAYMENT_PENDING", clientVisible: false },

  DEPOSIT_RECEIVED: { state: "PAYMENT_RECEIVED", clientVisible: true },
  ORDER_PLACED_WITH_SUPPLIER: { state: "PAYMENT_RECEIVED", clientVisible: false },
  PRODUCTION: { state: "PAYMENT_RECEIVED", clientVisible: true },

  PARTIALLY_RECEIVED: { state: "PREPARATION_COMPLETE", clientVisible: true },
  FULLY_RECEIVED: { state: "PREPARATION_COMPLETE", clientVisible: true },
  // "Interne, non visible par le client" on SaaS-Admin-Statut.
  INSPECTING: { state: "PREPARATION_COMPLETE", clientVisible: false },
  ISSUE_REPORTED: { state: "PREPARATION_COMPLETE", clientVisible: true },
  INSPECTION_PASSED: { state: "PREPARATION_COMPLETE", clientVisible: true },
  CONSOLIDATION: { state: "PREPARATION_COMPLETE", clientVisible: false },
  READY_TO_LOAD: { state: "PREPARATION_COMPLETE", clientVisible: true },

  BALANCE_PAID: { state: "SHIPPED", clientVisible: true },
  CONTAINER_LOADED: { state: "SHIPPED", clientVisible: true },
  EXPORT_DOCS_ISSUED: { state: "SHIPPED", clientVisible: false },
  BOOKING_CONFIRMED: { state: "SHIPPED", clientVisible: false },

  AT_SEA: { state: "IN_TRANSIT", clientVisible: true },
  TRANSHIPMENT: { state: "IN_TRANSIT", clientVisible: false },
  ARRIVED_AT_PORT: { state: "IN_TRANSIT", clientVisible: true },
  CUSTOMS_CLEARANCE: { state: "IN_TRANSIT", clientVisible: true },

  GOODS_DELIVERED: { state: "COMPLETED", clientVisible: true },
  FILE_CLOSED: { state: "COMPLETED", clientVisible: true },

  CANCELLED_BY_CLIENT: { state: "CANCELLED", clientVisible: true },
  CANCELLED_BY_SOURCINGPICK: { state: "CANCELLED", clientVisible: false },
  REFUND_ISSUED: { state: "CANCELLED", clientVisible: true },
};

/**
 * The colour each main state is drawn in, read off the lifecycle board.
 * Sub-states inherit their parent's tone — the canvas never gives one a
 * colour of its own.
 */
export const STATE_TONE: Record<OrderState, StatusTone> = {
  REQUEST_RECEIVED: "new",
  AGENT_ASSIGNED: "new",
  QUOTE_SENT: "quote",
  PAYMENT_PENDING: "waiting",
  PAYMENT_RECEIVED: "done",
  PREPARATION_COMPLETE: "done",
  SHIPPED: "moving",
  IN_TRANSIT: "moving",
  COMPLETED: "closed",
  CANCELLED: "failed",
};

export function toneForStage(stage: OrderStage): StatusTone {
  return STATE_TONE[STAGES[stage].state];
}

/** The sub-states of a main state, in the order the canvas lists them. */
export function stagesOf(state: OrderState): OrderStage[] {
  return ORDER_STAGES.filter((s) => STAGES[s].state === state);
}

/**
 * What a client is allowed to be told.
 *
 * An internal sub-state does not become invisible — it collapses to its
 * parent. A client watching an order in `CONSOLIDATION` sees "Preparation
 * complete", which is true, rather than nothing at all, which would look like
 * the order had stopped moving.
 */
export function visibleToClient(stage: OrderStage): { state: OrderState; stage: OrderStage | null } {
  const spec = STAGES[stage];
  return { state: spec.state, stage: spec.clientVisible ? stage : null };
}

/**
 * Whether a move is allowed.
 *
 * Forward along the canvas's order, or into `CANCELLED` from anywhere before
 * completion. Backwards is refused with one exception the board names: "Le
 * devis expire sans réponse : l'état revient en demande reçue pour
 * requalification."
 */
export function canTransition(from: OrderState, to: OrderState): boolean {
  if (from === to) return true;
  if (from === "COMPLETED" || from === "CANCELLED") return false;
  if (to === "CANCELLED") return true;
  if (from === "QUOTE_SENT" && to === "REQUEST_RECEIVED") return true;
  return ORDER_STATES.indexOf(to) > ORDER_STATES.indexOf(from);
}
