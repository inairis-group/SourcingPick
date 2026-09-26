import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/site-layout";

export const Route = createFileRoute("/faq")({ component: Page });

const GROUPS = [
  ["Général", [
    ["Qui êtes-vous ?", "Sourcing Pick est la marque de Hangzhou Qiyuan Ying Technology Information Co., Ltd. Entrepôt de 200 m² à Baiyun, quatre techniciens."],
    ["Pourquoi vous faire confiance ?", "L’adresse est publique, chaque étape est photographiée, chaque document reste dans votre espace. Vous jugez sur pièces."],
    ["Acceptez-vous les particuliers ?", "Oui, pour un projet ponctuel. Le service est pensé d’abord pour les PME qui importent par conteneur."],
    ["Vers quels pays ?", "Tous les pays desservis depuis Nansha. Nous sommes les plus rodés sur la France, l’Europe et l’Afrique francophone."],
  ]],
  ["Logistique", [
    ["Quels sont les délais ?", "Comptez 2 à 3 mois entre la commande et la livraison. L’estimation précise figure dans le devis."],
    ["Le dédouanement ?", "Sur mesure : notre transitaire ou le vôtre. Droits de douane et TVA à l’import restent à votre charge."],
    ["Pas de quoi remplir un conteneur ?", "Nous reconstituons un conteneur avec d’autres envois. Dites-nous le volume et les délais."],
    ["Combien de temps stockez-vous ?", "Un jour ouvré est inclus. Au-delà, le tarif est au devis. Les produits sensibles sont chargés dans la journée."],
    ["Train ou avion ?", "À l’étude. Nous ne les proposerons qu’une fois testés."],
  ]],
  ["Contrôle", [
    ["Que contrôlez-vous ?", "Ce que vous demandez : quantités, emballages, étiquettes, aspect. Photos et vidéo dans l’espace client."],
    ["Si un problème est détecté ?", "Nous vous prévenons avant le chargement. Vous décidez de la suite avec votre fournisseur."],
  ]],
  ["Sourcing", [
    ["Pas encore de fournisseur ?", "Nos agents recherchent, comparent et négocient. Vous validez avant toute commande."],
    ["Combien coûte le sourcing ?", "2 % sur la marchandise achetée pour vous, plus 3 % sur le fret. Pas de forfait de recherche."],
  ]],
  ["Paiement", [
    ["Comment se passe le paiement ?", "Acompte de 40 % à la commande, solde avant le chargement. Virement ou carte."],
    ["Mon argent est-il protégé ?", "Les sommes sont affectées à votre commande, par étapes. Ce n’est pas un séquestre : Sourcing Pick n’est pas un établissement de paiement."],
  ]],
  ["Application", [
    ["Quelles langues ?", "L’espace client : français, anglais, chinois. Le site : 12 langues."],
    ["Quand sort l’application ?", "Pas de date tant qu’elle n’est pas prête. L’espace web fait déjà le suivi."],
  ]],
] as const;

function Page() {
  const [tab, setTab] = useState<string>("Général");
  const group = GROUPS.find((g) => g[0] === tab) ?? GROUPS[0];
  return (
    <SiteLayout>
      <PageIntro title="Les réponses, sans détour." lead="Quand nous ne savons pas encore, nous le disons." />
      <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4">
        {GROUPS.map(([name]) => (
          <button key={name} type="button" className={`rounded-full border px-4 py-2 text-sm font-semibold ${tab === name ? "border-navy bg-navy text-white" : "border-line bg-paper"}`} onClick={() => setTab(name)}>
            {name}
          </button>
        ))}
      </div>
      <div className="mx-auto mt-4 grid max-w-6xl gap-3 px-4">
        {group[1].map(([q, a]) => (
          <article key={q} className="card">
            <h2 className="font-semibold">{q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
          </article>
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-6xl px-4 text-sm">Pas trouvé ? <a className="font-semibold text-brand" href="mailto:contact@sourcingpick.com">contact@sourcingpick.com</a></p>
    </SiteLayout>
  );
}
