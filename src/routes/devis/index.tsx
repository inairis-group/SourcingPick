import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Td } from "@/components/ops-ui";
import { opsCreateQuote, opsDeleteQuote, opsQuotes } from "@/lib/ops.functions";
import { euros, type OpsQuote } from "@/lib/ops.shared";

export const Route = createFileRoute("/devis/")({
  head: () => ({ meta: [{ title: "SourcingPick — Devis" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<OpsQuote[] | null>(null);
  const [error, setError] = useState("");

  function load() {
    void opsQuotes()
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Lecture impossible."));
  }

  useEffect(() => {
    load();
  }, []);

  function open(id: string) {
    void navigate({ to: "/devis/nouveau", search: { id } });
  }

  return (
    <Shell>
      <PageHead title="Devis">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setError("");
            void opsCreateQuote()
              .then((quote) => {
                if (quote) open(quote.id);
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Création impossible."));
          }}
        >
          Nouveau devis
        </button>
      </PageHead>
      {error ? <p className="mb-3 text-sm text-[#8a1c1c]">{error}</p> : null}
      <DataTable head={["Référence", "Client", "Email", "Montant", "Date", "État", ""]}>
        {(rows ?? []).map((row) => (
          <tr key={row.id} className="cursor-pointer" onDoubleClick={() => open(row.id)}>
            <Td className="mono font-semibold">{row.number}</Td>
            <Td>{row.clientCompany || row.clientName || "—"}</Td>
            <Td>{row.clientEmail || "—"}</Td>
            <Td className="mono">{euros(row.amountCents)}</Td>
            <Td>{row.issuedOn ? row.issuedOn.split("-").reverse().join("/") : "—"}</Td>
            <Td><Badge value={row.status} /></Td>
            <Td>
              <span className="flex items-center gap-3">
                <button type="button" className="font-semibold text-brand" onClick={() => open(row.id)}>Ouvrir</button>
                <button
                  type="button"
                  className="font-semibold text-[#8a1c1c]"
                  onClick={() => {
                    if (row.status === "Devis signé") {
                      setError("Un devis signé ne se supprime pas.");
                      return;
                    }
                    if (!window.confirm(`Supprimer le devis ${row.number} ?`)) return;
                    setError("");
                    void opsDeleteQuote({ data: row.id })
                      .then(load)
                      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Suppression impossible."));
                  }}
                >
                  Supprimer
                </button>
              </span>
            </Td>
          </tr>
        ))}
      </DataTable>
      {rows && rows.length === 0 ? <p className="mt-4 text-sm text-muted">Aucun devis.</p> : null}
    </Shell>
  );
}
