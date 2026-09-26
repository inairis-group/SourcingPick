import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Shell, PageHead } from "@/components/shell";
import { DocTable } from "@/components/doc-table";
import { isAvoir, isFacture } from "@/lib/docs";
import { useAtelier } from "@/lib/store";

export const Route = createFileRoute("/avoirs/")({ component: Page });

function Page() {
  const docs = useAtelier((s) => s.docs);
  const create = useAtelier((s) => s.createAvoirFromFacture);
  const navigate = useNavigate();
  const avoirs = docs.filter(isAvoir);
  const factures = docs.filter(isFacture);

  return (
    <Shell>
      <PageHead title="Avoirs">
        {factures[0] ? (
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              const id = create(factures[0].id);
              void navigate({ to: "/avoirs/$id", params: { id } });
            }}
          >
            Nouvel avoir <Plus size={16} />
          </button>
        ) : null}
      </PageHead>
      <p className="mb-4 max-w-2xl text-sm text-muted">
        Un avoir annule ou rectifie une facture déjà émise. Le montant d’origine reste visible sur le document.
      </p>
      <DocTable docs={avoirs} empty="Aucun avoir." />
    </Shell>
  );
}
