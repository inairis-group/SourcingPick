import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import {
  RESEARCH_FEE_DAY_CENTS,
  RESEARCH_FEE_WEEK_CENTS,
} from "@/lib/orders/pricing";
import { AgentProfileForm } from "./_components/profile-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/agent/profile">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.agent.profile.title };
}

export default async function AgentProfilePage({
  params,
}: PageProps<"/[lang]/agent/profile">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.AGENT);
  const dict = await getDictionary(lang);

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      agentBio: true,
      agentTimezone: true,
      agentResearchFeeDayCents: true,
      agentResearchFeeWeekCents: true,
      agentCategories: true,
      agentOnboardedAt: true,
    },
  });
  if (!profile) redirect(`/${lang}/login`);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.agent.profile.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.agent.profile.title}
        </h1>
        <p className="text-sm text-muted">{dict.agent.profile.description}</p>
      </header>

      <AgentProfileForm
        initial={{
          agentBio: profile.agentBio ?? "",
          agentTimezone: profile.agentTimezone ?? "",
          agentResearchFeeDayCents: profile.agentResearchFeeDayCents,
          agentResearchFeeWeekCents: profile.agentResearchFeeWeekCents,
          agentCategories: profile.agentCategories,
        }}
        floors={{
          dayCents: RESEARCH_FEE_DAY_CENTS,
          weekCents: RESEARCH_FEE_WEEK_CENTS,
        }}
        t={dict.agent.profile}
        categoryLabels={dict.categories}
      />
      {/* Surface the onboardedAt state for QA — purely informational. */}
      <p className="hidden">{profile.agentOnboardedAt?.toISOString()}</p>
    </div>
  );
}
