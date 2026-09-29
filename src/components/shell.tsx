import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  FileText,
  FileSignature,
  Inbox,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  PanelLeft,
  Paperclip,
  Receipt,
  Repeat,
  ScrollText,
  Bug,
  Search,
  Settings,
  Ship,
  Users,
  Wallet,
  X,
  Bell,
  Building2,
  ChevronDown,
  ArrowLeftRight,
  BarChart3,
  Gavel,
  Package,
  Store,
} from "lucide-react";
import { kindLabel, type Document } from "@/lib/docs";
import { adminLogout } from "@/lib/admin-auth.functions";
import { clearSession, loadSession, peekSession } from "@/lib/session";
import { useAtelier } from "@/lib/store";
import { Tour } from "@/components/tour";
import { CubeFace } from "@/components/design";
import { UiLangProvider, useUi } from "@/lib/ui-lang";
import { clientPortal, opsCatalog, opsJournal } from "@/lib/ops.functions";
import { readOps } from "@/components/ops-ui";
import type { OpsJournal } from "@/lib/ops.shared";

const NAV = [
  { to: "/espace", label: "Tableau de bord", icon: LayoutGrid, exact: true, roles: ["client"] },
  { to: "/espace/demandes", label: "Demandes", icon: Inbox, exact: false, roles: ["client"] },
  { to: "/espace/commandes", label: "Commandes", icon: Ship, exact: false, roles: ["client"] },
  { to: "/espace/facturation", label: "Facturation", icon: Receipt, exact: false, roles: ["client"] },
  { to: "/espace/documents", label: "Documents", icon: Paperclip, exact: true, roles: ["client"] },
  { to: "/espace/messages", label: "Messages", icon: MessageSquare, exact: true, roles: ["client"] },
  { to: "/espace/parametres", label: "Paramètres", icon: Settings, exact: true, roles: ["client"] },
  { to: "/admin", label: "Tableau de bord", icon: LayoutGrid, exact: true, roles: ["admin"] },
  { to: "/agent", label: "Tableau de bord", icon: LayoutGrid, exact: true, roles: ["agent"] },
  { to: "/demandes", label: "Demandes", icon: Inbox, exact: false, roles: ["admin", "agent"] },
  { to: "/devis", label: "Devis", icon: FileText, exact: false, roles: ["admin"] },
  { to: "/clients", label: "Clients", icon: Building2, exact: false, roles: ["admin", "agent"] },
  { to: "/commandes", label: "Commandes", icon: Ship, exact: false, roles: ["admin", "agent"] },
  { to: "/agent/messages", label: "Messages", icon: MessageSquare, exact: false, roles: ["admin", "agent"] },
  { to: "/documents", label: "Documents", icon: Paperclip, exact: false, roles: ["admin", "agent"] },
  { to: "/contrats", label: "Contrats", icon: FileSignature, exact: false, roles: ["admin"] },
  { to: "/agent/finances", label: "Finances", icon: Wallet, exact: true, roles: ["agent"] },
  { to: "/stock", label: "Stock", icon: Package, exact: true, roles: ["admin"] },
  { to: "/gestion/marketplace", label: "Marketplace", icon: Store, exact: false, roles: ["admin"] },
  { to: "/gestion/encheres", label: "Enchères", icon: Gavel, exact: false, roles: ["admin"] },
  { to: "/statistiques", label: "Statistiques", icon: BarChart3, exact: true, roles: ["admin"] },
] as const;

const BILLING = [
  { to: "/factures", label: "Factures", icon: Receipt, exact: false, roles: ["admin"] },
  { to: "/factures/recurrentes", label: "Récurrentes", icon: Repeat, exact: true, roles: ["admin"] },
  { to: "/factures/refacturation", label: "Refacturation", icon: ArrowLeftRight, exact: true, roles: ["admin"] },
  { to: "/avoirs", label: "Avoirs", icon: FileText, exact: false, roles: ["admin"] },
  { to: "/paiements", label: "Encaissements", icon: Wallet, exact: false, roles: ["admin"] },
] as const;

const FOOT = [
  { to: "/utilisateurs", label: "Utilisateurs", icon: Users, exact: false, roles: ["admin"] },
  { to: "/emails", label: "Emails", icon: Mail, exact: false, roles: ["admin"] },
  { to: "/journal", label: "Journal", icon: ScrollText, exact: false, roles: ["admin"] },
  { to: "/logs", label: "Logs", icon: Bug, exact: false, roles: ["admin"] },
  { to: "/parametres", label: "Paramètres", icon: Settings, exact: false, roles: ["admin"] },
  { to: "/agent/parametres", label: "Paramètres", icon: Settings, exact: true, roles: ["agent"] },
] as const;

const ROLE_LABEL = { admin: "Administration", agent: "Agent", client: "Client" } as const;

type Role = keyof typeof ROLE_LABEL;

function cleanPath(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function homeFor(role: Role) {
  if (role === "client") return "/espace" as const;
  if (role === "agent") return "/agent" as const;
  return "/admin" as const;
}

function allowed(role: Role, path: string) {
  if (role === "client") return path === "/espace" || path.startsWith("/espace/") || path.startsWith("/sessions") || path === "/aide" || path.startsWith("/imprimer/");
  if (path.startsWith("/espace")) return false;
  const adminOnly =
    path === "/admin" ||
    path.startsWith("/devis") ||
    path.startsWith("/factures") ||
    path.startsWith("/avoirs") ||
    path.startsWith("/paiements") ||
    path.startsWith("/utilisateurs") ||
    path.startsWith("/journal") ||
    path.startsWith("/logs") ||
    path.startsWith("/emails") ||
    path.startsWith("/agents") ||
    path.startsWith("/societe") ||
    path.startsWith("/acces") ||
    path === "/stock" ||
    path.startsWith("/gestion/") ||
    path.startsWith("/statistiques") ||
    path.startsWith("/contrats") ||
    path === "/parametres" ||
    path.startsWith("/parametres/");
  if (role === "agent" && adminOnly) return false;
  return true;
}

function pathOf(to: string, id?: string) {
  if (to === "/devis/$id") return `/devis/${id}`;
  if (to === "/factures/$id") return `/factures/${id}`;
  if (to === "/avoirs/$id") return `/avoirs/${id}`;
  return to;
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const docs = useAtelier((s) => s.docs);
  const clients = useAtelier((s) => s.clients);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [q, setQ] = useState("");
  const [account, setAccount] = useState(peekSession()?.user ?? null);
  const [leaving, setLeaving] = useState(false);
  const [index, setIndex] = useState<Array<{ id: string; kind: "devis" | "facture" | "avoir"; number: string; label: string }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("sp-nav") === "1");
    const openNav = () => setOpen(true);
    window.addEventListener("sp-nav-open", openNav);
    return () => window.removeEventListener("sp-nav-open", openNav);
  }, []);

  useEffect(() => {
    if (!account || account.role === "client") return;
    let live = true;
    void opsCatalog()
      .then((rows) => {
        if (!live) return;
        setIndex(rows);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [account]);

  useEffect(() => {
    let live = true;
    loadSession(false)
      .then((session) => {
        if (!live) return;
        if (!session.user) {
          void navigate({ to: "/connexion" });
          return;
        }
        const role = session.user.role;
        if (!allowed(role, pathname)) {
          void navigate({ to: homeFor(role) });
        }
        setAccount(session.user);
      })
      .catch(() => {
        if (live) void navigate({ to: "/connexion" });
      });
    return () => {
      live = false;
    };
  }, [navigate, pathname]);

  async function leave() {
    setLeaving(true);
    try {
      await adminLogout();
      clearSession();
    } finally {
      void navigate({ to: "/connexion" });
    }
  }

  const hits = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2 || !account) return [];
    if (account.role !== "client") {
      const pool = account.role === "agent" ? index.filter((item) => item.kind === "devis") : index;
      return pool
        .filter((item) => `${item.number} ${item.label}`.toLowerCase().includes(query))
        .slice(0, 6)
        .map((item) => ({ id: item.id, kind: item.kind, number: item.number, label: item.label }));
    }
    const visible = docs.filter((doc) => {
      const owner = clients.find((client) => client.id === doc.clientId);
      return (owner?.email || "").trim().toLowerCase() === (account.email || "").trim().toLowerCase();
    });
    return visible
      .filter((d) => {
        const client = clients.find((c) => c.id === d.clientId);
        const blob = `${d.number} ${d.headline} ${client?.legalName ?? ""} ${client?.tradeName ?? ""}`.toLowerCase();
        return blob.includes(query);
      })
      .slice(0, 6)
      .map((d) => ({ id: d.id, kind: d.kind, number: d.number, label: kindLabel(d.kind) }));
  }, [q, docs, clients, account, index]);

  function navOn(to: string, exact: boolean) {
    const path = cleanPath(pathname);
    if (to === "/factures") {
      return path === "/factures" || path.startsWith("/factures/fiche") || /^\/factures\/inv_/.test(path);
    }
    return exact ? path === to : path === to || path.startsWith(`${to}/`);
  }

  type NavItem = (typeof NAV)[number] | (typeof BILLING)[number] | (typeof FOOT)[number];

  function NavLink({ to, label, icon: Icon, exact }: NavItem) {
    const tour =
      to === "/espace" ? "nav-board"
      : to === "/espace/demandes" ? "nav-demandes"
      : to === "/espace/commandes" ? "nav-commandes"
      : to === "/espace/facturation" ? "nav-facturation"
      : to === "/espace/documents" ? "nav-documents"
      : to === "/espace/messages" ? "nav-messages"
      : undefined;
    return (
      <Link to={to} title={label} data-tour={tour} aria-current={navOn(to, exact) ? "page" : undefined} className={`nav-link ${collapsed ? "lg:justify-center" : ""}`} onClick={() => setOpen(false)}>
        <Icon size={18} strokeWidth={1.9} />
        <span className={collapsed ? "lg:hidden" : ""}><Tx text={label} /></span>
      </Link>
    );
  }

  const aside = (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <div className={`flex items-center gap-2 ${collapsed ? "lg:justify-center" : "justify-between px-1.5"}`}>
        <div className={`flex flex-col gap-3 ${collapsed ? "lg:hidden" : ""}`}>
          <img src="/logo-lockup.svg" alt="Sourcing Pick" className="h-7 w-auto self-start" />
          <span className="role-pill mono">
            {account ? <Tx text={ROLE_LABEL[account.role]} /> : "Sourcing Pick"}
          </span>
        </div>
        <button
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 lg:inline-flex"
          type="button"
          title={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
          aria-label={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
          onClick={() => setCollapsed((value) => {
            window.localStorage.setItem("sp-nav", value ? "0" : "1");
            return !value;
          })}
        >
          <PanelLeft size={18} />
        </button>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV.filter((item) => account && (item.roles as readonly string[]).includes(account.role)).map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
        {BILLING.some((item) => account && (item.roles as readonly string[]).includes(account.role)) ? (
          <>
            <p className={`mt-3 px-3 text-[11px] font-semibold tracking-wide text-white/45 uppercase ${collapsed ? "lg:hidden" : ""}`}>Facturation</p>
            {BILLING.filter((item) => account && (item.roles as readonly string[]).includes(account.role)).map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </>
        ) : null}
      </nav>
      <div className="flex shrink-0 flex-col gap-1 border-t border-white/12 pt-3">
        {FOOT.filter((item) => account && (item.roles as readonly string[]).includes(account.role)).map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
        <Link to="/aide" title="Aide" className={`nav-link ${collapsed ? "lg:justify-center" : ""}`} aria-current={pathname === "/aide" ? "page" : undefined} onClick={() => setOpen(false)}>
          <LifeBuoy size={18} strokeWidth={1.9} />
          <span className={collapsed ? "lg:hidden" : ""}><Tx text="Aide" /></span>
        </Link>
        <button className={`nav-link ${collapsed ? "lg:justify-center" : ""}`} type="button" onClick={() => void leave()} disabled={leaving} title="Se déconnecter">
          <LogOut size={18} strokeWidth={1.9} />
          <span className={collapsed ? "lg:hidden" : ""}><Tx text={leaving ? "Déconnexion…" : "Se déconnecter"} /></span>
        </button>
      </div>
    </div>
  );

  if (!account) {
    return (
      <div className="app-boot" aria-busy="true">
        <img src="/illustrations/mascotte-ronde.svg" alt="" />
        <p>Chargement…</p>
      </div>
    );
  }

  return (
    <UiLangProvider role={account.role}>
    <div className={`min-h-screen bg-canvas text-ink lg:grid ${collapsed ? "lg:grid-cols-[76px_minmax(0,1fr)]" : "lg:grid-cols-[248px_minmax(0,1fr)]"}`}>
      {account ? <Tour /> : null}
      <aside className={`sticky top-0 z-30 hidden h-screen min-h-0 flex-col overflow-hidden bg-sidebar py-6 lg:flex ${collapsed ? "px-2" : "px-4"}`}>{aside}</aside>
      {open ? (
        <div className="sp-shade fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-navy/50" aria-label="Fermer le menu" onClick={() => setOpen(false)} />
          <aside className="sp-drawer absolute inset-y-0 left-0 w-[280px] overflow-y-auto bg-sidebar px-4 py-6">{aside}</aside>
        </div>
      ) : null}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-[68px] items-center gap-3 border-b border-line bg-paper px-4 lg:h-[76px] lg:px-7">
          <button className="btn btn-quiet btn-icon lg:hidden" type="button" aria-label="Menu" onClick={() => setOpen(true)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          {collapsed ? (
            <button
              className="btn btn-quiet btn-icon hidden lg:inline-flex"
              type="button"
              aria-label="Ouvrir le menu"
              title="Ouvrir le menu"
              onClick={() => {
                setCollapsed(false);
                window.localStorage.setItem("sp-nav", "0");
              }}
            >
              <PanelLeft size={18} />
            </button>
          ) : null}
          <label className="relative flex h-11 max-w-[460px] flex-1 items-center gap-2.5 rounded-full border border-line bg-white px-4">
            <Search size={18} className="shrink-0 text-muted" />
            <AgentSearch q={q} setQ={setQ} />
            {hits.length > 0 ? (
              <ul className="sp-pop absolute top-12 right-0 left-0 z-30 overflow-hidden rounded-xl bg-paper shadow-card">
                {hits.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-canvas"
                      onClick={() => {
                        setQ("");
                        if (d.id.startsWith("q_")) void navigate({ to: "/devis/nouveau", search: { id: d.id } });
                        else if (d.kind === "avoir") void navigate({ to: "/avoirs/$id", params: { id: d.id } });
                        else if (d.kind === "devis") void navigate({ to: "/devis/$id", params: { id: d.id } });
                        else void navigate({ to: "/factures/fiche/$id", params: { id: d.id } });
                      }}
                    >
                      <span>
                        <span className="mono block text-sm font-semibold">{d.number}</span>
                        <span className="text-xs text-muted">{d.label || kindLabel(d.kind)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </label>
          <div className="ms-auto flex items-center gap-3.5">
            <LangSwitch />
            <BellMenu role={account.role} index={index} />
            <details className="sp-menu-details group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2.5 [&::-webkit-details-marker]:hidden">
                <CubeFace />
                <span className="hidden leading-tight sm:block">
                  <span className="block text-sm font-semibold">{account.name}</span>
                  <span className="block text-[12.5px] text-muted"><Tx text={ROLE_LABEL[account.role]} /></span>
                </span>
                <ChevronDown size={16} className="text-muted" />
              </summary>
              <div className="absolute top-12 right-0 z-30 w-52 rounded-2xl border border-line bg-white p-2 shadow-card">
                <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-canvas" type="button" onClick={() => void leave()} disabled={leaving}>
                  <LogOut size={16} />
                  <Tx text={leaving ? "Déconnexion…" : "Se déconnecter"} />
                </button>
              </div>
            </details>
          </div>
        </header>
        <main key={pathname} className="app-page min-w-0 px-4 py-6 lg:px-7 lg:py-7">{children}</main>
      </div>
    </div>
    </UiLangProvider>
  );
}

function AgentSearch({ q, setQ }: { q: string; setQ: (value: string) => void }) {
  const { t } = useUi();
  return (
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder={t("Rechercher une commande, un client, une référence…")}
      className="h-11 w-full border-0 bg-transparent text-sm text-ink outline-none"
    />
  );
}

function Tx({ text }: { text: string }) {
  const { t } = useUi();
  return <>{t(text)}</>;
}

let pingCtx: AudioContext | null = null;

function playPing() {
  const Context = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) return;
  const audio = pingCtx || new Context();
  pingCtx = audio;
  void audio.resume();
  const tone = audio.createOscillator();
  const gain = audio.createGain();
  tone.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.05, audio.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.22);
  tone.connect(gain);
  gain.connect(audio.destination);
  tone.start();
  tone.stop(audio.currentTime + 0.24);
}

function allowPing(action: string) {
  let prefs: Record<string, boolean> = {};
  try {
    prefs = JSON.parse(window.localStorage.getItem("sp-notices") || "{}") as Record<string, boolean>;
  } catch {
    prefs = {};
  }
  const text = action.toLowerCase();
  const key = /devis/.test(text)
    ? "quote"
    : /paiement|facture|virement|acompte|relance|encaiss/.test(text)
      ? "pay"
      : /photo|document|fichier/.test(text)
        ? "file"
        : /message/.test(text)
          ? "message"
          : "state";
  return prefs[key] !== false;
}

type NoticeDoc = { id: string; kind: "devis" | "facture" | "avoir"; number: string };

function noticeKind(token: string): "quote" | "invoice" | "credit" | "order" | "mail" | "" {
  if (token.includes("@")) return "mail";
  if (/AV[- ]?\d/i.test(token) || /^SP-AV-/i.test(token)) return "credit";
  if (/FA[- ]?\d/i.test(token) || /^SP-FA-/i.test(token)) return "invoice";
  if (/DV[- ]?\d/i.test(token) || /^SP-DV-/i.test(token)) return "quote";
  if (/^SP-\d{4}-\d+$/.test(token) || token.startsWith("ord_")) return "order";
  return "";
}

function BellMenu({ role, index }: { role: Role; index: NoticeDoc[] }) {
  const { t } = useUi();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<OpsJournal[]>([]);
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    let live = true;
    const pull = () => {
      const load = role === "client"
        ? readOps("client-portal", () => clientPortal(), true).then((data) => ({
            rows: data.journal.slice(0, 8),
            kinds: data.journal.slice(0, 8).map((row) => row.action),
          }))
        : readOps("journal", () => opsJournal(), true).then((journal) => ({
            rows: journal.slice(0, 8),
            kinds: journal.slice(0, 8).map((row) => row.action),
          }));
      void load
        .then(({ rows: next }) => {
          if (!live) return;
          setRows(next);
          const stamp = next.map((row) => row.id).join("|");
          const ack = window.localStorage.getItem("sp-bell") || "";
          if (!ack) {
            window.localStorage.setItem("sp-bell", stamp);
            setSeen(true);
            return;
          }
          const known = new Set(ack.split("|").filter(Boolean));
          const fresh = next.filter((row) => !known.has(row.id));
          const interesting = fresh.some((row) => allowPing(row.action));
          setSeen(!interesting);
          if (interesting && window.localStorage.getItem("sp-bell-ping") !== stamp) {
            window.localStorage.setItem("sp-bell-ping", stamp);
            playPing();
          }
        })
        .catch(() => {
          if (live) setRows([]);
        });
    };
    pull();
    const timer = window.setInterval(pull, 20000);
    window.addEventListener("focus", pull);
    window.addEventListener("sp-bell-refresh", pull);
    return () => {
      live = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", pull);
      window.removeEventListener("sp-bell-refresh", pull);
    };
  }, [role]);

  function toggle() {
    setOpen((value) => !value);
    const stamp = rows.map((row) => row.id).join("|");
    window.localStorage.setItem("sp-bell", stamp);
    setSeen(true);
  }

  function openRow(row: OpsJournal) {
    const action = row.action.toLowerCase();
    const tokens = String(row.objectRef ?? "").split(/\s+/).map((part) => part.trim()).filter(Boolean);
    const hits = tokens
      .map((token) => index.find((item) => item.id === token || item.number === token))
      .filter((item): item is NoticeDoc => Boolean(item));
    const prefer = /avoir/.test(action) ? "avoir" : /facture|acompte|paiement|virement|relance|encaiss/.test(action) ? "facture" : /devis/.test(action) ? "devis" : "";
    const hit = hits.find((item) => item.kind === prefer) ?? hits[0];
    const tokenKind = tokens.map(noticeKind).find(Boolean) ?? "";
    const kind = hit?.kind === "avoir" ? "credit" : hit?.kind === "facture" ? "invoice" : hit?.kind === "devis" ? "quote" : tokenKind;
    const id = hit?.id || tokens.find((token) => noticeKind(token) === kind) || tokens[0] || "";
    const early = /demande|qualif|reçu|recu|attribu/.test(action);
    setOpen(false);
    if (role === "client") {
      if (kind === "quote" && id) return void navigate({ to: "/espace/devis/$id", params: { id } });
      if ((kind === "invoice" || kind === "credit") && id) return void navigate({ to: "/espace/facture/$id", params: { id } });
      if (kind === "order" && id && /message|note interne/.test(action)) return void navigate({ to: "/espace/commandes/$id", params: { id }, search: { onglet: "messages" } });
      if (kind === "order" && id && /photo/.test(action)) return void navigate({ to: "/espace/commandes/$id", params: { id }, search: { onglet: "photos" } });
      if (kind === "order" && id && /document|fichier/.test(action)) return void navigate({ to: "/espace/commandes/$id", params: { id }, search: { onglet: "documents" } });
      if (kind === "order" && id && early) return void navigate({ to: "/espace/demandes/$id", params: { id }, search: { envoyee: false } });
      if (kind === "order" && id) return void navigate({ to: "/espace/commandes/$id", params: { id }, search: { onglet: "suivi" } });
      if (/message/.test(action)) return void navigate({ to: "/espace/messages" });
      if (/document|photo|fichier/.test(action)) return void navigate({ to: "/espace/documents" });
      if (/facture|paiement|acompte/.test(action)) return void navigate({ to: "/espace/facturation" });
      return void navigate({ to: "/espace" });
    }
    if (kind === "quote" && id) return void navigate({ to: "/devis/nouveau", search: { id } });
    if (role === "admin" && kind === "credit" && id) return void navigate({ to: "/avoirs/$id", params: { id } });
    if (role === "admin" && kind === "invoice" && id) return void navigate({ to: "/factures/fiche/$id", params: { id } });
    if (kind === "order" && id && /message|note interne/.test(action)) return void navigate({ to: "/commandes/$id", params: { id }, hash: "messages" });
    if (kind === "order" && id && early) return void navigate({ to: "/demandes/$id", params: { id } });
    if (kind === "order" && id) return void navigate({ to: "/commandes/$id", params: { id } });
    if (kind === "mail") return void navigate({ to: "/clients" });
    if (/message/.test(action)) return void navigate({ to: "/agent/messages" });
    if (role === "agent") {
      if (kind === "invoice" || kind === "credit" || /paiement|facture|acompte/.test(action)) return void navigate({ to: "/agent/finances" });
      if (/document|photo|fichier/.test(action)) return void navigate({ to: "/documents" });
      return void navigate({ to: "/agent" });
    }
    if (/email|gabarit|modèle|modele/.test(action)) return void navigate({ to: "/emails" });
    if (/paiement|encaiss/.test(action)) return void navigate({ to: "/paiements" });
    if (/récurrent|recurrent|mensuel/.test(action)) return void navigate({ to: "/factures/recurrentes" });
    if (/refactur|frais à refacturer/.test(action)) return void navigate({ to: "/factures/refacturation" });
    if (/utilisateur|invitation|accès|acces|vérification|verification|mot de passe/.test(action)) return void navigate({ to: "/utilisateurs" });
    if (/paramètre|parametre|société|societe/.test(action)) return void navigate({ to: "/parametres" });
    if (/document|photo|fichier/.test(action)) return void navigate({ to: "/documents" });
    return void navigate({ to: "/journal" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("Notifications")}
        aria-expanded={open}
        className="relative inline-flex size-11 items-center justify-center rounded-xl border border-line bg-white"
        onClick={toggle}
      >
        <Bell size={19} strokeWidth={1.9} />
        {seen ? null : <span className="absolute top-[9px] right-2.5 size-2 rounded-full bg-[#E02424]" />}
      </button>
      {open ? (
        <div className="sp-pop absolute top-[52px] right-0 z-50 w-[340px] max-w-[80vw] overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <p className="border-b border-line px-4 py-3 text-sm font-semibold">{t("Notifications")}</p>
          {rows.length === 0 ? (
            <p className="px-4 py-5 text-sm text-muted">{t("Aucune notification.")}</p>
          ) : (
            <ul>
              {rows.map((row) => (
                <li key={row.id} className="border-b border-line last:border-0">
                  <button type="button" className="block w-full px-4 py-3 text-left hover:bg-canvas" onClick={() => openRow(row)}>
                    <p className="text-sm font-semibold">{t(row.action)}</p>
                    <p className="text-xs text-muted">{row.objectRef} · {row.atLabel}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            to={role === "client" ? "/espace" : role === "agent" ? "/agent/messages" : "/journal"}
            className="block border-t border-line px-4 py-3 text-sm font-semibold text-[#155DFC]"
            onClick={() => setOpen(false)}
          >
            {t("Tout voir")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function LangSwitch() {
  const { agent, lang, setLang } = useUi();
  if (!agent) return null;
  return (
    <div className="flex rounded-full border border-line p-0.5 text-xs font-semibold">
      <button type="button" className={`rounded-full px-2 py-1 ${lang === "fr" ? "bg-navy text-white" : ""}`} onClick={() => setLang("fr")}>FR</button>
      <button type="button" className={`rounded-full px-2 py-1 ${lang === "en" ? "bg-navy text-white" : ""}`} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

export function PageHead({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  const { t } = useUi();
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <h1 className="display text-3xl text-ink">{t(title)}</h1>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function docHref(doc: Document): string {
  return pathOf(doc.kind === "devis" ? "/devis/$id" : doc.kind === "facture" ? "/factures/$id" : "/avoirs/$id", doc.id);
}
