import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/redirects";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  RESEARCH_FEE_DAY_CENTS,
  RESEARCH_FEE_WEEK_CENTS,
} from "@/lib/orders/pricing";
import { AgentOnboardingWizard } from "./_components/agent-wizard";

export default async function AgentOnboardingPage({
  params,
}: PageProps<"/[lang]/onboarding/agent">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/login`);
  if (user.role !== Role.AGENT)
    redirect(dashboardPathForRole(user.role, lang));
  if (user.agentOnboardedAt)
    redirect(dashboardPathForRole(Role.AGENT, lang));

  const dict = await getDictionary(lang);

  return (
    <AgentOnboardingWizard
      firstName={user.firstName}
      lang={lang}
      t={dict.agent.onboarding}
      categoryLabels={dict.categories}
      floors={{
        dayCents: RESEARCH_FEE_DAY_CENTS,
        weekCents: RESEARCH_FEE_WEEK_CENTS,
      }}
    />
  );
}
