import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Td, useOps } from "@/components/ops-ui";
import { opsClients, opsEmitSeries, opsRunBilling, opsSaveSeries, opsSeries, opsToggleSeries } from "@/lib/ops.functions";
import { clientLabel, euros, type OpsClient, type QuoteLine } from "@/lib/ops.shared";
import { CentsField, DecimalField } from "@/components/decimal-field";

export const Route = createFileRoute("/factures/recurrentes")({
  head: () => ({ meta: [{ title: "SourcingPick — Factures récurrentes" }] }),
  component: Page,
});

const CADENCE = [
  { id: "month", label: "Chaque mois" },
  { id: "quarter", label: "Chaque trimestre" },
  { id: "year", label: "Chaque année" },
] as const;

function blankLine(): QuoteLine {
  return { id: crypto.randomUUID(), kind: "service", title: "", details: "", qty: 1, unitCents: 0 };
}

function Page() {
  const { data, error, reload } = useOps(() => opsSeries());
  const [accounts, setAccounts] = useState<OpsClient[]>([]);
  const [clientUserId, setClientUserId] = useState("");
  const [label, setLabel] = useState("");
  const [cadence, setCadence] = useState<(typeof CADENCE)[number]["id"]>("month");
  const [nextOn, setNextOn] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().slice(0, 10);
  });
  const [endOn, setEndOn] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [lines, setLines] = useState<QuoteLine[]>([blankLine()]);
  const [info, setInfo] = useState("");
  const [localError, setLocalError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void opsClients().then(setAccounts).catch(() => setAccounts([]));
  }, []);

  const client = accounts.find((item) => item.id === clientUserId);
  const total = lines.reduce((sum, line) => sum + Math.round((Number(line.qty) || 0) * (Number(line.unitCents) || 0)), 0);

  function setLine(index: number, patch: Partial<QuoteLine>) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  return (
    <Shell>
      <PageHead title="Factures récurrentes">
        <button
          className="btn btn-quiet"
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void opsRunBilling()
              .then((result) => {
                setInfo(result.created || result.reminded ? `${result.created} facture(s) émise(s), ${result.reminded} relance(s) envoyée(s).` : result.failed ? "Des relances étaient dues, mais l’email n’est pas parti." : "Rien à émettre aujourd’hui.");
                reload();
              })
              .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Cycle impossible."))
              .finally(() => setBusy(false));
          }}
        >
          Émettre les échéances dues
        </button>
      </PageHead>
      <p className="mb-4 max-w-3xl text-sm text-muted">
        Pour un suivi mensuel, un stockage, ou une prestation qui revient. Le jour dit, une facture est créée pour le même client, avec les mêmes lignes, et les relances habituelles.
      </p>
      {error || localError ? <p className="mb-3 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {info ? <p className="mb-3 text-sm text-[#0e9f6e]">{info}</p> : null}
      <section className="card mb-4">
        <h2 className="font-semibold">Nouvelle récurrence</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">Libellé
            <input className="field mt-1" value={label} placeholder="Ex. Suivi mensuel, stockage entrepôt" onChange={(event) => setLabel(event.target.value)} />
          </label>
          <label className="text-sm sm:col-span-2">Client
            <select className="field mt-1" value={clientUserId} onChange={(event) => setClientUserId(event.target.value)}>
              <option value="">Choisir un compte client</option>
              {accounts.map((item) => (
                <option key={item.id} value={item.id}>{clientLabel(item)} — {item.email}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">Rythme
            <select className="field mt-1" value={cadence} onChange={(event) => setCadence(event.target.value as (typeof CADENCE)[number]["id"])}>
              {CADENCE.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="text-sm">Prochaine émission
            <input className="field mt-1" type="date" value={nextOn} onChange={(event) => setNextOn(event.target.value)} />
          </label>
          <label className="text-sm">Fin, facultative
            <input className="field mt-1" type="date" value={endOn} onChange={(event) => setEndOn(event.target.value)} />
          </label>
          <label className="text-sm">Commande liée
            <input className="field mt-1" value={orderRef} placeholder="Facultatif" onChange={(event) => setOrderRef(event.target.value)} />
          </label>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wide text-muted uppercase">
                <th className="pb-2">Désignation</th>
                <th className="pb-2">Qté</th>
                <th className="pb-2">Prix</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={line.id} className="border-t border-line">
                  <td className="py-2 pr-2"><input className="field" value={line.title} placeholder="Prestation" onChange={(event) => setLine(index, { title: event.target.value })} /></td>
                  <td className="py-2 pr-2"><DecimalField className="field w-24" fraction={0} value={line.qty} onChange={(qty) => setLine(index, { qty })} /></td>
                  <td className="py-2 pr-2"><CentsField cents={line.unitCents} onChange={(unitCents) => setLine(index, { unitCents })} /></td>
                  <td className="py-2 text-right">{lines.length > 1 ? <button className="text-sm font-semibold text-[#8a1c1c]" type="button" onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}>Retirer</button> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="btn btn-quiet" type="button" onClick={() => setLines((current) => [...current, blankLine()])}>Ajouter une ligne</button>
          <span className="mono text-sm font-semibold">{euros(total)}</span>
          <button
            className="btn btn-primary ms-auto"
            type="button"
            disabled={busy}
            onClick={() => {
              if (!client) {
                setLocalError("Choisissez un client.");
                return;
              }
              setBusy(true);
              setLocalError("");
              void opsSaveSeries({
                data: {
                  label,
                  clientUserId: client.id,
                  clientName: client.name,
                  clientEmail: client.email,
                  clientCompany: client.company,
                  clientAddress: client.address,
                  clientVat: client.vat,
                  orderRef,
                  lines,
                  cadence,
                  nextOn,
                  endOn,
                },
              })
                .then(() => {
                  setInfo("Récurrence enregistrée. Elle émettra une facture à la date choisie.");
                  setLabel("");
                  setLines([blankLine()]);
                  reload();
                })
                .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Enregistrement impossible."))
                .finally(() => setBusy(false));
            }}
          >
            Enregistrer
          </button>
        </div>
      </section>
      <DataTable head={["Libellé", "Client", "Rythme", "Prochaine", "Dernière", "État", ""]}>
        {(data ?? []).map((row) => (
          <tr key={row.id}>
            <Td className="font-semibold">{row.label}</Td>
            <Td>{clientLabel({ name: row.clientName, company: row.clientCompany })}</Td>
            <Td>{CADENCE.find((item) => item.id === row.cadence)?.label}</Td>
            <Td>{row.nextOn ? row.nextOn.split("-").reverse().join("/") : "—"}</Td>
            <Td className="mono">{row.lastNumber || "—"}</Td>
            <Td><Badge value={row.active ? "Active" : "En pause"} /></Td>
            <Td>
              <div className="flex flex-wrap gap-3">
                <button className="font-semibold text-brand" type="button" onClick={() => void opsEmitSeries({ data: row.id }).then(() => { setInfo("Facture émise."); reload(); }).catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Émission impossible."))}>Émettre</button>
                <button className="font-semibold text-ink" type="button" onClick={() => void opsToggleSeries({ data: { id: row.id, active: !row.active } }).then(() => reload()).catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Modification impossible."))}>{row.active ? "Pause" : "Reprendre"}</button>
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>
      {data && data.length === 0 ? <p className="mt-4 text-sm text-muted">Aucune récurrence. <Link to="/factures" className="font-semibold text-brand">Retour aux factures</Link></p> : null}
    </Shell>
  );
}
