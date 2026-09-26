import { useEffect, useState, type FormEvent } from "react";
import { submitLead } from "@/lib/backend.functions";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/site-layout";

export const Route = createFileRoute("/demande")({ component: Page });

type Draft = {
  need: "logistique" | "sourcing";
  products: string;
  qty: string;
  volume: string;
  value: string;
  suppliers: string;
  cities: string;
  country: string;
  city: string;
  when: string;
  who: "pro" | "particulier";
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  consent: boolean;
};

const EMPTY: Draft = {
  need: "logistique",
  products: "",
  qty: "",
  volume: "",
  value: "",
  suppliers: "",
  cities: "",
  country: "France",
  city: "",
  when: "",
  who: "pro",
  name: "",
  company: "",
  email: "",
  phone: "",
  notes: "",
  consent: false,
};

function Page() {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem("sp_draft");
    if (!raw) return;
    try {
      setDraft({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore broken draft */
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("sp_draft", JSON.stringify(draft));
  }, [draft]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.products.trim() || !draft.name.trim() || !draft.email.includes("@") || !draft.consent) return;
    const body = [
      `Besoin : ${draft.need}`,
      `Produits : ${draft.products}`,
      `Quantité : ${draft.qty}`,
      `Volume / poids : ${draft.volume}`,
      `Valeur : ${draft.value}`,
      `Fournisseurs : ${draft.suppliers} · ${draft.cities}`,
      `Destination : ${draft.city}, ${draft.country}`,
      `Arrivée souhaitée : ${draft.when}`,
      `${draft.who} · ${draft.name} · ${draft.company}`,
      `${draft.email} · ${draft.phone}`,
      draft.notes,
    ].join("\n");
    setPending(true);
    setError("");
    try {
      await submitLead({
        data: {
          kind: "devis",
          name: draft.name,
          email: draft.email,
          subject: `Demande de devis — ${draft.name}`,
          body,
          payload: {
            need: draft.need,
            products: draft.products,
            qty: draft.qty,
            volume: draft.volume,
            value: draft.value,
            suppliers: draft.suppliers,
            cities: draft.cities,
            country: draft.country,
            city: draft.city,
            when: draft.when,
            who: draft.who,
            company: draft.company,
            phone: draft.phone,
          },
        },
      });
      localStorage.removeItem("sp_draft");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SiteLayout>
      <PageIntro title="Décrivez votre envoi." lead="Nous revenons avec un devis détaillé sous 24 à 72 heures, en français, en anglais ou en chinois." />
      <form className="mx-auto grid max-w-3xl gap-4 px-4" onSubmit={submit}>
        <fieldset className="card grid gap-3">
          <legend className="font-semibold">1. Votre besoin</legend>
          <label className="text-sm"><input type="radio" name="need" checked={draft.need === "logistique"} onChange={() => set("need", "logistique")} /> J’ai déjà mes fournisseurs en Chine.</label>
          <label className="text-sm"><input type="radio" name="need" checked={draft.need === "sourcing"} onChange={() => set("need", "sourcing")} /> Je cherche encore un fournisseur.</label>
        </fieldset>
        <fieldset className="card grid gap-3 sm:grid-cols-2">
          <legend className="font-semibold sm:col-span-2">2. Vos marchandises</legend>
          <Field label="Produits" value={draft.products} onChange={(v) => set("products", v)} />
          <Field label="Quantité totale" value={draft.qty} onChange={(v) => set("qty", v)} />
          <Field label="Volume ou poids estimé" value={draft.volume} onChange={(v) => set("volume", v)} />
          <Field label="Valeur des marchandises" value={draft.value} onChange={(v) => set("value", v)} />
          <Field label="Nombre de fournisseurs" value={draft.suppliers} onChange={(v) => set("suppliers", v)} />
          <Field label="Villes des fournisseurs" value={draft.cities} onChange={(v) => set("cities", v)} />
        </fieldset>
        <fieldset className="card grid gap-3 sm:grid-cols-2">
          <legend className="font-semibold sm:col-span-2">3. Destination</legend>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Pays
            <select className="field font-normal" value={draft.country} onChange={(e) => set("country", e.target.value)}>
              {["France", "Belgique", "Suisse", "Autre Europe", "Afrique", "Autre"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <Field label="Ville ou port d’arrivée" value={draft.city} onChange={(v) => set("city", v)} />
          <Field label="Arrivée souhaitée" value={draft.when} onChange={(v) => set("when", v)} />
        </fieldset>
        <fieldset className="card grid gap-3 sm:grid-cols-2">
          <legend className="font-semibold sm:col-span-2">4. Vos coordonnées</legend>
          <label className="text-sm sm:col-span-2"><input type="radio" checked={draft.who === "pro"} onChange={() => set("who", "pro")} /> Professionnel</label>
          <label className="text-sm sm:col-span-2"><input type="radio" checked={draft.who === "particulier"} onChange={() => set("who", "particulier")} /> Particulier</label>
          <Field label="Nom et prénom" value={draft.name} onChange={(v) => set("name", v)} />
          <Field label="Entreprise (facultatif)" value={draft.company} onChange={(v) => set("company", v)} />
          <Field label="Email" value={draft.email} onChange={(v) => set("email", v)} />
          <Field label="Téléphone (facultatif)" value={draft.phone} onChange={(v) => set("phone", v)} />
          <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">
            Précisions
            <textarea className="field min-h-28 py-3 font-normal" value={draft.notes} onChange={(e) => set("notes", e.target.value)} />
          </label>
          <label className="flex items-start gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={draft.consent} onChange={(e) => set("consent", e.target.checked)} />
            J’accepte que Sourcing Pick utilise ces informations pour établir mon devis.
          </label>
        </fieldset>
        <button className="btn btn-primary w-fit" type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Envoyer ma demande"}</button>
        {error ? <p className="text-sm text-[#8a1c1c]">{error}</p> : null}
        {sent ? <p className="text-sm text-muted">Demande enregistrée. Nous revenons vers vous sous 24 à 72 heures à l’adresse indiquée.</p> : null}
        <p className="text-sm text-muted">Vos informations servent uniquement à établir votre devis. Joignez pro forma et photos dans le mail si vous en avez.</p>
      </form>
    </SiteLayout>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {label}
      <input className="field font-normal" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
