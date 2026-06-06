import { test } from "node:test";
import assert from "node:assert/strict";
import { OrderStatus, Role } from "@prisma/client";
import {
  canTransition,
  isTerminal,
  nextStatusesFor,
} from "../src/lib/orders/transitions";

// CTO audit F1a — the buyer must not be able to walk the order out of
// PAYMENT_PENDING by themselves. Only ADMIN (manual override) and the
// payment finaliser may flip it; the finaliser writes the status
// directly, bypassing canTransition().

test("F1a · CLIENT cannot transition PAYMENT_PENDING → PREPARATION", () => {
  assert.equal(
    canTransition(
      OrderStatus.PAYMENT_PENDING,
      OrderStatus.PREPARATION,
      Role.CLIENT,
    ),
    false,
  );
});

test("F1a · ADMIN can still transition PAYMENT_PENDING → PREPARATION (manual override)", () => {
  assert.equal(
    canTransition(
      OrderStatus.PAYMENT_PENDING,
      OrderStatus.PREPARATION,
      Role.ADMIN,
    ),
    true,
  );
});

test("F1a · CLIENT can still cancel from PAYMENT_PENDING (escape hatch)", () => {
  assert.equal(
    canTransition(
      OrderStatus.PAYMENT_PENDING,
      OrderStatus.CANCELLED,
      Role.CLIENT,
    ),
    true,
  );
});

test("F1a · nextStatusesFor(PAYMENT_PENDING, CLIENT) only offers CANCELLED", () => {
  const next = nextStatusesFor(OrderStatus.PAYMENT_PENDING, Role.CLIENT);
  assert.deepEqual(next.sort(), [OrderStatus.CANCELLED]);
});

// Sanity: the rest of the matrix should be untouched by the audit.

test("PREPARATION → QC is factory + admin (unchanged)", () => {
  assert.equal(
    canTransition(OrderStatus.PREPARATION, OrderStatus.QC, Role.FACTORY),
    true,
  );
  assert.equal(
    canTransition(OrderStatus.PREPARATION, OrderStatus.QC, Role.ADMIN),
    true,
  );
  assert.equal(
    canTransition(OrderStatus.PREPARATION, OrderStatus.QC, Role.CLIENT),
    false,
  );
});

test("SHIPPED / IN_TRANSIT → COMPLETED is still in the matrix for CLIENT/ADMIN", () => {
  // The matrix still allows the transition; advanceOrderStatusAction
  // gates the actual closure on `balancePaidAt` being non-null (F1b).
  assert.equal(
    canTransition(OrderStatus.SHIPPED, OrderStatus.COMPLETED, Role.CLIENT),
    true,
  );
  assert.equal(
    canTransition(OrderStatus.IN_TRANSIT, OrderStatus.COMPLETED, Role.CLIENT),
    true,
  );
});

test("isTerminal recognises COMPLETED + CANCELLED", () => {
  assert.equal(isTerminal(OrderStatus.COMPLETED), true);
  assert.equal(isTerminal(OrderStatus.CANCELLED), true);
  assert.equal(isTerminal(OrderStatus.SHIPPED), false);
  assert.equal(isTerminal(OrderStatus.PAYMENT_PENDING), false);
});

test("nextStatusesFor exhaustively reflects the matrix for FACTORY in QC", () => {
  const next = nextStatusesFor(OrderStatus.QC, Role.FACTORY).sort();
  assert.deepEqual(next, [OrderStatus.SHIPPED].sort());
});

test("Terminal states have no outgoing transitions for any role", () => {
  for (const role of [Role.CLIENT, Role.FACTORY, Role.AGENT, Role.ADMIN]) {
    assert.deepEqual(nextStatusesFor(OrderStatus.COMPLETED, role), []);
    assert.deepEqual(nextStatusesFor(OrderStatus.CANCELLED, role), []);
  }
});
