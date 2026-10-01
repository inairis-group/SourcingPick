import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy, Download, Plus, Smartphone, Users } from "lucide-react";
import { Shell } from "@/components/shell";
import { opsMarket } from "@/lib/commerce.functions";
import { useOps } from "@/components/ops-ui";
import { loadSession, peekSession } from "@/lib/session";

export const Route = createFileRoute("/stock")({
  head: () => ({ meta: [{ title: "SourcingPick Stock" }] }),
  component: StockGate,
});

function StockGate() {
  const navigate = useNavigate();
  const cached = peekSession()?.user;
  const [open, setOpen] = useState(Boolean(cached && cached.role === "admin"));
  useEffect(() => {
    let live = true;
    loadSession()
      .then((session) => {
        if (!live) return;
        if (session.user?.role !== "admin") {
          void navigate({ to: session.user ? "/espace" : "/connexion" });
          return;
        }
        setOpen(true);
      })
      .catch(() => {
        if (live) void navigate({ to: "/connexion" });
      });
    return () => {
      live = false;
    };
  }, [navigate]);
  if (!open) return null;
  return <StockFrame />;
}

const TEAM_KEY = "sp-stock-team";
const APK_URL = "https://sourcingpick.com/Reserve-stock.apk";

type Operator = {
  deviceId: string;
  displayName: string;
  role: string;
  site: string;
  lastSeen: string;
};

type Created = { name: string; site: string; loginId: string; pin: string };

/** Appel JSON à l'API de l'app stock (reserve-stock, même domaine via nginx). */
async function stockSync<T>(op: string, data: unknown): Promise<T> {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op, data }),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(json.error || "Synchronisation impossible.");
  return json;
}

/** Liste les opérateurs d'une équipe (lecture seule : aucun deviceId -> pas d'enregistrement). */
async function stockPeople(code: string): Promise<Operator[]> {
  const res = await fetch(`/api/people?code=${encodeURIComponent(code)}&role=admin`, { cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as { people?: Operator[]; error?: string };
  if (!res.ok) throw new Error(json.error || "Lecture impossible.");
  return json.people ?? [];
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function StockFrame() {
  const sales = useOps(() => opsMarket({ data: "sale" }), "stock-sales");
  const auctions = useOps(() => opsMarket({ data: "auction" }), "stock-auctions");
  // Mémoïsé : sinon la fusion + le filtre repartent à chaque rendu.
  const low = useMemo(
    () =>
      [...(sales.data ?? []), ...(auctions.data ?? [])].filter(
        (item) => item.qty <= item.minQty && item.stage !== "Expédié" && item.stage !== "Vendu",
      ),
    [sales.data, auctions.data],
  );

  const [panel, setPanel] = useState<"none" | "operators" | "apk">("none");
  const [team, setTeam] = useState(() => {
    try {
      return localStorage.getItem(TEAM_KEY) || "";
    } catch {
      return "";
    }
  });
  const [operators, setOperators] = useState<Operator[] | null>(null);
  const [opName, setOpName] = useState("");
  const [opSite, setOpSite] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [created, setCreated] = useState<Created | null>(null);

  function saveTeam(value: string) {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setTeam(clean);
    try {
      localStorage.setItem(TEAM_KEY, clean);
    } catch {
      /* navigation privée */
    }
  }

  async function refreshOperators(code = team) {
    if (code.length !== 6) return;
    setBusy(true);
    setNote("");
    try {
      setOperators(await stockPeople(code));
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Lecture impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function invite() {
    const name = opName.trim();
    const site = opSite.trim();
    if (team.length !== 6) {
      setNote("Indiquez le code équipe (6 caractères).");
      return;
    }
    if (name.length < 2 || !site) {
      setNote("Indiquez le prénom et le lieu de l’opérateur.");
      return;
    }
    setBusy(true);
    setNote("");
    try {
      const creds = await stockSync<Created & { displayName: string }>("inviteOperator", { code: team, name, site });
      const done = { name: creds.displayName || name, site, loginId: creds.loginId, pin: creds.pin };
      setCreated(done);
      setOpName("");
      setOpSite("");
      await refreshOperators();
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Création impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="-mx-4 -my-6 flex h-[calc(100dvh-68px)] flex-col lg:-mx-7 lg:-my-7 lg:h-[calc(100dvh-76px)]">
        {low.length > 0 ? (
          <p className="shrink-0 border-b border-[#f3c7c7] bg-[#fde8e8] px-4 py-2 text-sm text-[#8a1c1c]">
            Stock bas : {low.map((item) => `${item.title} (${item.qty})`).join(" · ")}
          </p>
        ) : null}

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line bg-canvas px-4 py-2.5 lg:px-7">
          <span className="mr-1 text-sm font-semibold">Stock</span>
          <button
            type="button"
            className={`btn h-9 min-h-9 px-3 text-[13px] ${panel === "operators" ? "btn-primary" : "btn-quiet"}`}
            onClick={() => setPanel(panel === "operators" ? "none" : "operators")}
          >
            <Users size={15} /> Opérateurs
          </button>
          <button
            type="button"
            className={`btn h-9 min-h-9 px-3 text-[13px] ${panel === "apk" ? "btn-primary" : "btn-quiet"}`}
            onClick={() => setPanel(panel === "apk" ? "none" : "apk")}
          >
            <Smartphone size={15} /> Application Android
          </button>
        </div>

        {panel === "operators" ? (
          <section className="shrink-0 border-b border-line bg-paper px-4 py-4 lg:px-7">
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
              <div className="card">
                <p className="font-semibold">Inviter un opérateur</p>
                <p className="mt-1 text-sm text-muted">Un lieu, un identifiant, et c’est parti. Il se connecte depuis l’app ou le site.</p>
                <div className="mt-3 grid gap-2">
                  <label className="text-sm font-semibold">
                    Code équipe
                    <input
                      className="field mt-1 font-mono font-normal tracking-[0.2em]"
                      value={team}
                      onChange={(event) => saveTeam(event.target.value)}
                      onBlur={() => void refreshOperators()}
                      placeholder="ABC123"
                      inputMode="text"
                      autoCapitalize="characters"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-sm font-semibold">
                      Prénom
                      <input className="field mt-1 font-normal" value={opName} onChange={(event) => setOpName(event.target.value.slice(0, 32))} placeholder="Karim" />
                    </label>
                    <label className="text-sm font-semibold">
                      Lieu
                      <input className="field mt-1 font-normal" value={opSite} onChange={(event) => setOpSite(event.target.value.slice(0, 40))} placeholder="Entrepôt" />
                    </label>
                  </div>
                  {note ? <p className="text-sm text-[#8a1c1c]">{note}</p> : null}
                  <button className="btn btn-primary" type="button" disabled={busy} onClick={() => void invite()}>
                    <Plus size={16} /> {busy ? "Création…" : "Créer et inviter"}
                  </button>
                  {created ? (
                    <div className="rounded-2xl border border-[#b6e5c8] bg-[#e3f6ec] p-3 text-sm">
                      <p className="font-semibold text-[#145c38]">{created.name} · {created.site}</p>
                      <p className="mt-1 font-mono">Identifiant {created.loginId} · code {created.pin}</p>
                      <button
                        type="button"
                        className="btn btn-quiet mt-2 h-9 min-h-9 px-3 text-[13px]"
                        onClick={() => void copyText(`${created.name} · ${created.site}\nIdentifiant : ${created.loginId}\nCode perso : ${created.pin}\nApp : ${APK_URL}`).then((ok) => setNote(ok ? "Accès copiés — partagez-les à l’opérateur." : "Copie impossible."))}
                      >
                        <Copy size={14} /> Copier les accès
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="card">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-semibold">Opérateurs de l’équipe</p>
                  <button type="button" className="btn btn-quiet h-9 min-h-9 px-3 text-[13px]" disabled={busy || team.length !== 6} onClick={() => void refreshOperators()}>
                    {busy ? "…" : "Actualiser"}
                  </button>
                </div>
                {operators === null ? (
                  <p className="text-sm text-muted">Entrez le code équipe pour voir les opérateurs.</p>
                ) : operators.length === 0 ? (
                  <p className="text-sm text-muted">Aucun opérateur dans cette équipe.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {operators.map((op) => (
                      <li key={op.deviceId} className="flex items-center justify-between gap-3 py-2.5">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{op.displayName || "Sans nom"}</span>
                          <span className="block truncate text-xs text-muted">{op.role === "admin" ? "Admin" : "Opérateur"}{op.site ? ` · ${op.site}` : ""}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted">{op.lastSeen ? new Date(op.lastSeen).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {panel === "apk" ? (
          <section className="shrink-0 border-b border-line bg-paper px-4 py-4 lg:px-7">
            <div className="card max-w-xl">
              <p className="font-semibold">Application Android — Reserve Stock</p>
              <p className="mt-1 text-sm text-muted">
                Le lien d’installation de l’APK, à partager aux opérateurs. Sur le téléphone : ouvrir le lien dans Chrome, télécharger, installer.
              </p>
              <p className="mt-3 rounded-xl bg-canvas px-3 py-2.5 font-mono text-sm break-all">{APK_URL}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="btn btn-primary" href={APK_URL}>
                  <Download size={16} /> Télécharger l’APK
                </a>
                <button
                  type="button"
                  className="btn btn-quiet"
                  onClick={() => void copyText(APK_URL).then((ok) => setNote(ok ? "Lien copié." : "Copie impossible — sélectionnez le lien."))}
                >
                  <Copy size={15} /> Copier le lien
                </button>
              </div>
              {note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
            </div>
          </section>
        ) : null}

        <iframe
          title="SourcingPick Stock"
          src="/stock/"
          className="min-h-0 w-full flex-1 border-0 bg-white"
          allow="camera"
        />
      </div>
    </Shell>
  );
}
