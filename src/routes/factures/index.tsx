import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Td } from "@/components/ops-ui";
import { opsArmReminders, opsCreateInvoice, opsCredit, opsInvoices, opsRunBilling } from "@/lib/ops.functions";
import { clientLabel, duePhrase, euros, type OpsInvoice } from "@/lib/ops.shared";

export const Route = createFileRoute("/factures/")({
  head: () => ({ meta: [{ title: "SourcingPick — Factures" }] }),
  component: Page,
});

function kindOf(kind: string) {
  if (kind === "deposit") return "Acompte";
  if (kind === "recharge") return "Refacturation";
  if (kind === "recurring") return "Récurrente";
  if (kind === "credit") return "Avoir";
  return "Facture";
}

function followUp(row: OpsInvoice) {
  if (row.status === "Payée" || row.status === "Annulée" || row.kind === "credit" || !row.amountCents) return "";
  if (!row.remindersOn) return "Relances coupées";
  if (row.reminderLevel >= 3) return "Dernier rappel envoyé";
  const due = row.dueOn || row.issuedOn;
  if (!due) return "Relances actives";
  const age = Math.floor((Date.parse(`${new Date().toISOString().slice(0, 10)}T12:00:00Z`) - Date.parse(`${due}T12:00:00Z`)) / 86400000);
  const next = row.reminderLevel === 0 ? 7 : row.reminderLevel === 1 ? 15 : 30;
  const left = next - age;
  return left > 0 ? `Prochaine relance dans ${left} j` : "Relance à envoyer";
}

function Page() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<OpsInvoice[] | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  function load() {
    void opsInvoices()
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Lecture impossible."));
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <Shell>
      <PageHead title="Factures">
        <button
          className="btn btn-quiet"
          type="button"
          onClick={() => {
            void opsArmReminders()
              .then((count) => {
                setInfo(count ? `Relances activées sur ${count} facture(s).` : "Les factures ouvertes ont déjà les relances.");
                load();
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Activation impossible."));
          }}
        >
          Activer les relances
        </button>
        <button
          className="btn btn-quiet"
          type="button"
          onClick={() => {
            void opsRunBilling()
              .then((result) => setInfo(result.created || result.reminded ? `${result.created} facture(s) récurrente(s), ${result.reminded} relance(s).` : result.failed ? "Relance due, mais l’email n’est pas parti." : "Rien à envoyer pour le moment."))
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Cycle impossible."));
          }}
        >
          Lancer le cycle
        </button>
        <Link to="/factures/refacturation" className="btn btn-quiet">Refacturer</Link>
        <Link to="/factures/recurrentes" className="btn btn-quiet">Récurrences</Link>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            void opsCreateInvoice()
              .then((id) => navigate({ to: "/factures/fiche/$id", params: { id } }))
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Création impossible."));
          }}
        >
          Nouvelle facture
        </button>
      </PageHead>
      <p className="mb-4 max-w-3xl text-sm text-muted">
        Une facture peut partir seule, reprendre un devis, refacturer un frais avancé, ou revenir chaque mois. Les impayées reçoivent un rappel 7 jours après l’échéance, une relance à 15 jours, puis un dernier rappel à 30 jours.
      </p>
      {error ? <p className="mb-3 text-sm text-[#8a1c1c]">{error}</p> : null}
      {info ? <p className="mb-3 text-sm text-[#0e9f6e]">{info}</p> : null}
      <DataTable head={["N° de facture", "Client", "Type", "Montant", "Échéance", "État", ""]}>
        {(rows ?? []).map((row) => (
          <tr key={row.id} className="cursor-pointer" onClick={() => void navigate(row.kind === "credit" ? { to: "/avoirs/$id", params: { id: row.id } } : { to: "/factures/fiche/$id", params: { id: row.id } })}>
            <Td className="mono font-semibold">{row.number}</Td>
            <Td>{clientLabel({ name: row.clientName, company: row.clientCompany }) === "Client" ? "—" : clientLabel({ name: row.clientName, company: row.clientCompany })}</Td>
            <Td>
              {kindOf(row.kind)}
              {followUp(row) ? <span className="mt-1 block text-xs text-muted">{followUp(row)}</span> : null}
            </Td>
            <Td className="mono">{row.kind === "credit" ? `− ${euros(row.amountCents)}` : euros(row.amountCents)}</Td>
            <Td>{duePhrase(row.dueOn)}</Td>
            <Td><Badge value={row.status} /></Td>
            <Td>
              <Link to={row.kind === "credit" ? "/avoirs/$id" : "/factures/fiche/$id"} params={{ id: row.id }} className="font-semibold text-brand" onClick={(event) => event.stopPropagation()}>Ouvrir</Link>
              {row.kind !== "credit" && row.status !== "Annulée" ? (
                <button
                  className="ml-3 font-semibold text-[#8a1c1c]"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!window.confirm(`Supprimer ${row.number} ? La facture n’est pas effacée : un avoir finalisé est créé, et elle reste marquée annulée.`)) return;
                    void opsCredit({ data: row.id })
                      .then((note) => {
                        setInfo(`Avoir ${note.number} finalisé. ${row.number} est annulée.`);
                        load();
                        void navigate({ to: "/avoirs/$id", params: { id: note.id } });
                      })
                      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Avoir impossible."));
                  }}
                >
                  Supprimer
                </button>
              ) : null}
            </Td>
          </tr>
        ))}
      </DataTable>
      {rows && rows.length === 0 ? <p className="mt-4 text-sm text-muted">Aucune facture.</p> : null}
    </Shell>
  );
}
