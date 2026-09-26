import { createFileRoute } from "@tanstack/react-router";
import { Shell, PageHead } from "@/components/shell";
import { useAtelier } from "@/lib/store";

export const Route = createFileRoute("/societe")({ component: Page });

function Page() {
  const company = useAtelier((s) => s.company);
  const setCompany = useAtelier((s) => s.setCompany);
  const restore = useAtelier((s) => s.restoreExample);

  const fields = [
    ["legalName", "Raison sociale"],
    ["brandLine", "Marque"],
    ["chineseName", "Raison sociale (chinois)"],
    ["contactName", "Contact"],
    ["email", "Email"],
    ["address", "Adresse"],
    ["usci", "USCI"],
    ["capital", "Capital"],
    ["iban", "IBAN"],
    ["swift", "SWIFT"],
    ["bank", "Banque"],
    ["fxLabel", "Taux 1 € = … CNY"],
  ] as const;

  return (
    <Shell>
      <PageHead title="Paramètres" />
      <p className="mb-4 max-w-2xl text-sm text-muted">
        Ces informations apparaissent sur chaque devis, facture et avoir. Le texte des conditions se met à jour tant que vous ne l’avez pas réécrit à la main.
      </p>
      <form className="card grid gap-3 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        {fields.map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1.5 text-sm font-semibold">
            {label}
            <input className="field font-normal" value={company[key]} onChange={(e) => setCompany({ [key]: e.target.value })} />
          </label>
        ))}
        <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
          Mention de TVA
          <textarea className="field min-h-20 py-3 font-normal" value={company.vatNote} onChange={(e) => setCompany({ vatNote: e.target.value })} />
        </label>
      </form>
      <button className="btn btn-quiet mt-4" type="button" onClick={() => restore()}>
        Recharger l’exemple Manzini
      </button>
    </Shell>
  );
}
