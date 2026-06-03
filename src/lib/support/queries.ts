import "server-only";
import { Role, SupportTopicKind } from "@prisma/client";
import { prisma } from "@/lib/db/client";

/**
 * Resolved view of a SupportTicket.topicKind + topicId pair. Used to
 * render a small "topic" card on the ticket page + a row badge in the
 * admin queue. `missing: true` means the upstream row was soft-deleted
 * after the link was set — we keep the badge so admins know what was
 * referenced, but mark it dim.
 */
export type SupportTopicView =
  | {
      kind: SupportTopicKind;
      id: string;
      title: string;
      subtitle?: string | null;
      href: string | null;
      missing?: false;
    }
  | {
      kind: SupportTopicKind;
      id: string;
      title: string;
      missing: true;
      href: null;
    };

/**
 * Resolve a topic for display. Returns null when the ticket has no topic
 * set. Per-role href hints route the admin / requester to the natural
 * page for that entity.
 */
export async function resolveSupportTopic(
  kind: SupportTopicKind | null,
  topicId: string | null,
  lang: string,
  role: Role,
): Promise<SupportTopicView | null> {
  if (!kind || !topicId) return null;
  const rolePath = role.toLowerCase();

  switch (kind) {
    case SupportTopicKind.ORDER: {
      const o = await prisma.order.findUnique({
        where: { id: topicId },
        select: {
          id: true,
          reference: true,
          request: { select: { title: true } },
          clientOrg: { select: { displayName: true } },
        },
      });
      if (!o) {
        return { kind, id: topicId, title: topicId, missing: true, href: null };
      }
      return {
        kind,
        id: o.id,
        title: o.request.title,
        subtitle: `${o.reference} · ${o.clientOrg.displayName}`,
        href:
          role === Role.ADMIN || role === Role.CLIENT || role === Role.FACTORY
            ? `/${lang}/${rolePath === "admin" ? "client" : rolePath}/orders/${o.id}`
            : `/${lang}/agent/requests`,
      };
    }
    case SupportTopicKind.SOURCING_REQUEST: {
      const r = await prisma.sourcingRequest.findUnique({
        where: { id: topicId },
        select: {
          id: true,
          reference: true,
          title: true,
          clientOrg: { select: { displayName: true } },
        },
      });
      if (!r) {
        return { kind, id: topicId, title: topicId, missing: true, href: null };
      }
      return {
        kind,
        id: r.id,
        title: r.title,
        subtitle: `${r.reference} · ${r.clientOrg.displayName}`,
        href:
          role === Role.CLIENT
            ? `/${lang}/client/requests/${r.id}`
            : role === Role.AGENT
              ? `/${lang}/agent/requests/${r.id}`
              : `/${lang}/admin/requests`,
      };
    }
    case SupportTopicKind.MARKETPLACE_PRODUCT: {
      const p = await prisma.marketplaceProduct.findUnique({
        where: { id: topicId },
        select: {
          id: true,
          reference: true,
          name: true,
          factoryOrg: { select: { displayName: true } },
        },
      });
      if (!p) {
        return { kind, id: topicId, title: topicId, missing: true, href: null };
      }
      return {
        kind,
        id: p.id,
        title: p.name,
        subtitle: `${p.reference} · ${p.factoryOrg.displayName}`,
        href: `/${lang}/marketplace/${p.id}`,
      };
    }
    case SupportTopicKind.AUCTION: {
      const a = await prisma.auction.findUnique({
        where: { id: topicId },
        select: {
          id: true,
          reference: true,
          title: true,
          factoryOrg: { select: { displayName: true } },
        },
      });
      if (!a) {
        return { kind, id: topicId, title: topicId, missing: true, href: null };
      }
      return {
        kind,
        id: a.id,
        title: a.title,
        subtitle: `${a.reference} · ${a.factoryOrg.displayName}`,
        href: `/${lang}/auctions/${a.id}`,
      };
    }
    case SupportTopicKind.CLIENT_ORG:
    case SupportTopicKind.FACTORY_ORG: {
      const o = await prisma.organization.findUnique({
        where: { id: topicId },
        select: {
          id: true,
          displayName: true,
          country: true,
          city: true,
          type: true,
        },
      });
      if (!o) {
        return { kind, id: topicId, title: topicId, missing: true, href: null };
      }
      return {
        kind,
        id: o.id,
        title: o.displayName,
        subtitle: `${o.city}, ${o.country}`,
        href:
          role === Role.ADMIN
            ? `/${lang}/admin/organizations`
            : null,
      };
    }
    case SupportTopicKind.AGENT: {
      const u = await prisma.user.findFirst({
        where: { id: topicId, deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
      if (!u) {
        return { kind, id: topicId, title: topicId, missing: true, href: null };
      }
      return {
        kind,
        id: u.id,
        title: `${u.firstName} ${u.lastName}`,
        subtitle: u.email,
        href: role === Role.ADMIN ? `/${lang}/admin/agents` : null,
      };
    }
  }
}
