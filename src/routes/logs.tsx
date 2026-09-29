import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { useOps } from "@/components/ops-ui";
import { opsHealth, opsLogs } from "@/lib/ops.functions";

export const Route = createFileRoute("/logs")({
  head: () => ({ meta: [{ title: "SourcingPick — Logs" }] }),
  component: Page,
});

function clock(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium", timeZone: "Europe/Paris" }).format(date);
}

function span(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
}

function Page() {
  const { data, error, reload } = useOps(() => opsLogs(), "logs");
  const health = useOps(() => opsHealth(), "health");
  const rows = data ?? [];
  const live = health.data;
  return (
    <Shell>
      <PageHead title="Logs">
        <button className="btn btn-quiet" type="button" onClick={() => { reload(); health.reload(); }}>Actualiser</button>
      </PageHead>
      <section className="mb-5 rounded-2xl border border-line bg-white p-4">
        <p className="text-sm font-semibold">{live?.ok ? "Serveur stable" : live ? "Serveur à surveiller" : "Mesure en cours"}</p>
        <p className="mt-1 text-sm text-muted">{live?.note || "Winston vérifie la base, la mémoire et le temps de réponse chaque minute."}</p>
        {live ? (
          <p className="mt-2 text-sm">
            Base {live.db === "ok" ? "joignable" : "injoignable"}
            <span className="mx-2 text-muted">·</span>
            Mémoire {live.memoryMb} Mo
            <span className="mx-2 text-muted">·</span>
            En ligne depuis {span(live.uptimeSec)}
            <span className="mx-2 text-muted">·</span>
            Vu à {clock(live.checkedAt)}
          </p>
        ) : null}
        {health.error ? <p className="mt-2 text-sm text-[#8a1c1c]">{health.error}</p> : null}
      </section>
      <p className="mb-4 max-w-3xl text-sm text-muted">Les erreurs techniques restent ici et dans les fichiers Winston du serveur. Le détail est la réponse brute, pas le message affiché à l’écran.</p>
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
