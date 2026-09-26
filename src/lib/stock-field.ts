import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HOME_SITE, formatCategory, letterFromCategory, nextRef, LOT_CATEGORIES } from "@/lib/catalog";

export type ConditionId = "neuf" | "comme-neuf" | "tres-bon" | "bon" | "moyen" | "pieces";
export type MovementType = "in" | "out" | "adjust" | "sale";

export const CONDITIONS: { id: ConditionId; label: string; short: string }[] = [
  { id: "neuf", label: "Neuf déstocké", short: "Neuf" },
  { id: "comme-neuf", label: "Comme neuf", short: "Comme neuf" },
  { id: "tres-bon", label: "Très bon état", short: "TBE" },
  { id: "bon", label: "Bon état", short: "Bon" },
  { id: "moyen", label: "État moyen", short: "Moyen" },
  { id: "pieces", label: "Pour pièces", short: "Pièces" },
];

export const MOVE_LABEL: Record<MovementType, string> = {
  in: "Entrée",
  out: "Sortie",
  adjust: "Inventaire",
  sale: "Vente",
};

export type Lot = {
  id: string;
  name: string;
  reference: string;
  category: string;
  quantity: number;
  minQuantity: number;
  location: string;
  condition: ConditionId;
  buyPrice: number;
  sellPrice: number;
  notes: string;
  site: string;
  imei: string;
  photo?: string;
  refused: boolean;
  refuseNote: string;
  createdAt: string;
  updatedAt: string;
};

export type Movement = {
  id: string;
  itemId: string;
  itemName: string;
  itemRef: string;
  type: MovementType;
  quantity: number;
  note: string;
  createdAt: string;
};

type Draft = {
  name: string;
  category: string;
  condition: ConditionId;
  quantity: number;
  location: string;
  notes: string;
  buyPrice: number;
  sellPrice: number;
  imei: string;
  photo?: string;
};

const ADMIN_PIN = "13244231";

function uid() {
  return crypto.randomUUID();
}

export function conditionShort(id: ConditionId) {
  return CONDITIONS.find((c) => c.id === id)?.short ?? id;
}

export function stockTone(lot: Pick<Lot, "quantity" | "minQuantity" | "refused">) {
  if (lot.refused) return "refuse";
  if (lot.quantity <= 0) return "out";
  if (lot.minQuantity > 0 && lot.quantity <= lot.minQuantity) return "low";
  return "ok";
}

type State = {
  lots: Lot[];
  movements: Movement[];
  admin: boolean;
  unlock: (pin: string) => boolean;
  lock: () => void;
  addLot: (draft: Draft) => Lot;
  adjust: (id: string, delta: number, type: MovementType, note: string) => void;
  refuse: (id: string, note: string) => void;
  remove: (id: string) => void;
};

export const useFieldStock = create<State>()(
  persist(
    (set, get) => ({
      lots: [],
      movements: [],
      admin: false,
      unlock: (pin) => {
        const ok = pin.trim() === ADMIN_PIN;
        if (ok) set({ admin: true });
        return ok;
      },
      lock: () => set({ admin: false }),
      addLot: (draft) => {
        const now = new Date().toISOString();
        const category =
          LOT_CATEGORIES.find((c) => formatCategory(c.letter, c.name) === draft.category)?.letter
            ? draft.category
            : formatCategory("A", "Téléphone");
        const lot: Lot = {
          id: uid(),
          name: draft.name.trim(),
          reference: nextRef(category, get().lots.map((l) => l.reference)),
          category,
          quantity: Math.max(0, draft.quantity || 1),
          minQuantity: 0,
          location: draft.location.trim(),
          condition: draft.condition,
          buyPrice: Math.max(0, draft.buyPrice || 0),
          sellPrice: Math.max(0, draft.sellPrice || 0),
          notes: draft.notes.trim(),
          site: HOME_SITE,
          imei: draft.imei.trim(),
          photo: draft.photo,
          refused: false,
          refuseNote: "",
          createdAt: now,
          updatedAt: now,
        };
        const mov: Movement = {
          id: uid(),
          itemId: lot.id,
          itemName: lot.name,
          itemRef: lot.reference,
          type: "in",
          quantity: lot.quantity,
          note: "Création du lot",
          createdAt: now,
        };
        set({ lots: [lot, ...get().lots], movements: [mov, ...get().movements] });
        return lot;
      },
      adjust: (id, delta, type, note) => {
        const lot = get().lots.find((l) => l.id === id);
        if (!lot || lot.refused) return;
        const next = Math.max(0, lot.quantity + delta);
        if (next === lot.quantity && type !== "adjust") return;
        const now = new Date().toISOString();
        const mov: Movement = {
          id: uid(),
          itemId: lot.id,
          itemName: lot.name,
          itemRef: lot.reference,
          type,
          quantity: Math.abs(delta) || next,
          note,
          createdAt: now,
        };
        set({
          lots: get().lots.map((l) => (l.id === id ? { ...l, quantity: next, updatedAt: now } : l)),
          movements: [mov, ...get().movements],
        });
      },
      refuse: (id, note) => {
        const now = new Date().toISOString();
        set({
          lots: get().lots.map((l) =>
            l.id === id ? { ...l, refused: true, refuseNote: note.trim(), updatedAt: now } : l,
          ),
        });
      },
      remove: (id) =>
        set({
          lots: get().lots.filter((l) => l.id !== id),
          movements: get().movements.filter((m) => m.itemId !== id),
        }),
    }),
    { name: "sourcingpick-stock", partialize: (s) => ({ lots: s.lots, movements: s.movements }) },
  ),
);

export function categoryOf(letter: string) {
  const cat = LOT_CATEGORIES.find((c) => c.letter === letter);
  return cat ? formatCategory(cat.letter, cat.name) : formatCategory("J", "Autre");
}

export function letterOf(lot: { category: string }) {
  return letterFromCategory(lot.category);
}
