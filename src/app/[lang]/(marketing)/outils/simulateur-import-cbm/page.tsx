import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { pageAlternates } from "@/lib/seo/alternates";
import { ImportSimulator } from "../../_design/import-simulator";
import { SeoArticle } from "../../_design/seo-article";

/**
 * /outils/simulateur-import-cbm — the SEO pack's free tool (matrix, part 2).
 * French only.
 */

const TITLE = "Calculateur CBM Conteneur & Simulateur Coût Import Chine | Sourcing Pick";
const DESCRIPTION =
  "Calculez gratuitement votre volume en m³ (CBM) multi-fournisseurs, le remplissage conteneur (20’, 40’ HC) et vos commissions de sourcing (2%) et fret (3%).";

export async function generateMetadata({ params }: PageProps<"/[lang]/outils/simulateur-import-cbm">) {
  const { lang } = await params;
  if (lang !== "fr" || !isLocale(lang)) return {};
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: pageAlternates(lang, "/outils/simulateur-import-cbm", ["fr"]),
  };
}

export default async function SimulatorPage({ params }: PageProps<"/[lang]/outils/simulateur-import-cbm">) {
  const { lang } = await params;
  if (lang !== "fr") notFound();
  return (
    <SeoArticle
      eyebrow="Outil gratuit · Entrepôt de Guangzhou (Baiyun)"
      h1="Calculateur de Volume CBM (m³) et Simulateur de Coût d’Importation Chine"
      lead="Ajoutez les colis de vos différents fournisseurs chinois pour estimer le volume consolidé à Baiyun et nos commissions transparentes (2 % sur la marchandise sourcée, 3 % sur le fret maritime). Les prestations d’entrepôt (stockage au-delà d’un jour ouvré, contrôle, caisses bois NIMP 15, chargement) sont chiffrées ligne par ligne sur votre devis."
      image="/design/consolidated-pallet.svg"
      wide
    >
      <ImportSimulator quoteHref={sitePath("fr", "/devis")} />
    </SeoArticle>
  );
}
