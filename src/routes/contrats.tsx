import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { useOps } from "@/components/ops-ui";
import { opsClients, opsContract, opsDocuments, opsSaveContract, opsSendDocumentSign } from "@/lib/ops.functions";
import { clientLabel, type OpsClient, type OpsDocument } from "@/lib/ops.shared";
import { ContractView } from "@/components/contract-sheet";

const MODEL = `CONTRAT DE PRESTATION

Entre **SourcingPick** (Hangzhou Qiyuan Ying Technology Information Co., Ltd.) et le client nommé sur ce document.

1. Objet
SourcingPick réceptionne, contrôle, consolide et expédie les marchandises convenues. Le client reste l’acheteur auprès du fournisseur et l’importateur des marchandises.

2. Prix
Le prix, l’acompte et le solde sont ceux du devis accepté ou des factures liées.

- Les sommes versées sont affectées à la commande.
- Elles ne constituent pas un séquestre.

3. Exécution
Les photos d’étape sont versées au dossier. Un écart de quantité, de référence ou d’état est signalé avant consolidation. Les délais de port et de douane ne sont pas garantis.

4. Signature
La signature électronique identifie le signataire : nom, fonction, société, email vérifié par code, date et adresse IP. Elle vaut acceptation de ce contrat et des conditions générales publiées sur sourcingpick.com.`;

export const Route = createFileRoute("/contrats")({
  validateSearch: (search: Record<string, unknown>): { id: string } => ({
    id: typeof search.id === "string" ? search.id : "",
  }),
  head: () => ({ meta: [{ title: "SourcingPick — Contrats" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, error, reload } = useOps(async () => {
    const [documents, clients] = await Promise.all([opsDocuments(), opsClients()]);
    return { documents: documents.filter((item) => item.category === "Contrats"), clients };
  });
  const contracts = data?.documents ?? [];
  const clients = data?.clients ?? [];
  const [id, setId] = useState(search.id);
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [body, setBody] = useState(MODEL);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Bonjour, merci de lire ce contrat et de le signer.");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [localError, setLocalError] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = status === "signed";

  useEffect(() => {
    if (!search.id) return;
    setId(search.id);
    void opsContract({ data: search.id })
      .then((contract) => {
        setTitle(contract.title);
        setClientName(contract.clientName);
        setBody(contract.body || MODEL);
        setEmail(contract.signEmail || emailFor(clients, contract.clientName));
        setStatus(contract.signStatus);
      })
      .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Contrat introuvable."));
  }, [search.id]);

  function pickClient(name: string) {
    setClientName(name);
    setEmail(emailFor(clients, name));
  }

  function open(doc: OpsDocument) {
    setLocalError("");
    setNote("");
    void navigate({ search: { id: doc.id } });
  }

  function fresh() {
    setId("");
    setTitle("");
    setClientName("");
    setBody(MODEL);
    setEmail("");
    setStatus("");
    setNote("");
    setLocalError("");
    void navigate({ search: { id: "" } });
  }

  function save() {
    setBusy(true);
    setLocalError("");
    void opsSaveContract({ data: { id, clientName, title, body } })
      .then((saved) => {
        setId(saved.id);
        setNote("Contrat enregistré dans les documents du client.");
        void navigate({ search: { id: saved.id } });
        reload();
      })
      .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Enregistrement impossible."))
      .finally(() => setBusy(false));
  }

  function send() {
    setBusy(true);
    setLocalError("");
    void opsSaveContract({ data: { id, clientName, title, body } })
      .then((saved) => {
        setId(saved.id);
        void navigate({ search: { id: saved.id } });
        return opsSendDocumentSign({ data: { documentId: saved.id, email, message } });
      })
      .then(() => {
        setStatus("sent");
        setNote(`Lien de signature envoyé à ${email}. Le contrat est dans les documents.`);
        reload();
      })
      .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Envoi impossible."))
      .finally(() => setBusy(false));
  }

  return (
    <Shell>
      <PageHead title="Contrats">
        <button className="btn btn-quiet" type="button" onClick={fresh}>Nouveau contrat</button>
      </PageHead>
      <p className="mb-4 max-w-3xl text-sm text-muted">Le contrat se range dans le dossier Contrats du client. Vous pouvez le modifier tant qu’il n’est pas signé. L’envoi ouvre le même lien : email, code, lecture, signature.</p>
      {error || localError ? <p className="mb-3 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {note ? <p className="mb-3 text-sm text-muted">{note}</p> : null}
      <div className="grid items-start gap-4 xl:grid-cols-[240px_minmax(320px,460px)_minmax(0,1fr)]">
        <aside className="card">
          <h2 className="mb-3 text-sm font-semibold">Dossier</h2>
          {contracts.length === 0 ? <p className="text-sm text-muted">Aucun contrat pour l’instant.</p> : (
            <ul className="grid gap-1">
              {contracts.map((doc) => (
                <li key={doc.id}>
                  <button type="button" className={`w-full rounded-xl px-3 py-2 text-left text-sm ${doc.id === id ? "bg-navy text-white" : ""}`} onClick={() => open(doc)}>
                    <span className="block font-semibold">{doc.title}</span>
                    <span className={`text-xs ${doc.id === id ? "text-white/70" : "text-muted"}`}>{doc.clientName} · {doc.signStatus === "signed" ? "Signé" : doc.signStatus === "sent" ? "Envoyé" : "Brouillon"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <form className="card grid gap-3" onSubmit={(event) => { event.preventDefault(); save(); }}>
          <label className="text-sm">Client
            <select className="field mt-1" value={clientName} disabled={locked} onChange={(event) => pickClient(event.target.value)}>
              <option value="">Choisir</option>
              {clients.map((client) => (
                <option key={client.id} value={clientLabel(client)}>{clientLabel(client)}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">Titre
            <input className="field mt-1" value={title} disabled={locked} placeholder="Contrat de prestation" onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="text-sm">Texte
            <textarea className="field mt-1 min-h-[280px] font-normal leading-6" value={body} disabled={locked} onChange={(event) => setBody(event.target.value)} />
          </label>
          <p className="text-xs text-muted">Une ligne seule devient un titre. « 1. Objet » ouvre une section. Une ligne vide sépare les paragraphes. « - » fait une liste. **gras** et *italique*.</p>
          {locked ? <p className="text-sm text-muted">Signé. Le texte ne change plus.</p> : (
            <button className="btn btn-primary w-fit" type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
          )}
        </form>
        <aside className="grid gap-3">
          <ContractView title={title || "Contrat"} client={clientName} body={body} />
          <div className="card grid gap-3">
          <label className="text-sm">Email du signataire
            <input className="field mt-1" type="email" value={email} disabled={locked} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="text-sm">Message
            <textarea className="field mt-1 min-h-20" value={message} disabled={locked} onChange={(event) => setMessage(event.target.value)} />
          </label>
          {locked ? null : <button className="btn btn-primary" type="button" disabled={busy} onClick={send}>Envoyer pour signature</button>}
          {status === "sent" ? <p className="text-sm text-muted">En attente de signature{email ? ` · ${email}` : ""}.</p> : null}
          {status === "signed" ? <p className="text-sm font-semibold">Signé. Il reste dans les documents.</p> : null}
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function emailFor(clients: OpsClient[], name: string) {
  return clients.find((item) => clientLabel(item) === name || item.name === name || item.company === name)?.email || "";
}
