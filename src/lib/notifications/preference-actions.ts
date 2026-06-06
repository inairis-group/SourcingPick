"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EmailDigestMode } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";

const ModeSchema = z.object({
  mode: z.nativeEnum(EmailDigestMode),
});

export type PreferenceResult = { ok: true } | { ok: false; error: string };

/**
 * Update the caller's `emailDigestMode`. Security events (password
 * reset, OTP) ignore this — they always email. Effect kicks in for
 * the very next notification emit; the next digest cron run flushes
 * any already-queued in-app rows.
 */
export async function updateEmailDigestModeAction(input: {
  mode: EmailDigestMode;
}): Promise<PreferenceResult> {
  const user = await requireAuth();
  const parsed = ModeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid mode." };

  await prisma.user.update({
    where: { id: user.id },
    data: { emailDigestMode: parsed.data.mode },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "user.email_digest_mode_updated",
    targetType: "User",
    targetId: user.id,
    payload: { mode: parsed.data.mode },
  });

  revalidatePath("/[lang]/settings", "page");
  return { ok: true };
}
