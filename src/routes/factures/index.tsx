import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Shell, PageHead } from "@/components/shell";
import { DocTable } from "@/components/doc-table";
import { isFacture } from "@/lib/docs";
import { useAtelier } from "@/lib/store";

export const Route = createFileRoute("/factures/")({ component: Page });

function Page() {
  const all = useAtelier((s) => s.docs);
  const docs = useMemo(() => all.filter(isFacture), [all]);
  return (
    <Shell>
      <PageHead title="Factures" />
      <p className="mb-4 max-w-2xl text-sm text-muted">
        Une facture naît d’un devis : acompte, solde ou facture intégrale. Ouvrez un devis signé pour la créer.
      </p>
      <DocTable docs={docs} empty="Aucune facture. Partez d’un devis." />
    </Shell>
  );
}
