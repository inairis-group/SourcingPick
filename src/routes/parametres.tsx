import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { opsSaveSettings, opsSettings } from "@/lib/ops.functions";
import { percent, type OpsSettings } from "@/lib/ops.shared";

export const Route = createFileRoute("/parametres")({
  head: () => ({ meta: [{ title: "SourcingPick — Paramètres" }] }),
  component: Page,
});

function bps(value: string) {
  return Math.round(Number(value.replace(",", ".")) * 100) || 0;
}

function Page() {
  const [form, setForm] = useState<OpsSettings | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    void opsSettings()
      .then(setForm)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Lecture impossible."));
  }, []);

  function patch(partial: Partial<OpsSettings>) {
    setForm((current) => (current ? { ...current, ...partial } : current));
  }

  if (!form) {
    return (
      <Shell>
        <PageHead title="Paramètres de la société" />
        <p className="text-sm text-muted">{error || "Chargement…"}</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <PageHead title="Paramètres de la société">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            void opsSaveSettings({ data: form })
              .then(() => setInfo("Paramètres enregistrés."))
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Enregistrement impossible."));
          }}
        >
          Enregistrer
        </button>
      </PageHead>
      {error ? <p className="mb-3 text-sm text-[#8a1c1c]">{error}</p> : null}
      {info ? <p className="mb-3 text-sm text-[#0e9f6e]">{info}</p> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="card grid gap-3">
          <h2 className="font-semibold">Identité de la société</h2>
          <Field label="Raison sociale" value={form.legalName} onChange={(legalName) => patch({ legalName })} />
          <Field label="中文名称" value={form.chineseName} onChange={(chineseName) => patch({ chineseName })} />
          <Field label="Code de crédit social unifié" value={form.usci} onChange={(usci) => patch({ usci })} />
          <label className="text-sm">Siège
            <textarea className="field mt-1" value={form.address} onChange={(event) => patch({ address: event.target.value })} />
          </label>
          <Field label="Représentant légal" value={form.representative} onChange={(representative) => patch({ representative })} />
        </section>
        <div className="grid gap-4">
          <section className="card grid gap-3 sm:grid-cols-2">
            <h2 className="font-semibold sm:col-span-2">Taux appliqués</h2>
            <Field label="Commission sur la marchandise %" value={percent(form.goodsBps)} onChange={(value) => patch({ goodsBps: bps(value) })} />
            <Field label="Commission sur le fret %" value={percent(form.freightBps)} onChange={(value) => patch({ freightBps: bps(value) })} />
            <Field label="Acompte par défaut %" value={percent(form.depositBps)} onChange={(value) => patch({ depositBps: bps(value) })} />
            <Field label="Validité des devis (jours)" value={String(form.validityDays)} onChange={(value) => patch({ validityDays: Number(value) || 0 })} />
          </section>
          <section className="card grid gap-3">
            <h2 className="font-semibold">Coordonnées bancaires</h2>
            <Field label="Bénéficiaire" value={form.beneficiary} onChange={(beneficiary) => patch({ beneficiary })} />
            <Field label="IBAN" value={form.iban} onChange={(iban) => patch({ iban })} />
            <Field label="SWIFT" value={form.swift} onChange={(swift) => patch({ swift })} />
            <Field label="Banque" value={form.bank} onChange={(bank) => patch({ bank })} />
          </section>
        </div>
      </div>
    </Shell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm">
      {label}
      <input className="field mt-1" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
