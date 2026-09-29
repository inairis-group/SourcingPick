import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Notice, useOps } from "@/components/ops-ui";
import { opsAddDocument, opsClients, opsDocumentFile, opsDocuments, opsInvoices, opsOrders, opsQuotes, opsSendDocumentSign } from "@/lib/ops.functions";
import { openOpsInvoice, openOpsQuote } from "@/lib/ops-paper";
import type { OpsClient, OpsDocument, OpsInvoice, OpsOrder, OpsQuote } from "@/lib/ops.shared";
import { clientLabel, euros } from "@/lib/ops.shared";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "SourcingPick — Documents" }] }),
  component: Page,
});

const FILE_FOLDERS = ["Contrats", "Photos et vidéos", "Documents de transport", "Documents d’entreprise"];
const VIRTUAL = ["Commandes", "Factures", "Devis", "Avoirs"];

function slash(value: string) {
  const text = String(value ?? "");
  return text.includes("-") ? text.split("-").reverse().join("/") : text;
}

function same(a: unknown, b: unknown) {
  const left = String(a ?? "").trim().toLowerCase();
  const right = String(b ?? "").trim().toLowerCase();
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function Page() {
  const navigate = useNavigate();
  const { data, error, reload } = useOps(async () => {
    const [documents, quotes, invoices, orders] = await Promise.all([opsDocuments(), opsQuotes(), opsInvoices(), opsOrders()]);
    return { documents, quotes, invoices, orders };
  });
  const documents = data?.documents ?? [];
  const [accounts, setAccounts] = useState<OpsClient[]>([]);
  const [custom, setCustom] = useState<string[]>([]);
  useEffect(() => {
    void opsClients().then(setAccounts).catch(() => setAccounts([]));
    try {
      const stored = JSON.parse(window.localStorage.getItem("sp-doc-folders") || "[]");
      if (Array.isArray(stored)) setCustom(stored.filter((item) => typeof item === "string"));
    } catch {
      setCustom([]);
    }
  }, []);
  const names = [...new Set([...accounts.map((item) => clientLabel(item)), ...documents.map((doc) => doc.clientName), ...(data?.orders ?? []).map((order) => order.clientName), ...(data?.invoices ?? []).map((invoice) => clientLabel({ name: invoice.clientName, company: invoice.clientCompany }))].filter(Boolean))];
  const [client, setClient] = useState("");
  const active = client || names[0] || "";
  const folders = [...VIRTUAL, ...FILE_FOLDERS, ...custom.filter((name) => !FILE_FOLDERS.includes(name) && !VIRTUAL.includes(name))];
  const [folder, setFolder] = useState("Factures");
  const [title, setTitle] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [info, setInfo] = useState("");
  const [localError, setLocalError] = useState("");
  const [signDoc, setSignDoc] = useState<OpsDocument | null>(null);
  const [signEmail, setSignEmail] = useState("");
  const [signMessage, setSignMessage] = useState("Bonjour, merci de lire ce document et de le signer.");
  const fileFolder = !VIRTUAL.includes(folder);

  function ownsOrder(order: OpsOrder) {
    return same(order.clientName, active);
  }
  function ownsInvoice(invoice: OpsInvoice) {
    return same(invoice.clientName, active) || same(invoice.clientCompany, active) || same(clientLabel({ name: invoice.clientName, company: invoice.clientCompany }), active);
  }
  function ownsQuote(quote: OpsQuote) {
    return same(quote.clientName, active) || same(quote.clientCompany, active) || same(clientLabel({ name: quote.clientName, company: quote.clientCompany }), active);
  }
  function ownsDoc(doc: OpsDocument) {
    return same(doc.clientName, active);
  }

  const rows = folder === "Commandes"
    ? (data?.orders ?? []).filter(ownsOrder).map((order) => ({
        key: order.id,
        title: order.ref,
        meta: `${order.product} · ${order.state}`,
        date: "",
        open: () => navigate({ to: "/commandes/$id", params: { id: order.id } }),
      }))
    : folder === "Factures"
      ? (data?.invoices ?? []).filter((invoice) => ownsInvoice(invoice) && invoice.kind !== "credit").map((invoice) => ({
          key: invoice.id,
          title: invoice.number,
          meta: `${invoice.status} · ${euros(invoice.amountCents)}`,
          date: slash(invoice.issuedOn),
          open: () => navigate({ to: "/factures/fiche/$id", params: { id: invoice.id } }),
        }))
      : folder === "Devis"
        ? (data?.quotes ?? []).filter(ownsQuote).map((quote) => ({
            key: quote.id,
            title: quote.number,
            meta: `${quote.status} · ${euros(quote.amountCents)}`,
            date: slash(quote.issuedOn),
            open: () => navigate({ to: "/devis/nouveau", search: { id: quote.id } }),
          }))
        : folder === "Avoirs"
          ? (data?.invoices ?? []).filter((invoice) => ownsInvoice(invoice) && invoice.kind === "credit").map((invoice) => ({
              key: invoice.id,
              title: invoice.number,
              meta: `${invoice.method || "Avoir"} · − ${euros(invoice.amountCents)}`,
              date: slash(invoice.issuedOn),
              open: () => navigate({ to: "/avoirs/$id", params: { id: invoice.id } }),
            }))
          : documents.filter((doc) => ownsDoc(doc) && doc.category === folder).map((doc) => ({
              key: doc.id,
              title: doc.title,
              meta: [
                doc.byteSize ? `${doc.fileName} · ${Math.max(1, Math.round(doc.byteSize / 1024))} Ko` : doc.orderRef || "Pièce",
                doc.signStatus === "signed" ? `Signé${doc.signerName ? ` · ${doc.signerName}` : ""}` : "",
                doc.signStatus === "sent" ? `En attente · ${doc.signEmail}` : "",
              ].filter(Boolean).join(" · "),
              date: slash(doc.issuedOn),
              open: () => openPiece(doc, false),
              sign: doc.byteSize > 0 ? doc : undefined,
            }));

  function count(name: string) {
    if (name === "Commandes") return (data?.orders ?? []).filter(ownsOrder).length;
    if (name === "Factures") return (data?.invoices ?? []).filter((invoice) => ownsInvoice(invoice) && invoice.kind !== "credit").length;
    if (name === "Devis") return (data?.quotes ?? []).filter(ownsQuote).length;
    if (name === "Avoirs") return (data?.invoices ?? []).filter((invoice) => ownsInvoice(invoice) && invoice.kind === "credit").length;
    return documents.filter((doc) => ownsDoc(doc) && doc.category === name).length;
  }

  async function download(doc: OpsDocument) {
    const file = await opsDocumentFile({ data: doc.id });
    const binary = atob(file.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: file.mime || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.fileName || doc.title;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function openPiece(doc: OpsDocument, pdf: boolean) {
    const dv = doc.title.match(/DV-\d{4}-\d+/);
    const quote = dv ? data?.quotes.find((item) => item.number === dv[0]) : undefined;
    if (quote) {
      if (pdf) await openOpsQuote(quote);
      else void navigate({ to: "/devis/nouveau", search: { id: quote.id } });
      return;
    }
    const fa = doc.title.match(/FA-\d{4}-\d+|SP-FA-\d{4}-\d+/);
    const invoice = fa ? data?.invoices.find((item) => item.number === fa[0]) : undefined;
    if (invoice) {
      if (pdf) await openOpsInvoice(invoice);
      else void navigate({ to: "/factures/fiche/$id", params: { id: invoice.id } });
      return;
    }
    if (doc.category === "Contrats") {
      void navigate({ to: "/contrats", search: { id: doc.id } });
      return;
    }
    if (doc.byteSize > 0) {
      await download(doc);
      return;
    }
    const av = doc.title.match(/SP-AV-\d{4}-\d+|AV-\d{4}-\d+/);
    const credit = av ? data?.invoices.find((item) => item.number === av[0]) : undefined;
    if (credit) {
      void navigate({ to: "/avoirs/$id", params: { id: credit.id } });
      return;
    }
    setInfo(doc.title);
  }

  function store(next: File | null) {
    setFile(next);
    setLocalError("");
  }

  function classify(event: FormEvent) {
    event.preventDefault();
    if (!fileFolder) {
      setLocalError("Ouvrez un dossier de fichiers pour y déposer une pièce. Les factures et commandes se remplissent toutes seules.");
      return;
    }
    if (!file || !active) {
      setLocalError("Choisissez un client et un fichier.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || "");
      const fileBase64 = raw.slice(raw.indexOf(",") + 1);
      void opsAddDocument({
        data: {
          clientName: active,
          category: folder,
          title: title || file.name,
          orderRef,
          fileName: file.name,
          mime: file.type || "application/octet-stream",
          fileBase64,
        },
      })
        .then(() => {
          setTitle("");
          setOrderRef("");
          setFile(null);
          setInfo(`Classé dans ${folder}.`);
          reload();
        })
        .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Ajout impossible."));
    };
    reader.onerror = () => setLocalError("Lecture du fichier impossible.");
    reader.readAsDataURL(file);
  }

  return (
    <Shell>
      <PageHead title="Documents" />
      <Notice>Chaque client a ses dossiers. Commandes, factures, devis et avoirs s’y rangent tout seuls. Les photos et pièces se déposent dans le dossier ouvert.</Notice>
      {error || localError ? <p className="mb-3 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {info ? <p className="mb-3 text-sm text-muted">{info}</p> : null}
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="card">
          <h2 className="mb-3 text-sm font-semibold">Dossiers clients</h2>
          <ul className="grid gap-1">
            {names.map((name) => (
              <li key={name}>
                <button type="button" className={`w-full rounded-xl px-3 py-2 text-left text-sm ${name === active ? "bg-navy text-white" : ""}`} onClick={() => setClient(name)}>
                  <span className="block font-semibold">{name}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {folders.map((name) => (
              <button key={name} type="button" className={`rounded-2xl border px-4 py-3 text-left ${name === folder ? "border-navy bg-navy text-white" : "border-line bg-white"}`} onClick={() => setFolder(name)}>
                <span className="block font-semibold">{name}</span>
                <span className={`text-sm ${name === folder ? "text-white/70" : "text-muted"}`}>{count(name)} pièce{count(name) > 1 ? "s" : ""}</span>
              </button>
            ))}
          </div>
          <form className="card grid gap-3" onSubmit={(event) => { event.preventDefault(); const name = newFolder.trim(); if (name.length < 2 || folders.includes(name)) return; const next = [...custom, name]; setCustom(next); window.localStorage.setItem("sp-doc-folders", JSON.stringify(next)); setFolder(name); setNewFolder(""); }}>
            <div className="flex flex-wrap gap-2">
              <input className="field max-w-xs" value={newFolder} placeholder="Nouveau dossier" onChange={(event) => setNewFolder(event.target.value)} />
              <button className="btn btn-quiet" type="submit">Créer le dossier</button>
            </div>
          </form>
          {fileFolder ? (
            <form className="card grid gap-3" onSubmit={classify}>
              <label
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed px-4 py-10 text-center ${drag ? "border-[#155DFC] bg-[#eef3ff]" : "border-line bg-canvas"}`}
                onDragOver={(event) => { event.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(event) => { event.preventDefault(); setDrag(false); store(event.dataTransfer.files?.[0] ?? null); }}
              >
                <span className="text-base font-semibold">{file ? file.name : `Déposer dans « ${folder} »`}</span>
                <span className="text-sm text-muted">Glissez le fichier ici, ou cliquez. PDF, photo, Excel — 8 Mo maximum.</span>
                <input className="hidden" type="file" onChange={(event) => store(event.target.files?.[0] ?? null)} />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm">Nom dans le dossier
                  <input className="field mt-1" value={title} placeholder="BL, photos, packing list…" onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className="text-sm">Commande liée
                  <input className="field mt-1" value={orderRef} placeholder="SP-2026-0148" onChange={(event) => setOrderRef(event.target.value)} />
                </label>
              </div>
              <button className="btn btn-primary w-fit" type="submit">Classer dans {folder}</button>
            </form>
          ) : (
            <p className="text-sm text-muted">Ce dossier se remplit avec les {folder.toLowerCase()} de {active || "ce client"}. Double-cliquez une ligne pour l’ouvrir.</p>
          )}
          <section className="card">
            <h2 className="font-semibold">{folder}</h2>
            <p className="mb-3 text-sm text-muted">{active || "Aucun client"} · {rows.length} pièce{rows.length > 1 ? "s" : ""}</p>
            {signDoc ? (
              <form
                className="mb-4 grid gap-2 rounded-2xl border border-line bg-canvas p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setLocalError("");
                  void opsSendDocumentSign({ data: { documentId: signDoc.id, email: signEmail, message: signMessage } })
                    .then(() => {
                      setInfo(`Lien de signature envoyé à ${signEmail}.`);
                      setSignDoc(null);
                      reload();
                    })
                    .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Envoi impossible."));
                }}
              >
                <p className="text-sm font-semibold">Faire signer « {signDoc.title} »</p>
                <input className="field" type="email" value={signEmail} placeholder="Email du signataire" onChange={(event) => setSignEmail(event.target.value)} required />
                <textarea className="field min-h-20" value={signMessage} onChange={(event) => setSignMessage(event.target.value)} />
                <div className="flex gap-2">
                  <button className="btn btn-primary" type="submit">Envoyer le lien</button>
                  <button className="btn btn-quiet" type="button" onClick={() => setSignDoc(null)}>Annuler</button>
                </div>
              </form>
            ) : null}
            {rows.length === 0 ? <p className="text-sm text-muted">Rien dans ce dossier pour l’instant.</p> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted uppercase">
                    {["Pièce", "Détail", "Date", ""].map((label) => <th key={label || "action"} className="pb-2">{label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className="cursor-pointer border-t border-line" onDoubleClick={() => void Promise.resolve(row.open()).catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Ouverture impossible."))}>
                      <td className="py-2 pr-2 font-semibold">{row.title}</td>
                      <td className="py-2 pr-2 text-muted">{row.meta}</td>
                      <td className="py-2">{row.date || "—"}</td>
                      <td className="py-2 text-right">
                        {"sign" in row && row.sign && row.sign.signStatus !== "signed" ? (
                          <button
                            className="btn btn-quiet h-9 min-h-9 px-3"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              const known = accounts.find((item) => clientLabel(item) === active || item.name === active || item.company === active);
                              setSignEmail(known?.email || row.sign?.signEmail || "");
                              setSignDoc(row.sign ?? null);
                            }}
                          >
                            Faire signer
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </Shell>
  );
}
