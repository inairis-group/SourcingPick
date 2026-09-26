import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  FileMinus,
  FileText,
  Inbox,
  LayoutGrid,
  LifeBuoy,
  Menu,
  Package,
  Receipt,
  Search,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { dueCents, formatEUR, kindLabel, type Document } from "@/lib/docs";
import { useAtelier } from "@/lib/store";

const NAV = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutGrid, exact: true },
  { to: "/demandes", label: "Demandes", icon: Inbox, exact: false },
  { to: "/devis", label: "Devis", icon: FileText, exact: false },
  { to: "/factures", label: "Factures", icon: Receipt, exact: false },
  { to: "/avoirs", label: "Avoirs", icon: FileMinus, exact: false },
  { to: "/paiements", label: "Paiements", icon: Wallet, exact: false },
  { to: "/clients", label: "Clients", icon: Users, exact: false },
  { to: "/stock", label: "Stock", icon: Package, exact: false },
  { to: "/societe", label: "Paramètres", icon: Settings, exact: false },
] as const;

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
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const hits = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    return docs
      .filter((d) => {
        const client = clients.find((c) => c.id === d.clientId);
        const blob = `${d.number} ${d.headline} ${client?.legalName ?? ""} ${client?.tradeName ?? ""}`.toLowerCase();
        return blob.includes(query);
      })
      .slice(0, 6);
  }, [q, docs, clients]);

  const aside = (
    <div className="flex h-full flex-col gap-5">
      <div className="flex flex-col gap-3 px-1.5">
        <img src="/logo-lockup.svg" alt="Sourcing Pick" className="h-7 w-auto self-start" />
        <span className="mono inline-flex w-fit items-center rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold tracking-wider text-gold uppercase">
          Administration
        </span>
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const on = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={on ? "page" : undefined}
              className="nav-link"
              onClick={() => setOpen(false)}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-white/12 pt-3">
        <Link to="/aide" className="nav-link" aria-current={pathname === "/aide" ? "page" : undefined} onClick={() => setOpen(false)}>
          <LifeBuoy size={18} strokeWidth={1.9} />
          <span>Aide</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas text-ink lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-sidebar px-4 py-6 lg:flex">{aside}</aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-navy/50" aria-label="Fermer le menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] overflow-y-auto bg-sidebar px-4 py-6">{aside}</aside>
        </div>
      ) : null}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-[68px] items-center gap-3 border-b border-line bg-paper px-4 lg:h-[76px] lg:px-7">
          <button className="btn btn-quiet btn-icon lg:hidden" type="button" aria-label="Menu" onClick={() => setOpen(true)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <label className="relative flex min-h-11 max-w-[460px] flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3">
            <Search size={18} className="text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un devis, une facture, un client…"
              className="h-11 w-full border-0 bg-transparent text-sm text-ink outline-none"
            />
            {hits.length > 0 ? (
              <ul className="absolute top-12 right-0 left-0 z-30 overflow-hidden rounded-xl bg-paper shadow-card">
                {hits.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-canvas"
                      onClick={() => {
                        setQ("");
                        const to =
                          d.kind === "devis" ? "/devis/$id" : d.kind === "facture" ? "/factures/$id" : "/avoirs/$id";
                        void navigate({ to, params: { id: d.id } });
                      }}
                    >
                      <span>
                        <span className="mono block text-sm font-semibold">{d.number}</span>
                        <span className="text-xs text-muted">{kindLabel(d.kind)}</span>
                      </span>
                      <span className="mono text-sm">{formatEUR(dueCents(d))}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </label>
          <div className="ms-auto hidden items-center gap-2 sm:flex">
            <span className="grid size-9 place-items-center rounded-full bg-navy text-sm font-semibold text-white">A</span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">Adam</span>
              <span className="block text-xs text-muted">Administration</span>
            </span>
          </div>
        </header>
        <main className="min-w-0 px-4 py-6 lg:px-7 lg:py-7">{children}</main>
      </div>
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
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <h1 className="display text-3xl text-ink">{title}</h1>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function docHref(doc: Document): string {
  return pathOf(doc.kind === "devis" ? "/devis/$id" : doc.kind === "facture" ? "/factures/$id" : "/avoirs/$id", doc.id);
}
