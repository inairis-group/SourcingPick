"use server";

import { createHash, randomBytes } from "node:crypto";
import { GuestChatTeam, GuestConversationStatus, NotificationType, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { headers } from "next/headers";
import {
  appLocaleFor,
  defaultLocale,
  isLocale,
  type Locale
} from "@/lib/i18n/config";
import { pick, type Localized } from "@/lib/i18n/localized";

/**
 * Public live chat for logged-out visitors.
 *
 * Every export is an async server action — this file is covered by
 * `scripts/check-use-server.ts`.
 *
 * These are the only unauthenticated write paths in the app apart from signup,
 * so they are deliberately narrow: a visitor can create a conversation, append
 * to one they hold the token for, and read that same one. Nothing else. The
 * token is the whole credential, so it is generated with `randomBytes` and
 * never rendered anywhere a third party could see it.
 */

/**
 * Abuse guards. This is an unauthenticated write endpoint, so both a
 * per-email and a per-IP limit apply — the email cap alone is defeated by
 * typing a different address, and the IP cap alone by a shared NAT.
 */
const MAX_OPEN_PER_EMAIL = 3;
const MAX_PER_IP_PER_HOUR = 5;

/**
 * Salted SHA-256 of the client IP. Never stored raw: a public contact form
 * needs a rate-limit key, not a record of who visited. Salting with
 * AUTH_SECRET stops the hash being reversible via a rainbow table of the
 * (small) IPv4 space.
 */
async function clientIpHash(): Promise<string | null> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim();
  if (!ip) return null;
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? "unsalted"}:${ip}`)
    .digest("hex");
}

/**
 * Locale the visitor is browsing in, read from the header the proxy sets.
 * Same helper the sourcing and marketplace actions keep privately; there is no
 * shared export to import.
 */
async function currentLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}

export async function startGuestConversation(_prev: unknown, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const body = String(formData.get("message") ?? "").trim();

  if (name.length < 2) return { ok: false as const, error: "missing_name" };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false as const, error: "invalid_email" };
  }
  if (body.length < 2) return { ok: false as const, error: "missing_message" };
  if (body.length > 4000) return { ok: false as const, error: "message_too_long" };

  const open = await prisma.guestConversation.count({
    where: { email, handledAt: null }
  });
  if (open >= MAX_OPEN_PER_EMAIL) {
    return { ok: false as const, error: "too_many_open" };
  }

  const ipHash = await clientIpHash();
  if (ipHash) {
    const recent = await prisma.guestConversation.count({
      where: {
        ipHash,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
      }
    });
    if (recent >= MAX_PER_IP_PER_HOUR) {
      return { ok: false as const, error: "rate_limited" };
    }
  }

  const locale = await currentLocale();
  const conversation = await prisma.guestConversation.create({
    data: {
      token: randomBytes(24).toString("base64url"),
      name,
      email,
      // Same twelve-value column as User.locale — see appLocaleFor.
      locale: appLocaleFor(locale),
      ipHash,
      messages: { create: { body, fromTeam: false } }
    },
    select: { id: true, token: true }
  });

  // The team is notified in-app and by email. Deliberately every admin rather
  // than one named person: the visitor is told they're talking to "the team",
  // and routing to a single inbox would make that untrue the moment they're away.
  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN, deletedAt: null },
    select: { id: true }
  });
  await emitNotificationToMany(
    admins.map((u) => u.id),
    {
      type: NotificationType.SYSTEM,
      vars: { title: `Live chat — ${name}` },
      contextType: "GuestConversation",
      contextId: conversation.id
    },
  );

  return { ok: true as const, token: conversation.token };
}

export async function postGuestMessage(_prev: unknown, formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const body = String(formData.get("message") ?? "").trim();
  if (!token) return { ok: false as const, error: "missing_token" };
  if (body.length < 1) return { ok: false as const, error: "missing_message" };
  if (body.length > 4000) return { ok: false as const, error: "message_too_long" };

  const conversation = await prisma.guestConversation.findUnique({
    where: { token },
    select: { id: true, name: true }
  });
  if (!conversation) return { ok: false as const, error: "not_found" };

  await prisma.guestMessage.create({
    data: { conversationId: conversation.id, body, fromTeam: false }
  });
  // A visitor reply re-opens the conversation for the team.
  await prisma.guestConversation.update({
    where: { id: conversation.id },
    data: { handledAt: null }
  });

  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN, deletedAt: null },
    select: { id: true }
  });
  await emitNotificationToMany(
    admins.map((u) => u.id),
    {
      type: NotificationType.SYSTEM,
      vars: { title: `Live chat — ${conversation.name}` },
      contextType: "GuestConversation",
      contextId: conversation.id
    },
  );

  return { ok: true as const };
}

/** Visitor-side history. Scoped by token; returns nothing without a valid one. */
export async function getGuestConversation(token: string) {
  if (!token) return null;
  return prisma.guestConversation.findUnique({
    where: { token },
    select: {
      name: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, body: true, fromTeam: true, createdAt: true }
      }
    }
  });
}

/** Team reply. Authenticated — admins only. */
const REPLY_SUBJECT: Localized<string> = {
  fr: "Réponse de l'équipe SourcingPick",
  en: "A reply from the SourcingPick team",
  zh: "SourcingPick 团队回复",
  ar: "رد من فريق SourcingPick"
};

export async function replyToGuest(_prev: unknown, formData: FormData) {
  const { requireRole } = await import("@/lib/permissions/guards");
  const admin = await requireRole(Role.ADMIN);

  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("message") ?? "").trim();
  if (!conversationId) return { ok: false as const, error: "not_found" };
  if (!body) return { ok: false as const, error: "missing_message" };

  const conversation = await prisma.guestConversation.findUnique({
    where: { id: conversationId },
    select: { id: true, name: true, email: true, locale: true }
  });
  if (!conversation) return { ok: false as const, error: "not_found" };

  await prisma.guestMessage.create({
    data: { conversationId: conversation.id, body, fromTeam: true }
  });
  await prisma.guestConversation.update({
    where: { id: conversation.id },
    data: { handledAt: new Date() }
  });

  /**
   * Deliver the same answer to their inbox.
   *
   * A widget reply only reaches someone still sitting on the page, and most
   * people ask a question and leave — so a chat-only reply is written into a
   * box nobody comes back to. They handed us an email address at the start of
   * the conversation for exactly this.
   *
   * Fire-and-forget: the transcript is already written and is authoritative;
   * an SMTP outage must not cost the operator their message.
   */
  const { sendEmail } = await import("@/lib/email/send");
  const { default: PublicReplyEmail } = await import("@/lib/email/templates/public-reply");
  const { inboundReplyAddress } = await import("@/lib/email/inbound-address");
  const replyTo = inboundReplyAddress({ kind: "g", id: conversation.id });
  void sendEmail({
    to: conversation.email,
    subject: pick(REPLY_SUBJECT, conversation.locale),
    // Null when inbound email isn't configured, in which case we fall back to
    // EMAIL_REPLY_TO rather than advertising an address that routes nowhere.
    ...(replyTo ? { replyTo } : {}),
    react: PublicReplyEmail({
      visitorName: conversation.name,
      body,
      locale: conversation.locale,
      canReplyByEmail: replyTo !== null
    })
  }).catch(() => {
    /* the in-widget transcript still carries the reply */
  });

  const { revalidatePath } = await import("next/cache");
  void admin;
  revalidatePath("/[lang]/admin/support", "page");
  return { ok: true as const };
}

/**
 * Admin queue. Unhandled conversations first, then most recently active.
 * Returns full transcripts — these are short, and the team needs the context
 * to reply without clicking through.
 */
export async function listGuestConversations(filters?: {
  team?: string;
  status?: string;
  query?: string;
}) {
  const { requireRole: guard } = await import("@/lib/permissions/guards");
  await guard(Role.ADMIN);

  const team = (Object.values(GuestChatTeam) as string[]).includes(filters?.team ?? "")
    ? (filters?.team as GuestChatTeam)
    : undefined;
  // "unrouted" is the queue that matters most — nobody owns those yet.
  const unrouted = filters?.team === "NONE";
  const status = (Object.values(GuestConversationStatus) as string[]).includes(
    filters?.status ?? "",
  )
    ? (filters?.status as GuestConversationStatus)
    : undefined;
  const q = (filters?.query ?? "").trim().slice(0, 100);

  return prisma.guestConversation.findMany({
    where: {
      ...(team ? { team } : {}),
      ...(unrouted ? { team: null } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              // Searching what was actually said matters more than searching
              // who said it — an operator remembers the problem, not the name.
              { messages: { some: { body: { contains: q, mode: "insensitive" as const } } } },
            ]
          }
        : {})
    },
    orderBy: [{ handledAt: "asc" }, { updatedAt: "desc" }],
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      locale: true,
      handledAt: true,
      updatedAt: true,
      team: true,
      status: true,
      escalatedTicketId: true,
      escalatedDisputeId: true,
      escalatedTicket: { select: { reference: true } },
      escalatedDispute: { select: { reference: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, body: true, fromTeam: true, createdAt: true }
      }
    }
  });
}
