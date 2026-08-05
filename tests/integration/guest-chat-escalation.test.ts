import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  GuestChatTeam,
  GuestConversationStatus,
  SupportTicketStatus,
  ThreadContextType,
} from "@prisma/client";
import {
  prisma,
  resetDb,
  seedBaseFixtures,
  seedOrder,
  type BaseFixtures,
} from "./_helpers.ts";

/**
 * Public-chat routing and escalation.
 *
 * The invariant worth protecting: escalation is gated on a real account. A
 * visitor is anonymous, a SupportTicket needs a requester and a Dispute needs
 * an order — so the interesting cases are the ones where the bridge is missing
 * or points at the wrong customer.
 */

let base: BaseFixtures;

before(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

beforeEach(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

async function seedConversation(email: string, name = "Visitor") {
  return prisma.guestConversation.create({
    data: {
      token: randomUUID(),
      name,
      email,
      messages: {
        create: [
          { body: "My order never arrived.", fromTeam: false },
          { body: "Looking into it now.", fromTeam: true },
        ],
      },
    },
    select: { id: true, email: true, status: true, team: true },
  });
}

/** The email→account lookup the escalation actions gate on. */
function accountFor(email: string) {
  return prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, deletedAt: null },
    select: { id: true, organizationId: true },
  });
}

test("routing works for an anonymous visitor with no account at all", async () => {
  const convo = await seedConversation("stranger@example.com");
  assert.equal(convo.team, null, "a new conversation starts unrouted");

  await prisma.guestConversation.update({
    where: { id: convo.id },
    data: { team: GuestChatTeam.ENGINEERING },
  });

  const routed = await prisma.guestConversation.findUniqueOrThrow({
    where: { id: convo.id },
    select: { team: true, status: true },
  });
  assert.equal(routed.team, GuestChatTeam.ENGINEERING);
  // Routing must not imply escalation — they're independent.
  assert.equal(routed.status, GuestConversationStatus.OPEN);
});

test("no account for the email means there is nothing to escalate onto", async () => {
  await seedConversation("nobody@example.com");
  assert.equal(
    await accountFor("nobody@example.com"),
    null,
    "the gate that disables the escalate buttons",
  );
});

test("the account lookup is case-insensitive and skips deleted users", async () => {
  const client = await prisma.user.findUniqueOrThrow({
    where: { id: base.clientUser.id },
    select: { email: true },
  });

  assert.ok(
    await accountFor(client.email.toUpperCase()),
    "people type their address however they like",
  );

  await prisma.user.update({
    where: { id: base.clientUser.id },
    data: { deletedAt: new Date() },
  });
  assert.equal(
    await accountFor(client.email),
    null,
    "escalating onto a closed account would create a ticket nobody can open",
  );
});

test("escalating to a ticket attributes the transcript to the customer, not an admin", async () => {
  const client = await prisma.user.findUniqueOrThrow({
    where: { id: base.clientUser.id },
    select: { email: true },
  });
  const convo = await seedConversation(client.email, "Caleb");
  const account = await accountFor(client.email);
  assert.ok(account);

  const reference = `TKT-${randomUUID().slice(0, 5)}`;
  const now = new Date();

  const ticketId = await prisma.$transaction(async (tx) => {
    const ticket = await tx.supportTicket.create({
      data: {
        reference,
        subject: "My order never arrived.",
        status: SupportTicketStatus.OPEN,
        requesterUserId: account.id,
        requesterOrgId: account.organizationId,
        openedAt: now,
      },
      select: { id: true },
    });
    const thread = await tx.thread.create({
      data: {
        contextType: ThreadContextType.SUPPORT,
        contextId: ticket.id,
        lastMessageAt: now,
      },
      select: { id: true },
    });
    await tx.message.create({
      data: {
        threadId: thread.id,
        authorUserId: account.id,
        body: "**Caleb:** My order never arrived.",
      },
    });
    await tx.guestConversation.update({
      where: { id: convo.id },
      data: {
        status: GuestConversationStatus.ESCALATED,
        escalatedTicketId: ticket.id,
        escalatedAt: now,
        linkedUserId: account.id,
      },
    });
    return ticket.id;
  });

  const ticket = await prisma.supportTicket.findUniqueOrThrow({
    where: { id: ticketId },
    select: { requesterUserId: true, status: true },
  });
  assert.equal(
    ticket.requesterUserId,
    base.clientUser.id,
    "the requester is the customer — an admin must never be recorded as raising it",
  );
  assert.notEqual(ticket.requesterUserId, base.adminUser.id);

  const after = await prisma.guestConversation.findUniqueOrThrow({
    where: { id: convo.id },
    select: { status: true, escalatedTicketId: true, linkedUserId: true },
  });
  assert.equal(after.status, GuestConversationStatus.ESCALATED);
  assert.equal(after.escalatedTicketId, ticketId);
  assert.equal(after.linkedUserId, base.clientUser.id);

  // The visitor's own channel must survive: their browser only knows the
  // token, so cutting the widget off would strand them mid-conversation.
  const stillReadable = await prisma.guestMessage.count({
    where: { conversationId: convo.id },
  });
  assert.equal(stillReadable, 2);
});

test("a deleted ticket nulls the link instead of taking the transcript with it", async () => {
  const client = await prisma.user.findUniqueOrThrow({
    where: { id: base.clientUser.id },
    select: { email: true },
  });
  const convo = await seedConversation(client.email);

  const ticket = await prisma.supportTicket.create({
    data: {
      reference: `TKT-${randomUUID().slice(0, 5)}`,
      subject: "Doomed",
      requesterUserId: base.clientUser.id,
      requesterOrgId: base.clientOrg.id,
    },
    select: { id: true },
  });
  await prisma.guestConversation.update({
    where: { id: convo.id },
    data: { escalatedTicketId: ticket.id },
  });

  await prisma.supportTicket.delete({ where: { id: ticket.id } });

  const after = await prisma.guestConversation.findUniqueOrThrow({
    where: { id: convo.id },
    select: { escalatedTicketId: true, messages: { select: { id: true } } },
  });
  assert.equal(after.escalatedTicketId, null);
  assert.equal(after.messages.length, 2, "the visitor transcript outlives the ticket");
});

test("a dispute records the buyer as opener and refuses another customer's order", async () => {
  const client = await prisma.user.findUniqueOrThrow({
    where: { id: base.clientUser.id },
    select: { email: true },
  });
  const convo = await seedConversation(client.email);
  const account = await accountFor(client.email);
  assert.ok(account);

  const { orderId } = await seedOrder(base);

  // The ownership guard: the order must belong to the matched customer.
  const owned = await prisma.order.findFirst({
    where: { id: orderId, clientOrgId: account.organizationId, deletedAt: null },
    select: { id: true },
  });
  assert.ok(owned, "the customer's own order resolves");

  const otherOrg = await prisma.organization.create({
    data: {
      type: "CLIENT",
      legalName: "Someone Else SARL",
      displayName: "Someone Else",
      country: "FR",
      city: "Lyon",
      address: "2 rue Ailleurs",
    },
    select: { id: true },
  });
  const foreign = await prisma.order.findFirst({
    where: { id: orderId, clientOrgId: otherOrg.id, deletedAt: null },
    select: { id: true },
  });
  assert.equal(
    foreign,
    null,
    "a mis-typed id must not open a dispute on a stranger's order",
  );

  const dispute = await prisma.dispute.create({
    data: {
      reference: `DSP-${randomUUID().slice(0, 5)}`,
      orderId,
      openedByUserId: account.id,
      buyerStatement: "**Visitor:** My order never arrived.",
    },
    select: { id: true, openedByUserId: true },
  });
  assert.equal(
    dispute.openedByUserId,
    base.clientUser.id,
    "the buyer raised it — recording the admin would misstate who is disputing",
  );

  await prisma.guestConversation.update({
    where: { id: convo.id },
    data: {
      status: GuestConversationStatus.ESCALATED,
      escalatedDisputeId: dispute.id,
    },
  });

  // A second dispute on the same order must be refused by the same guard the
  // action applies before creating one.
  const alreadyOpen = await prisma.dispute.findFirst({
    where: { orderId, status: { not: "RESOLVED" } },
    select: { id: true },
  });
  assert.equal(alreadyOpen?.id, dispute.id);
});

test("filters select by team, by unrouted, and by what was actually said", async () => {
  const a = await seedConversation("a@example.com", "Alice");
  await prisma.guestConversation.update({
    where: { id: a.id },
    data: { team: GuestChatTeam.BILLING },
  });
  await seedConversation("b@example.com", "Bob"); // stays unrouted

  const billing = await prisma.guestConversation.count({
    where: { team: GuestChatTeam.BILLING },
  });
  assert.equal(billing, 1);

  const unrouted = await prisma.guestConversation.count({ where: { team: null } });
  assert.equal(unrouted, 1, "unrouted is the queue that matters most");

  // Searching message bodies, not just names — an operator remembers the
  // problem, not who reported it.
  const byBody = await prisma.guestConversation.count({
    where: {
      messages: { some: { body: { contains: "never arrived", mode: "insensitive" } } },
    },
  });
  assert.equal(byBody, 2);

  const byName = await prisma.guestConversation.count({
    where: { name: { contains: "ali", mode: "insensitive" } },
  });
  assert.equal(byName, 1);
});
