import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

const NAV: Array<[string, string]> = [
  ["/marketplace", "Marketplace"],
  ["/encheres", "Enchères"],
  ["/cgv", "Conditions"],
];

export function CommercePage({ kicker, title, lede, children }: { kicker: string; title: string; lede: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  // Verrouille le scroll de la page tant que le menu mobile est ouvert.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-[#f5f7fc] text-[#0e1a3d]" style={{ fontFamily: "Onest, Segoe UI, sans-serif" }}>
      <header className="sticky top-0 z-20 border-b border-[#dce3f2] bg-[rgba(245,247,252,0.94)] backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-6 px-5">
          <Link to="/" className="text-[15px] font-semibold tracking-tight">SourcingPick</Link>
          <nav className="ms-auto hidden items-center gap-6 text-[15px] font-medium sm:flex">
            {NAV.map(([to, label]) => (
              <Link key={to} to={to}>{label}</Link>
            ))}
          </nav>
          <button
            type="button"
            className="ms-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#dce3f2] bg-white sm:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
          <Link to="/demande" className="btn btn-primary h-11 min-h-11 px-4 max-sm:ms-0 max-sm:text-[13px] max-sm:px-3">Demander un devis</Link>
        </div>
        {open ? (
          <nav className="border-t border-[#dce3f2] bg-white px-5 py-3 sm:hidden">
            {NAV.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-between border-b border-[#eef1f8] py-3 text-[16px] font-semibold last:border-0"
              >
                {label}
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      <section className="bg-[#0e1a3d] text-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8db2ff]">{kicker}</p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold tracking-[-0.03em] sm:text-5xl" style={{ fontFamily: "Unbounded, Trebuchet MS, sans-serif" }}>{title}</h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#c3cdeb]">{lede}</p>
        </div>
      </section>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}

export function money(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format((Number(cents) || 0) / 100);
}
