import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CLIENTS,
  COMPANY,
  SEED_DOCS,
  SEED_SEQ,
  conditionsFor,
  emptyLine,
  isAvoir,
  isDevis,
  isFacture,
  narrativeLine,
  nowIso,
  snapFromDevis,
  todayISO,
  uid,
  type Avoir,
  type Client,
  type Company,
  type Document,
  type Facture,
  type FactureMode,
  type Line,
  type Seq,
  type Devis,
} from "@/lib/docs";

type Patch = Record<string, unknown>;

function takeNumber(seq: Seq, kind: Document["kind"], year: number) {
  const next = { ...seq };
  if (kind === "devis") {
    const n = next.devis;
    next.devis += 1;
    return { seq: next, number: `SP-DV-${year}-${String(n).padStart(2, "0")}` };
  }
  if (kind === "facture") {
    const n = next.facture;
    next.facture += 1;
    return { seq: next, number: `SP-FA-${year}-${String(n).padStart(3, "0")}` };
  }
  const n = next.avoir;
  next.avoir += 1;
  return { seq: next, number: `SP-AV-${year}-${String(n).padStart(3, "0")}` };
}

function touch(doc: Document, company: Company, patch: Patch): Document {
  const next = { ...doc, ...patch, updatedAt: nowIso() } as Document;
  if (Object.prototype.hasOwnProperty.call(patch, "conditions")) {
    return { ...next, conditionsCustom: true };
  }
  if (next.conditionsCustom) return next;
  return { ...next, conditions: conditionsFor(next, company) };
}

function blankDevis(company: Company, clientId: string, number: string): Devis {
  const draft: Devis = {
    id: uid("doc"),
    kind: "devis",
    number,
    status: "brouillon",
    clientId,
    issueDate: todayISO(),
    headline: "",
    conditions: "",
    conditionsCustom: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    validityDays: 30,
    leadTime: "3 à 4 semaines",
    delivery: "DAP, déchargée",
    port: "",
    commissionBps: 200,
    depositBps: 4000,
    lines: [],
  };
  draft.lines = [emptyLine(draft.lines)];
  draft.conditions = conditionsFor(draft, company);
  return draft;
}

export type AtelierState = {
  company: Company;
  clients: Client[];
  docs: Document[];
  seq: Seq;
  setCompany: (patch: Partial<Company>) => void;
  saveClient: (client: Client) => void;
  removeClient: (id: string) => string | null;
  updateDoc: (id: string, patch: Patch) => void;
  updateLine: (docId: string, lineId: string, patch: Partial<Line>) => void;
  addLine: (docId: string) => void;
  removeLine: (docId: string, lineId: string) => void;
  moveLine: (docId: string, lineId: string, dir: -1 | 1) => void;
  resetConditions: (id: string) => void;
  createDevis: (clientId?: string) => string;
  duplicateDevis: (id: string) => string;
  createFactureFromDevis: (devisId: string, mode: Exclude<FactureMode, "integrale"> | "integrale") => string;
  resyncFacture: (id: string) => void;
  createAvoirFromFacture: (factureId: string) => string;
  linkAvoir: (avoirId: string, factureId: string) => void;
  removeDoc: (id: string) => void;
  restoreExample: () => void;
};

export const useAtelier = create<AtelierState>()(
  persist(
    (set, get) => ({
      company: COMPANY,
      clients: CLIENTS,
      docs: SEED_DOCS,
      seq: SEED_SEQ,

      setCompany: (patch) =>
        set((s) => {
          const company = { ...s.company, ...patch };
          return {
            company,
            docs: s.docs.map((d) => (d.conditionsCustom ? d : { ...d, conditions: conditionsFor(d, company) })),
          };
        }),

      saveClient: (client) =>
        set((s) => {
          const exists = s.clients.some((c) => c.id === client.id);
          return {
            clients: exists ? s.clients.map((c) => (c.id === client.id ? client : c)) : [client, ...s.clients],
          };
        }),

      removeClient: (id) => {
        const used = get().docs.some((d) => d.clientId === id);
        if (used) return "Ce client est lié à des documents.";
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) }));
        return null;
      },

      updateDoc: (id, patch) =>
        set((s) => ({
          docs: s.docs.map((d) => (d.id === id ? touch(d, s.company, patch) : d)),
        })),

      updateLine: (docId, lineId, patch) =>
        set((s) => ({
          docs: s.docs.map((d) => {
            if (d.id !== docId) return d;
            const lines = d.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l));
            return touch(d, s.company, { lines });
          }),
        })),

      addLine: (docId) =>
        set((s) => ({
          docs: s.docs.map((d) => {
            if (d.id !== docId) return d;
            return touch(d, s.company, { lines: [...d.lines, emptyLine(d.lines)] });
          }),
        })),

      removeLine: (docId, lineId) =>
        set((s) => ({
          docs: s.docs.map((d) => {
            if (d.id !== docId) return d;
            return touch(d, s.company, { lines: d.lines.filter((l) => l.id !== lineId) });
          }),
        })),

      moveLine: (docId, lineId, dir) =>
        set((s) => ({
          docs: s.docs.map((d) => {
            if (d.id !== docId) return d;
            const i = d.lines.findIndex((l) => l.id === lineId);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= d.lines.length) return d;
            const lines = d.lines.slice();
            const [row] = lines.splice(i, 1);
            lines.splice(j, 0, row);
            return touch(d, s.company, { lines });
          }),
        })),

      resetConditions: (id) =>
        set((s) => ({
          docs: s.docs.map((d) =>
            d.id === id ? { ...d, conditionsCustom: false, conditions: conditionsFor(d, s.company), updatedAt: nowIso() } : d,
          ),
        })),

      createDevis: (clientId) => {
        let id = "";
        set((s) => {
          const year = new Date().getFullYear();
          const taken = takeNumber(s.seq, "devis", year);
          const doc = blankDevis(s.company, clientId || s.clients[0]?.id || "", taken.number);
          id = doc.id;
          return { seq: taken.seq, docs: [doc, ...s.docs] };
        });
        return id;
      },

      duplicateDevis: (sourceId) => {
        let id = "";
        set((s) => {
          const src = s.docs.find((d) => d.id === sourceId);
          if (!src || !isDevis(src)) return s;
          const year = new Date().getFullYear();
          const taken = takeNumber(s.seq, "devis", year);
          const doc: Devis = {
            ...src,
            id: uid("doc"),
            number: taken.number,
            status: "brouillon",
            issueDate: todayISO(),
            createdAt: nowIso(),
            updatedAt: nowIso(),
            lines: src.lines.map((l) => ({ ...l, id: uid("ln") })),
          };
          if (!doc.conditionsCustom) doc.conditions = conditionsFor(doc, s.company);
          id = doc.id;
          return { seq: taken.seq, docs: [doc, ...s.docs] };
        });
        return id;
      },

      createFactureFromDevis: (devisId, mode) => {
        const existing = get().docs.find(
          (d) => isFacture(d) && d.sourceDevisId === devisId && d.mode === mode && d.status !== "annulee",
        );
        if (existing) return existing.id;
        let id = "";
        set((s) => {
          const devis = s.docs.find((d) => d.id === devisId);
          if (!devis || !isDevis(devis)) return s;
          const year = new Date().getFullYear();
          const taken = takeNumber(s.seq, "facture", year);
          const client = s.clients.find((c) => c.id === devis.clientId);
          const already =
            mode === "solde"
              ? Math.round(
                  (snapFromDevis(devis).netCents * devis.depositBps) / 10000,
                )
              : 0;
          const order = snapFromDevis(devis, already);
          const lines =
            mode === "integrale"
              ? devis.lines.map((l) => ({ ...l, id: uid("ln") }))
              : [narrativeLine(devis, client, mode)];
          const facture: Facture = {
            id: uid("doc"),
            kind: "facture",
            number: taken.number,
            status: "brouillon",
            clientId: devis.clientId,
            issueDate: todayISO(),
            headline:
              mode === "acompte"
                ? `Acompte de ${devis.depositBps / 100} % sur le devis ${devis.number} du ${devis.issueDate.split("-").reverse().join(".")}, ${devis.lines.length} postes.`
                : mode === "solde"
                  ? `Solde du devis ${devis.number}, après acompte.`
                  : `Facture sur le devis ${devis.number}.`,
            conditions: "",
            conditionsCustom: false,
            createdAt: nowIso(),
            updatedAt: nowIso(),
            mode,
            sourceDevisId: devis.id,
            dueLabel: mode === "acompte" ? "à réception" : "avant expédition",
            commissionBps: devis.commissionBps,
            depositBps: devis.depositBps,
            order,
            lines,
            paidOn: "",
            paidMethod: "Virement",
            paidCents: null,
            feesCents: 0,
          };
          facture.conditions = conditionsFor(facture, s.company);
          id = facture.id;
          return { seq: taken.seq, docs: [facture, ...s.docs] };
        });
        return id;
      },

      resyncFacture: (id) =>
        set((s) => ({
          docs: s.docs.map((d) => {
            if (d.id !== id || !isFacture(d) || !d.sourceDevisId) return d;
            const devis = s.docs.find((x) => x.id === d.sourceDevisId);
            if (!devis || !isDevis(devis)) return d;
            const client = s.clients.find((c) => c.id === devis.clientId);
            const already = d.mode === "solde" ? Math.round((snapFromDevis(devis).netCents * devis.depositBps) / 10000) : 0;
            const order = snapFromDevis(devis, already);
            const lines =
              d.mode === "integrale"
                ? devis.lines.map((l) => ({ ...l, id: uid("ln") }))
                : d.mode === "acompte" || d.mode === "solde"
                  ? [narrativeLine(devis, client, d.mode)]
                  : d.lines;
            const next: Facture = {
              ...d,
              clientId: devis.clientId,
              commissionBps: devis.commissionBps,
              depositBps: devis.depositBps,
              order,
              lines,
              conditionsCustom: false,
            };
            next.conditions = conditionsFor(next, s.company);
            next.updatedAt = nowIso();
            return next;
          }),
        })),

      createAvoirFromFacture: (factureId) => {
        const existing = get().docs.find(
          (d) => isAvoir(d) && d.sourceFactureId === factureId && d.status !== "annulee",
        );
        if (existing) return existing.id;
        let id = "";
        set((s) => {
          const facture = s.docs.find((d) => d.id === factureId);
          if (!facture || !isFacture(facture)) return s;
          const year = new Date().getFullYear();
          const taken = takeNumber(s.seq, "avoir", year);
          const amount = facture.lines.reduce(
            (sum, l) => sum + Math.round(l.qty * l.unitPriceCents),
            0,
          );
          const avoir: Avoir = {
            id: uid("doc"),
            kind: "avoir",
            number: taken.number,
            status: "brouillon",
            clientId: facture.clientId,
            issueDate: todayISO(),
            headline: `Avoir sur la facture ${facture.number}.`,
            conditions: "",
            conditionsCustom: false,
            createdAt: nowIso(),
            updatedAt: nowIso(),
            sourceFactureId: facture.id,
            sourceNumber: facture.number,
            sourceAmountCents: facture.mode === "integrale"
              ? Math.round(amount * (1 + facture.commissionBps / 10000))
              : amount,
            reason: "Rectification de la facture.",
            lines: facture.lines.map((l) => ({ ...l, id: uid("ln") })),
          };
          avoir.conditions = conditionsFor(avoir, s.company);
          id = avoir.id;
          return { seq: taken.seq, docs: [avoir, ...s.docs] };
        });
        return id;
      },

      linkAvoir: (avoirId, factureId) =>
        set((s) => {
          const facture = s.docs.find((d) => d.id === factureId);
          if (!facture || !isFacture(facture)) return s;
          const amount = facture.lines.reduce((sum, l) => sum + Math.round(l.qty * l.unitPriceCents), 0);
          return {
            docs: s.docs.map((d) => {
              if (d.id !== avoirId || !isAvoir(d)) return d;
              const next: Avoir = {
                ...d,
                sourceFactureId: facture.id,
                sourceNumber: facture.number,
                sourceAmountCents: facture.mode === "integrale" ? Math.round(amount * (1 + facture.commissionBps / 10000)) : amount,
                clientId: facture.clientId,
                headline: `Avoir sur la facture ${facture.number}.`,
                lines: facture.lines.map((l) => ({ ...l, id: uid("ln") })),
                conditionsCustom: false,
              };
              next.conditions = conditionsFor(next, s.company);
              next.updatedAt = nowIso();
              return next;
            }),
          };
        }),

      removeDoc: (id) => set((s) => ({ docs: s.docs.filter((d) => d.id !== id) })),

      restoreExample: () =>
        set({
          company: COMPANY,
          clients: CLIENTS,
          docs: SEED_DOCS,
          seq: SEED_SEQ,
        }),
    }),
    {
      name: "sp-atelier-v1",
      skipHydration: true,
      partialize: (s) => ({
        company: s.company,
        clients: s.clients.filter((client) => client.id.startsWith("usr_")),
        docs: s.docs,
        seq: s.seq,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const clients = state.clients.filter((client) => client.id.startsWith("usr_"));
        if (clients.length !== state.clients.length) state.clients = clients;
      },
    },
  ),
);
