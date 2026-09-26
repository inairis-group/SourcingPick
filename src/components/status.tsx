import type { Document, Status } from "@/lib/docs";

const LABEL: Record<Status, string> = {
  brouillon: "Brouillon",
  emis: "Envoyé",
  accepte: "Signé",
  payee: "Payée",
  annulee: "Annulé",
};

export function statusLabel(doc: Document): string {
  if (doc.kind === "devis" && doc.status === "emis") return "Devis envoyé";
  if (doc.kind === "devis" && doc.status === "accepte") return "Devis signé";
  if (doc.kind === "facture" && doc.status === "emis") return "À encaisser";
  if (doc.kind === "facture" && doc.status === "payee") return "Payée";
  if (doc.kind === "avoir" && doc.status === "emis") return "Avoir émis";
  return LABEL[doc.status];
}

const TONE: Record<Status, string> = {
  brouillon: "bg-[#4a557814] text-muted",
  emis: "bg-[#155dfc14] text-brand",
  accepte: "bg-[#0e9f6e14] text-ok",
  payee: "bg-[#0e9f6e14] text-ok",
  annulee: "bg-[#4a557814] text-muted",
};

export function StatusPill({ doc }: { doc: Document }) {
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${TONE[doc.status]}`}>
      {statusLabel(doc)}
    </span>
  );
}
