import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Td } from "@/components/ops-ui";
import { Filters, frDate, isCommande, useClient } from "@/components/client-ui";

export const Route = createFileRoute("/espace/demandes/")({
  head: () => ({ meta: [{ title: "SourcingPick — Mes demandes" }] }),
  component: Page,
});

function Page() {
  const { data, error } = useClient();
  const [filter, setFilter] = useState("Toutes");
  const orders = (data?.orders ?? []).filter((order) => !isCommande(order.state)).filter((order) => {
    if (filter === "En cours") return !["Terminé", "Annulé"].includes(order.state);
    if (filter === "Devis reçu") return order.state === "Devis envoyé";
    if (filter === "Clôturées") return order.state === "Terminé";
    return true;
  });
  return (
    <Shell>
      <PageHead title="Mes demandes">
        <Link to="/espace/demandes/nouvelle" className="btn btn-primary">
          Nouvelle demande
        </Link>
      </PageHead>
      {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
      <Filters value={filter} options={["Toutes", "En cours", "Devis reçu", "Clôturées"]} onChange={setFilter} />
      <DataTable head={["Référence", "Produit", "Agent", "Mise à jour", "État", ""]}>
        {orders.map((order) => (
          <tr key={order.id}>
            <Td className="mono font-semibold">{order.ref}</Td>
            <Td>{order.product}</Td>
            <Td>{order.agentName}</Td>
            <Td>{frDate(order.updatedAt)}</Td>
            <Td>
              <Badge value={order.state} />
            </Td>
            <Td className="text-right">
              <Link className="font-semibold text-[#155DFC]" to="/espace/demandes/$id" params={{ id: order.id }} search={{ envoyee: false }}>
                Ouvrir
              </Link>
            </Td>
          </tr>
        ))}
      </DataTable>
      {orders.length === 0 ? <p className="mt-4 text-sm text-muted">Aucune demande. Une nouvelle demande n’est pas une commande : elle le devient après signature du devis et paiement de l’acompte.</p> : null}
    </Shell>
  );
}
