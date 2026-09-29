import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Shell, PageHead } from "@/components/shell";
import { listAccounts, saveAccount, type Role } from "@/lib/admin-auth.functions";

export const Route = createFileRoute("/acces")({
  head: () => ({ meta: [{ title: "SourcingPick — Accès" }] }),
  component: Page,
});

type Account = { id: string; name: string; email: string; role: Role; active: boolean; createdAt: string };

const EMPTY: Account = { id: "", name: "", email: "", role: "agent", active: true, createdAt: "" };

function Page() {
  const [rows, setRows] = useState<Account[]>([]);
  const [draft, setDraft] = useState<Account | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function reload() {
    setRows(await listAccounts());
  }

  useEffect(() => {
    void reload().catch((err) => setError(err instanceof Error ? err.message : "Lecture impossible."));
  }, []);

  return (
    <Shell>
      <PageHead title="Accès">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setPassword("");
            setDraft({ ...EMPTY, id: crypto.randomUUID() });
          }}
        >
          Nouveau compte <Plus size={16} />
        </button>
      </PageHead>
      <p className="mb-4 max-w-2xl text-sm text-muted">
        L'administration gère la société, les accès et les sessions. Un agent prépare les devis et les factures. Un client ne voit que les documents rattachés à son email.
      </p>
      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-3">
        {rows.map((row) => (
          <article key={row.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{row.name}</h2>
              <p className="text-sm text-muted">
                {row.email} · {row.role === "admin" ? "Administration" : row.role === "agent" ? "Agent" : "Client"}
                {row.active ? "" : " · désactivé"}
              </p>
            </div>
            <button
              className="btn btn-quiet"
              type="button"
              onClick={() => {
                setPassword("");
                setDraft(row);
              }}
            >
              Modifier
            </button>
          </article>
        ))}
      </div>
      {draft ? (
        <form
          className="card mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            void saveAccount({ data: { ...draft, password } })
              .then(() => {
                setDraft(null);
                return reload();
              })
              .catch((err) => setError(err instanceof Error ? err.message : "Enregistrement impossible."));
          }}
        >
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Nom
            <input className="field font-normal" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Email
            <input className="field font-normal" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Rôle
            <select className="field font-normal" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}>
              <option value="admin">Administration</option>
              <option value="agent">Agent</option>
              <option value="client">Client</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {rows.some((row) => row.id === draft.id) ? "Nouveau mot de passe" : "Mot de passe"}
            <input className="field font-normal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
            Compte actif
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn btn-primary" type="submit">
              Enregistrer
            </button>
            <button className="btn btn-quiet" type="button" onClick={() => setDraft(null)}>
              Fermer
            </button>
          </div>
        </form>
      ) : null}
    </Shell>
  );
}
