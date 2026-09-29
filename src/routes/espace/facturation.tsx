import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Td } from "@/components/ops-ui";
import { Filters, frDate, useClient } from "@/components/client-ui";
import { euros } from "@/lib/ops.shared";
import { openOpsInvoice, openOpsQuote } from "@/lib/ops-paper";

export const Route = createFileRoute("/espace/facturation")({
  head: () => ({ meta: [{ title: "SourcingPick — Facturation" }] }),
  component: Page,
});

function Page() {
  const { data, error } = useClient();
  const [filter, setFilter] = useState("Tous");
  const quotes = data?.quotes ?? [];
  const invoices = data?.invoices ?? [];
  const credits = invoices.filter((invoice) => invoice.kind === "credit");
  const bills = invoices.filter((invoice) => invoice.kind !== "credit");
  const paid = bills.filter((invoice) => invoice.status === "Payée").reduce((sum, invoice) => sum + invoice.amountCents, 0);
  const due = bills.filter((invoice) => invoice.status !== "Payée" && invoice.status !== "Annulée").reduce((sum, invoice) => sum + invoice.amountCents, 0);
  const rows = [
    ...quotes.map((quote) => ({ kind: "Devis" as const, id: quote.id, number: quote.number, orderRef: quote.orderRef, issued: quote.issuedOn, amount: quote.amountCents, status: quote.status === "Devis envoyé" ? "À signer" : quote.status, href: "/espace/devis/$id" as const })),
    ...bills.map((invoice) => ({ kind: "Facture" as const, id: invoice.id, number: invoice.number, orderRef: invoice.orderRef, issued: invoice.issuedOn || invoice.receivedOn, amount: invoice.amountCents, status: invoice.status, href: "/espace/facture/$id" as const })),
    ...credits.map((invoice) => ({ kind: "Avoir" as const, id: invoice.id, number: invoice.number, orderRef: invoice.orderRef, issued: invoice.issuedOn, amount: invoice.amountCents, status: "Émis", href: "/espace/avoir/$id" as const })),
  ].filter((row) => filter === "Tous" || (filter === "Devis" && row.kind === "Devis") || (filter === "Factures" && row.kind === "Facture") || (filter === "Avoirs" && row.kind === "Avoir"));
  return (
    <Shell>
      <PageHead title="Facturation" />
      <p className="mb-4 text-sm text-muted">Vos devis, vos factures et vos avoirs. Chaque document s’ouvre tel qu’il a été émis.</p>
      {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Total réglé" value={euros(paid)} />
        <Stat label="Reste à régler" value={euros(due)} />
        <Stat label="Avoirs émis" value={String(credits.length)} />
      </section>
      <Filters value={filter} options={["Tous", "Devis", "Factures", "Avoirs"]} onChange={setFilter} />
      <DataTable head={["Document", "Commande", "Émis le", "Montant", "État", ""]}>
        {rows.map((row) => (
          <tr key={row.number}>
            <Td>
              <span className="block text-xs text-muted">{row.kind}</span>
              {row.number}
            </Td>
            <Td className="mono">{row.orderRef || "—"}</Td>
            <Td>{frDate(row.issued)}</Td>
            <Td className="mono">{row.kind === "Avoir" ? `− ${euros(row.amount)}` : euros(row.amount)}</Td>
            <Td><Badge value={row.status} /></Td>
            <Td className="text-right">
              <Link className="font-semibold text-[#155DFC]" to={row.href} params={{ id: row.id }}>
                Ouvrir
              </Link>
              {row.kind === "Devis" ? (
                <button className="ml-3 font-semibold text-[#155DFC]" type="button" onClick={() => void openOpsQuote(quotes.find((quote) => quote.id === row.id)!)}>
                  PDF
                </button>
              ) : null}
              {row.kind === "Facture" ? (
                <button className="ml-3 font-semibold text-[#155DFC]" type="button" onClick={() => void openOpsInvoice(invoices.find((invoice) => invoice.id === row.id)!)}>
                  PDF
                </button>
              ) : null}
            </Td>
          </tr>
        ))}
      </DataTable>
      <p className="mt-3 text-sm text-muted">Aucun PDF n’est stocké : chaque document est régénéré à l’ouverture, toujours à jour.</p>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="card">
      <p className="text-sm text-muted">{label}</p>
      <p className="display mt-1 text-2xl">{value}</p>
    </article>
  );
}
