import "server-only";
import { Role, SubRole, ThreadContextType } from "@prisma/client";
import { prisma } from "@/lib/db/client";

export type ResolvedParticipant = {
  userId: string;
  role: Role;
  /** True for the context's "primary" actor — client owner on a REQUEST, factory owner on a QUOTE, etc. */
  isPrimary?: boolean;
};

/**
 * Resolve the user IDs that should be in a thread for a given context.
 *
 * Rules (v1):
 *   REQUEST → client org owners + assigned agent (if any) + admins (lazy: only when admin opens)
 *   QUOTE   → REQUEST set + factory org owners
 *   ORDER   → QUOTE set
 *   KYC     → factory org owners + admins
 *   CERT    → factory org owners + admins
 *   DISPUTE → all parties of the order + admins
 *
 * Admins are NOT auto-added — they join on first read (lazy). This avoids
 * spamming every admin with every thread and matches the support flow in
 * spec §6.2: admins surface threads via the queue, not their inbox.
 */
export async function resolveParticipantsFor(
  contextType: ThreadContextType,
  contextId: string,
): Promise<ResolvedParticipant[]> {
  switch (contextType) {
    case ThreadContextType.REQUEST: {
      const req = await prisma.sourcingRequest.findUnique({
        where: { id: contextId },
        select: {
          clientOrgId: true,
          agentId: true,
          createdByUserId: true,
        },
      });
      if (!req) return [];
      const clientOwners = await ownerUserIdsForOrg(req.clientOrgId);
      const out: ResolvedParticipant[] = [];
      // Client primary contact is the user who created the request.
      for (const id of clientOwners) {
        out.push({
          userId: id,
          role: Role.CLIENT,
          isPrimary: id === req.createdByUserId,
        });
      }
      if (req.agentId) {
        out.push({ userId: req.agentId, role: Role.AGENT, isPrimary: true });
      }
      return dedup(out);
    }

    case ThreadContextType.TENDER: {
      const invite = await prisma.tenderInvitation.findUnique({
        where: { id: contextId },
        select: {
          factoryOrgId: true,
          request: { select: { agentId: true } },
        },
      });
      if (!invite) return [];
      const factoryOwners = await ownerUserIdsForOrg(invite.factoryOrgId);
      const out: ResolvedParticipant[] = factoryOwners.map((userId) => ({
        userId,
        role: Role.FACTORY,
        isPrimary: true,
      }));
      if (invite.request.agentId) {
        out.push({
          userId: invite.request.agentId,
          role: Role.AGENT,
          isPrimary: true,
        });
      }
      return dedup(out);
    }

    case ThreadContextType.QUOTE: {
      const quote = await prisma.quote.findUnique({
        where: { id: contextId },
        select: { requestId: true, factoryOrgId: true },
      });
      if (!quote) return [];
      const base = await resolveParticipantsFor(
        ThreadContextType.REQUEST,
        quote.requestId,
      );
      const factoryOwners = await ownerUserIdsForOrg(quote.factoryOrgId);
      return dedup([
        ...base,
        ...factoryOwners.map((userId) => ({
          userId,
          role: Role.FACTORY,
          isPrimary: true,
        })),
      ]);
    }

    case ThreadContextType.ORDER: {
      // Marketplace orders have no assigned agent (agentId is null on the
      // synthetic SourcingRequest). For those, the thread is the buyer's
      // support channel with the platform — admins join lazily, factory is
      // not added. For agent-led (sourcing flow) orders, all parties get
      // pulled in via the QUOTE context resolver as before.
      const order = await prisma.order.findUnique({
        where: { id: contextId },
        select: {
          quoteId: true,
          clientOrgId: true,
          agentId: true,
          request: { select: { createdByUserId: true } },
        },
      });
      if (!order) return [];
      if (!order.agentId) {
        const clientOwners = await ownerUserIdsForOrg(order.clientOrgId);
        return dedup(
          clientOwners.map((userId) => ({
            userId,
            role: Role.CLIENT,
            isPrimary: userId === order.request.createdByUserId,
          })),
        );
      }
      return resolveParticipantsFor(ThreadContextType.QUOTE, order.quoteId);
    }

    case ThreadContextType.KYC:
    case ThreadContextType.CERT: {
      const factoryOwners = await ownerUserIdsForOrg(contextId);
      return factoryOwners.map((userId) => ({
        userId,
        role: Role.FACTORY,
        isPrimary: true,
      }));
    }

    case ThreadContextType.DISPUTE:
      // Disputes are scoped to an order id; reuse the order's set.
      return resolveParticipantsFor(ThreadContextType.ORDER, contextId);
  }
}

/**
 * Check whether a user has read access to a thread context (without joining
 * yet). Used to authorise the "open thread" action that lazy-creates rows.
 */
export async function canAccessThreadContext(
  contextType: ThreadContextType,
  contextId: string,
  user: { id: string; role: Role; organizationId: string },
): Promise<boolean> {
  if (user.role === Role.ADMIN) return true;

  switch (contextType) {
    case ThreadContextType.REQUEST: {
      const req = await prisma.sourcingRequest.findUnique({
        where: { id: contextId },
        select: { clientOrgId: true, agentId: true },
      });
      if (!req) return false;
      if (user.role === Role.CLIENT) return req.clientOrgId === user.organizationId;
      if (user.role === Role.AGENT) return req.agentId === user.id;
      return false;
    }
    case ThreadContextType.TENDER: {
      const invite = await prisma.tenderInvitation.findUnique({
        where: { id: contextId },
        select: {
          factoryOrgId: true,
          request: { select: { agentId: true } },
        },
      });
      if (!invite) return false;
      if (user.role === Role.AGENT) return invite.request.agentId === user.id;
      if (user.role === Role.FACTORY)
        return invite.factoryOrgId === user.organizationId;
      return false;
    }
    case ThreadContextType.QUOTE: {
      const quote = await prisma.quote.findUnique({
        where: { id: contextId },
        select: {
          factoryOrgId: true,
          agentId: true,
          request: { select: { clientOrgId: true } },
        },
      });
      if (!quote) return false;
      if (user.role === Role.CLIENT)
        return quote.request.clientOrgId === user.organizationId;
      if (user.role === Role.FACTORY)
        return quote.factoryOrgId === user.organizationId;
      if (user.role === Role.AGENT) return quote.agentId === user.id;
      return false;
    }
    case ThreadContextType.ORDER: {
      const order = await prisma.order.findUnique({
        where: { id: contextId },
        select: { clientOrgId: true, factoryOrgId: true, agentId: true },
      });
      if (!order) return false;
      // Marketplace orders (no agent) → factory has no access; client talks
      // to admin support only. Agent-led orders → factory + client + agent
      // all have access as before.
      const isMarketplaceOrder = !order.agentId;
      if (user.role === Role.CLIENT)
        return order.clientOrgId === user.organizationId;
      if (user.role === Role.FACTORY)
        return (
          !isMarketplaceOrder && order.factoryOrgId === user.organizationId
        );
      if (user.role === Role.AGENT) return order.agentId === user.id;
      return false;
    }
    case ThreadContextType.KYC:
    case ThreadContextType.CERT:
      return user.role === Role.FACTORY && user.organizationId === contextId;
    case ThreadContextType.DISPUTE:
      return canAccessThreadContext(
        ThreadContextType.ORDER,
        contextId,
        user,
      );
  }
}

async function ownerUserIdsForOrg(orgId: string): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { organizationId: orgId, deletedAt: null },
    select: { id: true, subRole: true },
  });
  // Owners first, then members. Accountants are out of message threads by default.
  const ordered = users
    .filter((u) => u.subRole !== SubRole.ACCOUNTANT)
    .sort((a, b) =>
      a.subRole === SubRole.OWNER ? -1 : b.subRole === SubRole.OWNER ? 1 : 0,
    );
  return ordered.map((u) => u.id);
}

function dedup(list: ResolvedParticipant[]): ResolvedParticipant[] {
  const seen = new Map<string, ResolvedParticipant>();
  for (const p of list) {
    const existing = seen.get(p.userId);
    if (!existing || (p.isPrimary && !existing.isPrimary)) seen.set(p.userId, p);
  }
  return Array.from(seen.values());
}
