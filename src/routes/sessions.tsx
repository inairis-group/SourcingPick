import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell, PageHead } from "@/components/shell";
import { listActiveSessions, revokeActiveSession } from "@/lib/admin-auth.functions";

export const Route = createFileRoute("/sessions")({
  head: () => ({ meta: [{ title: "SourcingPick — Sessions" }] }),
  component: Page,
});

type Row = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "client";
  createdAt: string;
  expiresAt: string;
  agent: string;
  ip: string;
  current: boolean;
};

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function Page() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  async function reload() {
    setRows(await listActiveSessions());
  }

  useEffect(() => {
    void reload().catch((err) => setError(err instanceof Error ? err.message : "Lecture impossible."));
  }, []);

  return (
    <Shell>
      <PageHead title="Sessions actives" />
      <p className="mb-4 max-w-2xl text-sm text-muted">
        Chaque connexion ouvre une session de 30 jours. Vous pouvez en fermer une sans toucher aux autres. L'administration voit toutes les sessions.
      </p>
      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-3">
        {rows.map((row) => (
          <article key={row.id} className="card flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">
                {row.name}
                {row.current ? <span className="ms-2 text-xs font-semibold text-gold">Cette session</span> : null}
              </h2>
              <p className="text-sm text-muted">{row.email}</p>
              <p className="mt-1 text-sm text-muted">
                Ouverte le {when(row.createdAt)} · expire le {when(row.expiresAt)}
                {row.ip ? ` · ${row.ip}` : ""}
              </p>
              {row.agent ? <p className="mt-1 max-w-xl text-xs text-muted">{row.agent}</p> : null}
            </div>
            <button
              className="btn btn-quiet"
              type="button"
              onClick={() => {
                void revokeActiveSession({ data: { id: row.id } })
                  .then((result) => {
                    if (result.current) void navigate({ to: "/connexion" });
                    else return reload();
                  })
                  .catch((err) => setError(err instanceof Error ? err.message : "Fermeture impossible."));
              }}
            >
              Fermer
            </button>
          </article>
        ))}
        {rows.length === 0 ? <p className="text-sm text-muted">Aucune session active.</p> : null}
      </div>
    </Shell>
  );
}
