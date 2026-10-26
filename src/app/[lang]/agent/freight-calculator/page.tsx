import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { FreightCalculatorView } from "@/app/[lang]/admin/freight-calculator/freight-calculator-view";

/**
 * The agents' freight calculator: the administrators' page, reaching only the
 * clients the agent works for (freight-calculator-view.tsx).
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/agent/freight-calculator">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.freightCalculator.title };
}

export default async function AgentFreightCalculatorPage({ params }: PageProps<"/[lang]/agent/freight-calculator">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.AGENT);
  return <FreightCalculatorView lang={lang} staff={{ id: user.id, role: user.role }} />;
}
