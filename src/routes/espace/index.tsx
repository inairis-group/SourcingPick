import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, FileText, ListChecks, PenLine, Ship, Wallet } from "lucide-react";
import { Shell } from "@/components/shell";
import { Hero, Stat } from "@/components/design";
import { FirstSteps } from "@/components/tour";
import { Badge, DataTable, Td } from "@/components/ops-ui";
import { frDate, isCommande, stepIndex, useClient } from "@/components/client-ui";
import { duePhrase, euros } from "@/lib/ops.shared";

export const Route = createFileRoute("/espace/")({
  head: () => ({ meta: [{ title: "SourcingPick — Espace client" }] }),
  component: Page,
});

function Page() {
  const { data, error } = useClient();
  const orders = data?.orders ?? [];
  const quotes = data?.quotes ?? [];
  const invoices = data?.invoices ?? [];
  const open = orders.filter((order) => !isCommande(order.state) && !["Terminé", "Annulé"].includes(order.state));
  const toSign = quotes.filter((quote) => quote.status === "Devis envoyé");
  const transit = orders.filter((order) => order.state === "En transit");
  const toPay = invoices.filter((invoice) => invoice.status === "À régler" || invoice.status === "En retard");

  return (
    <Shell>
      <div data-tour="board">
      <Hero
        kicker="Client"
        title={data?.name ? `Bonjour ${data.name.split(" ")[0]}` : "Votre espace"}
        text="Voici où en sont vos demandes et vos commandes."
      >
        <Link to="/espace/demandes/nouvelle" className="btn btn-primary" data-tour="demande">
          Nouvelle demande <ArrowRight size={16} />
        </Link>
        <Link to="/espace/commandes" className="btn btn-quiet">Commandes</Link>
      </Hero>
        {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
        <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Demandes en cours" value={String(open.length)} icon={<ListChecks size={16} />} tone="#EEF3FF" ink="#155DFC" />
          <Stat label="Devis à signer" value={String(toSign.length)} icon={<FileText size={16} />} tone="#F3EEFF" ink="#7C5CFF" />
          <Stat label="Commandes en transit" value={String(transit.length)} icon={<Ship size={16} />} tone="#FFF6E8" ink="#B45309" />
          <Stat label="Documents ajoutés cette semaine" value={String((data?.documents ?? []).length)} icon={<Camera size={16} />} tone="#E3F6EC" ink="#0E9F6E" />
        </section>
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
        <section className="card mb-5 flex flex-col gap-3" data-tour="devis">
          <h2 className="display text-lg">Ce qu’on attend de vous</h2>
          {toSign.length + toPay.length === 0 ? <p className="text-sm text-muted">Rien en attente.</p> : null}
          {toSign.map((quote) => (
            <article key={quote.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#FFF3D6] text-[#B45309]">
                  <PenLine size={17} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Signer le devis {quote.number}</p>
                  <p className="text-sm text-muted">
                    {quote.orderRef} · {euros(quote.amountCents)}
                  </p>
                </div>
              </div>
              <Link className="btn btn-primary" to="/espace/signer/$id" params={{ id: quote.id }}>
                Ouvrir <ArrowRight size={15} />
              </Link>
            </article>
          ))}
          {toPay.map((invoice) => (
            <article key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#FFF3D6] text-[#B45309]">
                  <Wallet size={17} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Payer {invoice.number}</p>
                  <p className="text-sm text-muted">
                    {invoice.orderRef} · échéance {duePhrase(invoice.dueOn)} · {euros(invoice.amountCents)}
                  </p>
                </div>
              </div>
              <Link className="btn btn-primary" to="/espace/payer/$id" params={{ id: invoice.id }}>
                Ouvrir <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </section>
        <section className="mb-5" data-tour="documents">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="display text-lg">Commandes en cours</h2>
            <Link to="/espace/commandes" className="text-sm font-semibold text-[#155DFC]">
              Tous
            </Link>
          </div>
          <DataTable head={["Référence", "Produit", "État", "Montant", ""]}>
            {orders.filter((order) => isCommande(order.state) && order.state !== "Terminé").slice(0, 8).map((order) => {
              const quote = quotes.find((item) => item.orderRef === order.ref);
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
                    {stepIndex(order.state) <= 2 ? (
                      <Link className="font-semibold text-[#155DFC]" to="/espace/demandes/$id" params={{ id: order.id }} search={{ envoyee: false }}>
                        Ouvrir
                      </Link>
                    ) : (
                      <Link className="font-semibold text-[#155DFC]" to="/espace/commandes/$id" params={{ id: order.id }} search={{ onglet: "suivi" }}>
                        Ouvrir
                      </Link>
                    )}
                  </Td>
                </tr>
              );
            })}
          </DataTable>
        </section>
          </div>
          <div className="flex flex-col gap-4">
            <div data-tour="premiers-pas">
              <FirstSteps />
            </div>
            <section className="card" data-tour="messages">
              <h2 className="display mb-3 text-lg">Dernières activités</h2>
              <ul className="flex flex-col gap-3">
                {(data?.journal ?? []).slice(0, 5).map((entry) => (
                  <li key={entry.id} className="text-sm">
                    <p className="font-semibold">{entry.action}</p>
                    <p className="text-muted">
                      {entry.objectRef} · {entry.atLabel}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Shell>
  );
}

