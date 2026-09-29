import { useEffect, useRef, useState, type ReactNode } from "react";
import { useUi } from "@/lib/ui-lang";
import { armLoadingBar, clearLoadingBar } from "@/lib/loading";

type Slot = { data?: unknown; at: number; promise?: Promise<unknown>; gen: number };

const memory = new Map<string, Slot>();

export function readOps<T>(key: string, load: () => Promise<T>, force = false): Promise<T> {
  const cached = memory.get(key);
  if (!force && cached?.promise) return cached.promise as Promise<T>;
  const gen = (cached?.gen ?? 0) + 1;
  const promise = load()
    .then((value) => {
      const slot = memory.get(key);
      if (!slot || slot.gen === gen) memory.set(key, { data: value, at: Date.now(), gen });
      return value;
    })
    .catch((error) => {
      const slot = memory.get(key);
      if (slot?.gen === gen) memory.set(key, { data: slot.data, at: slot.at, gen });
      throw error;
    });
  memory.set(key, { data: cached?.data, at: cached?.at ?? 0, gen, promise });
  return promise;
}

export function useOps<T>(load: () => Promise<T>, key?: string) {
  const cacheKey = key || load.toString();
  const loadRef = useRef(load);
  loadRef.current = load;
  const seeded = memory.get(cacheKey);
  const [data, setData] = useState<T | null>(seeded?.data !== undefined ? (seeded.data as T) : null);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const request = useRef(0);

  useEffect(() => {
    let live = true;
    const id = ++request.current;
    const cached = memory.get(cacheKey);
    if (cached?.data !== undefined) setData(cached.data as T);
    else armLoadingBar();
    readOps(cacheKey, () => loadRef.current(), tick > 0)
      .then((value) => {
        if (live && id === request.current) {
          setData(value);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (live && id === request.current) setError(err instanceof Error ? err.message : "Lecture impossible.");
      })
      .finally(() => {
        if (live && id === request.current) clearLoadingBar();
      });
    return () => {
      live = false;
    };
  }, [cacheKey, tick]);

  return {
    data,
    error,
    reload: () => setTick((n) => n + 1),
    setData,
  };
}

const TONE: Record<string, string> = {
  "Devis envoyé": "bg-[#e8efff] text-[#0f47c9]",
  "Devis signé": "bg-[#e5f6ee] text-[#0e9f6e]",
  "Devis refusé": "bg-[#fde8e8] text-[#c81e1e]",
  "Devis expiré": "bg-[#f3f4f8] text-[#4a5578]",
  "Paiement en attente": "bg-[#fff4d8] text-[#8a5a00]",
  "En attente des fonds": "bg-[#fff4d8] text-[#8a5a00]",
  "Préparation terminée": "bg-[#e7ebf6] text-[#0e1a3d]",
  "En transit": "bg-[#e8efff] text-[#0f47c9]",
  "En mer": "bg-[#e8efff] text-[#0f47c9]",
  Terminé: "bg-[#e5f6ee] text-[#0e9f6e]",
  "Dossier clos": "bg-[#e5f6ee] text-[#0e9f6e]",
  Payée: "bg-[#e5f6ee] text-[#0e9f6e]",
  "En retard": "bg-[#fde8e8] text-[#c81e1e]",
  "À signer": "bg-[#fff4d8] text-[#8a5a00]",
  "À régler": "bg-[#fff4d8] text-[#8a5a00]",
  "Virement annoncé": "bg-[#fff4d8] text-[#8a5a00]",
  "Virement déclaré": "bg-[#e8efff] text-[#0f47c9]",
  Émis: "bg-[#e7ebf6] text-[#0e1a3d]",
  Vérifié: "bg-[#e5f6ee] text-[#0e9f6e]",
  "En attente": "bg-[#fff4d8] text-[#8a5a00]",
  "En cours d’examen": "bg-[#e8efff] text-[#0f47c9]",
  Brouillon: "bg-[#f3f4f8] text-[#4a5578]",
  "En stock": "bg-[#e7ebf6] text-[#0e1a3d]",
  "En ligne": "bg-[#e8efff] text-[#0f47c9]",
  Réservé: "bg-[#fff4d8] text-[#8a5a00]",
  Vendu: "bg-[#e5f6ee] text-[#0e9f6e]",
  Expédié: "bg-[#e5f6ee] text-[#0e9f6e]",
  "Stock bas": "bg-[#fde8e8] text-[#c81e1e]",
  Annulée: "bg-[#fde8e8] text-[#c81e1e]",
  Retenu: "bg-[#e5f6ee] text-[#0e9f6e]",
  Comparé: "bg-[#f3f4f8] text-[#4a5578]",
};

export function Badge({ value }: { value: string }) {
  const { t } = useUi();
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${TONE[value] ?? "bg-[#f3f4f8] text-[#0e1a3d]"}`}>
      {t(value)}
    </span>
  );
}

export function DataTable({ head, children }: { head: string[]; children: ReactNode }) {
  const { t } = useUi();
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs tracking-wide text-muted uppercase">
            {head.map((label) => (
              <th key={label} className="px-4 py-3 font-semibold">
                {label ? t(label) : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`border-t border-line px-4 py-3 align-middle ${className}`}>{children}</td>;
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted">{children}</p>;
}

export function Filters({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  const { t } = useUi();
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`min-h-9 rounded-full px-3 text-sm font-semibold ${option === value ? "bg-navy text-white" : "bg-white text-muted"}`}
          onClick={() => onChange(option)}
        >
          {t(option)}
        </button>
      ))}
    </div>
  );
}
