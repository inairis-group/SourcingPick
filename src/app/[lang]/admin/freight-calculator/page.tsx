import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { FreightCalculatorView } from "./freight-calculator-view";

/** The administrators' freight calculator (freight-calculator-view.tsx). */
export async function generateMetadata({ params }: PageProps<"/[lang]/admin/freight-calculator">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.freightCalculator.title };
}

export default async function AdminFreightCalculatorPage({ params }: PageProps<"/[lang]/admin/freight-calculator">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.ADMIN);
  return <FreightCalculatorView lang={lang} staff={{ id: user.id, role: user.role }} />;
}
