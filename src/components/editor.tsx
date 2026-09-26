import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Plus, Printer, Trash2 } from "lucide-react";
import { PageHead } from "@/components/shell";
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

function euros(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function parseEuros(value: string) {
  const n = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

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
  const [step, setStep] = useState(() =>
    doc && doc.lines.some((l) => l.title.trim()) && (doc.kind !== "devis" || doc.status !== "brouillon") ? 3 : 1,
  );
  const [newClient, setNewClient] = useState(false);

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
  const back =
    doc.kind === "devis" ? "/devis" : doc.kind === "facture" ? "/factures" : "/avoirs";
  const heading =
    doc.kind === "devis"
      ? doc.status === "brouillon" && !doc.lines.some((l) => l.title.trim())
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
            <select className="field" value={doc.clientId} onChange={(e) => updateDoc(doc.id, { clientId: e.target.value })}>
              <option value="">Choisir un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.legalName}
                  {c.tradeName ? ` — ${c.tradeName}` : ""}
                </option>
              ))}
            </select>
          </Field>
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
                <input className="field" inputMode="decimal" value={String(doc.commissionBps / 100)} onChange={(e) => updateDoc(doc.id, { commissionBps: Math.round((Number(e.target.value.replace(",", ".")) || 0) * 100) })} />
              </Field>
              <Field label="Acompte (%)">
                <input className="field" inputMode="decimal" value={String(doc.depositBps / 100)} onChange={(e) => updateDoc(doc.id, { depositBps: Math.round((Number(e.target.value.replace(",", ".")) || 0) * 100) })} />
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
          {client ? (
            <p className="text-sm text-muted">
              {client.legalName}
              {client.tradeName ? ` · ${client.tradeName}` : ""}
              {client.siteNote ? ` · ${client.siteNote}` : ""}
            </p>
          ) : (
            <p className="text-sm text-danger">Choisissez un client avant l’envoi.</p>
          )}
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
        <input
          className="field"
          inputMode="decimal"
          value={doc.paidCents == null ? "" : euros(doc.paidCents)}
          onChange={(e) => updateDoc(doc.id, { paidCents: e.target.value.trim() ? parseEuros(e.target.value) : null })}
        />
      </Field>
      <Field label="Frais bancaires (€)">
        <input className="field" inputMode="decimal" value={euros(doc.feesCents)} onChange={(e) => updateDoc(doc.id, { feesCents: parseEuros(e.target.value) })} />
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
          <textarea className="field min-h-24 py-3" value={line.details} onChange={(e) => onChange({ details: e.target.value })} />
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
            <input className="field" inputMode="decimal" value={String(line.qty)} onChange={(e) => onChange({ qty: Number(e.target.value.replace(",", ".")) || 0 })} />
          </Field>
          <Field label="Prix unitaire (€)">
            <input className="field" inputMode="decimal" value={euros(line.unitPriceCents)} onChange={(e) => onChange({ unitPriceCents: parseEuros(e.target.value) })} />
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
  const [address, setAddress] = useState("");
  const [siret, setSiret] = useState("");
  return (
    <div className="grid gap-3 rounded-xl bg-canvas p-3 sm:grid-cols-2">
      <Field label="Raison sociale">
        <input className="field" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
      </Field>
      <Field label="Enseigne">
        <input className="field" value={tradeName} onChange={(e) => setTradeName(e.target.value)} />
      </Field>
      <Field label="Adresse">
        <input className="field" value={address} onChange={(e) => setAddress(e.target.value)} />
      </Field>
      <Field label="SIRET">
        <input className="field" value={siret} onChange={(e) => setSiret(e.target.value)} />
      </Field>
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
              vat: "",
              siret: siret.trim(),
              rcs: "",
              siteNote: "",
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
