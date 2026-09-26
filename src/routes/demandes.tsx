import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { listLeads, type LeadRow } from "@/lib/backend.functions";

export const Route = createFileRoute("/demandes")({
  head: () => ({ meta: [{ title: "SourcingPick — Demandes" }] }),
  component: Demandes,
});

function Demandes() {
  const [rows, setRows] = useState<LeadRow[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void listLeads()
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Lecture impossible."));
  }, []);
  return (
    <Shell>
      <PageHead title="Demandes" />
      <p className="mb-5 max-w-2xl text-sm text-muted">
        Demandes de devis et messages envoyés depuis le site. Elles sont enregistrées dans la base, pas seulement dans le navigateur.
      </p>
      {error ? <p className="text-sm text-[#8a1c1c]">{error}</p> : null}
      {rows == null && !error ? <p className="text-sm text-muted">Chargement…</p> : null}
      {rows && rows.length === 0 ? <p className="card text-sm text-muted">Aucune demande pour le moment.</p> : null}
      <ul className="grid gap-3">
        {rows?.map((row) => (
          <li key={row.id} className="card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">{row.name}</p>
              <p className="text-xs text-muted">{new Date(row.created_at).toLocaleString("fr-FR")}</p>
            </div>
            <p className="mt-1 text-sm text-muted">{row.kind === "contact" ? "Message" : "Devis"} · {row.email}</p>
            <p className="mt-2 text-sm font-medium">{row.subject}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{row.body}</p>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
