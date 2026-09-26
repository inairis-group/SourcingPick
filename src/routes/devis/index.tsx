import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Shell, PageHead } from "@/components/shell";
import { DocTable } from "@/components/doc-table";
import { isDevis } from "@/lib/docs";
import { useAtelier } from "@/lib/store";

export const Route = createFileRoute("/devis/")({ component: Page });

function Page() {
  const all = useAtelier((s) => s.docs);
  const docs = useMemo(() => all.filter(isDevis), [all]);
  const createDevis = useAtelier((s) => s.createDevis);
  const navigate = useNavigate();
  return (
    <Shell>
      <PageHead title="Devis">
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
      <DocTable docs={docs} empty="Aucun devis." />
    </Shell>
  );
}
