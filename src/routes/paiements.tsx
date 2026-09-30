import { Fragment, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Td, useOps } from "@/components/ops-ui";
import { CentsField } from "@/components/decimal-field";
import { opsInvoices, opsMarkPaid } from "@/lib/ops.functions";
import { clientLabel, euros } from "@/lib/ops.shared";

export const Route = createFileRoute("/paiements")({
  head: () => ({ meta: [{ title: "SourcingPick — Paiements" }] }),
  component: Page,
});

function slash(value: string) {
  if (!value) return "—";
  return value.includes("-") ? value.split("-").reverse().join("/") : value;
}

function Page() {
  const { data, error, reload } = useOps(() => opsInvoices(), "invoices");
  const [openId, setOpenId] = useState("");
  const [method, setMethod] = useState("Virement");
  const [receivedOn, setReceivedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [receivedCents, setReceivedCents] = useState(0);
  const [feesCents, setFeesCents] = useState(0);
  const [info, setInfo] = useState("");
  const [localError, setLocalError] = useState("");
  const rows = (data ?? []).filter((row) => row.kind !== "credit" && row.status !== "Brouillon" && row.status !== "Annulée" && row.amountCents > 0);
  return (
    <Shell>
      <PageHead title="Encaissements" />
      <p className="-mt-3 mb-4 max-w-3xl text-sm leading-relaxed text-muted">
        Factures envoyées, pas les brouillons, pas les avoirs, pas les factures annulées. Saisissez le montant reçu, y compris les centimes. Un montant inférieur laisse la facture ouverte.
      </p>
      {error || localError ? <p className="mb-3 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {info ? <p className="mb-3 text-sm text-[#0e9f6e]">{info}</p> : null}
      <DataTable head={["N° de facture", "Client", "Moyen", "Montant", "Reçu", "État", ""]}>
        {rows.map((row) => (
          <Fragment key={row.id}>
            <tr
              className="cursor-pointer"
              onClick={() => {
                setOpenId(openId === row.id ? "" : row.id);
                setReceivedCents(Math.max(row.amountCents - (row.receivedCents || 0), 0) || row.amountCents);
                setFeesCents(row.feesCents || 0);
                if (row.method && row.method !== "À définir") setMethod(row.method);
              }}
            >
              <Td className="mono font-semibold">{row.number}</Td>
              <Td>{clientLabel({ name: row.clientName, company: row.clientCompany })}</Td>
              <Td>{row.method || "—"}</Td>
              <Td className="mono">{euros(row.amountCents)}</Td>
              <Td>{row.receivedCents ? euros(row.receivedCents) : row.status === "Payée" ? slash(row.receivedOn) : "—"}</Td>
              <Td><Badge value={row.status} /></Td>
              <Td>
                {row.status === "Payée" ? (
                  <Link to="/factures/fiche/$id" params={{ id: row.id }} className="font-semibold text-brand" onClick={(event) => event.stopPropagation()}>Voir</Link>
                ) : (
                  <button className="font-semibold text-brand" type="button" onClick={(event) => { event.stopPropagation(); setOpenId(row.id); setReceivedCents(row.amountCents); }}>Encaisser</button>
                )}
              </Td>
            </tr>
            {openId === row.id && row.status !== "Payée" ? (
              <tr>
                <td colSpan={7} className="bg-canvas px-3 py-3">
                  <form
                    className="flex flex-wrap items-end gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setLocalError("");
                      if (receivedCents <= 0) {
                        setLocalError("Indiquez le montant reçu, avec les centimes si besoin.");
                        return;
                      }
                      void opsMarkPaid({ data: { id: row.id, method, receivedOn, receivedCents, feesCents } })
                        .then(() => {
                          setInfo(receivedCents >= row.amountCents ? `${row.number} encaissée.` : `${row.number} : ${euros(receivedCents)} reçus, facture encore ouverte.`);
                          setOpenId("");
                          reload();
                        })
                        .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Encaissement impossible."));
                    }}
                  >
                    <label className="text-sm">Moyen
                      <select className="field mt-1" value={method} onChange={(event) => setMethod(event.target.value)}>
                        <option>Virement</option>
                        <option>XTransfer</option>
                        <option>Wise</option>
                        <option>Carte</option>
                      </select>
                    </label>
                    <label className="text-sm">Reçu le
                      <input className="field mt-1" type="date" value={receivedOn} onChange={(event) => setReceivedOn(event.target.value)} />
                    </label>
                    <label className="text-sm">Montant reçu
                      <CentsField cents={receivedCents} onChange={setReceivedCents} className="field mt-1 w-36" />
                    </label>
                    <label className="text-sm">Frais
                      <CentsField cents={feesCents} onChange={setFeesCents} className="field mt-1 w-28" />
                    </label>
                    <button className="btn btn-primary" type="submit">Confirmer {euros(receivedCents)}</button>
                  </form>
                </td>
              </tr>
            ) : null}
          </Fragment>
        ))}
      </DataTable>
      {rows.length === 0 ? <p className="mt-4 text-sm text-muted">Aucune facture à encaisser.</p> : null}
    </Shell>
  );
}
