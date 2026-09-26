import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/site-layout";

export const Route = createFileRoute("/comment-ca-marche")({ component: Page });

const STEPS = [
  ["Votre demande", "Vous décrivez marchandises, fournisseurs, volumes et destination.", "Nous étudions et revenons si une information manque.", "Demande reçue"],
  ["Le devis", "Vous lisez ligne par ligne, puis signez électroniquement.", "Nous chiffrons chaque prestation, fret compris.", "Devis envoyé"],
  ["L’acompte", "Vous payez l’acompte par carte ou par virement.", "Nous confirmons et lançons les opérations.", "Paiement reçu"],
  ["Réception et contrôle", "Vous suivez les livraisons et les photos.", "Nous réceptionnons, contrôlons, consolidons, renforçons.", "Préparation terminée"],
  ["Chargement et départ", "Vous recevez la vidéo et le numéro de conteneur.", "Nous chargeons et faisons partir le conteneur de Nansha.", "Expédié"],
  ["En mer", "Vous suivez le conteneur et les documents.", "Nous suivons le transport jusqu’au port d’arrivée.", "En transit"],
];

function Page() {
  return (
    <SiteLayout>
      <PageIntro title="De votre demande au port d’arrivée." lead="À chaque étape : ce que vous faites, ce que nous faisons, et le statut dans votre espace client." />
      <ol className="mx-auto grid max-w-6xl gap-3 px-4 md:grid-cols-2">
        {STEPS.map(([title, you, us, status], i) => (
          <li key={title} className="card">
            <p className="mono text-sm text-brand">{i + 1}</p>
            <h2 className="mt-1 text-lg font-semibold">{title}</h2>
            <p className="mt-3 text-sm"><span className="font-semibold">Vous. </span>{you}</p>
            <p className="mt-2 text-sm"><span className="font-semibold">Nous. </span>{us}</p>
            <p className="mt-3 inline-flex rounded-lg bg-[#155dfc14] px-2 py-1 text-xs font-semibold text-brand">{status}</p>
          </li>
        ))}
      </ol>
      <section className="mx-auto mt-8 grid max-w-6xl gap-3 px-4 md:grid-cols-2">
        <article className="card">
          <h2 className="font-semibold">Ce qu’il nous faut pour démarrer</h2>
          <ul className="mt-3 list-disc space-y-1 ps-5 text-sm text-muted">
            <li>La liste de vos fournisseurs et leurs coordonnées</li>
            <li>Les factures pro forma ou bons de commande</li>
            <li>Le nombre de colis et le poids estimés</li>
            <li>L’adresse de livraison finale</li>
            <li>Vos consignes de contrôle</li>
          </ul>
        </article>
        <article className="card">
          <h2 className="font-semibold">Ce que nous transmettons à vos fournisseurs</h2>
          <p className="mt-3 text-sm text-muted">L’adresse de l’entrepôt, votre code client à inscrire sur chaque carton, et les horaires : lundi au samedi, 9 h à 18 h, heure de Chine. Pas de réception la nuit ni le dimanche.</p>
          <Link to="/demande" className="btn btn-primary mt-4">Demander un devis</Link>
        </article>
      </section>
    </SiteLayout>
  );
}
