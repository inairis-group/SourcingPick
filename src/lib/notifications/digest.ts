import "server-only";
import { EmailDigestMode } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { sendEmail } from "@/lib/email/send";
import DigestEmail from "@/lib/email/templates/digest";
import { renderNotification, EMAIL_TYPES } from "./copy";
import type { Locale } from "@/lib/i18n/config";

/**
 * Daily digest dispatcher.
 *
 * For every user on `emailDigestMode = DAILY` who has at least one
 * non-digested, email-relevant notification in the last 24 h, this
 * sends a single summary email and marks those rows `digestedAt = now`.
 *
 * Called by /api/cron/notifications-digest at ~07:00 UTC. Idempotent
 * within the day: rerunning is safe — already-digested rows are
 * skipped by the WHERE clause.
 *
 * Returns counts for the cron's response body so admins can graph it.
 */
export async function dispatchDailyDigests(): Promise<{
  usersConsidered: number;
  digestsSent: number;
  rowsFlushed: number;
}> {
  const candidates = await prisma.user.findMany({
    where: {
      emailDigestMode: EmailDigestMode.DAILY,
      deletedAt: null,
      notifications: {
        some: {
          digestedAt: null,
          deliveredEmail: false,
        },
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      locale: true,
    },
  });

  let digestsSent = 0;
  let rowsFlushed = 0;

  for (const u of candidates) {
    // Pull every undigested, never-emailed row for this user.
    // We don't filter by createdAt — if the digest cron missed yesterday
    // for some reason, today's batch picks up the backlog.
    const rows = await prisma.notification.findMany({
      where: {
        recipientUserId: u.id,
        digestedAt: null,
        deliveredEmail: false,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        createdAt: true,
      },
    });
    // Skip rows whose NotificationType doesn't get email at all —
    // marking them digested anyway so they don't re-queue.
    const emailable = rows.filter((r) => EMAIL_TYPES.has(r.type));
    if (emailable.length === 0) {
      if (rows.length > 0) {
        await prisma.notification.updateMany({
          where: { id: { in: rows.map((r) => r.id) } },
          data: { digestedAt: new Date() },
        });
      }
      continue;
    }

    const items = emailable.map((r) => ({
      title: r.title,
      description: r.description,
      createdAtLabel: formatStamp(r.createdAt, u.locale),
    }));
    const localeKey = u.locale as Locale;
    const subject = renderNotification(
      // Reuse SYSTEM rendering for the subject line; the actual rows
      // already carry their localised titles. We just need a stable
      // subject in the recipient's language.
      "SYSTEM",
      localeKey,
      { systemKey: undefined, title: subjectFor(emailable.length, localeKey) },
    ).title;

    try {
      await sendEmail({
        to: u.email,
        subject,
        react: DigestEmail({
          recipientName: u.firstName,
          items,
          locale: localeKey,
        }),
      });
      digestsSent++;
    } catch {
      // Skip marking digestedAt if the email failed — they'll be retried tomorrow.
      continue;
    }

    await prisma.notification.updateMany({
      where: { id: { in: rows.map((r) => r.id) } },
      data: { digestedAt: new Date() },
    });
    rowsFlushed += rows.length;
  }

  return {
    usersConsidered: candidates.length,
    digestsSent,
    rowsFlushed,
  };
}

function subjectFor(n: number, locale: Locale): string {
  switch (locale) {
    case "fr":
      return n === 1
        ? "1 nouvelle notification SourcingPick"
        : `${n} nouvelles notifications SourcingPick`;
    case "zh":
      return `${n} 条 SourcingPick 新通知`;
    case "ar":
      return n === 1
        ? "إشعار جديد واحد من SourcingPick"
        : `${n} إشعارات جديدة من SourcingPick`;
    case "en":
    default:
      return n === 1
        ? "1 new SourcingPick notification"
        : `${n} new SourcingPick notifications`;
  }
}

function formatStamp(d: Date, locale: string): string {
  // Match the in-app medium-date format. Keep it locale-aware but
  // independent of the per-locale formatters helper (we don't want to
  // pull a heavy module into the email path).
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}
