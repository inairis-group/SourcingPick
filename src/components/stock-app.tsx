import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, Minus, Plus, Search, X } from "lucide-react";
import { LOT_CATEGORIES, formatCategory } from "@/lib/catalog";
import {
  CONDITIONS,
  MOVE_LABEL,
  conditionShort,
  stockTone,
  useFieldStock,
  type ConditionId,
  type Lot,
} from "@/lib/stock-field";
import { Mark } from "@/components/logo";

function euros(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

async function readPhoto(file: File) {
  const bmp = await createImageBitmap(file);
  const max = 900;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export function StockApp() {
  const lots = useFieldStock((s) => s.lots);
  const movements = useFieldStock((s) => s.movements);
  const admin = useFieldStock((s) => s.admin);
  const [q, setQ] = useState("");
  const [letter, setLetter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [log, setLog] = useState(false);
  const [pin, setPin] = useState(false);

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    return lots.filter((lot) => {
      if (letter !== "all" && !lot.category.startsWith(letter)) return false;
      if (!query) return true;
      return [lot.name, lot.reference, lot.imei, lot.location].join(" ").toLowerCase().includes(query);
    });
  }, [lots, q, letter]);

  const open = lots.find((l) => l.id === openId) ?? null;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-2 px-4">
          <Mark className="h-7 w-7" />
          <div className="min-w-0">
            <p className="display truncate text-sm">SourcingPick Stock</p>
            <p className="text-xs text-muted">{admin ? "Admin · prix visibles" : "Opérateur · sans prix"}</p>
          </div>
          <button className="btn btn-quiet ms-auto h-10 min-h-10 px-3" type="button" onClick={() => setPin(true)}>
            {admin ? "Verrouiller" : "Admin"}
          </button>
        </div>
        <div className="mx-auto max-w-lg px-4 pb-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input className="field ps-9" value={q} placeholder="Nom, référence, IMEI" onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
            <Chip active={letter === "all"} onClick={() => setLetter("all")}>Tout</Chip>
            {LOT_CATEGORIES.map((c) => (
              <Chip key={c.letter} active={letter === c.letter} onClick={() => setLetter(c.letter)}>
                {c.letter}
              </Chip>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 pb-28">
        <div className="mb-3 flex items-center justify-between text-sm">
          <p className="text-muted">{visible.length} lot{visible.length > 1 ? "s" : ""}</p>
          <button className="font-semibold text-brand" type="button" onClick={() => setLog(true)}>Mouvements</button>
        </div>
        {visible.length === 0 ? (
          <div className="card text-center">
            <p className="font-semibold">Aucun lot ici</p>
            <p className="mt-1 text-sm text-muted">Photographiez l’article, la référence se crée toute seule (A001, B001…).</p>
          </div>
        ) : (
          <ul className="grid gap-2">
            {visible.map((lot) => (
              <li key={lot.id}>
                <button className="card flex w-full items-center gap-3 p-3 text-start" type="button" onClick={() => setOpenId(lot.id)}>
                  <Thumb src={lot.photo} />
                  <span className="min-w-0 flex-1">
                    <span className="mono text-xs text-brand">{lot.reference}</span>
                    <span className="block truncate font-semibold">{lot.name}</span>
                    <span className="text-xs text-muted">{conditionShort(lot.condition)} · {lot.category}</span>
                  </span>
                  <Qty lot={lot} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 text-center text-xs text-muted">
          Stock enregistré sur cet appareil. <Link to="/" className="text-brand">Retour au site</Link>
        </p>
      </main>

      <button className="btn btn-primary fixed bottom-4 left-1/2 h-12 min-h-12 -translate-x-1/2 px-5 shadow-card" type="button" onClick={() => setCreating(true)}>
        <Plus size={18} /> Nouveau lot
      </button>

      {creating ? <CreateSheet onClose={() => setCreating(false)} admin={admin} /> : null}
      {open ? <LotSheet lot={open} admin={admin} onClose={() => setOpenId(null)} /> : null}
      {log ? <LogSheet movements={movements} onClose={() => setLog(false)} /> : null}
      {pin ? <PinSheet onClose={() => setPin(false)} /> : null}
    </div>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${active ? "bg-navy text-white" : "bg-paper text-muted ring-1 ring-line"}`}
    >
      {children}
    </button>
  );
}

function Thumb({ src }: { src?: string }) {
  if (!src) return <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-canvas text-muted"><Camera size={16} /></span>;
  return <img src={src} alt="" className="size-14 shrink-0 rounded-xl object-cover" />;
}

function Qty({ lot }: { lot: Lot }) {
  const tone = stockTone(lot);
  const color = tone === "out" || tone === "refuse" ? "text-[#8a1c1c]" : tone === "low" ? "text-[#8a5a00]" : "text-ink";
  return (
    <span className={`mono text-lg font-semibold ${color}`}>{lot.refused ? "refus" : lot.quantity}</span>
  );
}

function CreateSheet({ onClose, admin }: { onClose: () => void; admin: boolean }) {
  const addLot = useFieldStock((s) => s.addLot);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(formatCategory("A", "Téléphone"));
  const [condition, setCondition] = useState<ConditionId>("bon");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [imei, setImei] = useState("");
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [photo, setPhoto] = useState<string | undefined>();

  return (
    <Sheet title="Nouveau lot" onClose={onClose}>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          addLot({ name, category, condition, quantity, location, notes, imei, buyPrice, sellPrice, photo });
          onClose();
        }}
      >
        <label className="text-sm font-semibold">Photo
          <input
            className="mt-1 block w-full text-sm"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void readPhoto(file).then(setPhoto);
            }}
          />
        </label>
        {photo ? <img src={photo} alt="" className="h-36 w-full rounded-xl object-cover" /> : null}
        <label className="text-sm font-semibold">Nom<input className="field mt-1 font-normal" value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label className="text-sm font-semibold">Catégorie
          <select className="field mt-1 font-normal" value={category} onChange={(e) => setCategory(e.target.value)}>
            {LOT_CATEGORIES.map((c) => {
              const label = formatCategory(c.letter, c.name);
              return <option key={c.letter} value={label}>{label}</option>;
            })}
          </select>
        </label>
        <label className="text-sm font-semibold">État
          <select className="field mt-1 font-normal" value={condition} onChange={(e) => setCondition(e.target.value as ConditionId)}>
            {CONDITIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">Quantité<input className="field mt-1 font-normal" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} /></label>
        <label className="text-sm font-semibold">Emplacement<input className="field mt-1 font-normal" value={location} onChange={(e) => setLocation(e.target.value)} /></label>
        <label className="text-sm font-semibold">IMEI<input className="field mt-1 font-normal" value={imei} onChange={(e) => setImei(e.target.value)} /></label>
        {admin ? (
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm font-semibold">Achat €<input className="field mt-1 font-normal" type="number" min={0} value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} /></label>
            <label className="text-sm font-semibold">Vente €<input className="field mt-1 font-normal" type="number" min={0} value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} /></label>
          </div>
        ) : (
          <p className="text-xs text-muted">Les prix restent cachés tant que le mode admin n’est pas ouvert sur cet appareil.</p>
        )}
        <label className="text-sm font-semibold">Notes<textarea className="field mt-1 min-h-20 py-3 font-normal" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        <button className="btn btn-primary" type="submit">Enregistrer le lot</button>
      </form>
    </Sheet>
  );
}

function LotSheet({ lot, admin, onClose }: { lot: Lot; admin: boolean; onClose: () => void }) {
  const adjust = useFieldStock((s) => s.adjust);
  const refuse = useFieldStock((s) => s.refuse);
  const remove = useFieldStock((s) => s.remove);
  const [note, setNote] = useState("");
  return (
    <Sheet title={`${lot.reference} · ${lot.name}`} onClose={onClose}>
      {lot.photo ? <img src={lot.photo} alt="" className="mb-3 h-48 w-full rounded-xl object-cover" /> : null}
      <p className="text-sm text-muted">{lot.category} · {conditionShort(lot.condition)}{lot.location ? ` · ${lot.location}` : ""}</p>
      {lot.imei ? <p className="mono mt-1 text-xs">IMEI {lot.imei}</p> : null}
      {lot.notes ? <p className="mt-2 text-sm">{lot.notes}</p> : null}
      {admin ? (
        <p className="mt-2 text-sm">Achat {euros(lot.buyPrice)} · Vente {euros(lot.sellPrice)}</p>
      ) : null}
      <p className="mono mt-3 text-3xl font-semibold">{lot.refused ? "Refusé" : lot.quantity}</p>
      {lot.refused ? <p className="text-sm text-[#8a1c1c]">{lot.refuseNote || "Lot refusé"}</p> : (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button className="btn btn-quiet" type="button" onClick={() => adjust(lot.id, -1, "out", "Sortie")}><Minus size={16} /> 1</button>
          <button className="btn btn-quiet" type="button" onClick={() => adjust(lot.id, 1, "in", "Entrée")}><Plus size={16} /> 1</button>
          <button className="btn btn-primary" type="button" onClick={() => adjust(lot.id, -1, "sale", "Vente")}>Vente</button>
        </div>
      )}
      {!lot.refused ? (
        <form
          className="mt-4 grid gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            refuse(lot.id, note);
          }}
        >
          <input className="field" placeholder="Motif de refus" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn btn-quiet" type="submit">Refuser le lot</button>
        </form>
      ) : null}
      <button
        className="mt-3 text-sm text-[#8a1c1c]"
        type="button"
        onClick={() => {
          remove(lot.id);
          onClose();
        }}
      >
        Supprimer
      </button>
    </Sheet>
  );
}

function LogSheet({ movements, onClose }: { movements: { id: string; itemRef: string; itemName: string; type: keyof typeof MOVE_LABEL; quantity: number; note: string; createdAt: string }[]; onClose: () => void }) {
  return (
    <Sheet title="Mouvements" onClose={onClose}>
      {movements.length === 0 ? <p className="text-sm text-muted">Aucun mouvement.</p> : (
        <ul className="grid gap-2">
          {movements.slice(0, 40).map((m) => (
            <li key={m.id} className="rounded-xl bg-canvas px-3 py-2 text-sm">
              <span className="font-semibold">{MOVE_LABEL[m.type]}</span> · {m.itemRef} {m.itemName}
              <span className="block text-xs text-muted">{m.quantity} · {m.note}</span>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

function PinSheet({ onClose }: { onClose: () => void }) {
  const admin = useFieldStock((s) => s.admin);
  const unlock = useFieldStock((s) => s.unlock);
  const lock = useFieldStock((s) => s.lock);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  if (admin) {
    return (
      <Sheet title="Mode admin" onClose={onClose}>
        <p className="text-sm text-muted">Les prix d’achat et de vente sont visibles sur cet appareil.</p>
        <button className="btn btn-quiet mt-4" type="button" onClick={() => { lock(); onClose(); }}>Revenir opérateur</button>
      </Sheet>
    );
  }
  return (
    <Sheet title="Code admin" onClose={onClose}>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!unlock(value)) setError(true);
          else onClose();
        }}
      >
        <input className="field" inputMode="numeric" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} />
        {error ? <p className="text-sm text-[#8a1c1c]">Code incorrect.</p> : null}
        <button className="btn btn-primary" type="submit">Ouvrir</button>
      </form>
    </Sheet>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="sp-shade fixed inset-0 z-40 flex items-end justify-center bg-[#0b1433]/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="sp-sheet max-h-[92vh] w-full max-w-lg overflow-auto rounded-t-3xl bg-paper p-4 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn btn-quiet btn-icon" type="button" aria-label="Fermer" onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
