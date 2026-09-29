import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function CommercePage({ kicker, title, lede, children }: { kicker: string; title: string; lede: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f7fc] text-[#0e1a3d]" style={{ fontFamily: "Onest, Segoe UI, sans-serif" }}>
      <header className="sticky top-0 z-20 border-b border-[#dce3f2] bg-[rgba(245,247,252,0.94)] backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-6 px-5">
          <Link to="/" className="text-[15px] font-semibold tracking-tight">SourcingPick</Link>
          <nav className="ms-auto hidden items-center gap-6 text-[15px] font-medium sm:flex">
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/encheres">Enchères</Link>
            <Link to="/cgv">Conditions</Link>
          </nav>
          <Link to="/demande" className="btn btn-primary h-11 min-h-11 px-4">Demander un devis</Link>
        </div>
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
