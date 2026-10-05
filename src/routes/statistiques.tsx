import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead, Shell } from "@/components/shell";
import { useOps } from "@/components/ops-ui";
import { opsMarkQuoteSigned, opsQuoteBill, opsQuoteFunnel } from "@/lib/ops.functions";
import { opsStats } from "@/lib/commerce.functions";
import { SEO_PAGES } from "@/lib/seo";

export const Route = createFileRoute("/statistiques")({
  head: () => ({ meta: [{ title: "SourcingPick — Statistiques" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const { data, error, reload } = useOps(() => opsStats(), "stats");
  const funnel = useOps(() => opsQuoteFunnel(), "quote-funnel");
  const stats = data;
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const clientPath = (path: string) => /^\/(espace|consulter|signer)(\/|$)/.test(path);
  const publicPages = (stats?.pages ?? []).filter((row) => !clientPath(row.label));
  const clientPages = (stats?.pages ?? []).filter((row) => clientPath(row.label));
  const publicReading = (stats?.reading ?? []).filter((row) => !clientPath(row.label));
  const clientVisits = (stats?.recent ?? []).filter((row) => clientPath(row.path));
  const publicVisits = (stats?.recent ?? []).filter((row) => !clientPath(row.path));
  return (
    <Shell>
      <PageHead title="Statistiques">
        <button className="btn btn-quiet" type="button" onClick={() => { reload(); funnel.reload(); }}>Actualiser</button>
      </PageHead>
      <p className="mb-4 max-w-3xl text-sm text-muted">Uniquement les visiteurs du site et les clients. Tes passages dans l’administration, et ceux des agents, ne sont pas comptés.</p>
      <h2 className="mb-2 text-sm font-semibold">Devis — ouvert, signé, téléchargé</h2>
      <p className="mb-3 max-w-3xl text-sm text-muted">Ce n’est pas le trafic du site. Chaque ligne est un devis. « Marquer signé » n’envoie pas d’email. « Créer l’acompte » non plus.</p>
      {note ? <p className="mb-3 text-sm text-[#8a1c1c]">{note}</p> : null}
      <div className="mb-8 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Devis</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Ouvert</th>
              <th className="px-3 py-2">Signé</th>
              <th className="px-3 py-2">PDF</th>
              <th className="px-3 py-2">Acompte</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(funnel.data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="px-3 py-2 font-semibold">
                  <Link to="/devis/nouveau" search={{ id: row.id }} className="text-brand">{row.number}</Link>
                  <span className="mt-0.5 block text-xs font-normal text-muted">{row.status}</span>
                </td>
                <td className="px-3 py-2">{row.client}</td>
                <td className="px-3 py-2">{row.code ? "Oui" : "—"}</td>
                <td className="px-3 py-2">{row.opened ? "Oui" : "—"}</td>
                <td className="px-3 py-2">{row.signed ? (row.manual ? "Par toi" : "Client") : "—"}</td>
                <td className="px-3 py-2">{row.downloaded ? "Oui" : "—"}</td>
                <td className="px-3 py-2">
                  {row.depositId ? (
                    <Link to="/factures/fiche/$id" params={{ id: row.depositId }} className="font-semibold text-brand">{row.depositNumber}</Link>
                  ) : "—"}
                </td>
                <td className="px-3 py-2">
                  <span className="flex flex-wrap gap-2">
                    {!row.signed && row.status !== "Devis refusé" ? (
                      <button
                        className="font-semibold text-brand disabled:opacity-50"
                        type="button"
                        disabled={busy === row.id}
                        onClick={() => {
                          setNote("");
                          setBusy(row.id);
                          void opsMarkQuoteSigned({ data: row.id })
                            .then(() => funnel.reload())
                            .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Marquage impossible."))
                            .finally(() => setBusy(""));
                        }}
                      >
                        Marquer signé
                      </button>
                    ) : null}
                    {row.signed && !row.depositId ? (
                      <button
                        className="font-semibold text-brand disabled:opacity-50"
                        type="button"
                        disabled={busy === row.id}
                        onClick={() => {
                          setNote("");
                          setBusy(row.id);
                          void opsQuoteBill({ data: { id: row.id, mode: "deposit" } })
                            .then((invoiceId) => navigate({ to: "/factures/fiche/$id", params: { id: invoiceId } }))
                            .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Facture impossible."))
                            .finally(() => setBusy(""));
                        }}
                      >
                        Créer l’acompte
                      </button>
                    ) : null}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {funnel.data && funnel.data.length === 0 ? <p className="px-3 py-3 text-sm text-muted">Aucun devis.</p> : null}
        {funnel.error ? <p className="px-3 py-3 text-sm text-[#8a1c1c]">{funnel.error}</p> : null}
      </div>
      {error ? <p className="mb-3 text-sm text-[#8a1c1c]">{error}</p> : null}
      {stats ? (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Kpi label="Aujourd’hui" views={stats.today.views} visitors={stats.today.visitors} />
            <Kpi label="7 jours" views={stats.week.views} visitors={stats.week.visitors} />
            <Kpi label="30 jours" views={stats.month.views} visitors={stats.month.visitors} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Bars title="Pages des visiteurs" rows={publicPages} />
            <Bars title="Provenance" rows={stats.sources} />
            <Bars title="Pays" rows={stats.countries} />
            <Bars title="Appareils" rows={stats.devices} />
          </div>
          <h2 className="mb-2 mt-8 text-sm font-semibold">Clients — documents envoyés</h2>
          <p className="mb-3 max-w-3xl text-sm text-muted">Devis, factures et liens partis aux clients. Un mail accepté a été pris par le serveur. Une ouverture compte quand les images sont chargées. Un clic compte chaque ouverture du lien.</p>
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <Mini label="Envoyés" value={stats.mails.sent} hint={`${stats.mails.accepted} acceptés`} />
            <Mini label="Ouverts" value={stats.mails.opened} hint={`${stats.mails.opens} chargements`} />
            <Mini label="Cliqués" value={stats.mails.clicked} hint={`${stats.mails.clicks} clics`} />
            <Mini label="Taux de clic" value={stats.mails.sent ? Math.round((stats.mails.clicked / stats.mails.sent) * 100) : 0} hint="% des envois" />
          </div>
          <div className="mb-8 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr><th className="px-3 py-2">Quand</th><th className="px-3 py-2">Destinataire</th><th className="px-3 py-2">Sujet</th><th className="px-3 py-2">Reçu</th><th className="px-3 py-2">Ouvert</th><th className="px-3 py-2">Clics</th></tr>
              </thead>
              <tbody>
                {stats.mailLog.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-3 py-2 mono">{row.at}</td>
                    <td className="px-3 py-2">{row.to}</td>
                    <td className="px-3 py-2">{row.subject}</td>
                    <td className="px-3 py-2">{row.accepted ? "Oui" : "Non"}</td>
                    <td className="px-3 py-2">{row.opens ? `${row.opens} · ${row.opened}` : "—"}</td>
                    <td className="px-3 py-2">{row.clicks ? `${row.clicks} · ${row.clicked}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.mailLog.length === 0 ? <p className="px-3 py-3 text-sm text-muted">Aucun document envoyé à un client pour le moment.</p> : null}
          </div>
          <div className="mb-8 grid gap-4 lg:grid-cols-2">
            <Bars title="Pages ouvertes par les clients" rows={clientPages} />
            <section className="rounded-2xl border border-line bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold">Dernières consultations</h2>
              {clientVisits.length === 0 ? <p className="text-sm text-muted">Pas encore de consultation d’un devis, d’une signature ou de l’espace client.</p> : null}
              <ul className="grid gap-2 text-sm">
                {clientVisits.slice(0, 8).map((row, index) => (
                  <li key={`${row.at}-${row.path}-${index}`} className="flex justify-between gap-3">
                    <span className="truncate">{row.path}</span>
                    <span className="mono text-muted">{row.at}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <h2 className="mb-2 text-sm font-semibold">Lecture des pages — 30 jours</h2>
          <p className="mb-3 max-w-3xl text-sm text-muted">Jusqu’où les visiteurs descendent, et combien de temps ils restent. La moitié, c’est au moins 50 % de la page. Le bas, c’est la page entière.</p>
          <div className="mb-6 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr><th className="px-3 py-2">Page</th><th className="px-3 py-2">Lecteurs</th><th className="px-3 py-2">Moitié</th><th className="px-3 py-2">Bas de page</th><th className="px-3 py-2">Temps moyen</th></tr>
              </thead>
              <tbody>
                {publicReading.map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <td className="px-3 py-2 font-semibold">{row.label}</td>
                    <td className="px-3 py-2">{row.views}</td>
                    <td className="px-3 py-2">{row.half}</td>
                    <td className="px-3 py-2">{row.full}</td>
                    <td className="px-3 py-2">{row.seconds} s</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {publicReading.length === 0 ? <p className="px-3 py-3 text-sm text-muted">Pas encore de lecture mesurée.</p> : null}
          </div>
          <div className="mb-6">
            <Bars title="Endroits vus sur les pages" rows={stats.sections} />
          </div>
          <h2 className="mb-2 mt-8 text-sm font-semibold">Référencement</h2>
          <p className="mb-3 max-w-3xl text-sm text-muted">Pages ouvertes à Google, avec leur titre, la longueur de la description et les visites des 30 derniers jours. Le plan du site est sur /sitemap.xml.</p>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr><th className="px-3 py-2">Page</th><th className="px-3 py-2">Titre</th><th className="px-3 py-2">Description</th><th className="px-3 py-2">30 j</th></tr>
              </thead>
              <tbody>
                {SEO_PAGES.filter((page) => page.index).map((page) => {
                  const seen = stats.pages.find((row) => row.label === page.path)?.n ?? 0;
                  const length = page.description.length;
                  return (
                    <tr key={page.path} className="border-t border-line">
                      <td className="px-3 py-2 font-semibold">{page.path}</td>
                      <td className="px-3 py-2">{page.title}</td>
                      <td className="px-3 py-2 text-muted">{length} car.</td>
                      <td className="px-3 py-2">{seen}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <h2 className="mb-2 mt-8 text-sm font-semibold">Derniers passages</h2>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr><th className="px-3 py-2">Quand</th><th className="px-3 py-2">Page</th><th className="px-3 py-2">Source</th><th className="px-3 py-2">Pays</th><th className="px-3 py-2">Appareil</th></tr>
              </thead>
              <tbody>
                {publicVisits.map((row, index) => (
                  <tr key={`${row.at}-${row.path}-${index}`} className="border-t border-line">
                    <td className="px-3 py-2 mono">{row.at}</td>
                    <td className="px-3 py-2">{row.path}</td>
                    <td className="px-3 py-2">{row.source}</td>
                    <td className="px-3 py-2">{row.country || "—"}</td>
                    <td className="px-3 py-2">{row.device}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </Shell>
  );
}

function Kpi({ label, views, visitors }: { label: string; views: number; visitors: number }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{visitors}</p>
      <p className="text-sm text-muted">{views} pages vues</p>
    </article>
  );
}

function Mini({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted">{hint}</p>
    </article>
  );
}

function Bars({ title, rows }: { title: string; rows: Array<{ label: string; n: number }> }) {
  const max = Math.max(1, ...rows.map((row) => row.n));
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {rows.length === 0 ? <p className="text-sm text-muted">Pas encore de données.</p> : null}
      <div className="grid gap-2">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between gap-3 text-xs">
              <span className="truncate">{row.label}</span>
              <span>{row.n}</span>
            </div>
            <div className="h-2 rounded-full bg-[#eef2f8]">
              <div className="h-2 rounded-full bg-[#155dfc]" style={{ width: `${Math.max(4, (row.n / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
