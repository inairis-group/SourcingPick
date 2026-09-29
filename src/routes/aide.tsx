import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell, PageHead } from "@/components/shell";
import { loadSession, type Role } from "@/lib/session";

export const Route = createFileRoute("/aide")({ component: Page });

function Page() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  useEffect(() => {
    loadSession()
      .then((session) => setRole(session.user?.role ?? null))
      .catch(() => setRole(null));
  }, []);
  const client = role === "client";
  return (
    <Shell>
      <PageHead title="Aide" />
      <div className="card flex max-w-2xl flex-col gap-4 text-sm leading-relaxed">
        {client ? (
          <p>Le didacticiel se lance tout seul à la première connexion. Vous pouvez le revoir quand vous voulez.</p>
        ) : (
          <>
            <p>Trois documents, un même papier : devis, facture, avoir.</p>
            <ol className="list-decimal space-y-2 ps-5">
              <li>Créez un devis, choisissez le client, posez les lignes.</li>
              <li>La commission de 2 % et l’acompte de 40 % se calculent tout seuls. Vous pouvez changer les taux.</li>
              <li>À l’étape Aperçu, « Télécharger le PDF » ouvre l’impression. Choisissez Enregistrer au format PDF.</li>
              <li>Depuis un devis, créez la facture d’acompte, puis plus tard la facture de solde.</li>
              <li>Depuis une facture, « Créer un avoir » reprend les lignes et rappelle le montant d’origine.</li>
            </ol>
          </>
        )}
        <div className="flex flex-wrap gap-2">
          {client ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                sessionStorage.setItem("sp-tour-force", "1");
                void navigate({ to: "/espace" });
              }}
            >
              Revoir le didacticiel
            </button>
          ) : (
            <Link to="/devis" className="btn btn-primary w-fit">
              Ouvrir les devis
            </Link>
          )}
        </div>
      </div>
    </Shell>
  );
}
