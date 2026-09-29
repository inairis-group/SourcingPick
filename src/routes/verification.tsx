import { useRef, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AuthFrame } from "@/components/auth-frame";
import { confirmVerification, resendVerification } from "@/lib/admin-auth.functions";

export const Route = createFileRoute("/verification")({
  head: () => ({ meta: [{ title: "SourcingPick — Vérification" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [email] = useState(() => sessionStorage.getItem("sp-verify-email") || "");
  const [hint, setHint] = useState(() => sessionStorage.getItem("sp-verify-code") || "");
  const [digits, setDigits] = useState<string[]>(() => {
    const saved = sessionStorage.getItem("sp-verify-code") || "";
    return Array.from({ length: 6 }, (_, index) => saved[index] ?? "");
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const boxes = useRef<Array<HTMLInputElement | null>>([]);

  function setAt(index: number, value: string) {
    const next = digits.slice();
    next[index] = value;
    setDigits(next);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await confirmVerification({ data: { code: digits.join("") } });
      sessionStorage.removeItem("sp-verify-code");
      void navigate({ to: "/espace" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vérification impossible.");
      setPending(false);
    }
  }

  return (
    <AuthFrame>
      <img src="/illustrations/mascotte-ronde.svg" alt="" className="h-28 w-28 self-start" />
      <div>
        <h1 className="display text-3xl">Vérifiez votre email</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Code à six chiffres pour <strong className="text-ink">{email || "votre adresse"}</strong>. Il est valable 15 minutes.
        </p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Code de vérification</span>
          <div className="flex gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(node) => {
                  boxes.current[index] = node;
                }}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                aria-label={`Chiffre ${index + 1}`}
                className={`h-16 w-12 rounded-2xl border bg-white text-center font-mono text-2xl font-semibold ${digit ? "border-[#155DFC]" : "border-[#DCE3F2]"}`}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "").slice(-1);
                  setAt(index, value);
                  if (value && boxes.current[index + 1]) boxes.current[index + 1]?.focus();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && !digits[index] && boxes.current[index - 1]) {
                    boxes.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </div>
        </div>
        {hint ? <p className="text-sm text-muted">Votre code, tant que l’email n’est pas branché : <span className="mono font-semibold text-ink">{hint}</span></p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn btn-primary w-full" type="submit" disabled={pending}>
          Vérifier <ArrowRight size={18} />
        </button>
        <div className="flex items-center justify-between gap-3 text-sm text-muted">
          <button
            className="font-semibold text-[#155DFC]"
            type="button"
            onClick={() => {
              setError("");
              void resendVerification()
                .then((result) => {
                  sessionStorage.setItem("sp-verify-code", result.code);
                  sessionStorage.setItem("sp-verify-email", result.email);
                  setHint(result.code);
                  setDigits(Array.from({ length: 6 }, (_, index) => result.code[index] ?? ""));
                })
                .catch((err) => setError(err instanceof Error ? err.message : "Envoi impossible."));
            }}
          >
            Renvoyer le code
          </button>
          <span>Pensez à regarder vos indésirables.</span>
        </div>
      </form>
    </AuthFrame>
  );
}
