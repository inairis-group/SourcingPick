"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role, SourcingRegion } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { clearSourcingAllowlistCache } from "./settings";

const UpdateSchema = z.object({
  regions: z.array(z.enum(SourcingRegion)),
  countries: z
    .array(z.string().regex(/^[A-Z]{2}$/, "Use ISO 3166-1 alpha-2 codes."))
    .max(250),
});

export type UpdateAllowlistResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Replace the sourcing allowlist (regions + countries). Admin-only.
 * Both arrays are replaced wholesale — clients should send the full
 * intended set, not a diff.
 */
export async function updateSourcingAllowlistAction(
  regions: SourcingRegion[],
  countries: string[],
): Promise<UpdateAllowlistResult> {
  const admin = await requireRole(Role.ADMIN);

  const parsed = UpdateSchema.safeParse({
    regions,
    countries: countries.map((c) => c.toUpperCase()),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      allowedSourcingRegions: parsed.data.regions,
      allowedSourcingCountries: parsed.data.countries,
    },
    update: {
      allowedSourcingRegions: parsed.data.regions,
      allowedSourcingCountries: parsed.data.countries,
    },
  });

  clearSourcingAllowlistCache();

  await writeAuditLog({
    actorUserId: admin.id,
    action: "platform.allowlist_updated",
    targetType: "PlatformSettings",
    targetId: "default",
    payload: {
      regions: parsed.data.regions,
      countries: parsed.data.countries,
    },
    level: "WARN",
  });

  revalidatePath("/[lang]/admin/settings/sourcing", "page");
  revalidatePath("/[lang]/client/requests/new", "page");
  return { ok: true };
}
