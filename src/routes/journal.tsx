import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { DataTable, Td, useOps } from "@/components/ops-ui";
import { opsJournal } from "@/lib/ops.functions";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "SourcingPick — Journal" }] }),
  component: Page,
});

function Page() {
  const { data, error } = useOps(() => opsJournal(), "journal");
  return (
    <Shell>
      <PageHead title="Journal des actions" />
      <p className="mb-4 max-w-3xl text-sm text-muted">Chaque action d’administration est tracée avec l’auteur et l’heure.</p>
      {error ? <p className="mb-3 text-sm text-[#8a1c1c]">{error}</p> : null}
      <DataTable head={["Quand", "Qui", "Action", "Objet"]}>
        {(data ?? []).map((row) => (
          <tr key={row.id}>
            <Td className="mono">{row.atLabel}</Td>
            <Td>{row.actor}</Td>
            <Td>{row.action}</Td>
            <Td className="mono">{row.objectRef}</Td>
          </tr>
        ))}
      </DataTable>
    </Shell>
  );
}
