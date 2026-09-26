import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/site-layout";

export const Route = createFileRoute("/services")({ component: Page });

const ITEMS = [
  ["Réception", "Vos fournisseurs livrent à Baiyun. Nous enregistrons nombre, poids et état, et signalons un colis manquant ou abîmé.", "Photos de chaque livraison. Un jour ouvré de stockage inclus."],
  ["Vérification", "Ouverture d’un échantillon ou de tous les cartons, comptage, contrôle visuel, étiquettes.", "Photos et vidéo. Les écarts sont signalés avant le chargement."],
  ["Consolidation", "Regroupement, palettisation et filmage pour un seul envoi.", "Un conteneur à suivre, et une liste de colisage consolidée."],
  ["Renforcement bois", "Caisses sur mesure, cerclage, calage, bois traité NIMP 15.", "Photos des caisses. Chaque caisse est une ligne du devis."],
  ["Chargement conteneur", "Chargé par nos techniciens, du premier carton à la fermeture des portes.", "Vidéo du chargement et numéro de conteneur."],
  ["Expédition maritime", "Place sur un navire au départ de Nansha, documents d’export, suivi jusqu’au port d’arrivée.", "Statuts Expédié puis En transit, et le lien du transporteur."],
];

function Page() {
  return (
    <SiteLayout>
      <PageIntro kicker="Services" title="Six opérations à Guangzhou, une trace pour chacune." lead="Entre l’usine et le navire, vos marchandises passent par notre entrepôt de Baiyun." />
      <div className="mx-auto grid max-w-6xl gap-3 px-4 pb-8">
        {ITEMS.map(([title, doing, receive], i) => (
          <article key={title} className="card grid gap-4 md:grid-cols-[180px_1fr_1fr]">
            <div>
              <p className="mono text-sm text-brand">0{i + 1}</p>
              <h2 className="mt-1 text-xl font-semibold">{title}</h2>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-muted uppercase">Ce que nous faisons</p>
              <p className="mt-2 text-sm leading-relaxed">{doing}</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-muted uppercase">Ce que vous recevez</p>
              <p className="mt-2 text-sm leading-relaxed">{receive}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="mx-auto max-w-6xl px-4 text-sm text-muted">Dédouanement à l’arrivée : sur mesure, par notre transitaire ou par le vôtre. <Link to="/demande" className="font-semibold text-brand">Demander un devis</Link></p>
    </SiteLayout>
  );
}
