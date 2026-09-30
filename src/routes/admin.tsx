import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, CreditCard, Euro, FileText, Plus, Receipt, Ship } from "lucide-react";
import { Shell } from "@/components/shell";
import { Bars, CubeFace, Hero, Stat } from "@/components/design";
import { opsCreateQuote, opsDashboard, opsNudge } from "@/lib/ops.functions";
import { useOps } from "@/components/ops-ui";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "SourcingPick — Administration" }] }),
  component: AdminHome,
});

const TONES = ["#3B82F6", "#60A5FA", "#7C5CFF", "#E0A106", "#12B76A", "#16A34A", "#1D4ED8", "#0E7490", "#0E1A3D", "#E02424"];

function whole(cents: number) {
  return Math.round(cents / 100).toLocaleString("fr-FR");
}

function AdminHome() {
  const navigate = useNavigate();
  const { data, error, reload } = useOps(() => opsDashboard());
  const [note, setNote] = useState("");
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState("");
  const month = data?.collectedMonth ?? 0;
  const prev = data?.collectedPrev ?? 0;
  const delta = data && prev > 0 ? Math.round(((month - prev) / prev) * 100) : null;

  return (
    <Shell>
      <Hero
        kicker="Administration"
        title="Vue d’ensemble"
        text="L’administration dispose de tous les droits d’un agent : qualifier une demande, établir un devis, mettre à jour un état, répondre aux messages."
      >
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setBad(false);
            setNote("");
            setBusy("devis");
            void opsCreateQuote()
              .then((quote) => {
                if (quote) void navigate({ to: "/devis/nouveau", search: { id: quote.id } });
              })
              .catch((err: unknown) => {
                setBad(true);
                setNote(err instanceof Error ? err.message : "Création impossible.");
              })
              .finally(() => setBusy(""));
          }}
        >
          Nouveau devis <Plus size={16} />
        </button>
        <Link to="/demandes" className="btn btn-quiet">File des demandes</Link>
      </Hero>
      {error || note ? <p className={`mb-4 text-sm ${error || bad ? "text-[#8a1c1c]" : "text-[#0e9f6e]"}`}>{error || note}</p> : null}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Volume d’affaires du mois" value={data ? whole(month) : "—"} unit="€" hint={delta == null ? "Encaissé" : delta >= 0 ? `+${delta} %` : `${delta} %`} icon={<Euro size={16} />} />
        <Stat label="Montant facturé" value={data ? whole(data.invoicedMonth) : "—"} unit="€" hint="Factures émises" icon={<Receipt size={16} />} tone="#FFF6E8" ink="#B45309" />
        <Stat label="Devis en attente de signature" value={String(data?.waitingQuotes ?? "—")} icon={<FileText size={16} />} tone="#F3EEFF" ink="#7C5CFF" />
        <Stat label="Acomptes non réglés" value={String(data?.unpaidDeposits ?? "—")} icon={<CreditCard size={16} />} tone="#FFF0F3" ink="#E11D48" />
        <Stat label="Conteneurs en mer" value={String(data?.atSea ?? "—")} icon={<Ship size={16} />} tone="#EEF6FF" ink="#3B82F6" />
      </div>
      <section className="card mb-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="display text-lg">Supervision — aujourd’hui, tous rôles</h2>
            <p className="text-sm text-muted">Un coup d’œil sur ce que fait chaque rôle, avant de plonger dans le détail.</p>
          </div>
          <Link to="/journal" className="text-sm font-semibold text-brand">Voir le journal complet</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {(data?.supervision ?? []).map((row) => (
            <article key={row.role} className="rounded-2xl border border-line bg-canvas p-4">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${row.role === "admin" ? "bg-[#F3EEFF] text-[#7C5CFF]" : row.role === "agent" ? "bg-[#EEF3FF] text-[#155DFC]" : "bg-[#E3F6EC] text-[#0E9F6E]"}`}>
                {row.role === "admin" ? "Administration" : row.role === "agent" ? "Agent" : "Client"}
              </span>
              <p className="display mt-3 text-2xl">{row.count} action{row.count > 1 ? "s" : ""}</p>
              <p className="mt-1 text-sm text-muted">{row.hint || "aucune action aujourd’hui"}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="card">
          <h2 className="display mb-2 text-lg">Pipeline par état</h2>
          <Bars rows={(data?.pipeline ?? []).map((row, index) => ({ label: row.state, count: row.count, tone: TONES[index % TONES.length] }))} />
        </section>
        <div className="grid content-start gap-4">
          <section className="card">
            <h2 className="display mb-1 text-lg">Ce qui traîne</h2>
            <p className="mb-3 text-sm text-muted">Devis envoyé depuis plus de 7 jours, facture impayée depuis plus de 3 jours, commande sans mise à jour depuis 10 jours.</p>
            {(data?.stale ?? []).length === 0 ? <p className="text-sm text-muted">Rien en retard.</p> : null}
            <ul className="sp-alerts">
              {(data?.stale ?? []).map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <Clock size={16} />
                  <span className="min-w-0 flex-1">{item.label}</span>
                  {item.kind === "devis" ? (
                    <Link to="/devis/nouveau" search={{ id: item.id }} className="font-semibold text-brand">Ouvrir</Link>
                  ) : item.kind === "facture" ? (
                    <Link to="/factures/fiche/$id" params={{ id: item.id }} className="font-semibold text-brand">Ouvrir</Link>
                  ) : (
                    <Link to="/commandes/$id" params={{ id: item.id }} className="font-semibold text-brand">Ouvrir</Link>
                  )}
                  <button
                    className="font-semibold text-brand disabled:opacity-50"
                    type="button"
                    disabled={busy === item.id}
                    onClick={() => {
                      setBusy(item.id);
                      setNote("");
                      setBad(false);
                      void opsNudge({ data: { kind: item.kind, id: item.id } })
                        .then(() => {
                          setNote("Relance envoyée par email.");
                          reload();
                        })
                        .catch((err: unknown) => {
                          setBad(true);
                          setNote(err instanceof Error ? err.message : "Relance impossible.");
                        })
                        .finally(() => setBusy(""));
                    }}
                  >
                    Relancer
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2 className="display mb-1 text-lg">Charge des agents</h2>
            {(data?.agents ?? []).length === 0 ? <p className="text-sm text-muted">Aucun agent actif. Créez-en un dans Utilisateurs.</p> : null}
            <ul className="sp-people">
              {(data?.agents ?? []).map((agent) => (
                <li key={agent.name}>
                  <CubeFace size={32} />
                  <strong>{agent.name}</strong>
                  <em>{agent.count} commande{agent.count > 1 ? "s" : ""}</em>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Shell>
  );
}