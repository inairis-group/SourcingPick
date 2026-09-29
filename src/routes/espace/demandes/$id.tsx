import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge } from "@/components/ops-ui";
import { ClientPiece, Composer, Timeline, readClientPieces, useClient } from "@/components/client-ui";
import { clientAttach, clientReply } from "@/lib/ops.functions";
import { euros } from "@/lib/ops.shared";

export const Route = createFileRoute("/espace/demandes/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    envoyee: search.envoyee === true || search.envoyee === "1" || search.envoyee === 1,
  }),
  head: () => ({ meta: [{ title: "SourcingPick — Demande" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { data, error, reload } = useClient();
  const { envoyee } = Route.useSearch();
  const order = data?.orders.find((item) => item.id === id || item.ref === id);
  const quote = data?.quotes.find((item) => item.orderRef === order?.ref && item.status !== "Devis refusé");
  const docs = (data?.documents ?? []).filter((doc) => doc.orderRef === order?.ref);
  const [fileNote, setFileNote] = useState("");
  const [uploadNote, setUploadNote] = useState("");
  useEffect(() => {
    const missed = window.sessionStorage.getItem("sp-file-note");
    if (missed) {
      setFileNote(missed);
      window.sessionStorage.removeItem("sp-file-note");
    }
  }, []);
  if (!data && !error) return <Shell><p className="text-sm text-muted">Chargement…</p></Shell>;
  if (!order) return <Shell><p>Demande introuvable.</p></Shell>;
  return (
    <Shell>
      <PageHead title={order.ref}>
        <Badge value={order.state} />
        <Link to="/espace/messages" className="btn btn-quiet">Écrire à mon agent</Link>
      </PageHead>
      <p className="-mt-3 mb-5 text-sm text-muted">{order.product}</p>
      {envoyee ? (
        <p className="mb-4 rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          Votre demande est chez nous. Ce n’est pas encore une commande : elle le devient quand le devis est signé et l’acompte reçu. Un agent vous répond sous 24 à 72 heures.
        </p>
      ) : null}
      {fileNote ? <p className="mb-4 text-sm text-[#8a1c1c]">Ces fichiers n’ont pas été joints : {fileNote}. Vous pouvez les renvoyer ci-dessous.</p> : null}
      {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="card">
          <h2 className="mb-3 font-semibold">Suivi de la demande</h2>
          <Timeline state={order.state} />
        </section>
        <div className="flex flex-col gap-4">
          <section className="card grid gap-3 text-sm sm:grid-cols-2">
            <Field label="Détail" value={order.note || "—"} />
            <Field label="Produits" value={order.product} />
            <Field label="Agent" value={order.agentName} />
            <Field label="Destination" value={quote?.port || "—"} />
          </section>
          {quote ? (
            <section className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Devis {quote.number}</p>
                <p className="text-sm text-muted">{euros(quote.amountCents)} · {quote.status}</p>
              </div>
              {quote.status === "Devis envoyé" ? (
                <Link className="btn btn-primary" to="/espace/signer/$id" params={{ id: quote.id }}>Signer le devis</Link>
              ) : (
                <Link className="btn btn-quiet" to="/espace/devis/$id" params={{ id: quote.id }}>Ouvrir le devis</Link>
              )}
            </section>
          ) : null}
          <section className="card">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Photos et fichiers</h2>
              <label className="btn btn-quiet cursor-pointer">
                Ajouter
                <input
                  className="sr-only"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.xls,.xlsx,.doc,.docx,.csv,.txt"
                  onChange={(event) => {
                    const picked = event.target.files;
                    event.target.value = "";
                    void (async () => {
                      const { pieces, errors } = await readClientPieces(picked, docs.length);
                      if (errors[0]) setUploadNote(errors[0]);
                      for (const piece of pieces) {
                        try {
                          await clientAttach({ data: { orderId: order.id, ...piece } });
                        } catch (err) {
                          setUploadNote(err instanceof Error ? err.message : "Envoi impossible.");
                        }
                      }
                      if (pieces.length) reload();
                    })();
                  }}
                />
              </label>
            </div>
            {uploadNote ? <p className="mb-3 text-sm text-[#8a1c1c]">{uploadNote}</p> : null}
            {docs.length === 0 ? <p className="text-sm text-muted">Aucun fichier pour le moment.</p> : null}
            <ul className="flex flex-col gap-3">
              {docs.map((doc) => (
                <li key={doc.id} className="rounded-xl border border-line px-3 py-3 text-sm">
                  <p className="font-semibold">{doc.title}</p>
                  <p className="mb-2 text-xs text-muted">{doc.category}</p>
                  <ClientPiece id={doc.id} title={doc.title} mime={doc.mime} byteSize={doc.byteSize} />
                </li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2 className="font-semibold">Message</h2>
            <Composer onSend={async (body) => { await clientReply({ data: { orderId: order.id, body } }); reload(); }} />
          </section>
        </div>
      </div>
    </Shell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
