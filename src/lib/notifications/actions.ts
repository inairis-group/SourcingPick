"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";

export type MarkNotifResult = { ok: true } | { ok: false; error: string };

export async function markNotificationReadAction(
  notificationId: string,
): Promise<MarkNotifResult> {
  const user = await requireAuth();
  const updated = await prisma.notification.updateMany({
    where: { id: notificationId, recipientUserId: user.id, read: false },
    data: { read: true, readAt: new Date() },
  });
  if (updated.count === 0) return { ok: true };
  revalidatePath("/[lang]", "layout");
  return { ok: true };
}

export async function markAllNotificationsReadAction(): Promise<MarkNotifResult> {
  const user = await requireAuth();
  await prisma.notification.updateMany({
    where: { recipientUserId: user.id, read: false },
    data: { read: true, readAt: new Date() },
  });
  revalidatePath("/[lang]", "layout");
  return { ok: true };
}
