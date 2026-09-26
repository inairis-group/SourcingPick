import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/site-layout";

export const Route = createFileRoute("/application")({ component: Page });

function Page() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  return (
    <SiteLayout>
      <PageIntro title="Toute votre logistique, d’abord sur le web." lead="Demandes, devis, signature, acompte, photos, messages et suivi. L’application iOS et Android est en construction : pas de date tant qu’elle n’est pas prête." />
      <div className="mx-auto grid max-w-6xl gap-3 px-4 sm:grid-cols-3">
        {["App Store · en construction", "Google Play · en construction", "Français, English, 中文"].map((s) => (
          <p key={s} className="rounded-2xl border border-dashed border-line bg-paper px-4 py-4 text-sm font-semibold">{s}</p>
        ))}
      </div>
      <section className="mx-auto mt-6 grid max-w-6xl gap-3 px-4 md:grid-cols-2">
        {["Demandes et devis", "Signature électronique", "Acompte et factures", "Photos et vidéos", "Messagerie avec votre agent", "Notification à chaque statut"].map((s) => (
          <article key={s} className="card text-sm font-semibold">{s}</article>
        ))}
      </section>
      <form
        className="mx-auto mt-8 flex max-w-6xl flex-wrap items-end gap-3 px-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.includes("@")) return;
          const prev = JSON.parse(localStorage.getItem("sp_app_wait") || "[]") as string[];
          localStorage.setItem("sp_app_wait", JSON.stringify([...prev, email]));
          setOk(true);
        }}
      >
        <label className="text-sm font-semibold">
          Être prévenu au lancement
          <input className="field mt-1 font-normal" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
        </label>
        <button className="btn btn-primary" type="submit">Prévenez-moi</button>
        <Link to="/admin" className="btn btn-quiet">Ouvrir l’espace client</Link>
        {ok ? <p className="w-full text-sm text-muted">Noté sur cet appareil. Nous n’envoyons pas encore d’email automatique : écrivez aussi à contact@sourcingpick.com.</p> : null}
      </form>
    </SiteLayout>
  );
}
