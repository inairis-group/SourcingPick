import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/redirects";
import { isLocale } from "@/lib/i18n/config";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Onboarding dispatcher.
 *
 * - CLIENT  → /onboarding/client
 * - FACTORY → /onboarding/factory
 * - ADMIN/AGENT → silently mark hasOnboarded=true and bounce to dashboard
 *   (staff users don't need the buyer/factory onboarding screens)
 * - Already onboarded → straight to dashboard
 */
export default async function OnboardingDispatcherPage({
  params,
}: PageProps<"/[lang]/onboarding">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/login`);

  if (user.hasOnboarded) {
    redirect(dashboardPathForRole(user.role, lang));
  }

  if (user.role === Role.AGENT) {
    // Agents go through the new agent onboarding wizard — rates, bio,
    // timezone, categories. The wizard itself flips hasOnboarded +
    // agentOnboardedAt on submit.
    redirect(`/${lang}/onboarding/agent`);
  }
  if (user.role === Role.ADMIN) {
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
    redirect(dashboardPathForRole(user.role, lang));
  }

  if (user.role === Role.CLIENT) {
    redirect(`/${lang}/onboarding/client`);
  }
  redirect(`/${lang}/onboarding/factory`);
}
