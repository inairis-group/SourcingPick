"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PayoutAccountStatus, PayoutProvider, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { WiseError } from "./client";
import { createWiseRecipient, type RecipientInput } from "./recipients";

const RecipientSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("IBAN"),
    holderName: z.string().trim().min(2).max(140),
    currency: z.string().trim().length(3).toUpperCase(),
    iban: z
      .string()
      .trim()
      .min(15, "IBAN looks too short.")
      .max(34, "IBAN looks too long.")
      .regex(/^[A-Za-z]{2}[0-9]{2}/, "IBAN must start with a country code and two check digits."),
  }),
  z.object({
    type: z.literal("SWIFT"),
    holderName: z.string().trim().min(2).max(140),
    currency: z.string().trim().length(3).toUpperCase(),
    swiftCode: z
      .string()
      .trim()
      .min(8, "SWIFT/BIC must be 8 or 11 characters.")
      .max(11, "SWIFT/BIC must be 8 or 11 characters.")
      .regex(/^[A-Za-z0-9]+$/, "SWIFT/BIC contains invalid characters."),
    accountNumber: z.string().trim().min(4).max(40),
  }),
  z.object({
    type: z.literal("CHINESE_LOCAL"),
    holderName: z.string().trim().min(2).max(140),
    currency: z.literal("CNY"),
    bankCode: z.string().trim().min(2).max(20),
    accountNumber: z.string().trim().min(8).max(40),
  }),
]);

export type SetupRecipientState = {
  error?: string;
  ok?: boolean;
};

/**
 * Factory submits their bank details — we register them with Wise and
 * store the returned recipient id on the Organization. Wise's response
 * codes drive the error messages so the factory sees the actual reason
 * (bad IBAN, unsupported currency, etc.) instead of a generic failure.
 */
export async function setupWiseRecipientAction(
  _prev: SetupRecipientState,
  formData: FormData,
): Promise<SetupRecipientState> {
  const factory = await requireRole(Role.FACTORY);

  const parsed = RecipientSchema.safeParse({
    type: formData.get("type"),
    holderName: formData.get("holderName"),
    currency: formData.get("currency"),
    iban: formData.get("iban") ?? undefined,
    swiftCode: formData.get("swiftCode") ?? undefined,
    accountNumber: formData.get("accountNumber") ?? undefined,
    bankCode: formData.get("bankCode") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid bank details." };
  }

  let recipientId: string;
  try {
    recipientId = await createWiseRecipient(parsed.data as RecipientInput);
  } catch (e) {
    // Surface Wise's own message — it tells the factory exactly which
    // field Wise rejected (e.g. "IBAN check digits invalid").
    if (e instanceof WiseError) {
      const detail = readWiseErrorDetail(e.body) ?? e.message;
      return { error: detail.slice(0, 500) };
    }
    return { error: e instanceof Error ? e.message : "Unable to register bank details with Wise." };
  }

  await prisma.organization.update({
    where: { id: factory.organizationId },
    data: {
      wiseRecipientId: recipientId,
      payoutProvider: PayoutProvider.WISE,
      payoutAccountId: recipientId,
      payoutStatus: PayoutAccountStatus.ACTIVE,
      payoutOnboardedAt: new Date(),
    },
  });

  await writeAuditLog({
    actorUserId: factory.id,
    action: "wise.recipient_created",
    targetType: "Organization",
    targetId: factory.organizationId,
    payload: { type: parsed.data.type, currency: parsed.data.currency },
  });

  revalidatePath("/[lang]/factory/payouts", "page");
  return { ok: true };
}

/**
 * Wise error responses commonly carry `{ errors: [{ message: "..." }] }`
 * or `{ error: "..." }` — pull the most helpful string from either shape.
 */
function readWiseErrorDetail(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.error === "string") return b.error;
  if (Array.isArray(b.errors)) {
    const first = b.errors[0];
    if (first && typeof first === "object" && "message" in first) {
      const msg = (first as { message: unknown }).message;
      if (typeof msg === "string") return msg;
    }
  }
  return null;
}
