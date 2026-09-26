import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Shell, PageHead } from "@/components/shell";
import { DocTable } from "@/components/doc-table";
import { dueCents, formatEUR, isDevis, isFacture } from "@/lib/docs";
import { useAtelier } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "SourcingPick — Administration" }] }),
  component: AdminHome,
});

function AdminHome() {
  const docs = useAtelier((s) => s.docs);
  const createDevis = useAtelier((s) => s.createDevis);
  const navigate = useNavigate();
  const open = docs.filter(isFacture).filter((d) => d.status === "emis");
  const waiting = docs.filter(isDevis).filter((d) => d.status === "emis");
  const due = open.reduce((sum, d) => sum + dueCents(d), 0);

  return (
    <Shell>
      <PageHead title="Tableau de bord">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            const id = createDevis();
            void navigate({ to: "/devis/$id", params: { id } });
          }}
        >
          Nouveau devis <Plus size={16} />
        </button>
      </PageHead>
      <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted">
        Établissez un devis, transformez-le en facture d’acompte ou de solde, puis émettez un avoir si le montant change.
      </p>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <article className="card">
          <p className="text-sm text-muted">À encaisser</p>
          <p className="mono mt-2 text-2xl font-semibold">{formatEUR(due)}</p>
        </article>
        <article className="card">
          <p className="text-sm text-muted">Devis en attente de signature</p>
          <p className="mono mt-2 text-2xl font-semibold">{waiting.length}</p>
        </article>
        <article className="card">
          <p className="text-sm text-muted">Documents</p>
          <p className="mono mt-2 text-2xl font-semibold">{docs.length}</p>
        </article>
      </div>
      <DocTable docs={[...docs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8)} empty="Aucun document." />
    </Shell>
  );
}
