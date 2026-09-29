import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge } from "@/components/ops-ui";
import { opsCreateQuote, opsOrder, opsSaveQualification, opsSetState } from "@/lib/ops.functions";
import { STATE_TREE, type OpsSupplier } from "@/lib/ops.shared";
import { useAccount } from "@/lib/use-account";

export const Route = createFileRoute("/demandes/$id")({
  head: () => ({ meta: [{ title: "SourcingPick — Qualification" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const admin = useAccount()?.role === "admin";
  const [note, setNote] = useState("");
  const [suppliers, setSuppliers] = useState<OpsSupplier[]>([]);
  const [sub, setSub] = useState("Informations manquantes");
  const [error, setError] = useState("");
  const [pack, setPack] = useState<Awaited<ReturnType<typeof opsOrder>>>(null);

  useEffect(() => {
    void opsOrder({ data: id }).then((value) => {
      setPack(value);
      setNote(value?.order.internalNote ?? "");
      setSuppliers(value?.suppliers ?? []);
      if (value?.order.substate) setSub(value.order.substate);
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : "Lecture impossible."));
  }, [id]);

  const order = pack?.order;
  async function save() {
    await opsSaveQualification({ data: { id: order?.id ?? id, note, suppliers } });
    await opsSetState({ data: { id: order?.id ?? id, substate: sub, comment: "" } });
  }

  return (
    <Shell>
      <PageHead title={order ? order.ref : "Qualification"}>
        {admin ? (
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            void opsCreateQuote().then(async (quote) => {
              if (!quote || !order) return;
              const { opsSaveQuote } = await import("@/lib/ops.functions");
              await opsSaveQuote({
                data: { ...quote, clientName: order.clientName, orderRef: order.ref },
              });
              void navigate({ to: "/devis/nouveau", search: { id: quote.id } });
            });
          }}
        >
          Établir le devis
        </button>
        ) : null}
      </PageHead>
      {error ? <p className="text-sm text-[#8a1c1c]">{error}</p> : null}
      {order ? (
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span>{order.clientName} · {order.product}</span>
          <Badge value={order.state} />
          {order.clientEmail ? <a className="font-semibold text-brand" href={`mailto:${order.clientEmail}`}>{order.clientEmail}</a> : null}
          {order.clientPhone ? <a className="font-semibold text-brand" href={`tel:${order.clientPhone.replace(/\s/g, "")}`}>{order.clientPhone}</a> : null}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="card">
          <h2 className="font-semibold">État</h2>
          <label className="mt-3 block text-sm text-muted">
            Sous-état
            <select className="field mt-1" value={sub} onChange={(event) => setSub(event.target.value)}>
              {STATE_TREE.flatMap((group) => group.subs.map((item) => (
                <option key={item.name} value={item.name}>{group.state} — {item.name}</option>
              )))}
            </select>
          </label>
          <button className="btn btn-quiet mt-3 w-full" type="button" onClick={() => void save()}>
            Enregistrer
          </button>
          <button className="btn btn-ghost mt-2 w-full" type="button" onClick={() => void opsSetState({ data: { id: order?.id ?? id, substate: "Informations manquantes", comment: "Demande d’informations" } })}>
            Demander au client
          </button>
        </section>
        <section className="card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Consultation fournisseurs</h2>
            <button
              className="btn btn-quiet"
              type="button"
              onClick={() => setSuppliers((rows) => [...rows, { id: "", orderId: id, name: "", price: "", qty: "", lead: "", status: "Comparé" }])}
            >
              Ajouter un fournisseur consulté
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted uppercase">
                  {["Fournisseur", "Prix reçu", "Qté", "Délai", "Statut"].map((label) => <th key={label} className="pb-2">{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {suppliers.map((row, index) => (
                  <tr key={`${row.id}-${index}`}>
                    {(["name", "price", "qty", "lead"] as const).map((key) => (
                      <td key={key} className="py-1 pr-2">
                        <input className="field" value={row[key]} onChange={(event) => setSuppliers((rows) => rows.map((item, i) => i === index ? { ...item, [key]: event.target.value } : item))} />
                      </td>
                    ))}
                    <td>
                      <select className="field" value={row.status} onChange={(event) => setSuppliers((rows) => rows.map((item, i) => i === index ? { ...item, status: event.target.value } : item))}>
                        <option>Retenu</option>
                        <option>Comparé</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <label className="mt-4 block text-sm">
            Note interne
            <textarea className="field mt-1" value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <p className="mt-1 text-xs text-muted">Interne, non visible par le client</p>
          {order?.note ? <p className="mt-3 whitespace-pre-wrap text-sm"><span className="font-semibold">Demande du client. </span>{order.note}</p> : null}
          {pack?.journal?.length ? (
            <div className="mt-5">
              <h3 className="font-semibold">Historique</h3>
              <ol className="mt-2 grid gap-1 text-sm text-muted">
                {pack.journal.map((event) => (
                  <li key={event.id}>{event.action} · {event.atLabel}</li>
                ))}
              </ol>
            </div>
          ) : null}
          <Link to="/commandes/$id" params={{ id: order?.id ?? id }} className="mt-4 inline-block text-sm font-semibold text-brand">
            Ouvrir la commande
          </Link>
        </section>
      </div>
    </Shell>
  );
}
