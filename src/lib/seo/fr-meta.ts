import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";

/**
 * `<title>` and meta description of the French pages, from the 2026-10 SEO
 * pack (matrix, part 1 and 2), keyed by route. The titles already end with
 * "| Sourcing Pick", so they are absolute — the layout's title template would
 * otherwise add the name a second time. The other languages keep the
 * canvas's titles.
 */
export const FR_META: Readonly<Record<string, { title: string; description?: string }>> = {
  "/": {
    title: "Sourcing, Consolidation & Logistique Chine (Guangzhou) | Sourcing Pick",
    description:
      "Entre l’usine et le navire : réception, contrôle qualité photo/vidéo, consolidation, caisses NIMP 15 et fret maritime depuis Guangzhou (Nansha). Commission 2% / 3%.",
  },
  "/services": {
    title: "Services Logistiques à Guangzhou : Contrôle, Groupage & Fret | Sourcing Pick",
    description:
      "Nos 6 opérations dans notre entrepôt de Baiyun (Guangzhou) : réception multi-fournisseurs, contrôle qualité, consolidation, caisses NIMP 15, empotage et fret Nansha.",
  },
  "/comment-ca-marche": {
    title: "Importer de Chine en 6 Étapes : du Devis au Navire | Sourcing Pick",
    description:
      "De votre demande de devis jusqu’au départ du conteneur à Nansha : découvrez les 6 étapes d’une importation suivie en photo et vidéo dans votre espace client.",
  },
  "/entrepot": {
    title: "Notre Entrepôt Logistique à Guangzhou (Baiyun) – 200 m² | Sourcing Pick",
    description:
      "Découvrez notre entrepôt de 200 m² dans le district de Baiyun à Guangzhou : 4 techniciens sur place pour réceptionner, contrôler, consolider et charger vos conteneurs.",
  },
  "/pricing": {
    title: "Tarifs Sourcing Chine (2%) & Fret Maritime (3%) sur Devis | Sourcing Pick",
    description:
      "Des devis réels ligne par ligne : 2 % de commission sur le sourcing fournisseur, 3 % sur le fret maritime Nansha, 0 € de frais de dossier. Acompte 40 % à la commande.",
  },
  "/faq": {
    title: "Questions Fréquentes : Importation, Groupage & Sourcing Chine | Sourcing Pick",
    description:
      "Toutes nos réponses sans détour : délais maritimes depuis Nansha, groupage de conteneur, contrôle qualité à Guangzhou, stockage, paiement 40/60 et commission 2%/3%.",
  },
  "/about": {
    title: "À Propos de Sourcing Pick : Notre Équipe à Guangzhou | Sourcing Pick",
    description:
      "Fondée en 2023 à Guangzhou par Adam et Xie Wei, Sourcing Pick sécurise vos importations entre l’usine et le navire avec 4 techniciens dans notre entrepôt de Baiyun.",
  },
  "/legal/mentions-legales": {
    title: "Mentions Légales – Hangzhou Qiyuan Ying Technology | Sourcing Pick",
    description:
      "Mentions légales du site sourcingpick.com et de l’application Sourcing Pick, édités par Hangzhou Qiyuan Ying Technology Information Co., Ltd. à Guangzhou.",
  },
  "/legal/terms": {
    title: "Conditions Générales de Vente et d’Utilisation (CGV) | Sourcing Pick",
    description:
      "Consultez les conditions générales de vente des prestations de réception, contrôle, consolidation, sourcing (2%) et fret maritime (3%) de Sourcing Pick.",
  },
  "/legal/privacy": {
    title: "Politique de Confidentialité & Protection des Données | Sourcing Pick",
    description:
      "Politique de confidentialité de Sourcing Pick : protection stricte de vos données commerciales, factures fournisseurs et documents d’importation.",
  },
  "/legal/cookies": { title: "Politique de Gestion des Cookies | Sourcing Pick" },
};

/** The page's title and description: the SEO pack's in French, `fallback` otherwise. */
export function pageMeta(
  lang: Locale,
  route: string,
  fallback: { title: string; description: string },
): Pick<Metadata, "title" | "description"> {
  const fr = lang === "fr" ? FR_META[route] : undefined;
  if (!fr) return fallback;
  return { title: { absolute: fr.title }, description: fr.description ?? fallback.description };
}
