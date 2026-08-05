import { test, before } from "node:test";
import assert from "node:assert/strict";

/**
 * Inbound reply addressing.
 *
 * These are the security-relevant paths: anyone can send us mail claiming to
 * be anyone, so routing must depend on the signed recipient token and nothing
 * else. A forged or guessed token has to fail closed.
 */

// The module reads the secret at call time, so setting it here is enough.
before(() => {
  process.env.INBOUND_EMAIL_SECRET = "test-secret-not-used-anywhere-real";
  process.env.INBOUND_EMAIL_DOMAIN = "reply.sourcingpick.com";
});

const load = async () => import("../src/lib/email/inbound-address.ts");

test("a generated address round-trips back to its target", async () => {
  const { inboundReplyAddress, parseInboundAddress } = await load();

  const addr = inboundReplyAddress({ kind: "g", id: "abc123def456" });
  assert.ok(addr, "an address should be produced when both env vars are set");
  // Lowercase hex specifically: a signature that changed meaning when
  // lower-cased would reject genuine replies from relays that normalise case.
  assert.match(addr, /^reply\+g\.abc123def456\.[0-9a-f]{16}@reply\.sourcingpick\.com$/);

  assert.deepEqual(parseInboundAddress(addr), {
    kind: "g",
    id: "abc123def456",
  });
});

test("tickets and conversations with the same id get different signatures", async () => {
  const { inboundReplyAddress } = await load();
  const g = inboundReplyAddress({ kind: "g", id: "sameid0000" })!;
  const t = inboundReplyAddress({ kind: "t", id: "sameid0000" })!;
  assert.notEqual(
    g.split(".")[2],
    t.split(".")[2],
    "the kind is signed too, or a chat token would open a ticket",
  );
});

test("a forged or tampered token is rejected", async () => {
  const { inboundReplyAddress, parseInboundAddress } = await load();
  const addr = inboundReplyAddress({ kind: "g", id: "abc123def456" })!;
  const sig = addr.split("@")[0]!.split(".")[2]!;

  // Swapping the id while keeping a valid signature — the attack this exists
  // to stop: reading someone else's conversation by editing the address.
  assert.equal(
    parseInboundAddress(`reply+g.someoneelseid.${sig}@reply.sourcingpick.com`),
    null,
  );

  // Right id, wrong signature.
  assert.equal(
    parseInboundAddress("reply+g.abc123def456.0000000000000000@reply.sourcingpick.com"),
    null,
  );

  // Kind swapped, signature kept.
  assert.equal(
    parseInboundAddress(`reply+t.abc123def456.${sig}@reply.sourcingpick.com`),
    null,
  );

  // No token at all.
  assert.equal(parseInboundAddress("support@sourcingpick.com"), null);
  assert.equal(parseInboundAddress("reply+garbage@reply.sourcingpick.com"), null);
  assert.equal(parseInboundAddress(""), null);
});

test("real-world envelope formatting still parses", async () => {
  const { inboundReplyAddress, parseInboundAddress } = await load();
  const addr = inboundReplyAddress({ kind: "t", id: "tkt00000001" })!;

  assert.deepEqual(parseInboundAddress(`SourcingPick <${addr}>`), {
    kind: "t",
    id: "tkt00000001",
  });
  assert.deepEqual(parseInboundAddress(`  ${addr.toUpperCase()}  `), {
    kind: "t",
    id: "tkt00000001",
  });
});

test("no address is issued when inbound email isn't configured", async () => {
  const { inboundReplyAddress } = await load();
  const domain = process.env.INBOUND_EMAIL_DOMAIN;
  delete process.env.INBOUND_EMAIL_DOMAIN;
  assert.equal(
    inboundReplyAddress({ kind: "g", id: "abc" }),
    null,
    "better no Reply-To than one that routes nowhere",
  );
  process.env.INBOUND_EMAIL_DOMAIN = domain;
});

test("quoted history is stripped, the actual reply is kept", async () => {
  const { stripQuotedReply } = await load();

  assert.equal(
    stripQuotedReply(
      "Yes, 500 units works for us.\n\nOn Tue, 5 Aug 2026 at 14:02, SourcingPick wrote:\n> Our quote is attached.",
    ),
    "Yes, 500 units works for us.",
  );

  assert.equal(
    stripQuotedReply("Merci !\n\nLe 5 août 2026, SourcingPick a écrit :\n> Bonjour"),
    "Merci !",
  );

  assert.equal(
    stripQuotedReply("Sounds good.\n--\nJean Dupont\nAcme SARL"),
    "Sounds good.",
  );

  assert.equal(
    stripQuotedReply("Confirmed.\n-----Original Message-----\nFrom: us"),
    "Confirmed.",
  );

  // Nothing recognisable to cut at: keep the whole thing rather than guess.
  assert.equal(stripQuotedReply("Just a plain reply."), "Just a plain reply.");

  // A reply that is *only* quoted text carries no new information.
  assert.equal(stripQuotedReply("> nothing but a quote"), "");
});
