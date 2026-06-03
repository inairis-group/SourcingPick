"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { StorageError, storeFile } from "@/lib/storage/local";

export type UploadLogoState = {
  error?: string;
  ok?: boolean;
};

/**
 * Upload an org logo / profile photo. The signed-in user must be an
 * OWNER (or ADMIN) of an org — random members can't change the brand.
 * Storage scope is "factories" (sized + validated for the same image
 * mime/ext set as the marketplace photos).
 */
export async function uploadOrgLogoAction(
  _prev: UploadLogoState,
  formData: FormData,
): Promise<UploadLogoState> {
  const user = await requireAuth();

  // Owners + admins can change the org brand. Members can see it; not
  // edit. Admin can change any org's logo (audit-logged below).
  if (user.subRole !== "OWNER" && user.role !== Role.ADMIN) {
    return { error: "Only the org owner can change the logo." };
  }

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pick an image file." };
  }

  let storageUrl: string;
  try {
    const stored = await storeFile({
      scope: "factories",
      ownerId: user.organizationId,
      kindPrefix: "logo",
      file,
    });
    storageUrl = stored.storageUrl;
  } catch (e) {
    if (e instanceof StorageError) return { error: e.message };
    return { error: "Couldn't save the image. Please try again." };
  }

  await prisma.organization.update({
    where: { id: user.organizationId },
    data: { logoUrl: storageUrl },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "org.logo_updated",
    targetType: "Organization",
    targetId: user.organizationId,
  });

  revalidatePath("/[lang]/factory/settings", "page");
  revalidatePath("/[lang]/client/settings", "page");
  revalidatePath("/[lang]/agent/settings", "page");
  return { ok: true };
}
