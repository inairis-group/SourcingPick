import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { prisma, resetDb, seedBaseFixtures, seedOrder, type BaseFixtures } from "./_helpers.ts";
import { recordStage, orderTimeline } from "../../src/lib/orders/stage.ts";

/**
 * What "Mettre à jour l'état" relies on `recordStage` for, held against the
 * database: the move and its trace happen together, a client is shown only the
 * steps the canvas makes public, and an order never goes back a state.
 */

let base: BaseFixtures;
let orderId: string;

beforeEach(async () => {
  await resetDb();
  base = await seedBaseFixtures();
  ({ orderId } = await seedOrder(base));
});

test("a step moves the order and leaves one event, with its comment and its author", async () => {
  const result = await recordStage({
    orderId,
    state: "PREPARATION_COMPLETE",
    stage: "FULLY_RECEIVED",
    comment: "Tous les cartons sont arrivés.",
    actorId: base.adminUser.id,
  });
  assert.equal(result.ok, true);

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  assert.equal(order.state, "PREPARATION_COMPLETE");
  assert.equal(order.stage, "FULLY_RECEIVED");

  const events = await prisma.orderStageEvent.findMany({ where: { orderId } });
  assert.equal(events.length, 1);
  assert.equal(events[0].comment, "Tous les cartons sont arrivés.");
  assert.equal(events[0].actorId, base.adminUser.id);
  assert.equal(events[0].clientVisible, true);
});

test("an internal step is recorded but never reaches a client's timeline", async () => {
  await recordStage({ orderId, state: "PREPARATION_COMPLETE", stage: "FULLY_RECEIVED" });
  await recordStage({
    orderId,
    state: "PREPARATION_COMPLETE",
    stage: "CONSOLIDATION", // internal on the flow board
    comment: "Palettes filmées.",
  });
  await recordStage({ orderId, state: "SHIPPED", stage: "CONTAINER_LOADED" });

  const forClient = await orderTimeline(orderId, true);
  const forTeam = await orderTimeline(orderId, false);

  assert.deepEqual(forClient.map((e) => e.stage), ["FULLY_RECEIVED", "CONTAINER_LOADED"]);
  assert.deepEqual(forTeam.map((e) => e.stage), [
    "FULLY_RECEIVED",
    "CONSOLIDATION",
    "CONTAINER_LOADED",
  ]);
  // The comment written on an internal step travels with it, so it is hidden too.
  assert.ok(forClient.every((e) => e.comment !== "Palettes filmées."));
});

test("an order never goes back a state, but may change step inside one", async () => {
  await recordStage({ orderId, state: "SHIPPED", stage: "CONTAINER_LOADED" });

  const back = await recordStage({
    orderId,
    state: "PREPARATION_COMPLETE",
    stage: "READY_TO_LOAD",
  });
  assert.deepEqual(back, { ok: false, error: "illegal_transition" });

  const within = await recordStage({ orderId, state: "SHIPPED", stage: "BOOKING_CONFIRMED" });
  assert.equal(within.ok, true);

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  assert.equal(order.stage, "BOOKING_CONFIRMED");
  // The refused move left no trace.
  assert.equal(await prisma.orderStageEvent.count({ where: { orderId } }), 2);
});

test("a step that does not belong to the state is refused before anything is written", async () => {
  const result = await recordStage({ orderId, state: "SHIPPED", stage: "AT_SEA" });
  assert.deepEqual(result, { ok: false, error: "stage_mismatch" });
  assert.equal(await prisma.orderStageEvent.count({ where: { orderId } }), 0);
});

test("an unknown order is reported, not invented", async () => {
  const result = await recordStage({
    orderId: "does-not-exist",
    state: "SHIPPED",
    stage: "CONTAINER_LOADED",
  });
  assert.deepEqual(result, { ok: false, error: "not_found" });
});
