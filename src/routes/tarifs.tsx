import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/site-layout";

export const Route = createFileRoute("/tarifs")({ component: Page });

function Page() {
  const rows = [
    ["Réception et stockage à Guangzhou", "Sur mesure"],
    ["Vérification et photos", "Sur mesure"],
    ["Consolidation", "Sur mesure"],
    ["Renforcement bois", "Sur mesure"],
    ["Chargement du conteneur", "Sur mesure"],
    ["Fret maritime Nansha → Europe", "Au prix du marché, détaillé"],
  ];
  return (
    <SiteLayout>
      <PageIntro title="Des devis réels, ligne par ligne." lead="Le fret change chaque semaine. Nous préférons un devis juste à un tarif d’appel. Notre rémunération, elle, ne bouge pas." />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="card">
          <h2 className="font-semibold">Logistique Chine → Europe</h2>
          <ul className="mt-4 divide-y divide-line">
            {rows.map(([a, b]) => (
              <li key={a} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                <span>{a}</span>
                <span className="mono text-muted">{b}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="card bg-navy text-white">
          <h2 className="font-semibold">Notre rémunération</h2>
          <p className="mt-4 display text-4xl">2 % <span className="text-lg font-medium text-[#b8c4e6]">marchandise</span></p>
          <p className="mt-2 display text-4xl">3 % <span className="text-lg font-medium text-[#b8c4e6]">fret</span></p>
          <p className="mt-4 text-sm leading-relaxed text-[#d5def5]">Si vous achetez vous-même, seule la commission de 3 % sur le fret s’applique. Pas de forfait de recherche, pas d’abonnement, pas de frais de dossier. Même taux quel que soit le montant.</p>
        </article>
      </div>
      <section className="mx-auto mt-6 grid max-w-6xl gap-3 px-4 md:grid-cols-3">
        <article className="card text-sm"><h2 className="font-semibold">Ce qui fait varier un devis</h2><p className="mt-2 text-muted">Volume, poids, nombre de fournisseurs, niveau de contrôle, caisses en bois, port et saison.</p></article>
        <article className="card text-sm"><h2 className="font-semibold">Chaque devis contient</h2><p className="mt-2 text-muted">Une ligne par prestation, le fret à part, la commission à part, les conditions de paiement, une validité de 7 à 30 jours.</p></article>
        <article className="card text-sm"><h2 className="font-semibold">Paiement</h2><p className="mt-2 text-muted">Acompte de 40 % à la commande, solde avant le chargement. Virement ou carte.</p></article>
      </section>
      <div className="mx-auto mt-6 max-w-6xl px-4">
        <Link to="/demande" className="btn btn-primary">Demander un devis</Link>
      </div>
    </SiteLayout>
  );
}
