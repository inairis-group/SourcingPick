import type { ReactNode } from "react";
import { Clock } from "lucide-react";

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(320px,560px)]">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-[420px] flex-col gap-5">{children}</div>
      </section>
      <aside className="hidden flex-col justify-center gap-6 bg-[#0B1433] px-12 py-14 text-white lg:flex">
        <img src="/illustrations/logo-footer.svg" alt="" className="h-8 w-auto self-start" />
        <h2 className="display text-[34px] leading-tight text-white">Chaque étape, une trace.</h2>
        <p className="text-base leading-relaxed text-[#C6D2EE]">
          Photos de réception, contrôle, chargement et documents : tout reste dans votre espace.
        </p>
        <img src="/illustrations/entrepot-navire.svg" alt="" className="mx-auto w-full max-w-[420px]" />
        <p className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3.5 text-sm text-[#C6D2EE]">
          <Clock size={17} className="shrink-0 text-[#FFC247]" aria-hidden="true" />
          L’application mobile est en cours de construction. L’espace web fait tout.
        </p>
      </aside>
    </main>
  );
}

export function AuthButton({ children, pending }: { children: ReactNode; pending?: boolean }) {
  return (
    <button className="btn btn-primary w-full" type="submit" disabled={pending}>
      {children}
    </button>
  );
}
