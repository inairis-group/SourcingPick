import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ORDER_STAGES,
  ORDER_STATES,
  STAGES,
  STATE_TONE,
  canTransition,
  stagesOf,
  visibleToClient,
  type OrderStage,
} from "../src/lib/orders/lifecycle";
import { locales } from "../src/lib/i18n/config";

/**
 * `SaaS-Flux-etats` is the only artboard that is a specification rather than
 * a screen, and it is the one the whole product hangs off. These tests hold
 * the code to it.
 */

test("ten main states, in the canvas's order", () => {
  assert.equal(ORDER_STATES.length, 10);
  assert.deepEqual(
    [...ORDER_STATES],
    [
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
    ],
  );
});

test("every sub-state belongs to a state, and every state has sub-states", () => {
  for (const stage of ORDER_STAGES) {
    assert.ok(ORDER_STATES.includes(STAGES[stage].state), `${stage} has no valid parent`);
  }
  for (const state of ORDER_STATES) {
    assert.ok(stagesOf(state).length > 0, `${state} has no sub-states`);
  }
  // The board's own counts, group by group.
  assert.deepEqual(
    ORDER_STATES.map((s) => stagesOf(s).length),
    [3, 4, 5, 4, 3, 7, 4, 4, 2, 3],
  );
});

test("exactly the five sub-states the canvas marks internal are internal", () => {
  const internal = ORDER_STAGES.filter((s) => !STAGES[s].clientVisible);
  assert.deepEqual(internal.sort(), [
    "BOOKING_CONFIRMED",
    "CONSOLIDATION",
    "EXPORT_DOCS_ISSUED",
    "INSPECTING",
    "TRANSHIPMENT",
  ]);
});

test("an internal sub-state collapses to its parent rather than disappearing", () => {
  // A client watching an order in consolidation must still see it moving.
  const hidden = visibleToClient("CONSOLIDATION");
  assert.equal(hidden.state, "PREPARATION_COMPLETE");
  assert.equal(hidden.stage, null);

  const shown = visibleToClient("ARRIVED_AT_PORT");
  assert.equal(shown.state, "IN_TRANSIT");
  assert.equal(shown.stage, "ARRIVED_AT_PORT");
});

test("orders move forward, and cancel from anywhere still open", () => {
  assert.equal(canTransition("REQUEST_RECEIVED", "QUOTE_SENT"), true);
  assert.equal(canTransition("SHIPPED", "IN_TRANSIT"), true);
  assert.equal(canTransition("PAYMENT_PENDING", "CANCELLED"), true);
  // Backwards is refused...
  assert.equal(canTransition("IN_TRANSIT", "PAYMENT_PENDING"), false);
  // ...except the one rewind the board names: an expired quotation returns
  // the request for requalification.
  assert.equal(canTransition("QUOTE_SENT", "REQUEST_RECEIVED"), true);
});

test("a finished order is finished", () => {
  for (const to of ORDER_STATES) {
    if (to === "COMPLETED") continue;
    assert.equal(canTransition("COMPLETED", to), false, `COMPLETED -> ${to}`);
    if (to !== "CANCELLED") {
      assert.equal(canTransition("CANCELLED", to), false, `CANCELLED -> ${to}`);
    }
  }
});

test("every state has a tone, and cancelled is the only red one", () => {
  for (const s of ORDER_STATES) assert.ok(STATE_TONE[s], `${s} has no tone`);
  const red = ORDER_STATES.filter((s) => STATE_TONE[s] === "failed");
  assert.deepEqual(red, ["CANCELLED"]);
});

test("all twelve languages name every state and sub-state", () => {
  // A missing label renders as an empty pill, which reads as "no status" —
  // the one thing a status pill must never say.
  for (const l of locales) {
    const dict = JSON.parse(
      readFileSync(new URL(`../src/lib/i18n/dictionaries/${l}.json`, import.meta.url), "utf8"),
    ) as { lifecycle?: { state?: Record<string, string>; stage?: Record<string, string> } };
    for (const s of ORDER_STATES) {
      assert.ok(dict.lifecycle?.state?.[s]?.length, `${l} is missing state ${s}`);
    }
    for (const s of ORDER_STAGES) {
      assert.ok(dict.lifecycle?.stage?.[s as OrderStage]?.length, `${l} is missing stage ${s}`);
    }
  }
});

test("the schema's enums and the vocabulary are the same list", () => {
  // Two copies of the canvas's lifecycle exist: the Prisma enums, which the
  // database enforces, and lifecycle.ts, which holds the tones, visibility
  // and transitions. If they drift, a stage can be written to a column that
  // has no name for it — and the failure lands mid-order.
  const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
  const values = (name: string) => {
    const block = new RegExp(`enum ${name} \\{([^}]*)\\}`).exec(schema);
    assert.ok(block, `no ${name} enum in schema.prisma`);
    return block[1]
      .split("\n")
      .map((l) => l.replace(/\/\/.*/, "").trim())
      .filter(Boolean);
  };
  assert.deepEqual(values("OrderState").sort(), [...ORDER_STATES].sort());
  assert.deepEqual(values("OrderStage").sort(), [...ORDER_STAGES].sort());
});
