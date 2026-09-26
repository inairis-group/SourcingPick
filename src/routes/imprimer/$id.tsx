import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Paper } from "@/components/paper";
import { useAtelier } from "@/lib/store";

export const Route = createFileRoute("/imprimer/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const doc = useAtelier((s) => s.docs.find((d) => d.id === id));

  useEffect(() => {
    if (!doc) return;
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, [doc]);

  if (!doc) {
    return (
      <main className="p-8">
        <p>Document introuvable.</p>
        <Link to="/">Retour</Link>
      </main>
    );
  }

  const back = doc.kind === "devis" ? "/devis/$id" : doc.kind === "facture" ? "/factures/$id" : "/avoirs/$id";

  return (
    <main className="bg-canvas px-3 py-6">
      <div className="no-print mx-auto mb-4 flex max-w-[920px] items-center justify-between gap-3">
        <Link to={back} params={{ id: doc.id }} className="btn btn-quiet">
          Retour au document
        </Link>
        <button className="btn btn-primary" type="button" onClick={() => window.print()}>
          Enregistrer en PDF
        </button>
      </div>
      <Paper doc={doc} />
    </main>
  );
}
