import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { opsClients, opsCreateInvoice, opsCreateQuote, opsCreateQuoteClient, opsInvoices, opsQuotes, opsSaveInvoice, opsSaveQuote, opsSearchCompanies } from "@/lib/ops.functions";
import type { CompanyHit, OpsClient, OpsInvoice, OpsQuote } from "@/lib/ops.shared";
import { clientLabel } from "@/lib/ops.shared";
import { AddressField } from "@/components/address-field";
import { useAccount } from "@/lib/use-account";

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "SourcingPick — Clients" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const account = useAccount();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<CompanyHit[]>([]);
  const [clients, setClients] = useState<OpsClient[]>([]);
  const [quotes, setQuotes] = useState<OpsQuote[]>([]);
  const [invoices, setInvoices] = useState<OpsInvoice[]>([]);
  const [openId, setOpenId] = useState("");
  const [pick, setPick] = useState<CompanyHit | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [password, setPassword] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<"pro" | "particulier">("pro");
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [personAddress, setPersonAddress] = useState("");
  const [personCountry, setPersonCountry] = useState("France");

  async function refresh() {
    const people = await opsClients();
    setClients(people);
    setLoaded(true);
    const [docs, bills] = await Promise.all([opsQuotes(), opsInvoices()]);
    setQuotes(docs);
    setInvoices(bills);
  }

  useEffect(() => {
    void refresh().catch((err: unknown) => setError(err instanceof Error ? err.message : "Lecture impossible."));
  }, []);

  async function search(event: FormEvent) {
    event.preventDefault();
    setError("");
    setInfo("");
    try {
      setHits(await opsSearchCompanies({ data: query }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Recherche impossible.");
    }
  }

  async function link(event: FormEvent) {
    event.preventDefault();
    if (!pick) return;
    setError("");
    try {
      const created = await opsCreateQuoteClient({
        data: {
          name,
          email,
          company: pick.name,
          address: pick.address,
          vat: pick.vat,
          country: "France",
          siren: pick.siren,
          siret: pick.siret,
          kind: "pro",
        },
      });
      setPassword(created.temporary);
      setInfo(created.temporary ? "Compte créé et entreprise liée." : "Entreprise liée au compte existant.");
      setPick(null);
      setHits([]);
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Liaison impossible.");
    }
  }

  async function addPerson(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const created = await opsCreateQuoteClient({
        data: {
          name: personName,
          email: personEmail,
          company: "",
          address: personAddress,
          vat: "",
          country: personCountry || "France",
          kind: "particulier",
        },
      });
      setPassword(created.temporary);
      setInfo(created.temporary ? "Particulier créé. Vous pouvez lui faire un devis ou une facture." : "Ce particulier existait déjà, sa fiche est à jour.");
      setPersonName("");
      setPersonEmail("");
      setPersonAddress("");
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Création impossible.");
    }
  }

  async function invoiceFor(client: OpsClient) {
    const id = await opsCreateInvoice();
    const bill = (await opsInvoices()).find((invoice) => invoice.id === id);
    await opsSaveInvoice({
      data: {
        id,
        number: bill?.number || "",
        clientName: client.name,
        clientUserId: client.id,
        clientEmail: client.email,
        clientCompany: client.kind === "particulier" ? "" : client.company,
        clientAddress: client.address,
        clientVat: client.kind === "particulier" ? "" : client.vat,
        clientSiren: client.kind === "particulier" ? "" : client.siren,
        clientSiret: client.kind === "particulier" ? "" : client.siret,
        clientNaf: client.kind === "particulier" ? "" : client.naf,
        orderRef: "",
        amountCents: 0,
        lines: bill?.lines,
      },
    });
    void navigate({ to: "/factures/fiche/$id", params: { id } });
  }

  async function quoteFor(client: OpsClient) {
    const quote = await opsCreateQuote();
    if (!quote) return;
    const person = client.kind === "particulier";
    const saved = await opsSaveQuote({
      data: {
        ...quote,
        clientUserId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        clientCompany: person ? "" : client.company,
        clientAddress: client.address,
        clientVat: person ? "" : client.vat,
        clientCountry: client.country || "France",
        clientSiren: person ? "" : client.siren,
        clientSiret: person ? "" : client.siret,
        clientNaf: person ? "" : client.naf,
      },
    });
    void navigate({ to: "/devis/nouveau", search: { id: saved.id } });
  }

  return (
    <Shell>
      <PageHead title="Clients" />
      <p className="-mt-3 mb-4 max-w-3xl text-sm leading-relaxed text-muted">
        Ajoutez un professionnel depuis l’annuaire, ou un particulier avec son nom et son adresse. Ensuite vous lui faites un devis ou une facture.
      </p>
      {error ? <p className="mb-3 text-sm text-[#8a1c1c]">{error}</p> : null}
      {info ? <p className="mb-3 text-sm text-[#0e9f6e]">{info}{password ? ` Mot de passe provisoire : ${password}` : ""}</p> : null}

      <div className="mb-4 flex gap-2">
        {(["pro", "particulier"] as const).map((value) => (
          <button key={value} className={`btn ${mode === value ? "btn-primary" : "btn-quiet"}`} type="button" onClick={() => setMode(value)}>
            {value === "pro" ? "Professionnel" : "Particulier"}
          </button>
        ))}
      </div>

      {mode === "pro" ? (
      <form className="card mb-4 flex flex-wrap items-end gap-2" onSubmit={(event) => void search(event)}>
        <label className="min-w-[240px] flex-1 text-sm font-semibold">
          Entreprise, SIREN ou SIRET
          <input className="field mt-1 font-normal" value={query} placeholder="Ex. Manzini ou 123 456 789" onChange={(event) => setQuery(event.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">Rechercher</button>
      </form>
      ) : null}

      {mode === "pro" && hits.length ? (
        <div className="mb-4 grid gap-2">
          {hits.map((hit) => (
            <article key={hit.siret || hit.siren} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">{hit.name}</h2>
                <p className="text-sm text-muted">{[hit.address, hit.siren ? `SIREN ${hit.siren}` : "", hit.siret ? `SIRET ${hit.siret}` : "", hit.naf ? `NAF ${hit.naf}` : ""].filter(Boolean).join(" · ")}</p>
                <p className="text-xs text-muted">{hit.open ? "Établissement ouvert" : "Établissement fermé"}{hit.vat ? ` · TVA ${hit.vat}` : ""}</p>
              </div>
              <button className="btn btn-quiet" type="button" onClick={() => { setPick(hit); setName(""); setEmail(""); }}>Lier cette entreprise</button>
            </article>
          ))}
        </div>
      ) : null}

      {mode === "pro" && pick ? (
        <form className="card mb-4 grid gap-3 sm:grid-cols-2" onSubmit={(event) => void link(event)}>
          <h2 className="font-semibold sm:col-span-2">Lier {pick.name}</h2>
          <label className="text-sm font-semibold">Nom du contact
            <input className="field mt-1 font-normal" value={name} required onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="text-sm font-semibold">Email
            <input className="field mt-1 font-normal" type="email" value={email} required onChange={(event) => setEmail(event.target.value)} />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn btn-primary" type="submit">Créer le compte et lier</button>
            <button className="btn btn-quiet" type="button" onClick={() => setPick(null)}>Annuler</button>
          </div>
        </form>
      ) : null}

      {mode === "particulier" ? (
        <form className="card mb-4 grid gap-3 sm:grid-cols-2" onSubmit={(event) => void addPerson(event)}>
          <h2 className="font-semibold sm:col-span-2">Nouveau particulier</h2>
          <label className="text-sm font-semibold">Nom et prénom
            <input className="field mt-1 font-normal" value={personName} required onChange={(event) => setPersonName(event.target.value)} />
          </label>
          <label className="text-sm font-semibold">Email
            <input className="field mt-1 font-normal" type="email" value={personEmail} required onChange={(event) => setPersonEmail(event.target.value)} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">Adresse
            <AddressField value={personAddress} onChange={setPersonAddress} />
          </label>
          <label className="text-sm font-semibold">Pays
            <input className="field mt-1 font-normal" value={personCountry} onChange={(event) => setPersonCountry(event.target.value)} />
          </label>
          <div className="flex items-end">
            <button className="btn btn-primary" type="submit">Créer le particulier</button>
          </div>
        </form>
      ) : null}

      <h2 className="display mb-3 text-lg">Comptes liés</h2>
      <div className="grid gap-3">
        {clients.map((client) => {
          const mine = quotes.filter((quote) => quote.clientUserId === client.id || quote.clientEmail === client.email);
          const bills = invoices.filter((invoice) => {
            const company = (client.company || "").trim().toLowerCase();
            const named = (invoice.clientName || "").trim().toLowerCase();
            return invoice.clientUserId === client.id || invoice.clientEmail === client.email || (company.length > 1 && named === company);
          });
          const signed = mine.filter((quote) => quote.status === "Devis signé").length;
          const open = openId === client.id;
          return (
            <article key={client.id} className="card">
              <button type="button" className="flex w-full flex-wrap items-start justify-between gap-3 text-left" onClick={() => setOpenId(open ? "" : client.id)}>
                <div>
                  <h3 className="font-semibold">{clientLabel(client)}{client.kind === "particulier" ? " · Particulier" : ""}</h3>
                  <p className="text-sm text-muted">{client.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-canvas px-3 py-1 font-semibold">{mine.length} devis</span>
                  <span className="rounded-full bg-canvas px-3 py-1 font-semibold">{signed} signé{signed > 1 ? "s" : ""}</span>
                  <span className="rounded-full bg-canvas px-3 py-1 font-semibold">{bills.length} facture{bills.length > 1 ? "s" : ""}</span>
                </div>
              </button>
              {open ? (
                <div className="mt-4 grid gap-4 border-t border-line pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="text-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h4 className="font-semibold">{client.kind === "particulier" ? "Particulier" : "Société"}</h4>
                      <CopyAll client={client} />
                    </div>
                    <ul className="grid gap-1">
                      {clientFields(client).map((field) => (
                        <CopyLine key={field.label} label={field.label} value={field.value} />
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="btn btn-primary" type="button" onClick={() => void quoteFor(client)}>Faire un devis</button>
                      {account?.role === "admin" ? (
                        <button className="btn btn-quiet" type="button" onClick={() => void invoiceFor(client)}>Faire une facture</button>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-sm">
                    <h4 className="mb-2 font-semibold">Devis et factures</h4>
                    {mine.length + bills.length === 0 ? <p className="text-muted">Aucun document pour ce compte.</p> : null}
                    <ul className="grid gap-1">
                      {mine.map((quote) => (
                        <li key={quote.id} className="flex flex-wrap items-center justify-between gap-2">
                          <span>{quote.number} · {quote.status}</span>
                          <Link to="/devis/nouveau" search={{ id: quote.id }} className="font-semibold text-brand">Ouvrir</Link>
                        </li>
                      ))}
                      {bills.map((invoice) => (
                        <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-2">
                          <span>{invoice.number} · {invoice.status}</span>
                          <Link to="/factures/fiche/$id" params={{ id: invoice.id }} className="font-semibold text-brand">Ouvrir</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
        {loaded && !clients.length ? <p className="text-sm text-muted">Aucun client pour le moment. Recherchez une entreprise ci-dessus.</p> : null}
      </div>
    </Shell>
  );
}

function clientFields(client: OpsClient) {
  const pro = client.kind !== "particulier";
  const rows: Array<{ label: string; value: string } | null> = [
    pro ? { label: "Raison sociale", value: client.company || "" } : null,
    { label: pro ? "Contact" : "Nom", value: client.name || "" },
    { label: "Email", value: client.email || "" },
    { label: "Adresse", value: client.address || "" },
    pro ? { label: "SIREN", value: client.siren || "" } : null,
    pro ? { label: "SIRET", value: client.siret || "" } : null,
    pro ? { label: "NAF", value: client.naf || "" } : null,
    pro ? { label: "TVA", value: client.vat || "" } : null,
    { label: "Pays", value: client.country || "" },
  ];
  return rows.filter((field): field is { label: string; value: string } => field !== null);
}

function CopyLine({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  const text = value.trim();
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-canvas px-3 py-2">
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold tracking-wide text-muted uppercase">{label}</span>
        <span className="block break-all font-medium select-all">{text || "—"}</span>
      </span>
      {text ? (
        <button className="shrink-0 text-sm font-semibold text-brand" type="button" onClick={() => void copyText(text).then(() => flash(setDone))}>
          {done ? "Copié" : "Copier"}
        </button>
      ) : null}
    </li>
  );
}

function CopyAll({ client }: { client: OpsClient }) {
  const [done, setDone] = useState(false);
  const block = clientFields(client)
    .filter((field) => field.value.trim())
    .map((field) => `${field.label} : ${field.value.trim()}`)
    .join("\n");
  if (!block) return null;
  return (
    <button className="text-sm font-semibold text-brand" type="button" onClick={() => void copyText(block).then(() => flash(setDone))}>
      {done ? "Copié" : "Tout copier"}
    </button>
  );
}

function flash(setDone: (value: boolean) => void) {
  setDone(true);
  window.setTimeout(() => setDone(false), 1200);
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area = document.createElement("textarea");
  area.value = text;
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  return Promise.resolve();
}
