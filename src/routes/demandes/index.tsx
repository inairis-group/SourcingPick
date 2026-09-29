import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Filters, Td, useOps } from "@/components/ops-ui";
import { opsOrders } from "@/lib/ops.functions";
import { STATE_TREE } from "@/lib/ops.shared";
import { useUi } from "@/lib/ui-lang";

export const Route = createFileRoute("/demandes/")({
  head: () => ({ meta: [{ title: "SourcingPick — Demandes" }] }),
  component: Demandes,
});

function Demandes() {
  const { data, error } = useOps(() => opsOrders());
  const { t } = useUi();
  const [filter, setFilter] = useState("Tous");
  const options = ["Tous", ...STATE_TREE.map((group) => group.state)];
  const rows = (data ?? []).filter((row) => filter === "Tous" || row.state === filter);
  return (
    <Shell>
      <PageHead title="Demandes" />
      {error ? <p className="mb-3 text-sm text-[#8a1c1c]">{error}</p> : null}
      <Filters value={filter} options={options} onChange={setFilter} />
      <DataTable head={["Référence", "Client", "Email", "Téléphone", "Produit", "Agent", "État", "Sous-état", ""]}>
        {rows.map((row) => (
          <tr key={row.id}>
            <Td className="mono font-semibold">{row.ref}</Td>
            <Td>{row.clientName}</Td>
            <Td>{row.clientEmail ? <a className="font-semibold text-brand" href={`mailto:${row.clientEmail}`}>{row.clientEmail}</a> : "—"}</Td>
            <Td>{row.clientPhone ? <a className="font-semibold text-brand" href={`tel:${row.clientPhone.replace(/\s/g, "")}`}>{row.clientPhone}</a> : "—"}</Td>
            <Td>{row.product}</Td>
            <Td>{row.agentName}</Td>
            <Td><Badge value={row.state} /></Td>
            <Td><Badge value={row.substate} /></Td>
            <Td>
              <Link to="/demandes/$id" params={{ id: row.id }} className="font-semibold text-brand">
                {t("Ouvrir")}
              </Link>
            </Td>
          </tr>
        ))}
      </DataTable>
    </Shell>
  );
}
