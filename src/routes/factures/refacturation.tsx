import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Td, useOps } from "@/components/ops-ui";
import { opsAddCharge, opsBillCharges, opsCharges, opsClients } from "@/lib/ops.functions";
import { clientLabel, euros, percent, type OpsClient } from "@/lib/ops.shared";
import { DecimalField } from "@/components/decimal-field";

export const Route = createFileRoute("/factures/refacturation")({
  head: () => ({ meta: [{ title: "SourcingPick — Refacturation" }] }),
  component: Page,
});

const NATURES = ["Fret maritime", "Contrôle qualité", "Entrepôt et stockage", "Douane", "Emballage et renforcement", "Autre frais avancé"];

function Page() {
  const navigate = useNavigate();
  const { data, error, reload } = useOps(() => opsCharges());
  const [accounts, setAccounts] = useState<OpsClient[]>([]);
  const [clientUserId, setClientUserId] = useState("");
  const [nature, setNature] = useState(NATURES[0]);
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(0);
  const [markup, setMarkup] = useState(0);
  const [orderRef, setOrderRef] = useState("");
  const [incurredOn, setIncurredOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [picked, setPicked] = useState<string[]>([]);
  const [info, setInfo] = useState("");
  const [localError, setLocalError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void opsClients().then(setAccounts).catch(() => setAccounts([]));
  }, []);

  const client = accounts.find((item) => item.id === clientUserId);
  const costCents = Math.round(cost * 100);
  const markupBps = Math.round(markup * 100);
  const billed = Math.round((costCents * (10000 + markupBps)) / 10000);
  const open = (data ?? []).filter((row) => row.status === "À refacturer");

  function toggle(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <Shell>
      <PageHead title="Refacturation" />
      <p className="mb-4 max-w-3xl text-sm text-muted">
        Vous avancez un fret, un contrôle, du stockage ou des frais de douane. Notez ce que vous avez payé, la marge éventuelle, puis émettez la facture au client. Plusieurs frais du même client partent sur une seule facture.
      </p>
      {error || localError ? <p className="mb-3 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {info ? <p className="mb-3 text-sm text-[#0e9f6e]">{info}</p> : null}
      <section className="card mb-4">
        <h2 className="font-semibold">Frais avancé</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Nature
            <select className="field mt-1" value={nature} onChange={(event) => setNature(event.target.value)}>
              {NATURES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm">Fournisseur ou transitaire
            <input className="field mt-1" value={supplier} placeholder="Ex. compagnie, entrepôt, inspecteur" onChange={(event) => setSupplier(event.target.value)} />
          </label>
          <label className="text-sm sm:col-span-2">Client
            <select className="field mt-1" value={clientUserId} onChange={(event) => setClientUserId(event.target.value)}>
              <option value="">Choisir un compte client</option>
              {accounts.map((item) => (
                <option key={item.id} value={item.id}>{clientLabel(item)} — {item.email}</option>
              ))}
            </select>
          </label>
          <label className="text-sm sm:col-span-2">Détail
            <input className="field mt-1" value={description} placeholder="Ex. conteneur 40 pieds Guangzhou → Le Havre, semaine 12" onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="text-sm">Montant avancé €
            <DecimalField className="field mt-1" value={cost} onChange={setCost} />
          </label>
          <label className="text-sm">Marge %
            <DecimalField className="field mt-1" value={markup} onChange={setMarkup} />
          </label>
          <label className="text-sm">Date
            <input className="field mt-1" type="date" value={incurredOn} onChange={(event) => setIncurredOn(event.target.value)} />
          </label>
          <label className="text-sm">Commande liée
            <input className="field mt-1" value={orderRef} placeholder="Facultatif" onChange={(event) => setOrderRef(event.target.value)} />
          </label>
        </div>
        <p className="mt-3 text-sm">Facturé au client : <span className="mono font-semibold">{euros(billed)}</span>{markupBps ? ` · marge ${percent(markupBps)}` : " · sans marge"}</p>
        <button
          className="btn btn-primary mt-3"
          type="button"
          disabled={busy}
          onClick={() => {
            if (!client) {
              setLocalError("Choisissez le client.");
              return;
            }
            setBusy(true);
            setLocalError("");
            void opsAddCharge({
              data: {
                supplier,
                nature,
                description,
                costCents,
                markupBps,
                clientUserId: client.id,
                clientName: client.name,
                clientEmail: client.email,
                clientCompany: client.company,
                clientAddress: client.address,
                clientVat: client.vat,
                orderRef,
                incurredOn,
              },
            })
              .then(() => {
                setInfo("Frais enregistré. Cochez-le puis refacturez quand vous voulez.");
                setSupplier("");
                setDescription("");
                setCost(0);
                reload();
              })
              .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Enregistrement impossible."))
              .finally(() => setBusy(false));
          }}
        >
          Enregistrer le frais
        </button>
      </section>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          className="btn btn-primary"
          type="button"
          disabled={!picked.length || busy}
          onClick={() => {
            setBusy(true);
            void opsBillCharges({ data: picked })
              .then((id) => navigate({ to: "/factures/fiche/$id", params: { id } }))
              .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Refacturation impossible."))
              .finally(() => setBusy(false));
          }}
        >
          Refacturer la sélection
        </button>
        <span className="text-sm text-muted">{picked.length ? `${picked.length} frais` : `${open.length} en attente`}</span>
      </div>
      <DataTable head={["", "Date", "Nature", "Client", "Avancé", "Facturé", "État", ""]}>
        {(data ?? []).map((row) => (
          <tr key={row.id}>
            <Td>
              {row.status === "À refacturer" ? (
                <input type="checkbox" checked={picked.includes(row.id)} onChange={() => toggle(row.id)} aria-label={`Sélectionner ${row.nature}`} />
              ) : null}
            </Td>
            <Td>{row.incurredOn ? row.incurredOn.split("-").reverse().join("/") : "—"}</Td>
            <Td>
              <span className="font-semibold">{row.nature}</span>
              {row.supplier || row.description ? <span className="mt-1 block text-xs text-muted">{[row.supplier, row.description].filter(Boolean).join(" · ")}</span> : null}
            </Td>
            <Td>{clientLabel({ name: row.clientName, company: row.clientCompany })}</Td>
            <Td className="mono">{euros(row.costCents)}</Td>
            <Td className="mono">{euros(row.billCents)}</Td>
            <Td><Badge value={row.status} /></Td>
            <Td>
              {row.invoiceId ? <Link to="/factures/fiche/$id" params={{ id: row.invoiceId }} className="font-semibold text-brand">{row.invoiceNumber || "Ouvrir"}</Link> : "—"}
            </Td>
          </tr>
        ))}
      </DataTable>
      {data && data.length === 0 ? <p className="mt-4 text-sm text-muted">Aucun frais à refacturer.</p> : null}
    </Shell>
  );
}
