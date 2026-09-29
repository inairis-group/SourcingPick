import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell, PageHead } from "@/components/shell";
import { Badge, DataTable, Td, useOps } from "@/components/ops-ui";
import { opsCredit, opsInvoices } from "@/lib/ops.functions";
import { clientLabel, euros } from "@/lib/ops.shared";

export const Route = createFileRoute("/avoirs/")({
  head: () => ({ meta: [{ title: "SourcingPick — Avoirs" }] }),
  component: Page,
});

function sourceOf(method: string) {
  return method.replace(/^Annule\s+/, "") || "—";
}

function Page() {
  const navigate = useNavigate();
  const { data, error, reload } = useOps(() => opsInvoices(), "invoices");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState("");
  const credits = (data ?? []).filter((row) => row.kind === "credit");
  const openBills = (data ?? []).filter((row) => row.kind !== "credit" && row.status !== "Annulée" && row.status !== "Brouillon");
  return (
    <Shell>
      <PageHead title="Avoirs" />
      <p className="mb-4 max-w-3xl text-sm text-muted">
        Un avoir est une pièce finalisée. Il annule la facture d’origine, garde les lignes, et reste dans la comptabilité. Rien n’est effacé.
      </p>
      {error || problem ? <p className="mb-3 text-sm text-[#8a1c1c]">{error || problem}</p> : null}
      {note ? <p className="mb-3 text-sm text-[#0e9f6e]">{note}</p> : null}
      <form
        className="card mb-4 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!source) return;
          const bill = openBills.find((row) => row.id === source);
          if (!bill || !window.confirm(`Créer un avoir finalisé pour ${bill.number} ? La facture sera marquée annulée.`)) return;
          setProblem("");
          void opsCredit({ data: source })
            .then((created) => {
              setNote(`Avoir ${created.number} finalisé.`);
              setSource("");
              reload();
              void navigate({ to: "/avoirs/$id", params: { id: created.id } });
            })
            .catch((err: unknown) => setProblem(err instanceof Error ? err.message : "Avoir impossible."));
        }}
      >
        <label className="min-w-[240px] flex-1 text-sm font-semibold">Facture à annuler
          <select className="field mt-1 font-normal" value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="">Choisir une facture émise</option>
            {openBills.map((row) => (
              <option key={row.id} value={row.id}>
                {row.number} · {clientLabel({ name: row.clientName, company: row.clientCompany })} · {euros(row.amountCents)}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" type="submit" disabled={!source}>Créer l’avoir</button>
      </form>
      <DataTable head={["Avoir", "Facture annulée", "Client", "Montant", "Émis le", "État", ""]}>
        {credits.map((row) => (
          <tr key={row.id} className="cursor-pointer" onClick={() => void navigate({ to: "/avoirs/$id", params: { id: row.id } })}>
            <Td className="mono font-semibold">{row.number}</Td>
            <Td className="mono">{sourceOf(row.method)}</Td>
            <Td>{clientLabel({ name: row.clientName, company: row.clientCompany })}</Td>
            <Td className="mono">− {euros(row.amountCents)}</Td>
            <Td>{row.issuedOn ? row.issuedOn.split("-").reverse().join("/") : "—"}</Td>
            <Td><Badge value="Émis" /></Td>
            <Td><span className="font-semibold text-brand">Ouvrir</span></Td>
          </tr>
        ))}
      </DataTable>
      {credits.length === 0 ? <p className="mt-4 text-sm text-muted">Aucun avoir. Créez-en un à partir d’une facture émise, ou supprimez une facture : l’avoir se crée tout seul.</p> : null}
    </Shell>
  );
}
