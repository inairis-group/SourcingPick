import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Td } from "@/components/ops-ui";
import { Filters, isCommande, useClient } from "@/components/client-ui";
import { euros } from "@/lib/ops.shared";

export const Route = createFileRoute("/espace/commandes/")({
  head: () => ({ meta: [{ title: "SourcingPick — Commandes" }] }),
  component: Page,
});

const OPTIONS = ["Tous", "Paiement reçu", "Préparation terminée", "Expédié", "En transit", "Terminé"];

function Page() {
  const { data, error } = useClient();
  const [filter, setFilter] = useState("Tous");
  const orders = (data?.orders ?? []).filter((order) => isCommande(order.state)).filter((order) => filter === "Tous" || order.state === filter);
  return (
    <Shell>
      <PageHead title="Commandes" />
      <p className="mb-4 text-sm text-muted">Une demande devient une commande quand le devis est signé et l’acompte reçu.</p>
      {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
      <Filters value={filter} options={OPTIONS} onChange={setFilter} />
      <DataTable head={["Référence", "Produit", "État", "Montant", ""]}>
        {orders.map((order) => {
          const quote = data?.quotes.find((item) => item.orderRef === order.ref);
          return (
            <tr key={order.id}>
              <Td className="mono font-semibold">{order.ref}</Td>
              <Td>{order.product}</Td>
              <Td>
                <Badge value={order.state} />
                <span className="mt-1 block text-xs text-muted">{order.substate}</span>
              </Td>
              <Td className="mono">{quote ? euros(quote.amountCents) : "—"}</Td>
              <Td className="text-right">
                <Link className="font-semibold text-[#155DFC]" to="/espace/commandes/$id" params={{ id: order.id }} search={{ onglet: "suivi" }}>
                  Ouvrir
                </Link>
              </Td>
            </tr>
          );
        })}
      </DataTable>
      {orders.length === 0 ? <p className="mt-4 text-sm text-muted">Aucune commande. Vos demandes restent dans l’onglet Demandes jusqu’à la signature et l’acompte.</p> : null}
    </Shell>
  );
}
