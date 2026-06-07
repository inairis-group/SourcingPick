"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Public-web URLs on the Organization (website, Instagram, Facebook,
 * LinkedIn). Surfaced on KYC review so admin can cross-check the
 * entity's public footprint. Partner #28.
 *
 * Only the org's OWNER can edit (matches logo + payouts). Empty
 * strings reset back to null.
 */

const OptionalUrl = z
  .union([z.string().trim().url("Must be a valid URL."), z.literal("")])
  .optional();

const SocialSchema = z.object({
  websiteUrl: OptionalUrl,
  instagramUrl: OptionalUrl,
  facebookUrl: OptionalUrl,
  linkedinUrl: OptionalUrl,
});

export type SocialResult = { ok: true } | { ok: false; error: string };

export async function updateOrgSocialUrlsAction(input: {
  websiteUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
}): Promise<SocialResult> {
  const user = await requireAuth();
  if (user.subRole !== "OWNER") {
    return {
      ok: false,
      error: "Only the organisation owner can edit these.",
    };
  }
  const parsed = SocialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid URL.",
    };
  }

  await prisma.organization.update({
    where: { id: user.organizationId },
    data: {
      websiteUrl: parsed.data.websiteUrl || null,
      instagramUrl: parsed.data.instagramUrl || null,
      facebookUrl: parsed.data.facebookUrl || null,
      linkedinUrl: parsed.data.linkedinUrl || null,
    },
  });
  await writeAuditLog({
    actorUserId: user.id,
    action: "organization.social_urls_updated",
    targetType: "Organization",
    targetId: user.organizationId,
  });

  revalidatePath("/[lang]/admin/kyc", "page");
  revalidatePath("/[lang]/client/settings", "page");
  revalidatePath("/[lang]/factory/settings", "page");
  revalidatePath("/[lang]/agent/settings", "page");
  return { ok: true };
}
