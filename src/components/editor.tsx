import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Plus, Printer, Trash2 } from "lucide-react";
import { PageHead } from "@/components/shell";
import { BoldField } from "@/components/marks";
import { Paper } from "@/components/paper";
import { StatusPill } from "@/components/status";
import {
  dueCents,
  formatEUR,
  formatPercent,
  isAvoir,
  isDevis,
  isFacture,
  type Client,
  type Facture,
  type Status,
  type Line,
} from "@/lib/docs";
import { useAtelier } from "@/lib/store";
import { CentsField, DecimalField } from "@/components/decimal-field";
import { opsClients, opsCreateQuoteClient, opsSendMail } from "@/lib/ops.functions";
import { partyFromHit, recoverCompany } from "@/lib/client-party";
import { clientLabel, type CompanyHit, type OpsClient } from "@/lib/ops.shared";

async function shrinkImage(file: File) {
  const bmp = await createImageBitmap(file);
  const max = 640;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.62);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

const STEPS = ["Client et commande", "Lignes", "Aperçu et envoi"] as const;

function sirenOf(value: string) {
  return String(value ?? "").replace(/^SIREN\s*/i, "").trim();
}

function nafOf(value: string) {
  return value.replace(/^NAF\s*/i, "").trim();
}

function clientFromHit(hit: CompanyHit, base: Client): Client {
  const party = partyFromHit(hit, { userId: base.id, name: base.tradeName || base.legalName, email: base.email });
  return {
    ...base,
    id: base.id || party.clientUserId || `cli-${hit.siret || hit.siren}`,
    legalName: party.clientCompany || base.legalName,
    tradeName: base.tradeName && base.tradeName !== party.clientCompany ? base.tradeName : "",
    address: party.clientAddress,
    vat: party.clientVat,
    siret: party.clientSiret,
    rcs: party.clientSiren ? `SIREN ${party.clientSiren}` : "",
    siteNote: party.clientNaf ? `NAF ${party.clientNaf}` : "",
    email: base.email,
  };
}

function clientFromOps(client: OpsClient): Client {
  const company = client.company || client.name || "Client";
  return {
    id: client.id,
    legalName: company,
    tradeName: client.company && client.name && client.name !== client.company ? client.name : "",
    address: client.address || "",
    vat: client.vat || "",
    siret: client.siret || "",
    rcs: client.siren ? `SIREN ${client.siren}` : "",
    siteNote: client.naf ? `NAF ${client.naf}` : "",
    email: client.email || "",
  };
}

export function Editor({ id }: { id: string }) {
  const doc = useAtelier((s) => s.docs.find((d) => d.id === id));
  const clients = useAtelier((s) => s.clients);
  const docs = useAtelier((s) => s.docs);
  const updateDoc = useAtelier((s) => s.updateDoc);
  const updateLine = useAtelier((s) => s.updateLine);
  const addLine = useAtelier((s) => s.addLine);
  const removeLine = useAtelier((s) => s.removeLine);
  const resetConditions = useAtelier((s) => s.resetConditions);
  const createFactureFromDevis = useAtelier((s) => s.createFactureFromDevis);
  const resyncFacture = useAtelier((s) => s.resyncFacture);
  const createAvoirFromFacture = useAtelier((s) => s.createAvoirFromFacture);
  const linkAvoir = useAtelier((s) => s.linkAvoir);
  const duplicateDevis = useAtelier((s) => s.duplicateDevis);
  const removeDoc = useAtelier((s) => s.removeDoc);
  const saveClient = useAtelier((s) => s.saveClient);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<OpsClient[]>([]);
  const [hits, setHits] = useState<CompanyHit[]>([]);
  const [lookupError, setLookupError] = useState("");
  const [mailText, setMailText] = useState("");
  const [mailInfo, setMailInfo] = useState("");
  const [mailErr, setMailErr] = useState("");
  const [step, setStep] = useState(() =>
    doc && doc.lines.some((l) => (l.title || "").trim()) && (doc.kind !== "devis" || doc.status !== "brouillon") ? 3 : 1,
  );
  const [newClient, setNewClient] = useState(false);
  const filled = useRef("");

  useEffect(() => {
    void opsClients().then(setAccounts).catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    if (!doc || !accounts.length || filled.current === doc.id) return;
    filled.current = doc.id;
    const account = accounts.find((item) => item.id === doc.clientId);
    if (!account || (!account.company && !account.siret && !account.address)) return;
    const current = useAtelier.getState().clients.find((item) => item.id === doc.clientId);
    if (current?.siret && current.address && current.legalName && current.legalName !== "Client") return;
    saveClient(clientFromOps(account));
  }, [doc, accounts, saveClient]);

  if (!doc) {
    return (
      <>
        <PageHead title="Document introuvable" />
        <Link to="/" className="btn btn-quiet">
          Retour
        </Link>
      </>
    );
  }

  const client = clients.find((c) => c.id === doc.clientId);
  const options = accounts
    .filter((item) => item.id.startsWith("usr_") && item.email.includes("@"))
    .map((item) => ({ id: item.id, label: `${clientLabel(item)} — ${item.email}${item.kind === "particulier" ? " · particulier" : ""}` }));

  function remember(next: Client) {
    saveClient(next);
    updateDoc(doc!.id, { clientId: next.id });
  }

  function pickClient(userId: string) {
    const account = accounts.find((item) => item.id === userId);
    if (!account) {
      updateDoc(doc!.id, { clientId: userId });
      setHits([]);
      return;
    }
    const next = clientFromOps(account);
    remember(next);
    setHits([]);
  }

  function applyHit(hit: CompanyHit) {
    const base = client ?? {
      id: doc!.clientId || `cli-${Date.now().toString(36)}`,
      legalName: "",
      tradeName: "",
      address: "",
      vat: "",
      siret: "",
      rcs: "",
      siteNote: "",
      email: "",
    };
    const next = clientFromHit(hit, base);
    remember(next);
    setHits([]);
    setLookupError("");
    if (next.email) {
      void opsCreateQuoteClient({
        data: {
          name: next.tradeName || next.legalName,
          email: next.email,
          company: next.legalName,
          address: next.address,
          vat: next.vat,
          country: "France",
          siren: sirenOf(next.rcs),
          siret: next.siret,
          naf: nafOf(next.siteNote),
        },
      }).catch(() => undefined);
    }
  }

  function lookup() {
    const query = client?.siret || (client ? sirenOf(client.rcs) : "") || client?.legalName || client?.tradeName || "";
    setLookupError("");
    void recoverCompany(query)
      .then((found) => {
        if (!found.length) {
          setLookupError("Aucune entreprise trouvée. Vérifiez la dénomination ou le SIRET.");
          setHits([]);
          return;
        }
        if (found.length === 1) applyHit(found[0]);
        else setHits(found);
      })
      .catch((err: unknown) => setLookupError(err instanceof Error ? err.message : "Annuaire indisponible."));
  }
  const back =
    doc.kind === "devis" ? "/devis" : doc.kind === "facture" ? "/factures" : "/avoirs";
  const heading =
    doc.kind === "devis"
      ? doc.status === "brouillon" && !doc.lines.some((l) => (l.title || "").trim())
        ? "Nouveau devis"
        : doc.number
      : doc.kind === "facture"
        ? `Facture ${doc.number}`
        : `Avoir ${doc.number}`;

  function setStatus(status: Status) {
    updateDoc(doc!.id, { status });
  }

  function openFacture(mode: "acompte" | "solde" | "integrale") {
    if (!isDevis(doc!)) return;
    const next = createFactureFromDevis(doc.id, mode);
    void navigate({ to: "/factures/$id", params: { id: next } });
  }

  function openAvoir() {
    if (!isFacture(doc!)) return;
    const next = createAvoirFromFacture(doc.id);
    void navigate({ to: "/avoirs/$id", params: { id: next } });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHead title={heading}>
        <StatusPill doc={doc} />
        {doc.status === "brouillon" ? (
          <button className="btn btn-quiet" type="button" onClick={() => setStatus("emis")}>
            <Check size={16} /> Enregistrer et marquer envoyé
          </button>
        ) : (
          <button className="btn btn-quiet" type="button" onClick={() => setStatus("brouillon")}>
            Revenir au brouillon
          </button>
        )}
      </PageHead>

      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const on = step === n;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setStep(n)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                on ? "border-navy bg-navy text-white" : "border-line bg-paper text-muted"
              }`}
            >
              {n}. {label}
            </button>
          );
        })}
      </div>

      {step === 1 ? (
        <section className="card grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="display text-lg">1. Client et commande</h2>
            <Link to={back} className="text-sm font-semibold text-brand">
              <ArrowLeft size={14} className="inline" /> Liste
            </Link>
          </div>
          <Field label="Client">
            <select className="field" value={doc.clientId} onChange={(e) => pickClient(e.target.value)}>
              <option value="">Choisir un client</option>
              {options.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          {client ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Dénomination">
                <input className="field" value={client.legalName || ""} onChange={(e) => saveClient({ ...client, legalName: e.target.value })} />
              </Field>
              <Field label="Contact">
                <input className="field" value={client.tradeName || ""} onChange={(e) => saveClient({ ...client, tradeName: e.target.value })} />
              </Field>
              <Field label="Email">
                <input className="field" value={client.email || ""} onChange={(e) => saveClient({ ...client, email: e.target.value })} />
              </Field>
              <Field label="SIRET">
                <input className="field" value={client.siret || ""} onChange={(e) => saveClient({ ...client, siret: e.target.value })} />
              </Field>
              <Field label="SIREN">
                <input className="field" value={sirenOf(client.rcs)} onChange={(e) => saveClient({ ...client, rcs: e.target.value ? `SIREN ${e.target.value}` : "" })} />
              </Field>
              <Field label="TVA">
                <input className="field" value={client.vat || ""} onChange={(e) => saveClient({ ...client, vat: e.target.value })} />
              </Field>
              <Field label="Adresse">
                <input className="field sm:col-span-2" value={client.address || ""} onChange={(e) => saveClient({ ...client, address: e.target.value })} />
              </Field>
            </div>
          ) : null}
          <button className="btn btn-quiet w-fit" type="button" onClick={lookup}>Récupérer la dénomination, le SIRET et l’adresse</button>
          {lookupError ? <p className="text-sm text-[#8a1c1c]">{lookupError}</p> : null}
          {hits.length ? (
            <div className="grid gap-2">
              {hits.map((hit) => (
                <button key={hit.siret || hit.siren} className="rounded-2xl border border-line bg-canvas px-3 py-2 text-left text-sm" type="button" onClick={() => applyHit(hit)}>
                  <b>{hit.name}</b>
                  <span className="mt-1 block text-muted">{[hit.address, hit.siret ? `SIRET ${hit.siret}` : "", hit.siren ? `SIREN ${hit.siren}` : ""].filter(Boolean).join(" · ")}</span>
                </button>
              ))}
            </div>
          ) : null}
          {newClient ? (
            <NewClient
              onCancel={() => setNewClient(false)}
              onSave={(c) => {
                saveClient(c);
                updateDoc(doc.id, { clientId: c.id });
                setNewClient(false);
              }}
            />
          ) : (
            <button className="btn btn-quiet w-fit" type="button" onClick={() => setNewClient(true)}>
              <Plus size={16} /> Nouveau client
            </button>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Référence">
              <input className="field mono" value={doc.number} onChange={(e) => updateDoc(doc.id, { number: e.target.value })} />
            </Field>
            <Field label="Date">
              <input className="field" type="date" value={doc.issueDate} onChange={(e) => updateDoc(doc.id, { issueDate: e.target.value })} />
            </Field>
            <Field label="Objet">
              <input className="field" value={doc.headline} onChange={(e) => updateDoc(doc.id, { headline: e.target.value })} placeholder="Chantier, cimetière, référence interne" />
            </Field>
          </div>
          {isDevis(doc) ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Validité (jours)">
                <input className="field" inputMode="numeric" value={String(doc.validityDays)} onChange={(e) => updateDoc(doc.id, { validityDays: Number(e.target.value) || 0 })} />
              </Field>
              <Field label="Délai de production">
                <input className="field" value={doc.leadTime} onChange={(e) => updateDoc(doc.id, { leadTime: e.target.value })} />
              </Field>
              <Field label="Livraison">
                <input className="field" value={doc.delivery} onChange={(e) => updateDoc(doc.id, { delivery: e.target.value })} />
              </Field>
              <Field label="Port d’arrivée">
                <input className="field" value={doc.port} onChange={(e) => updateDoc(doc.id, { port: e.target.value })} placeholder="Optionnel" />
              </Field>
              <Field label="Commission ouvrages (%)">
                <DecimalField value={doc.commissionBps / 100} onChange={(value) => updateDoc(doc.id, { commissionBps: Math.round(value * 100) })} />
              </Field>
              <Field label="Acompte (%)">
                <DecimalField value={doc.depositBps / 100} onChange={(value) => updateDoc(doc.id, { depositBps: Math.round(value * 100) })} />
              </Field>
            </div>
          ) : null}
          {isFacture(doc) ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Échéance">
                <input className="field" value={doc.dueLabel} onChange={(e) => updateDoc(doc.id, { dueLabel: e.target.value })} />
              </Field>
              <Field label="Mode">
                <select className="field" value={doc.mode} onChange={(e) => updateDoc(doc.id, { mode: e.target.value as typeof doc.mode })}>
                  <option value="acompte">Acompte</option>
                  <option value="solde">Solde</option>
                  <option value="integrale">Intégrale</option>
              </select>
              </Field>
            </div>
          ) : null}
          {isAvoir(doc) ? (
            <div className="grid gap-3">
              <Field label="Facture d’origine">
                <select
                  className="field"
                  value={doc.sourceFactureId ?? ""}
                  onChange={(e) => (e.target.value ? linkAvoir(doc.id, e.target.value) : updateDoc(doc.id, { sourceFactureId: null, sourceNumber: "", sourceAmountCents: 0 }))}
                >
                  <option value="">Aucune</option>
                  {docs.filter(isFacture).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.number}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Motif">
                <textarea className="field min-h-24 py-3" value={doc.reason} onChange={(e) => updateDoc(doc.id, { reason: e.target.value })} />
              </Field>
            </div>
          ) : null}
          {isFacture(doc) ? <PaymentBlock doc={doc} /> : null}
          {client ? null : <p className="text-sm text-danger">Choisissez un client avant l’envoi.</p>}
        </section>
      ) : null}

      {step === 2 ? (
        <section className="card flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="display text-lg">2. Lignes</h2>
            <button className="btn btn-quiet" type="button" onClick={() => addLine(doc.id)}>
              <Plus size={16} /> Ajouter une ligne
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {doc.lines.map((line, index) => (
              <LineCard key={line.id} docId={doc.id} line={line} index={index} onChange={(patch) => updateLine(doc.id, line.id, patch)} onRemove={() => removeLine(doc.id, line.id)} />
            ))}
            {doc.lines.length === 0 ? <p className="text-sm text-muted">Aucune ligne. Ajoutez un ouvrage ou une prestation.</p> : null}
          </div>
          <div className="rounded-xl bg-canvas px-4 py-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Net à payer</span>
              <span className="mono font-semibold">{formatEUR(dueCents(doc))}</span>
            </div>
            {isDevis(doc) ? (
              <p className="mt-1 text-xs text-muted">
                Commission {formatPercent(doc.commissionBps)} % ajoutée au total. Acompte {formatPercent(doc.depositBps)} %.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="overflow-x-auto rounded-[22px] border border-line bg-canvas p-3 sm:p-5">
            <Paper doc={doc} />
          </div>
          <aside className="card flex flex-col gap-3">
            <h2 className="display text-lg">3. Aperçu</h2>
            <p className="text-sm leading-relaxed text-muted">
              Le PDF se génère à l’impression : choisissez « Enregistrer au format PDF ». Rien n’est archivé, le document est recalculé à chaque ouverture.
            </p>
            <Link to="/imprimer/$id" params={{ id: doc.id }} className="btn btn-primary">
              <Printer size={16} /> Télécharger le PDF
            </Link>
            <label className="text-sm font-semibold">
              Message du mail
              <textarea className="field mt-1 min-h-24 font-normal" value={mailText} placeholder={doc.kind === "facture" ? "Bonjour, veuillez trouver votre facture." : "Bonjour, veuillez trouver votre devis."} onChange={(event) => setMailText(event.target.value)} />
            </label>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                setMailErr("");
                setMailInfo("");
                if (!client || !(client.email || "").includes("@")) {
                  setMailErr("Indiquez l’email du client à l’étape 1.");
                  return;
                }
                const rows = doc.lines
                  .filter((line) => line.title.trim())
                  .map((line) => `• ${line.title} — ${formatEUR(Math.round(line.qty * line.unitPriceCents))}`)
                  .join("\n");
                const label = doc.kind === "facture" ? "facture" : doc.kind === "avoir" ? "avoir" : "devis";
                const text = [
                  mailText.trim() || `Bonjour,\n\nVeuillez trouver votre ${label} ${doc.number}.`,
                  "",
                  `${doc.number} · ${client.legalName}`,
                  client.address,
                  client.siret ? `SIRET ${client.siret}` : "",
                  rows,
                  `Total : ${formatEUR(dueCents(doc))}`,
                  "",
                  "SourcingPick",
                  "contact@sourcingpick.com",
                ]
                  .filter(Boolean)
                  .join("\n");
                void opsSendMail({
                  data: {
                    to: client.email,
                    subject: doc.kind === "facture" ? `Votre facture ${doc.number}` : `Votre devis ${doc.number}`,
                    text,
                  },
                })
                  .then(() => setMailInfo(`Email envoyé à ${client.email}.`))
                  .catch((err: unknown) => setMailErr(err instanceof Error ? err.message : "Envoi impossible."));
              }}
            >
              Envoyer par email
            </button>
            {mailInfo ? <p className="text-sm text-[#0e9f6e]">{mailInfo}</p> : null}
            {mailErr ? <p className="text-sm text-[#8a1c1c]">{mailErr}</p> : null}
            {doc.status === "brouillon" ? (
              <button className="btn btn-quiet" type="button" onClick={() => setStatus("emis")}>
                Marquer comme envoyé
              </button>
            ) : null}
            {isDevis(doc) && doc.status === "emis" ? (
              <button className="btn btn-quiet" type="button" onClick={() => setStatus("accepte")}>
                Marquer comme signé
              </button>
            ) : null}
            {isDevis(doc) ? (
              <>
                <button className="btn btn-primary" type="button" onClick={() => openFacture("acompte")}>
                  Créer la facture d’acompte
                </button>
                <button className="btn btn-quiet" type="button" onClick={() => openFacture("solde")}>
                  Créer la facture de solde
                </button>
                <button className="btn btn-quiet" type="button" onClick={() => openFacture("integrale")}>
                  Facture intégrale
                </button>
                <button
                  className="btn btn-quiet"
                  type="button"
                  onClick={() => {
                    const next = duplicateDevis(doc.id);
                    if (next) void navigate({ to: "/devis/$id", params: { id: next } });
                  }}
                >
                  Dupliquer
                </button>
              </>
            ) : null}
            {isFacture(doc) ? (
              <>
                <PaymentBlock doc={doc} />
                {doc.sourceDevisId ? (
                  <button className="btn btn-quiet" type="button" onClick={() => resyncFacture(doc.id)}>
                    Recalculer depuis le devis
                  </button>
                ) : null}
                <button className="btn btn-quiet" type="button" onClick={openAvoir}>
                  Créer un avoir
                </button>
                {doc.status !== "payee" ? (
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() =>
                      updateDoc(doc.id, {
                        status: "payee",
                        paidOn: doc.paidOn || new Date().toISOString().slice(0, 10),
                        paidCents: doc.paidCents ?? dueCents(doc),
                      })
                    }
                  >
                    Marquer comme payée
                  </button>
                ) : (
                  <button className="btn btn-quiet" type="button" onClick={() => setStatus("emis")}>
                    Rouvrir l’encaissement
                  </button>
                )}
              </>
            ) : null}
            <Field label="Conditions">
              <textarea className="field min-h-36 py-3 text-sm" value={doc.conditions} onChange={(e) => updateDoc(doc.id, { conditions: e.target.value })} />
            </Field>
            <button className="text-left text-sm font-semibold text-brand" type="button" onClick={() => resetConditions(doc.id)}>
              Revenir au texte standard
            </button>
            {doc.status === "brouillon" ? (
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => {
                  removeDoc(doc.id);
                  void navigate({ to: back });
                }}
              >
                <Trash2 size={16} /> Supprimer le brouillon
              </button>
            ) : null}
          </aside>
        </div>
      ) : null}

      <div className="flex gap-2">
        {step > 1 ? (
          <button className="btn btn-quiet" type="button" onClick={() => setStep(step - 1)}>
            <ArrowLeft size={16} /> Retour
          </button>
        ) : null}
        {step < 3 ? (
          <button className="btn btn-primary" type="button" onClick={() => setStep(step + 1)}>
            Suivant <ArrowRight size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PaymentBlock({ doc }: { doc: Facture }) {
  const updateDoc = useAtelier((s) => s.updateDoc);
  return (
    <div className="grid gap-3 rounded-xl bg-canvas p-3 sm:grid-cols-2">
      <Field label="Moyen">
        <input className="field" value={doc.paidMethod} onChange={(e) => updateDoc(doc.id, { paidMethod: e.target.value })} />
      </Field>
      <Field label="Reçu le">
        <input className="field" type="date" value={doc.paidOn} onChange={(e) => updateDoc(doc.id, { paidOn: e.target.value })} />
      </Field>
      <Field label="Montant reçu (€)">
        <CentsField className="field" cents={doc.paidCents ?? 0} onChange={(cents) => updateDoc(doc.id, { paidCents: cents })} />
      </Field>
      <Field label="Frais bancaires (€)">
        <CentsField className="field" cents={doc.feesCents} onChange={(cents) => updateDoc(doc.id, { feesCents: cents })} />
      </Field>
    </div>
  );
}

function LineCard({
  line,
  index,
  onChange,
  onRemove,
}: {
  docId: string;
  line: Line;
  index: number;
  onChange: (patch: Partial<Line>) => void;
  onRemove: () => void;
}) {
  const amount = Math.round(line.qty * line.unitPriceCents);
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="mono text-xs font-semibold text-muted">{line.code || String(index + 1).padStart(2, "0")}</span>
        <button className="btn btn-quiet btn-icon" type="button" aria-label="Retirer la ligne" onClick={onRemove}>
          <Trash2 size={16} />
        </button>
      </div>
      <div className="grid gap-3">
        <Field label="Désignation">
          <input className="field" value={line.title} onChange={(e) => onChange({ title: e.target.value })} />
        </Field>
        <Field label="Matière ou sous-titre">
          <input className="field" value={line.material} onChange={(e) => onChange({ material: e.target.value })} />
        </Field>
        <Field label="Description, une puce par ligne">
          <BoldField value={line.details} onChange={(details) => onChange({ details })} placeholder="Une puce par ligne. Sélectionnez un mot, puis Gras." />
        </Field>
        <Field label="Photo du produit">
          <div className="flex flex-wrap items-center gap-3">
            {line.image ? <img src={line.image} alt="" className="h-16 w-16 rounded-lg object-cover" /> : null}
            <label className="btn btn-quiet">
              <ImagePlus size={16} /> {line.image ? "Changer" : "Ajouter une image"}
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  void shrinkImage(file).then((image) => {
                    if (image) onChange({ image });
                  });
                }}
              />
            </label>
            {line.image ? (
              <button className="btn btn-quiet" type="button" onClick={() => onChange({ image: "" })}>
                Retirer
              </button>
            ) : null}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Unité">
            <input className="field" value={line.unit} onChange={(e) => onChange({ unit: e.target.value })} />
          </Field>
          <Field label="Quantité">
            <DecimalField fraction={0} value={line.qty} onChange={(qty) => onChange({ qty })} />
          </Field>
          <Field label="Prix unitaire (€)">
            <CentsField className="field" cents={line.unitPriceCents} onChange={(unitPriceCents) => onChange({ unitPriceCents })} />
          </Field>
          <Field label="Montant">
            <input className="field mono" readOnly value={formatEUR(amount)} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function NewClient({ onSave, onCancel }: { onSave: (c: Client) => void; onCancel: () => void }) {
  const [legalName, setLegalName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [siret, setSiret] = useState("");
  const [siren, setSiren] = useState("");
  const [vat, setVat] = useState("");
  const [naf, setNaf] = useState("");
  const [hits, setHits] = useState<CompanyHit[]>([]);
  const [error, setError] = useState("");

  function apply(hit: CompanyHit) {
    setLegalName(hit.name);
    setAddress(hit.address);
    setSiret(hit.siret);
    setSiren(hit.siren);
    setVat(hit.vat);
    setNaf(hit.naf);
    setHits([]);
    setError("");
  }

  return (
    <div className="grid gap-3 rounded-xl bg-canvas p-3 sm:grid-cols-2">
      <Field label="Dénomination">
        <input className="field" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
      </Field>
      <Field label="Contact">
        <input className="field" value={tradeName} onChange={(e) => setTradeName(e.target.value)} />
      </Field>
      <Field label="Email">
        <input className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="SIRET">
        <input className="field" value={siret} onChange={(e) => setSiret(e.target.value)} />
      </Field>
      <Field label="SIREN">
        <input className="field" value={siren} onChange={(e) => setSiren(e.target.value)} />
      </Field>
      <Field label="TVA">
        <input className="field" value={vat} onChange={(e) => setVat(e.target.value)} />
      </Field>
      <Field label="Adresse">
        <input className="field" value={address} onChange={(e) => setAddress(e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button
          className="btn btn-quiet"
          type="button"
          onClick={() => {
            setError("");
            void recoverCompany(siret || siren || legalName)
              .then((found) => {
                if (!found.length) {
                  setError("Aucune entreprise trouvée.");
                  setHits([]);
                  return;
                }
                if (found.length === 1) apply(found[0]);
                else setHits(found);
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Annuaire indisponible."));
          }}
        >
          Récupérer la dénomination, le SIRET et l’adresse
        </button>
      </div>
      {error ? <p className="text-sm text-[#8a1c1c] sm:col-span-2">{error}</p> : null}
      {hits.map((hit) => (
        <button key={hit.siret || hit.siren} className="rounded-2xl border border-line bg-paper px-3 py-2 text-left text-sm sm:col-span-2" type="button" onClick={() => apply(hit)}>
          <b>{hit.name}</b>
          <span className="mt-1 block text-muted">{[hit.address, hit.siret ? `SIRET ${hit.siret}` : ""].filter(Boolean).join(" · ")}</span>
        </button>
      ))}
      <div className="flex gap-2 sm:col-span-2">
        <button
          className="btn btn-primary"
          type="button"
          disabled={!legalName.trim()}
          onClick={() =>
            onSave({
              id: `cli-${Date.now().toString(36)}`,
              legalName: legalName.trim(),
              tradeName: tradeName.trim(),
              address: address.trim(),
              vat: vat.trim(),
              siret: siret.trim(),
              rcs: siren.trim() ? `SIREN ${siren.trim()}` : "",
              siteNote: naf.trim() ? `NAF ${naf.trim()}` : "",
              email: email.trim(),
            })
          }
        >
          Enregistrer le client
        </button>
        <button className="btn btn-quiet" type="button" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </div>
  );
}
