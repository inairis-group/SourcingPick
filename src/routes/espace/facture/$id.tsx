import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, useOps } from "@/components/ops-ui";
import { frDate, useClient } from "@/components/client-ui";
import { PieceView } from "@/components/piece";
import { duePhrase, euros } from "@/lib/ops.shared";
import { factureFromOps, openOpsInvoice } from "@/lib/ops-paper";
import { opsInvoice } from "@/lib/ops.functions";

export const Route = createFileRoute("/espace/facture/$id")({
  head: () => ({ meta: [{ title: "SourcingPick — Facture" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { data, error } = useClient();
  const summary = data?.invoices.find((item) => item.id === id || item.number === id);
  const { data: full } = useOps(() => (summary ? opsInvoice({ data: summary.id }) : Promise.resolve(null)), summary ? `invoice-view:${summary.id}` : "invoice-view:wait");
  const invoice = full ?? summary;
  if (!invoice) return <Shell><p>{error || "Chargement…"}</p></Shell>;
  const payable = invoice.kind !== "credit" && (invoice.status === "À régler" || invoice.status === "En retard");
  const announced = invoice.status === "Virement annoncé" || invoice.status === "Virement déclaré";
  const deposit = invoice.kind === "deposit" || /acompte/i.test(invoice.lines[0]?.title || "");
  const draft = factureFromOps(invoice);
  const stateLabel = invoice.status === "Payée"
    ? "Facture soldée"
    : invoice.status === "Annulée"
      ? "Facture annulée"
      : announced
        ? "Virement annoncé, en attente de rapprochement"
        : deposit
          ? "Acompte à régler"
          : "Facture à régler";
  return (
    <Shell>
      <PageHead title={deposit ? `Facture d’acompte ${invoice.number}` : `Facture ${invoice.number}`}>
        <Badge value={invoice.status} />
      </PageHead>
      <p className="-mt-3 mb-4 text-sm text-muted">Échéance {duePhrase(invoice.dueOn)} · émise le {frDate(invoice.issuedOn || invoice.receivedOn)}</p>
      <PieceView doc={draft} fileName={`${invoice.number}.pdf`} clientName={invoice.clientName} site={invoice.orderRef} onPdf={() => void openOpsInvoice(invoice)}>
        <p>Émis le {frDate(invoice.issuedOn || invoice.receivedOn)}</p>
        <p className="mt-2">Commande {invoice.orderRef || "—"}</p>
        <p className="mono mt-4 text-2xl font-semibold">{euros(invoice.amountCents)}</p>
        <p className="mt-1 text-muted">{stateLabel}</p>
        {payable ? <Link className="btn btn-primary mt-4 w-full" to="/espace/payer/$id" params={{ id: invoice.id }}>Payer maintenant</Link> : <p className="mt-4">{invoice.status === "Payée" ? "Cette facture est soldée." : announced ? "Ce n’est pas encore un encaissement." : invoice.status === "Annulée" ? "Cette facture est annulée." : "Cette pièce n’est pas à régler en ligne."}</p>}
      </PieceView>
    </Shell>
  );
}
