import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Shell, PageHead } from "@/components/shell";
import type { Client } from "@/lib/docs";
import { useAtelier } from "@/lib/store";

export const Route = createFileRoute("/clients")({ component: Page });

const EMPTY: Client = {
  id: "",
  legalName: "",
  tradeName: "",
  address: "",
  vat: "",
  siret: "",
  rcs: "",
  siteNote: "",
};

function Page() {
  const clients = useAtelier((s) => s.clients);
  const saveClient = useAtelier((s) => s.saveClient);
  const removeClient = useAtelier((s) => s.removeClient);
  const [draft, setDraft] = useState<Client | null>(null);
  const [error, setError] = useState("");

  return (
    <Shell>
      <PageHead title="Clients">
        <button className="btn btn-primary" type="button" onClick={() => setDraft({ ...EMPTY, id: `cli-${Date.now().toString(36)}` })}>
          Nouveau client <Plus size={16} />
        </button>
      </PageHead>
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <div className="grid gap-3">
        {clients.map((c) => (
          <article key={c.id} className="card flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">{c.legalName}</h2>
              <p className="text-sm text-muted">
                {[c.tradeName, c.siret, c.siteNote].filter(Boolean).join(" · ") || "Fiche incomplète"}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-quiet" type="button" onClick={() => setDraft(c)}>
                Modifier
              </button>
              <button
                className="btn btn-quiet"
                type="button"
                onClick={() => {
                  const msg = removeClient(c.id);
                  setError(msg ?? "");
                }}
              >
                Retirer
              </button>
            </div>
          </article>
        ))}
      </div>
      {draft ? (
        <form
          className="card mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.legalName.trim()) return;
            saveClient(draft);
            setDraft(null);
          }}
        >
          {(
            [
              ["legalName", "Raison sociale"],
              ["tradeName", "Enseigne"],
              ["address", "Adresse"],
              ["vat", "TVA"],
              ["siret", "SIRET"],
              ["rcs", "RCS"],
              ["siteNote", "Note de chantier"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex flex-col gap-1.5 text-sm font-semibold">
              {label}
              <input className="field font-normal" value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
            </label>
          ))}
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
