import "server-only";
import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { sendEmail } from "@/lib/email/send";
import NotificationEmail from "@/lib/email/templates/notification";
import { EMAIL_TYPES, renderNotification, type NotificationVars } from "./copy";

export type EmitInput = {
  recipientUserId: string;
  type: NotificationType;
  vars?: NotificationVars;
  /** Optional polymorphic anchor — surfaced as deep-link target. */
  contextType?: string;
  contextId?: string;
  /** Override the locale used for copy; defaults to the recipient's User.locale. */
  localeOverride?: "fr" | "en" | "zh";
  /** Override deep-link URL (otherwise built from contextType+contextId). */
  ctaUrl?: string;
  ctaLabel?: string;
};

/**
 * Write a Notification row and (optionally) deliver an email. v1 keeps the
 * email side fire-and-forget — if SMTP burps, the in-app notification is
 * still authoritative and the recipient will see it on next page load.
 *
 * Caller is expected to compose `vars` with whatever the template needs;
 * the copy module ignores unknown keys.
 */
export async function emitNotification(input: EmitInput): Promise<void> {
  const recipient = await prisma.user.findUnique({
    where: { id: input.recipientUserId },
    select: { id: true, email: true, locale: true },
  });
  if (!recipient) return;

  const locale = input.localeOverride ?? recipient.locale;
  const copy = renderNotification(input.type, locale, input.vars ?? {});

  const wantsEmail = EMAIL_TYPES.has(input.type);

  await prisma.notification.create({
    data: {
      recipientUserId: recipient.id,
      type: input.type,
      title: copy.title,
      description: copy.description || null,
      contextType: input.contextType ?? null,
      contextId: input.contextId ?? null,
      deliveredInapp: true,
      deliveredEmail: wantsEmail,
    },
  });

  if (wantsEmail) {
    sendEmail({
      to: recipient.email,
      subject: copy.title,
      react: NotificationEmail({
        title: copy.title,
        description: copy.description,
        ctaLabel: input.ctaLabel,
        ctaUrl: input.ctaUrl,
        locale,
      }),
    }).catch(() => {
      // In-app row is authoritative; skip retry logic for v1.
    });
  }
}

/**
 * Fan-out helper — emit the same notification to many recipients in one go.
 * Each call is awaited so we don't race the email transport — fine for the
 * low-fan-out v1 events (1–10 recipients).
 */
export async function emitNotificationToMany(
  recipientUserIds: string[],
  input: Omit<EmitInput, "recipientUserId">,
): Promise<void> {
  await Promise.all(
    recipientUserIds.map((id) =>
      emitNotification({ ...input, recipientUserId: id }),
    ),
  );
}
