import { OrderStatus, Role } from "@prisma/client";

/**
 * v1 Order state machine — spec §3.2.
 *
 *   PAYMENT_PENDING ──payment-finaliser──▶ PREPARATION
 *                  ╲──admin/client(cancel)──▶ CANCELLED
 *   PREPARATION    ──factory──▶ QC
 *                  ╲──admin(cancel)──▶ CANCELLED
 *   QC             ──factory(+tracking)──▶ SHIPPED
 *                  ╲──admin(cancel)──▶ CANCELLED
 *   SHIPPED        ──factory──▶ IN_TRANSIT
 *                  ╲──client(confirm)──▶ COMPLETED (if balance paid)
 *   IN_TRANSIT     ──client(confirm)──▶ COMPLETED (if balance paid)
 *   COMPLETED      ─ terminal
 *   CANCELLED      ─ terminal
 *
 * PAYMENT_PENDING → PREPARATION is reserved for ADMIN (manual override)
 * and the payment finaliser (PingPong webhook + wire reconciliation). The buyer
 * cannot move the order out of PAYMENT_PENDING by themselves any more
 * (CTO audit F1a) — the deposit must actually land first.
 *
 * SHIPPED / IN_TRANSIT → COMPLETED is gated by `Order.balancePaidAt`
 * being set at the action layer (CTO audit F1b). The matrix lets the
 * role attempt the move; `advanceOrderStatusAction` records the buyer's
 * delivery confirmation but holds the status flip until the balance has
 * been reconciled. See src/lib/orders/actions.ts.
 */
export const ORDER_TRANSITIONS: Record<
  OrderStatus,
  Partial<Record<OrderStatus, Role[]>>
> = {
  PAYMENT_PENDING: {
    PREPARATION: [Role.ADMIN],
    CANCELLED: [Role.CLIENT, Role.ADMIN],
  },
  PREPARATION: {
    QC: [Role.FACTORY, Role.ADMIN],
    CANCELLED: [Role.ADMIN],
  },
  QC: {
    SHIPPED: [Role.FACTORY, Role.ADMIN],
    CANCELLED: [Role.ADMIN],
  },
  SHIPPED: {
    IN_TRANSIT: [Role.FACTORY, Role.ADMIN],
    COMPLETED: [Role.CLIENT, Role.ADMIN],
  },
  IN_TRANSIT: {
    COMPLETED: [Role.CLIENT, Role.ADMIN],
  },
  COMPLETED: {},
  CANCELLED: {},
};

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  role: Role,
): boolean {
  const allowedRoles = ORDER_TRANSITIONS[from][to];
  return Array.isArray(allowedRoles) && allowedRoles.includes(role);
}

export function isTerminal(status: OrderStatus): boolean {
  return status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED;
}

export function nextStatusesFor(
  current: OrderStatus,
  role: Role,
): OrderStatus[] {
  const transitions = ORDER_TRANSITIONS[current];
  return (Object.entries(transitions) as [OrderStatus, Role[]][])
    .filter(([, roles]) => roles.includes(role))
    .map(([next]) => next);
}
