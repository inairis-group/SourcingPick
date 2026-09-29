import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { useClient } from "@/components/client-ui";
import { clientTransfer } from "@/lib/ops.functions";
import { euros } from "@/lib/ops.shared";

export const Route = createFileRoute("/espace/payer/$id")({
  head: () => ({ meta: [{ title: "SourcingPick — Paiement" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { data, error, reload } = useClient();
  const invoice = data?.invoices.find((item) => item.id === id || item.number === id);
  const order = data?.orders.find((item) => item.ref === invoice?.orderRef);
  const payable = Boolean(invoice && invoice.kind !== "credit" && (invoice.status === "À régler" || invoice.status === "En retard"));
  const [method, setMethod] = useState("Virement bancaire");
  const [note, setNote] = useState("");
  if (!invoice || !data) return <Shell><p>{error || "Chargement…"}</p></Shell>;
  return (
    <Shell>
      <PageHead title="Paiement de l’acompte" />
      <p className="-mt-3 mb-4 text-sm text-muted">{invoice.orderRef} · {order?.product}</p>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="card flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {["Virement bancaire", "Carte bancaire"].map((item) => (
              <button key={item} type="button" className={`btn ${method === item ? "btn-primary" : "btn-quiet"}`} onClick={() => setMethod(item)}>
                {item}
              </button>
            ))}
          </div>
          {method === "Virement bancaire" && payable ? (
            <dl className="text-sm">
              <Row label="Bénéficiaire" value={data.bank.beneficiary} />
              <Row label="IBAN" value={data.bank.iban} />
              <Row label="SWIFT / BIC" value={data.bank.swift} />
              <Row label="Banque" value={data.bank.bank} />
              <p className="mt-3 text-muted">Indiquez la référence {invoice.orderRef} dans le libellé du virement.</p>
              <button
                className="btn btn-primary mt-4"
                type="button"
                onClick={() => {
                  void clientTransfer({ data: invoice.id })
                    .then(() => {
                      setNote("Virement annoncé. L’administration le verra dans Paiements et le rapprochera dès réception. La commande reste en attente des fonds.");
                      reload();
                    })
                    .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Déclaration impossible."));
                }}
              >
                J’ai effectué le virement
              </button>
            </dl>
          ) : payable ? (
            <p className="text-sm text-muted">Paiement sécurisé par Stripe. Aucune donnée de carte n’est conservée par Sourcing Pick. Le lien de paiement est envoyé avec la facture tant que Stripe n’est pas branché sur ce compte.</p>
          ) : (
            <p className="text-sm text-muted">{invoice.status === "Virement annoncé" ? "Le virement est déjà annoncé. L’encaissement n’est pas encore enregistré." : invoice.status === "Payée" ? "Cette facture est déjà soldée." : "Cette pièce n’est pas à régler en ligne."}</p>
          )}
          {note ? <p className="text-sm">{note}</p> : null}
        </section>
        <aside className="card">
          <p className="text-sm text-muted">Montant à régler</p>
          <p className="mono text-2xl font-semibold">{euros(invoice.amountCents)}</p>
          <p className="mt-3 text-sm">État · {invoice.status}</p>
        </aside>
      </div>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
