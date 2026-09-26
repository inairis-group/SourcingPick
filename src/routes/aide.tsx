import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, PageHead } from "@/components/shell";

export const Route = createFileRoute("/aide")({ component: Page });

function Page() {
  return (
    <Shell>
      <PageHead title="Aide" />
      <div className="card flex max-w-2xl flex-col gap-4 text-sm leading-relaxed">
        <p>Trois documents, un même papier : devis, facture, avoir.</p>
        <ol className="list-decimal space-y-2 ps-5">
          <li>Créez un devis, choisissez le client, posez les lignes.</li>
          <li>La commission de 2 % et l’acompte de 40 % se calculent tout seuls. Vous pouvez changer les taux.</li>
          <li>À l’étape Aperçu, « Télécharger le PDF » ouvre l’impression. Choisissez Enregistrer au format PDF.</li>
          <li>Depuis un devis, créez la facture d’acompte, puis plus tard la facture de solde.</li>
          <li>Depuis une facture, « Créer un avoir » reprend les lignes et rappelle le montant d’origine.</li>
        </ol>
        <p className="text-muted">Les données restent dans ce navigateur. Paramètres permet de recharger l’exemple du cimetière de Manzini.</p>
        <Link to="/devis" className="btn btn-primary w-fit">
          Ouvrir les devis
        </Link>
      </div>
    </Shell>
  );
}
