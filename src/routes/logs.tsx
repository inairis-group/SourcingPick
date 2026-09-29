import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { useOps } from "@/components/ops-ui";
import { opsLogs } from "@/lib/ops.functions";

export const Route = createFileRoute("/logs")({
  head: () => ({ meta: [{ title: "SourcingPick — Logs" }] }),
  component: Page,
});

function Page() {
  const { data, error, reload } = useOps(() => opsLogs(), "logs");
  const rows = data ?? [];
  return (
    <Shell>
      <PageHead title="Logs">
        <button className="btn btn-quiet" type="button" onClick={() => reload()}>Actualiser</button>
      </PageHead>
      <p className="mb-4 max-w-3xl text-sm text-muted">Les erreurs techniques restent ici : envoi de mail, facturation, démarrage. Le détail est la réponse brute du serveur, pas le message affiché à l’écran.</p>
      {error ? <p className="mb-3 text-sm text-[#8a1c1c]">{error}</p> : null}
      {rows.length === 0 ? <p className="text-sm text-muted">Aucune erreur enregistrée.</p> : null}
      <div className="grid gap-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-xs text-muted">
              <span className="mono">{row.atLabel}</span>
              <span className="mx-2">·</span>
              <span className="font-semibold uppercase">{row.source}</span>
            </p>
            <p className="mt-1 text-sm font-semibold">{row.message}</p>
            {row.detail && row.detail !== row.message ? <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-muted">{row.detail}</pre> : null}
          </article>
        ))}
      </div>
    </Shell>
  );
}
