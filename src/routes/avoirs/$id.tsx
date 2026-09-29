import { useLayoutEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell, PageHead } from "@/components/shell";
import { Editor } from "@/components/editor";
import { PaperView } from "@/components/paper";
import { Badge, useOps } from "@/components/ops-ui";
import { opsInvoice } from "@/lib/ops.functions";
import { avoirFromOps, openOpsAvoir, syncInvoiceClient } from "@/lib/ops-paper";
import { clientLabel, euros } from "@/lib/ops.shared";
import { useAtelier } from "@/lib/store";

export const Route = createFileRoute("/avoirs/$id")({
  head: () => ({ meta: [{ title: "SourcingPick — Avoir" }] }),
  component: Page,
});

function sourceOf(method: string, fallback: string) {
  return method.replace(/^Annule\s+/, "") || fallback || "facture";
}

function Page() {
  const { id } = Route.useParams();
  const local = useAtelier((state) => state.docs.find((doc) => doc.id === id));
  const opsId = id.startsWith("inv_") || !local;
  const { data, error } = useOps(() => (opsId ? opsInvoice({ data: id }) : Promise.resolve(null)), opsId ? `invoice:${id}` : "avoir-local");
  if (!opsId) {
    if (!local) return <Shell><p className="text-sm text-muted">Cet avoir local n’est plus dans l’atelier. Les avoirs réels sont dans la liste.</p></Shell>;
    return (
      <Shell>
        <Editor key={id} id={id} />
      </Shell>
    );
  }
  if (!data) return <Shell><p className="text-sm text-muted">{error || "Chargement de l’avoir…"}</p></Shell>;
  if (data.kind !== "credit") {
    return <Shell><p className="text-sm text-muted">Cette pièce n’est pas un avoir.</p></Shell>;
  }
  return <CreditSheet invoice={data} />;
}

function CreditSheet({ invoice }: { invoice: NonNullable<Awaited<ReturnType<typeof opsInvoice>>> }) {
  useLayoutEffect(() => {
    syncInvoiceClient(invoice);
  }, [invoice]);
  const source = sourceOf(invoice.method, invoice.orderRef);
  const draft = avoirFromOps({
    number: invoice.number,
    clientName: invoice.clientCompany || invoice.clientName,
    amountCents: invoice.amountCents,
    sourceNumber: source,
    reason: `Annulation de la facture ${source}.`,
    issuedOn: invoice.issuedOn,
    clientId: invoice.clientUserId || "",
    lines: invoice.lines,
  });
  return (
    <Shell>
      <PageHead title={`Avoir ${invoice.number}`}>
        <Badge value="Émis" />
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => void openOpsAvoir({
            number: invoice.number,
            clientName: invoice.clientCompany || invoice.clientName,
            amountCents: invoice.amountCents,
            sourceNumber: source,
            reason: draft.reason,
            issuedOn: invoice.issuedOn,
            clientId: invoice.clientUserId || "",
            lines: invoice.lines,
          })}
        >
          Ouvrir le PDF
        </button>
      </PageHead>
      <p className="mb-4 text-sm text-muted">
        {clientLabel({ name: invoice.clientName, company: invoice.clientCompany })} · annule {source} · − {euros(invoice.amountCents)}. Pièce finalisée, non modifiable.
      </p>
      <section className="overflow-auto rounded-[22px] border border-line bg-[#eef2f8] p-3">
        <PaperView doc={draft} />
      </section>
    </Shell>
  );
}
