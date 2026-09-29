import type { CompanyHit } from "@/lib/ops.shared";

function vatFromSiren(siren: string) {
  if (!/^\d{9}$/.test(siren)) return "";
  const key = (12 + 3 * (Number(siren) % 97)) % 97;
  return `FR${String(key).padStart(2, "0")}${siren}`;
}

type Seat = {
  siret?: string;
  adresse?: string;
  geo_adresse?: string;
  code_postal?: string;
  libelle_commune?: string;
  etat_administratif?: string;
};

type Hit = {
  siren?: string;
  nom_complet?: string;
  nom_raison_sociale?: string;
  activite_principale?: string;
  etat_administratif?: string;
  siege?: Seat;
};

export async function searchCompanies(query: string): Promise<CompanyHit[]> {
  const q = query.trim().slice(0, 80);
  if (q.length < 2) return [];
  const url = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(q)}&per_page=20`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error("L’annuaire des entreprises ne répond pas. Vous pouvez saisir la société à la main.");
  const data = (await res.json()) as { results?: Hit[] };
  const mapped = (data.results ?? []).slice(0, 12).map((row) => {
    const siren = String(row.siren ?? "");
    const seat = row.siege ?? {};
    const address = seat.geo_adresse || seat.adresse || [seat.code_postal, seat.libelle_commune].filter(Boolean).join(" ");
    return {
      siren,
      siret: String(seat.siret ?? ""),
      name: String(row.nom_raison_sociale || row.nom_complet || ""),
      address,
      naf: String(row.activite_principale ?? ""),
      vat: vatFromSiren(siren),
      open: (seat.etat_administratif || row.etat_administratif) !== "F",
    };
  });
  const seen = new Set<string>();
  return mapped.filter((hit) => {
    if (!hit.open || !hit.siren || seen.has(hit.siren)) return false;
    seen.add(hit.siren);
    return true;
  }).slice(0, 8);
}
