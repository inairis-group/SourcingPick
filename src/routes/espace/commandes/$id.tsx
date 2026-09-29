import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge } from "@/components/ops-ui";
import { Composer, ClientPiece, OrderTabs, Timeline, frDate, readClientPieces, useClient } from "@/components/client-ui";
import { VoiceNote } from "@/components/piece";
import { clientAttach, clientCancel, clientReply } from "@/lib/ops.functions";
import { euros } from "@/lib/ops.shared";
import { openOpsInvoice, openOpsQuote } from "@/lib/ops-paper";

export const Route = createFileRoute("/espace/commandes/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    onglet: ["suivi", "photos", "documents", "messages", "factures"].includes(String(search.onglet)) ? String(search.onglet) : "suivi",
  }),
  head: () => ({ meta: [{ title: "SourcingPick — Commande" }] }),
  component: Page,
});

const TILES = [
  "/illustrations/etape-reception.svg?v=orig",
  "/illustrations/etape-verification.svg?v=orig",
  "/illustrations/etape-bois.svg",
  "/illustrations/etape-chargement.svg",
  "/illustrations/etape-navire.svg",
  "/illustrations/etape-consolidation.svg",
];

function isPhoto(doc: { mime: string; category: string; title: string }) {
  return doc.mime.startsWith("image/") || /photo|vidéo|video/i.test(`${doc.category} ${doc.title}`);
}

function Page() {
  const { id } = Route.useParams();
  const { onglet } = Route.useSearch();
  const { data, error, reload } = useClient();
  const [uploadNote, setUploadNote] = useState("");
  const [cancel, setCancel] = useState(false);
  const order = data?.orders.find((item) => item.id === id || item.ref === id);
  if (!order) {
    return (
      <Shell>
        <p>{error || "Chargement…"}</p>
      </Shell>
    );
  }
  const docs = (data?.documents ?? []).filter((doc) => doc.orderRef === order.ref);
  const photos = docs.filter((doc) => isPhoto(doc));
  const papers = docs.filter((doc) => !isPhoto(doc));
  const quotes = (data?.quotes ?? []).filter((quote) => quote.orderRef === order.ref);
  const invoices = (data?.invoices ?? []).filter((invoice) => invoice.orderRef === order.ref);
  const messages = (data?.messages ?? []).filter((message) => message.orderId === order.id || message.ref === order.ref);
  const clos = ["Expédié", "En transit", "Terminé", "Annulé"].includes(order.state);
  return (
    <Shell>
      <PageHead title={`Commande ${order.ref}`}>
        <Badge value={order.state} />
      </PageHead>
      <p className="-mt-3 mb-4 text-sm text-muted">{order.product}</p>
      <OrderTabs id={order.id} current={onglet} />
      {!clos ? (
        <div className="mb-4">
          {cancel ? (
            <div className="card text-sm">
              <p>Annuler la commande {order.ref} ? La préparation s’arrête et le fournisseur est prévenu. L’acompte déjà réglé reste dû au titre des frais engagés.</p>
              <div className="mt-3 flex gap-2">
                <button className="btn btn-primary" type="button" onClick={() => void clientCancel({ data: order.id }).then(() => reload())}>Oui, annuler la commande</button>
                <button className="btn btn-quiet" type="button" onClick={() => setCancel(false)}>Retour</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-quiet" type="button" onClick={() => setCancel(true)}>Annuler la commande</button>
          )}
        </div>
      ) : null}
      {onglet === "suivi" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="card">
            <h2 className="mb-3 font-semibold">Suivi de la demande</h2>
            <Timeline state={order.state} />
          </section>
          <section className="card text-sm">
            <h2 className="mb-3 font-semibold">Prochaine étape</h2>
            <p className="mb-3">{SHIP[order.ref]?.next ?? order.substate}</p>
            <Field label="Agent" value={order.agentName} />
            <Field label="Mise à jour" value={frDate(order.updatedAt)} />
            {SHIP[order.ref] ? (
              <>
                <Field label="N° de conteneur" value={SHIP[order.ref].box} />
                <Field label="Navire" value={SHIP[order.ref].ship} />
                <Field label="Départ prévu" value={SHIP[order.ref].depart} />
                <Field label="Arrivée prévue" value={SHIP[order.ref].arrive} />
                <Field label="Port d’arrivée" value={SHIP[order.ref].port} />
              </>
            ) : null}
          </section>
        </div>
      ) : null}
      {onglet === "photos" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.length === 0 ? <p className="text-sm text-muted">Aucune photo pour l’instant. Celles jointes à la demande apparaissent ici.</p> : null}
          {photos.map((photo, index) => (
            <article key={photo.id} className="card overflow-hidden p-0">
              {photo.byteSize > 0 ? null : <img src={TILES[index % TILES.length]} alt="" className="h-40 w-full object-contain bg-[#eef3ff]" />}
              <div className="p-4">
                <p className="font-semibold">{photo.title}</p>
                <p className="mb-2 text-sm text-muted">{frDate(photo.issuedOn)}</p>
                <ClientPiece id={photo.id} title={photo.title} mime={photo.mime || "image/jpeg"} byteSize={photo.byteSize} />
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {onglet === "documents" ? (
        <section className="card">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">Fichiers de cette commande. Vous pouvez en ajouter.</p>
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
          {papers.length === 0 ? <p className="text-sm text-muted">Aucun autre fichier.</p> : null}
          <ul className="flex flex-col">
            {papers.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-3 text-sm">
                <span>{doc.title}</span>
                <ClientPiece id={doc.id} title={doc.title} mime={doc.mime} byteSize={doc.byteSize} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {onglet === "messages" ? (
        <section className="card">
          <ul className="flex flex-col gap-3">
            {messages.map((message) => (
              <li key={message.id} className="rounded-2xl bg-canvas px-4 py-3 text-sm">
                <p className="font-semibold">{message.author} <span className="font-normal text-muted">{message.atLabel}</span></p>
                {message.kind === "voice" ? <VoiceNote body={message.body} /> : <p className="mt-1">{message.body}</p>}
              </li>
            ))}
          </ul>
          <Composer onSend={async (body) => { await clientReply({ data: { orderId: order.id, body } }); reload(); }} />
        </section>
      ) : null}
      {onglet === "factures" ? (
        <section className="card flex flex-col gap-3">
          {quotes.map((quote) => (
            <div key={quote.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
              <div>
                <p className="font-semibold">{quote.number}</p>
                <p className="text-sm text-muted">{quote.status} · {euros(quote.amountCents)}</p>
              </div>
              <div className="flex gap-2">
                <Link className="btn btn-quiet" to="/espace/devis/$id" params={{ id: quote.id }}>Ouvrir</Link>
                <button className="btn btn-quiet" type="button" onClick={() => void openOpsQuote(quote)}>PDF</button>
              </div>
            </div>
          ))}
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{invoice.number}</p>
                <p className="text-sm text-muted">{invoice.status} · {euros(invoice.amountCents)}</p>
              </div>
              <div className="flex gap-2">
                <Link className="btn btn-quiet" to="/espace/facture/$id" params={{ id: invoice.id }}>Ouvrir</Link>
                <button className="btn btn-quiet" type="button" onClick={() => void openOpsInvoice(invoice)}>PDF</button>
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </Shell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="mb-2">
      <span className="block text-xs uppercase tracking-wide text-muted">{label}</span>
      {value}
    </p>
  );
}

const SHIP: Record<string, { box: string; ship: string; depart: string; arrive: string; port: string; next: string }> = {
  "SP-2026-0139": { box: "TCLU 778 392 6", ship: "COSCO", depart: "18/09/2026", arrive: "26/10/2026", port: "Le Havre", next: "Prêt à charger → Expédié" },
  "SP-2026-0131": { box: "MSCU 441 220 8", ship: "CMA CGM", depart: "02/09/2026", arrive: "14/10/2026", port: "Le Havre", next: "En mer" },
};
