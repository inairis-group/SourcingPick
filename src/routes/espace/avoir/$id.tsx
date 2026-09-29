import { useLayoutEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge } from "@/components/ops-ui";
import { frDate, useClient } from "@/components/client-ui";
import { PieceView } from "@/components/piece";
import { euros } from "@/lib/ops.shared";
import { avoirFromOps, openOpsAvoir, syncInvoiceClient } from "@/lib/ops-paper";

export const Route = createFileRoute("/espace/avoir/$id")({
  head: () => ({ meta: [{ title: "SourcingPick — Avoir" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { data, error } = useClient();
  const invoice = data?.invoices.find((item) => (item.id === id || item.number === id) && item.kind === "credit");
  useLayoutEffect(() => {
    if (invoice) syncInvoiceClient(invoice);
  }, [invoice]);
  if (!invoice) return <Shell><p>{error || "Avoir introuvable."}</p></Shell>;
  const source = invoice.method.replace(/^Annule\s+/, "") || invoice.orderRef || "facture";
  const reason = `Annulation de la facture ${source}.`;
  const draft = avoirFromOps({
    number: invoice.number,
    clientName: invoice.clientCompany || invoice.clientName,
    amountCents: invoice.amountCents,
    sourceNumber: source,
    reason,
    issuedOn: invoice.issuedOn,
    clientId: invoice.clientUserId || "",
    lines: invoice.lines,
  });
  return (
    <Shell>
      <PageHead title={`Avoir ${invoice.number}`}>
        <Badge value="Émis" />
      </PageHead>
      <PieceView
        doc={draft}
        fileName={`${invoice.number}.pdf`}
        clientName={invoice.clientCompany || invoice.clientName}
        site={invoice.orderRef}
        onPdf={() => void openOpsAvoir({
          number: invoice.number,
          clientName: invoice.clientCompany || invoice.clientName,
          amountCents: invoice.amountCents,
          sourceNumber: source,
          reason,
          issuedOn: invoice.issuedOn,
          clientId: invoice.clientUserId || "",
          lines: invoice.lines,
        })}
      >
        <p>Émis le {frDate(invoice.issuedOn)}</p>
        <p className="mt-2">Annule {source}</p>
        <p className="mono mt-4 text-2xl font-semibold">− {euros(invoice.amountCents)}</p>
        <p className="mt-3">{reason}</p>
      </PieceView>
    </Shell>
  );
}
