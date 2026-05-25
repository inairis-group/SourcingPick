"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/redirects";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Mark onboarding as complete + send the user to their dashboard.
 *
 * Idempotent. If hasOnboarded is already true we just redirect without
 * touching the DB or writing another audit row.
 */
export async function completeOnboardingAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const h = await headers();
  const fromProxy = h.get("x-locale");
  const locale = fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;

  if (!user.hasOnboarded) {
    await prisma.user.update({
      where: { id: user.id },
      data: { hasOnboarded: true },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "onboarding.completed",
      targetType: "User",
      targetId: user.id,
    });
  }

  redirect(dashboardPathForRole(user.role, locale));
}

/**
 * Internal helper for the role dispatcher — admin/agent users don't need
 * the buyer/factory onboarding screens. We complete their onboarding flag
 * silently if needed and send them straight to their dashboard.
 */
export async function skipOnboardingForStaffAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== Role.ADMIN && user.role !== Role.AGENT) {
    // Wrong role for skip — they should be onboarding properly.
    return;
  }

  const h = await headers();
  const fromProxy = h.get("x-locale");
  const locale = fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;

  if (!user.hasOnboarded) {
    await prisma.user.update({
      where: { id: user.id },
      data: { hasOnboarded: true },
    });
    await writeAuditLog({
      actorUserId: user.id,
      action: "onboarding.skipped_staff",
      targetType: "User",
      targetId: user.id,
    });
  }

  redirect(dashboardPathForRole(user.role, locale));
}
