import { opsSearchCompanies } from "@/lib/ops.functions";
import type { CompanyHit, OpsClient } from "@/lib/ops.shared";

export type ClientParty = {
  clientUserId: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientAddress: string;
  clientVat: string;
  clientCountry: string;
  clientSiren: string;
  clientSiret: string;
  clientNaf: string;
};

export function partyFromClient(client: OpsClient): ClientParty {
  return {
    clientUserId: client.id,
    clientName: client.name || "",
    clientEmail: client.email || "",
    clientCompany: client.company || "",
    clientAddress: client.address || "",
    clientVat: client.vat || "",
    clientCountry: client.country || "France",
    clientSiren: client.siren || "",
    clientSiret: client.siret || "",
    clientNaf: client.naf || "",
  };
}

export function partyFromHit(hit: CompanyHit, keep: { userId: string; name: string; email: string; country?: string }): ClientParty {
  return {
    clientUserId: keep.userId,
    clientName: keep.name || "",
    clientEmail: keep.email || "",
    clientCompany: hit.name || "",
    clientAddress: hit.address || "",
    clientVat: hit.vat || "",
    clientCountry: keep.country || "France",
    clientSiren: hit.siren || "",
    clientSiret: hit.siret || "",
    clientNaf: hit.naf || "",
  };
}

export async function recoverCompany(query: string) {
  const q = query.trim();
  if (q.length < 2) return [] as CompanyHit[];
  return opsSearchCompanies({ data: q });
}

export function matchCompany(hits: CompanyHit[], client: { company?: string; name?: string; siren?: string; siret?: string }) {
  const wanted = (client.company || client.name || "").trim().toLowerCase();
  return (
    hits.find((item) => client.siren && item.siren === client.siren) ||
    hits.find((item) => client.siret && item.siret === client.siret) ||
    hits.find((item) => wanted && item.name.toLowerCase() === wanted) ||
    (hits.length === 1 ? hits[0] : undefined)
  );
}
