import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { PlaceField } from "@/components/address-field";
import { clientPassword, clientProfile } from "@/lib/ops.functions";
import { useClient } from "@/components/client-ui";
import { replayTour } from "@/components/tour";
import { useUi } from "@/lib/ui-lang";

export const Route = createFileRoute("/espace/parametres")({
  head: () => ({ meta: [{ title: "SourcingPick — Paramètres" }] }),
  component: Page,
});

const NOTICES = [
  ["quote", "Devis reçu et relances de signature"],
  ["pay", "Acompte, solde et relances de paiement"],
  ["state", "Changement d’état d’une demande ou d’une commande"],
  ["file", "Nouvelles photos ou fichiers"],
  ["message", "Nouveau message"],
] as const;

function storedNotices() {
  try {
    const raw = JSON.parse(window.localStorage.getItem("sp-notices") || "{}") as Record<string, boolean>;
    return Object.fromEntries(NOTICES.map(([key]) => [key, raw[key] !== false]));
  } catch {
    return Object.fromEntries(NOTICES.map(([key]) => [key, true]));
  }
}

function Page() {
  const { data, reload } = useClient();
  const { lang, setLang } = useUi();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [flags, setFlags] = useState<Record<string, boolean>>({ quote: true, pay: true, state: true, file: true, message: true });
  const [note, setNote] = useState("");

  useEffect(() => {
    setFlags(storedNotices());
  }, []);

  useEffect(() => {
    if (!data) return;
    setName(data.name);
    setCompany(data.company);
    setAddress(data.address || "");
    setPhone(data.phone || "");
    setOtp(Boolean(data.otpSign));
  }, [data]);

  function saveNotices(nextFlags: Record<string, boolean>) {
    setFlags(nextFlags);
    window.localStorage.setItem("sp-notices", JSON.stringify(nextFlags));
  }

  return (
    <Shell>
      <PageHead title="Paramètres" />
      <p className="mb-4 max-w-3xl text-sm text-muted">Société, adresse de livraison, code email avant signature, mot de passe, notifications et langue.</p>
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <form
          className="card flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void clientProfile({ data: { name, company, address, phone, otpSign: otp } })
              .then(() => {
                setNote("Profil enregistré.");
                reload();
              })
              .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Enregistrement impossible."));
          }}
        >
          <h2 className="display text-lg">Profil et société</h2>
          <label className="text-sm font-semibold">Nom<input className="control mt-1" value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="text-sm font-semibold">Raison sociale<input className="control mt-1" value={company} onChange={(event) => setCompany(event.target.value)} /></label>
          <label className="text-sm font-semibold">
            Adresse de livraison
            <PlaceField mode="address" value={address} onChange={setAddress} placeholder="Numéro, rue, code postal, ville" />
          </label>
          <label className="text-sm font-semibold">Téléphone<input className="control mt-1" type="tel" value={phone} autoComplete="tel" placeholder="+33 6 12 34 56 78" onChange={(event) => setPhone(event.target.value)} /></label>
          <p className="text-sm text-muted">Email de connexion · {data?.email}</p>
          <label className="flex items-start gap-3 rounded-2xl border border-line bg-white p-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={otp}
              onChange={(event) => {
                const next = event.target.checked;
                setOtp(next);
                if (name.trim().length < 2) return;
                void clientProfile({ data: { name, company, address, phone, otpSign: next } })
                  .then(() => setNote(next ? "Code email activé pour la signature." : "Code email désactivé."))
                  .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Enregistrement impossible."));
              }}
            />
            <span>
              <span className="block font-semibold">Code email avant de signer</span>
              <span className="text-muted">Un code à 6 chiffres est envoyé sur votre email au moment de signer un devis.</span>
            </span>
          </label>
          <button className="btn btn-primary w-fit" type="submit">Enregistrer</button>
        </form>

        <form
          className="card flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void clientPassword({ data: { current, next } })
              .then(() => {
                setCurrent("");
                setNext("");
                setNote("Mot de passe modifié.");
              })
              .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Modification impossible."));
          }}
        >
          <h2 className="display text-lg">Sécurité</h2>
          <label className="text-sm font-semibold">Mot de passe actuel<input className="control mt-1" type="password" autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} /></label>
          <label className="text-sm font-semibold">Nouveau mot de passe<input className="control mt-1" type="password" autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value)} /></label>
          <button className="btn btn-quiet w-fit" type="submit">Changer le mot de passe</button>
        </form>

        <section className="card">
          <h2 className="display mb-3 text-lg">Notifications</h2>
          <ul className="flex flex-col gap-2">
            {NOTICES.map(([key, label]) => (
              <li key={key}>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2 text-sm">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={flags[key] !== false}
                    onChange={() => saveNotices({ ...flags, [key]: !flags[key] })}
                  />
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">Le point rouge et le son suivent ces choix, sur cet appareil. Le journal reste visible dans la cloche.</p>
        </section>

        <section className="card flex flex-col gap-3">
          <h2 className="display text-lg">Langue et visite</h2>
          <div className="flex gap-2">
            <button className={`btn ${lang === "fr" ? "btn-primary" : "btn-quiet"}`} type="button" onClick={() => setLang("fr")}>Français</button>
            <button className={`btn ${lang === "en" ? "btn-primary" : "btn-quiet"}`} type="button" onClick={() => setLang("en")}>English</button>
          </div>
          <p className="text-sm text-muted">La visite présente le tableau de bord, puis Demandes, Commandes, Facturation, Documents et Messages.</p>
          <button className="btn btn-quiet w-fit" type="button" onClick={() => replayTour()}>Revoir le didacticiel</button>
        </section>
      </div>
      {note ? <p className="mt-4 text-sm">{note}</p> : null}
    </Shell>
  );
}
