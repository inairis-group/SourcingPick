import { OrderStatus, Role } from "@prisma/client";

/**
 * v1 Order state machine — spec §3.2.
 *
 *   PAYMENT_PENDING ──client(sandbox-pay)──▶ PREPARATION
 *                  ╲──admin/client(cancel)──▶ CANCELLED
 *   PREPARATION    ──factory──▶ QC
 *                  ╲──admin(cancel)──▶ CANCELLED
 *   QC             ──factory(+tracking)──▶ SHIPPED
 *                  ╲──admin(cancel)──▶ CANCELLED
 *   SHIPPED        ──factory──▶ IN_TRANSIT
 *                  ╲──client(confirm)──▶ COMPLETED
 *   IN_TRANSIT     ──client(confirm)──▶ COMPLETED
 *   COMPLETED      ─ terminal
 *   CANCELLED      ─ terminal
 *
 * PAYMENT_PENDING → PREPARATION will be driven by the payment-provider
 * webhook in Phase 3; the sandbox button is a stand-in until then.
 */
export const ORDER_TRANSITIONS: Record<
  OrderStatus,
  Partial<Record<OrderStatus, Role[]>>
> = {
  PAYMENT_PENDING: {
    PREPARATION: [Role.CLIENT, Role.ADMIN],
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
