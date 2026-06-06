import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  Role,
  SupportTicketStatus,
  ThreadContextType,
} from "@prisma/client";
import {
  prisma,
  resetDb,
  seedBaseFixtures,
  type BaseFixtures,
} from "./_helpers.ts";
import { onSupportMessageSent } from "../../src/lib/support/lifecycle.ts";

// Support ticketing — the partner ask: status auto-flips based on who
// replies. Admin engagement → OPEN; requester reply on a closed ticket
// → reopens to OPEN. This test pins those invariants against the real
// `onSupportMessageSent` hook so any regression surfaces here.

let base: BaseFixtures;

before(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

beforeEach(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

async function seedTicket(
  status: SupportTicketStatus = SupportTicketStatus.PENDING,
) {
  const ticket = await prisma.supportTicket.create({
    data: {
      reference: `TKT-${randomUUID().slice(0, 5)}`,
      subject: "Integration: I need help",
      status,
      requesterUserId: base.clientUser.id,
      requesterOrgId: base.clientOrg.id,
    },
    select: { id: true },
  });
  // The lifecycle hook reads via the Thread → SupportTicket join, so we
  // need a Thread + ThreadParticipant rows seeded too.
  const thread = await prisma.thread.create({
    data: {
      contextType: ThreadContextType.SUPPORT,
      contextId: ticket.id,
      participants: {
        createMany: {
          data: [
            { userId: base.clientUser.id },
            { userId: base.adminUser.id },
          ],
        },
      },
    },
    select: { id: true },
  });
  return { ticketId: ticket.id, threadId: thread.id };
}

test("admin reply on a PENDING ticket flips it to OPEN", async () => {
  const { ticketId, threadId } = await seedTicket(SupportTicketStatus.PENDING);

  await onSupportMessageSent({
    threadId,
    authorUserId: base.adminUser.id,
    authorRole: Role.ADMIN,
  });

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { status: true, openedAt: true },
  });
  assert.equal(ticket?.status, SupportTicketStatus.OPEN);
  assert.notEqual(ticket?.openedAt, null);
});

test("requester reply on a RESOLVED ticket reopens it (back to OPEN, clears resolution)", async () => {
  const { ticketId, threadId } = await seedTicket(
    SupportTicketStatus.RESOLVED,
  );
  // Stamp the resolution fields the way the admin action would.
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      resolvedAt: new Date(),
      resolvedById: base.adminUser.id,
    },
  });

  await onSupportMessageSent({
    threadId,
    authorUserId: base.clientUser.id,
    authorRole: Role.CLIENT,
  });

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { status: true, resolvedAt: true, resolvedById: true },
  });
  assert.equal(ticket?.status, SupportTicketStatus.OPEN);
  assert.equal(ticket?.resolvedAt, null);
  assert.equal(ticket?.resolvedById, null);
});

test("non-admin reply on a PENDING ticket does NOT flip it", async () => {
  // Edge case — the requester chats with themselves while the ticket is
  // still PENDING. Status must stay PENDING until an admin actually
  // engages so the admin queue accurately reflects "needs attention".
  const { ticketId, threadId } = await seedTicket(SupportTicketStatus.PENDING);

  await onSupportMessageSent({
    threadId,
    authorUserId: base.clientUser.id,
    authorRole: Role.CLIENT,
  });

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { status: true },
  });
  assert.equal(ticket?.status, SupportTicketStatus.PENDING);
});

test("admin reply on a non-PENDING ticket is a no-op", async () => {
  // Once OPEN, admin replies just continue the conversation.
  const { ticketId, threadId } = await seedTicket(SupportTicketStatus.OPEN);
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { openedAt: new Date(Date.now() - 60_000) },
  });

  const before = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { openedAt: true },
  });

  await onSupportMessageSent({
    threadId,
    authorUserId: base.adminUser.id,
    authorRole: Role.ADMIN,
  });

  const after = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { status: true, openedAt: true },
  });
  assert.equal(after?.status, SupportTicketStatus.OPEN);
  // openedAt should not be re-stamped — partial-update on the hook only
  // touches the row when the status actually changes.
  assert.equal(after?.openedAt?.getTime(), before?.openedAt?.getTime());
});

test("non-SUPPORT threads are ignored by the lifecycle hook", async () => {
  // A thread whose contextType is anything other than SUPPORT (here
  // KYC — closest to "synthetic test target" since it doesn't require
  // a related Order / Quote tree). The hook should bail out cleanly
  // without touching any SupportTicket rows.
  const thread = await prisma.thread.create({
    data: {
      contextType: ThreadContextType.KYC,
      contextId: base.factoryOrg.id,
    },
    select: { id: true },
  });

  await onSupportMessageSent({
    threadId: thread.id,
    authorUserId: base.adminUser.id,
    authorRole: Role.ADMIN,
  });

  const tickets = await prisma.supportTicket.findMany();
  assert.equal(tickets.length, 0, "no support tickets should exist or be touched");
});
