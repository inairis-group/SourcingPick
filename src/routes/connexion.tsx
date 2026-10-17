import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";
import { AuthFrame, AuthLangPills } from "@/components/auth-frame";
import { LangProvider } from "@/site/i18n";
import { adminLogin, adminOnboard, confirmPasswordReset, requestPasswordReset } from "@/lib/admin-auth.functions";
import { clearSession, loadSession } from "@/lib/session";

import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/connexion")({
  validateSearch: (search: Record<string, unknown>): { reprise?: boolean; email?: string } => {
    const reprise = search.reprise === "1" || search.reprise === 1 || search.reprise === true;
    const email = typeof search.email === "string" ? search.email.slice(0, 160) : "";
    return {
      ...(reprise ? { reprise: true } : {}),
      ...(email.includes("@") ? { email } : {}),
    };
  },
  head: () => seoHead("/connexion"),
  component: Connexion,
});

function passwordStrength(password: string) {
  if (!password) return { bars: 0, label: "", color: "#DCE3F2" };
  if (password.length < 8) return { bars: 1, label: "Trop court", color: "#E02424" };
  let score = 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const bars = Math.min(4, score);
  const steps = [
    { label: "Faible", color: "#E07A24" },
    { label: "Moyen", color: "#C9A227" },
    { label: "Bon", color: "#1F8A4C" },
    { label: "Excellent", color: "#155DFC" },
  ];
  return { bars, ...steps[bars - 1] };
}

function Connexion() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"onboard" | "login" | "forgot" | "loading">("loading");
  const [resetStep, setResetStep] = useState<"email" | "code">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const strength = passwordStrength(mode === "forgot" ? password : "");

  useEffect(() => {
    if (search.reprise && search.email?.includes("@")) {
      setEmail(search.email);
      setResetStep("code");
      setMode("forgot");
      setNote("Saisissez le code reçu par email, puis choisissez votre mot de passe.");
      return;
    }
    let live = true;
    loadSession()
      .then((session) => {
        if (!live) return;
        if (session.user) {
          void navigate({ to: session.user.role === "client" ? "/espace" : session.user.role === "agent" ? "/agent" : "/admin" });
          return;
        }
        setMode(session.ready ? "login" : "onboard");
      })
      .catch(() => {
        if (live) setMode("login");
      });
    return () => {
      live = false;
    };
  }, [navigate, search.email, search.reprise]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNote("");
    if (mode === "forgot") {
      if (resetStep === "email") {
        setPending(true);
        try {
          await requestPasswordReset({ data: { email } });
          setResetStep("code");
          setNote("Si un compte existe pour cette adresse, le code vient de partir. Regardez aussi les indésirables.");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Envoi impossible.");
        }
        setPending(false);
        return;
      }
      if (password !== confirm) {
        setError("Les deux mots de passe ne correspondent pas.");
        return;
      }
      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password) || strength.bars < 2) {
        setError("Choisissez un mot de passe plus solide : 8 caractères, une lettre et un chiffre.");
        return;
      }
      setPending(true);
      try {
        await confirmPasswordReset({ data: { email, code, password } });
        setPassword("");
        setConfirm("");
        setCode("");
        setResetStep("email");
        setMode("login");
        setNote("Mot de passe mis à jour. Vous pouvez vous connecter.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Changement impossible.");
      }
      setPending(false);
      return;
    }
    if (mode === "onboard" && password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setPending(true);
    try {
      if (mode === "onboard") {
        clearSession();
        await adminOnboard({ data: { name, email, password } });
        await loadSession(true);
        void navigate({ to: "/admin" });
        return;
      }
      const result = await adminLogin({ data: { email, password } });
      clearSession();
      const session = await loadSession(true);
      const role = session.user?.role ?? result.role;
      void navigate({ to: role === "client" ? "/espace" : role === "agent" ? "/agent" : "/admin" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "La connexion a échoué.";
      if (message.includes("Confirmez")) {
        sessionStorage.setItem("sp-verify-email", email);
        void navigate({ to: "/verification" });
        return;
      }
      setError(message);
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
      {mode === "login" ? (
        <img src="/illustrations/mascotte-bras.svg" alt="" className="mx-auto w-44 max-w-full" />
      ) : null}
      <div>
        <h1 className="display text-3xl">
          {mode === "onboard" ? "Créer l'accès" : mode === "forgot" ? "Mot de passe oublié" : "Bon retour !"}
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          {mode === "onboard"
            ? "Premier passage. Ce compte ouvre l’administration."
            : mode === "forgot"
              ? resetStep === "code"
                ? "Saisissez le code reçu, puis choisissez un nouveau mot de passe."
                : "Indiquez l’email du compte. Un code à six chiffres vous est envoyé."
              : mode === "loading"
                ? "Vérification de la session…"
                : "Connectez-vous pour suivre vos commandes."}
        </p>
      </div>
      {mode !== "loading" ? (
        <form className="flex flex-col gap-4" onSubmit={submit}>
          {mode === "onboard" ? (
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Votre nom
              <input className="field font-normal" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </label>
          ) : null}
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Email
            <span className="field-icon">
              <Mail size={17} className="text-muted" aria-hidden="true" />
              <input className="field font-normal" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@entreprise.fr" autoComplete="username" required />
            </span>
          </label>
          {mode === "forgot" && resetStep === "code" ? (
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Code reçu par email
              <input className="field font-mono text-lg font-semibold tracking-[0.3em]" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" required />
            </label>
          ) : null}
          {mode !== "forgot" || resetStep === "code" ? (
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              {mode === "forgot" ? "Nouveau mot de passe" : "Mot de passe"}
              <span className="field-icon">
                <Lock size={17} className="text-muted" aria-hidden="true" />
                <input className="field font-normal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
              </span>
              {mode === "forgot" && password ? (
                <span className="mt-1">
                  <span className="flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <span key={step} className="h-1.5 flex-1 rounded-full" style={{ background: step <= strength.bars ? strength.color : "#E6EBF5" }} />
                    ))}
                  </span>
                  <span className="mt-1 block text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</span>
                </span>
              ) : null}
            </label>
          ) : null}
          {mode === "forgot" && resetStep === "code" ? (
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Confirmer
              <input className="field font-normal" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
            </label>
          ) : null}
          {mode === "onboard" ? (
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Confirmer
              <input className="field font-normal" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
            </label>
          ) : null}
          {mode === "login" ? (
            <div className="flex items-center justify-end gap-3 text-sm">
              <button className="font-semibold text-[#155DFC]" type="button" onClick={() => { setMode("forgot"); setResetStep("email"); setError(""); setNote(""); setPassword(""); setConfirm(""); setCode(""); }}>
                Mot de passe oublié ?
              </button>
            </div>
          ) : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {note ? <p className="text-sm text-muted">{note}</p> : null}
          <button className="btn btn-primary w-full" type="submit" disabled={pending}>
            {mode === "onboard" ? "Créer l'accès" : mode === "forgot" ? (resetStep === "code" ? "Changer le mot de passe" : "Recevoir le code") : "Se connecter"}
            <ArrowRight size={18} />
          </button>
          {mode === "login" ? (
            <p className="text-center text-sm text-muted">
              Pas encore de compte ?{" "}
              <Link to="/inscription" className="font-semibold text-[#155DFC]">
                Créer un compte
              </Link>
            </p>
          ) : null}
          {mode === "forgot" ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              {resetStep === "code" ? (
                <button
                  className="font-semibold text-[#155DFC]"
                  type="button"
                  onClick={() => {
                    setError("");
                    setPending(true);
                    void requestPasswordReset({ data: { email } })
                      .then(() => setNote("Un nouveau code a été envoyé si le compte existe."))
                      .catch((err) => setError(err instanceof Error ? err.message : "Envoi impossible."))
                      .finally(() => setPending(false));
                  }}
                >
                  Renvoyer le code
                </button>
              ) : <span />}
              <button className="font-semibold text-[#155DFC]" type="button" onClick={() => { setMode("login"); setResetStep("email"); setError(""); setNote(""); }}>
                Retour à la connexion
              </button>
            </div>
          ) : null}
        </form>
      ) : null}
      {mode === "login" ? (
        <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted">
          <CheckCircle2 size={15} className="shrink-0 text-[#0E9F6E]" aria-hidden="true" />
          Connexion chiffrée · code de vérification par email
        </p>
      ) : null}
    </AuthFrame>
    </LangProvider>
  );
}
