"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Locale } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { writeAuditLog } from "@/lib/audit/log";
import { settingsPathForRole } from "@/lib/auth/redirects";

// =============================================================
// Profile
// =============================================================

const ProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  locale: z.enum(Locale),
});

export type ProfileActionState = {
  error?: string;
  saved?: boolean;
};

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const parsed = ProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") ?? "",
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const localeChanged = parsed.data.locale !== user.locale;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      phone: parsed.data.phone || null,
      locale: parsed.data.locale,
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "settings.profile_updated",
    targetType: "User",
    targetId: user.id,
    payload: { localeChanged },
  });

  // Locale change: bounce to the settings page under the new locale so the
  // UI re-renders in the new language without leaving the user's context.
  if (localeChanged) {
    redirect(settingsPathForRole(user.role, parsed.data.locale));
  }

  revalidatePath("/[lang]", "layout");
  return { saved: true };
}

// =============================================================
// Password
// =============================================================

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(12, "New password must be at least 12 characters.")
      .max(200),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ["confirm"],
    message: "Passwords don't match.",
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ["newPassword"],
    message: "New password must be different from your current password.",
  });

export type PasswordActionState = {
  error?: string;
  saved?: boolean;
};

export async function changePasswordAction(
  _prev: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!user.passwordHash) {
    return {
      error: "This account doesn't use password sign-in. Set up a password from your account provider.",
    };
  }

  const parsed = PasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    await writeAuditLog({
      actorUserId: user.id,
      action: "settings.password_change_failed",
      targetType: "User",
      targetId: user.id,
      payload: { reason: "wrong_current_password" },
      level: "WARN",
    });
    return { error: "Your current password is wrong." };
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "settings.password_changed",
    targetType: "User",
    targetId: user.id,
    level: "WARN",
  });

  return { saved: true };
}

// =============================================================
// Two-factor toggle
// =============================================================

export type TwoFactorActionResult = { ok: true; enabled: boolean } | { ok: false; error: string };

export async function toggleTwoFactorAction(
  enabled: boolean,
): Promise<TwoFactorActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: enabled },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: enabled ? "auth.2fa_enabled" : "auth.2fa_disabled",
    targetType: "User",
    targetId: user.id,
    level: "WARN",
  });

  revalidatePath("/[lang]", "layout");
  return { ok: true, enabled };
}
