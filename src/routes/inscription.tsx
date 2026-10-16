import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Lock, Mail, Phone } from "lucide-react";
import { AuthFrame, AuthLangPills } from "@/components/auth-frame";
import { LangProvider } from "@/site/i18n";
import { registerClient } from "@/lib/admin-auth.functions";

import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/inscription")({
  head: () => seoHead("/inscription"),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<"pro" | "particulier">("pro");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [vat, setVat] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await registerClient({
        data: { name, email, password, kind, company, vat, country, phone, accepted },
      });
      sessionStorage.setItem("sp-verify-email", result.email);
      if (result.code) sessionStorage.setItem("sp-verify-code", result.code);
      else sessionStorage.removeItem("sp-verify-code");
      sessionStorage.setItem("sp-verify-mailed", result.mailed ? "1" : "0");
      void navigate({ to: "/verification" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible.");
      setPending(false);
    }
  }

  return (
    <LangProvider>
    <AuthFrame>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <img src="/illustrations/logo.svg" alt="Sourcing Pick" className="h-8 w-auto self-start" />
        <AuthLangPills />
      </div>
      <img src="/illustrations/mascotte-bras.svg" alt="" className="mx-auto w-40 max-w-full" />
      <div>
        <h1 className="display text-3xl">Créer votre compte</h1>
        <p className="mt-2 text-[15px] text-muted">Deux minutes, et vous pouvez envoyer votre première demande.</p>
      </div>
      <form className="flex flex-col gap-3.5" onSubmit={submit}>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Vous êtes</span>
          <div className="flex gap-2">
            {(["pro", "particulier"] as const).map((value) => (
              <label
                key={value}
                className={`flex flex-1 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${kind === value ? "border-[#155DFC]" : "border-[#DCE3F2]"}`}
              >
                <input type="radio" name="kind" checked={kind === value} onChange={() => setKind(value)} className="accent-[#155DFC]" />
                {value === "pro" ? "Professionnel" : "Particulier"}
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Nom et prénom
            <input className="field font-normal" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Entreprise
            <input className="field font-normal" value={company} onChange={(e) => setCompany(e.target.value)} required={kind === "pro"} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            N° de TVA ou d’immatriculation
            <input className="field font-normal" value={vat} onChange={(e) => setVat(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Pays de livraison
            <input className="field font-normal" value={country} onChange={(e) => setCountry(e.target.value)} />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Email professionnel
          <span className="relative block">
            <Mail size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input className="field pl-10 font-normal" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@entreprise.fr" autoComplete="email" required />
          </span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Téléphone
          <span className="relative block">
            <Phone size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input className="field pl-10 font-normal" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+33 6 12 34 56 78" required />
          </span>
          <span className="text-xs font-normal text-muted">Pour vous joindre sur vos demandes.</span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Mot de passe
          <span className="relative block">
            <Lock size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input className="field pl-10 font-normal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" autoComplete="new-password" required />
          </span>
          <span className="text-xs font-normal text-muted">8 caractères minimum, dont un chiffre.</span>
        </label>
        <label className="flex items-start gap-2 text-sm leading-snug text-muted">
          <input type="checkbox" className="mt-1 accent-[#155DFC]" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span>
            J’accepte les{" "}
            <Link to="/cgv" className="font-semibold text-[#155DFC]">conditions générales de vente</Link>
            {" "}et la{" "}
            <Link to="/confidentialite" className="font-semibold text-[#155DFC]">politique de confidentialité</Link>.
          </span>
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn btn-primary w-full" type="submit" disabled={pending}>
          Créer mon compte <ArrowRight size={18} />
        </button>
        <p className="text-center text-sm text-muted">
          Vous avez déjà un compte ?{" "}
          <Link to="/connexion" className="font-semibold text-[#155DFC]">Se connecter</Link>
        </p>
      </form>
      <p className="mt-1 flex items-center justify-center gap-2 text-xs text-muted">
        <CheckCircle2 size={15} className="shrink-0 text-[#0E9F6E]" aria-hidden="true" />
        Connexion chiffrée · code de vérification par email
      </p>
    </AuthFrame>
    </LangProvider>
  );
}
