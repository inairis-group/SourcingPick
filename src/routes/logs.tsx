import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { useOps } from "@/components/ops-ui";
import { opsBoard, opsHealth, opsLogs, opsSql } from "@/lib/ops.functions";

export const Route = createFileRoute("/logs")({
  head: () => ({ meta: [{ title: "SourcingPick — Logs" }] }),
  component: Page,
});

type Point = { t: number; v: number };

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

function figure(value: number, digits = 0) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

function Chart({ title, points, unit, digits = 0 }: { title: string; points: Point[]; unit: string; digits?: number }) {
  const usable = points.filter((point) => Number.isFinite(point.v));
  const last = usable.at(-1);
  const width = 640;
  const height = 148;
  let path = "";
  if (usable.length > 1) {
    const max = Math.max(...usable.map((point) => point.v), 0);
    const min = Math.min(...usable.map((point) => point.v), 0);
    const scale = max - min || 1;
    path = usable
      .map((point, index) => {
        const x = (index / (usable.length - 1)) * (width - 8) + 4;
        const y = height - 10 - ((point.v - min) / scale) * (height - 24);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }
  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{last ? `${figure(last.v, digits)} ${unit}` : "Pas encore de mesure"}</p>
      {path ? (
        <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-36 w-full" role="img" aria-label={title}>
          <path d={path} fill="none" stroke="#155dfc" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      ) : (
        <p className="mt-6 text-sm text-muted">Les premières mesures arrivent dans quelques minutes.</p>
      )}
    </article>
  );
}

function Page() {
  const { data, error, reload } = useOps(() => opsLogs(), "logs");
  const health = useOps(() => opsHealth(), "health");
  const board = useOps(() => opsBoard(), "board");
  const sql = useOps(() => opsSql(), "sql");
  const rows = data ?? [];
  const live = health.data;
  const curves = board.data;
  return (
    <Shell>
      <PageHead title="Logs">
        <button className="btn btn-quiet" type="button" onClick={() => { reload(); health.reload(); board.reload(); sql.reload(); }}>Actualiser</button>
      </PageHead>
      <section className="mb-5 rounded-2xl border border-line bg-white p-4">
        <p className="text-sm font-semibold">{live?.ok ? "Serveur stable" : live ? "Serveur à surveiller" : "Mesure en cours"}</p>
        <p className="mt-1 text-sm text-muted">{live?.note || "Les courbes ci-dessous sont celles du serveur. Un email part si la base tombe, si la mémoire dépasse 700 Mo, ou si le site ne répond plus."}</p>
        {live ? (
          <p className="mt-2 text-sm">
            Base {live.db === "ok" ? "joignable" : "injoignable"}
            <span className="mx-2 text-muted">·</span>
            Mémoire {live.memoryMb} Mo
            <span className="mx-2 text-muted">·</span>
            En ligne depuis {span(live.uptimeSec)}
            <span className="mx-2 text-muted">·</span>
            Redis {live.redisMs < 0 ? "indisponible" : `${live.redisMs} ms`}
            <span className="mx-2 text-muted">·</span>
            Réseau {live.netMs < 0 ? "coupé" : `${live.netMs} ms`}
            <span className="mx-2 text-muted">·</span>
            Site {live.siteMs < 0 ? "injoignable" : `${live.siteMs} ms`}
            <span className="mx-2 text-muted">·</span>
            Vu à {clock(live.checkedAt)}
          </p>
        ) : null}
        {health.error ? <p className="mt-2 text-sm text-[#8a1c1c]">{health.error}</p> : null}
        {board.error ? <p className="mt-2 text-sm text-[#8a1c1c]">{board.error}</p> : null}
      </section>
      <div className="mb-8 grid gap-3 md:grid-cols-2">
        <Chart title="Mémoire" points={curves?.memory ?? []} unit="Mo" />
        <Chart title="Requêtes par minute" points={curves?.pages ?? []} unit="/ min" digits={1} />
        <Chart title="Temps de réponse des pages" points={curves?.latency ?? []} unit="s" digits={2} />
        <Chart title="Erreurs serveur par minute" points={curves?.errors ?? []} unit="/ min" digits={2} />
      </div>
      <section className="mb-8 rounded-2xl border border-line bg-white p-4">
        <p className="text-sm font-semibold">Requêtes SQL</p>
        <p className="mt-1 text-sm text-muted">
          Cache {sql.data?.redis ? "Redis" : "mémoire"}. Une requête est notée ici à partir de 50 ms. Les valeurs ne sont pas enregistrées, seulement le texte de la requête.
        </p>
        {sql.error ? <p className="mt-2 text-sm text-[#8a1c1c]">{sql.error}</p> : null}
        {(sql.data?.slow.length ?? 0) === 0 ? <p className="mt-3 text-sm text-muted">Aucune requête lente depuis le dernier démarrage.</p> : null}
        <div className="mt-3 grid gap-2">
          {sql.data?.slow.map((query, index) => (
            <p key={`${query.at}-${index}`} className="text-xs text-muted">
              <span className="font-semibold text-ink">{query.ms} ms</span>
              <span className="mx-2">·</span>
              <span className="mono">{query.sql}</span>
            </p>
          ))}
        </div>
      </section>
      <p className="mb-4 max-w-3xl text-sm text-muted">Les erreurs techniques restent ici. Le détail est la réponse brute, pas le message affiché à l’écran.</p>
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
