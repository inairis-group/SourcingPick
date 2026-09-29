import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PaperView } from "@/components/paper";
import { ContractPages } from "@/components/contract-pages";
import { PageReel } from "@/components/page-reel";
import { devisFromOps, printNamed, signRows, stageClient } from "@/lib/ops-paper";
import { publicSign, publicSignCode, publicUnlock } from "@/lib/ops.functions";
import { euros } from "@/lib/ops.shared";
import { marks } from "@/components/marks";

export const Route = createFileRoute("/consulter/$token")({
  head: () => ({ meta: [{ title: "SourcingPick — Votre devis" }] }),
  component: Page,
});

type Opened = Awaited<ReturnType<typeof publicUnlock>>;

function Page() {
  const { token } = Route.useParams();
  const [phase, setPhase] = useState(0);
  const [opened, setOpened] = useState<Opened | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [read, setRead] = useState(false);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [step, setStep] = useState<"mail" | "code" | "who">("mail");
  const [done, setDone] = useState<{ invoiceNumber: string; amountCents: number; depositLabel: string; sent: boolean } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const ink = useRef(false);

  useEffect(() => {
    const timers = [0, 1, 2].map((index) => window.setTimeout(() => setPhase(index + 1), 900 * (index + 1)));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  if (phase < 3) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6">
        <div className="flex flex-col items-center text-center">
          <img src="/illustrations/logo.svg" alt="SourcingPick" className="h-9 w-auto" />
          <p className="mt-8 text-sm text-[#4a5878]">Ouverture du devis</p>
          <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden>
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-[#155dfc]"
                style={{ animation: "sp-load 1.05s ease-in-out infinite", animationDelay: `${index * 0.16}s` }}
              />
            ))}
          </div>
        </div>
        <style>{`@keyframes sp-load{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}`}</style>
      </main>
    );
  }

  if (!opened) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef2f8] px-4">
        <form
          className="w-full max-w-md rounded-[22px] border border-[#e3e8f2] bg-white p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setNote("");
            setBusy(true);
            if (step !== "code") {
              void publicSignCode({ data: { token, email } })
                .then(() => setStep("code"))
                .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Envoi du code impossible."))
                .finally(() => setBusy(false));
              return;
            }
            void publicUnlock({ data: { token, email, code } })
              .then((value) => {
                setOpened(value);
                const draft = devisFromOps(value.quote);
                stageClient(draft.clientId, value.quote.clientName, value.quote.orderRef);
                if (value.quote.clientName) setCompany((current) => current || value.quote.clientName);
                setStep("who");
              })
              .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Code refusé."))
              .finally(() => setBusy(false));
          }}
        >
          <p className="text-xs font-semibold tracking-[0.16em] text-[#155dfc]">SOURCINGPICK</p>
          <h1 className="mt-2 text-2xl font-semibold">Accéder au devis</h1>
          <p className="mt-2 text-sm text-[#4a5878]">Indiquez l’email qui a reçu le lien. Le code arrive ensuite. Le document s’ouvre seulement après.</p>
          {step !== "code" ? (
            <label className="mt-4 block text-sm font-semibold">Email
              <input className="field mt-1 font-normal" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
          ) : (
            <label className="mt-4 block text-sm font-semibold">Code reçu par {email}
              <input className="field mt-1 font-normal tracking-[0.3em]" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} required />
            </label>
          )}
          {note ? <p className="mt-3 text-sm text-[#8a1c1c]">{note}</p> : null}
          {error ? <p className="mt-3 text-sm text-[#8a1c1c]">{error}</p> : null}
          <button className="btn btn-primary mt-4 w-full" type="submit" disabled={busy}>{busy ? "Vérification…" : step !== "code" ? "Recevoir le code" : "Ouvrir le devis"}</button>
          {step === "code" ? <button className="mt-3 text-sm font-semibold text-[#155dfc]" type="button" onClick={() => setStep("mail")}>Changer d’email</button> : null}
        </form>
      </main>
    );
  }

  const draft = devisFromOps(opened.quote);
  const signed = opened.signed || Boolean(done);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const pad = canvas.current;
    if (!pad) return null;
    const rect = pad.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  return (
    <main className="consult-page min-h-screen bg-[#eef2f8] px-4 py-6 text-[#0e1a3d]">
      <div className="mx-auto grid max-w-[1280px] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[22px] border border-[#e3e8f2] bg-[#eef2f8] p-3">
          <PageReel running={!signed} onDone={() => setRead(true)}>
            <PaperView doc={draft} />
            <ContractPages
              number={opened.quote.number}
              client={opened.quote.clientName}
              amount={euros(opened.quote.amountCents)}
              deposit={opened.depositLabel || "0"}
              issued={opened.quote.issuedOn}
            />
          </PageReel>
        </section>
        <aside className="no-print rounded-[22px] border border-[#e3e8f2] bg-white p-5 lg:sticky lg:top-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#155dfc]">SOURCINGPICK</p>
          <h1 className="mt-2 text-2xl font-semibold">Devis {opened.quote.number}</h1>
          <div className="mail-note mt-3 text-sm leading-relaxed text-[#4a5878]">{marks(opened.message)}</div>
          {signed ? (
            <div className="mt-5 rounded-2xl bg-[#f4f7fb] p-4 text-sm">
              <p className="font-semibold">Devis signé</p>
              <div className="mt-3 grid gap-2">
                {signRows(opened.quote).map((row) => (
                  <p key={row.label}>
                    <span className="block text-[11px] font-semibold tracking-wide text-[#7b879f] uppercase">{row.label}</span>
                    <span className="break-words">{row.value}</span>
                  </p>
                ))}
              </div>
              {done?.invoiceNumber || opened.invoice?.number ? (
                <p className="mt-2">
                  La facture d’acompte {done?.invoiceNumber || opened.invoice?.number} de{" "}
                  {euros(done?.amountCents || opened.invoice?.amountCents || 0)} ({done?.depositLabel || opened.depositLabel} %) est émise.
                  {done?.sent === false ? " L’email n’est pas parti : le document reste disponible ici." : " Le devis signé et la facture d’acompte viennent d’être envoyés par email."}
                </p>
              ) : (
                <p className="mt-2">Ce devis n’a pas d’acompte à régler. {done?.sent === false ? "L’email n’est pas parti." : "Le devis signé vient d’être envoyé par email."}</p>
              )}
              <button className="btn btn-primary mt-4 w-full" type="button" onClick={() => printNamed(opened.quote.number)}>Télécharger le devis signé</button>
            </div>
          ) : (
            <form
              className="mt-5 flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                setNote("");
                if (step === "mail") {
                  setBusy(true);
                  void publicSignCode({ data: { token, email } })
                    .then(() => setStep("code"))
                    .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Envoi du code impossible."))
                    .finally(() => setBusy(false));
                  return;
                }
                if (step === "code") {
                  if (code.replace(/\D/g, "").length !== 6) {
                    setNote("Le code fait 6 chiffres.");
                    return;
                  }
                  setStep("who");
                  return;
                }
                const name = `${first.trim()} ${last.trim()}`.trim();
                if (name.length < 2) {
                  setNote("Indiquez le prénom et le nom.");
                  return;
                }
                if (!accepted) {
                  setNote("Confirmez que vous pouvez engager la société.");
                  return;
                }
                if (!read && !signed) {
                  setNote("Le contrat défile encore. La signature s’ouvre à la dernière page.");
                  return;
                }
                const image = mode === "type" ? typedSignature(name) : exportPad(canvas.current);
                if (mode === "draw" && !ink.current) {
                  setNote("Dessinez la signature, ou choisissez de signer avec votre nom.");
                  return;
                }
                setBusy(true);
                void publicSign({
                  data: { token, email, code, name, role, company, image },
                })
                  .then((result) => {
                    setOpened((current) =>
                      current
                        ? {
                            ...current,
                            signed: true,
                            quote: {
                              ...current.quote,
                              status: "Devis signé",
                              signerName: [name, role].filter(Boolean).join(", "),
                              signedAt: new Date().toISOString(),
                              signatureImage: image,
                            },
                          }
                        : current,
                    );
                    setDone(result);
                    window.setTimeout(() => document.querySelector(".e-sign")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
                  })
                  .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Signature impossible."))
                  .finally(() => setBusy(false));
              }}
            >
              <p className="text-sm font-semibold">{step === "mail" ? "Votre email" : step === "code" ? "Code reçu" : "Signature"}</p>
              {step === "mail" ? (
                <>
                  <p className="text-xs text-[#7b879f]">Indiquez l’adresse qui a reçu le devis. Le code n’est pas dans ce premier message : il part seulement maintenant.</p>
                  <label className="text-sm font-semibold">Email
                    <input className="field mt-1 font-normal" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  </label>
                </>
              ) : null}
              {step === "code" ? (
                <>
                  <p className="text-xs text-[#7b879f]">Un code à 6 chiffres vient d’être envoyé à {email}. Il est valable 15 minutes.</p>
                  <label className="text-sm font-semibold">Code
                    <input className="field mt-1 font-normal tracking-[0.3em]" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} required />
                  </label>
                  <button className="text-left text-xs font-semibold text-[#155dfc]" type="button" onClick={() => setStep("mail")}>Renvoyer un code</button>
                </>
              ) : null}
              {step === "who" ? (
                <>
                  <label className="text-sm font-semibold">Prénom
                    <input className="field mt-1 font-normal" value={first} onChange={(event) => setFirst(event.target.value)} required />
                  </label>
                  <label className="text-sm font-semibold">Nom
                    <input className="field mt-1 font-normal" value={last} onChange={(event) => setLast(event.target.value)} required />
                  </label>
                  <label className="text-sm font-semibold">Fonction
                    <input className="field mt-1 font-normal" value={role} onChange={(event) => setRole(event.target.value)} placeholder="Gérant, directeur…" />
                  </label>
                  <label className="text-sm font-semibold">Société
                    <input className="field mt-1 font-normal" value={company} onChange={(event) => setCompany(event.target.value)} />
                  </label>
                  <div className="flex gap-2">
                    <button className={`btn ${mode === "draw" ? "btn-primary" : "btn-quiet"}`} type="button" onClick={() => setMode("draw")}>Dessiner</button>
                    <button className={`btn ${mode === "type" ? "btn-primary" : "btn-quiet"}`} type="button" onClick={() => setMode("type")}>Signer avec mon nom</button>
                  </div>
                  {mode === "draw" ? (
                    <canvas
                      ref={canvas}
                      className="block h-36 w-full touch-none rounded-xl border border-dashed border-[#155dfc] bg-white"
                      onPointerDown={(event) => {
                        const ctx = drawContext(canvas.current);
                        const hit = point(event);
                        if (!ctx || !hit) return;
                        drawing.current = true;
                        ink.current = true;
                        event.preventDefault();
                        event.currentTarget.setPointerCapture(event.pointerId);
                        ctx.beginPath();
                        ctx.moveTo(hit.x, hit.y);
                      }}
                      onPointerMove={(event) => {
                        if (!drawing.current) return;
                        const ctx = canvas.current?.getContext("2d");
                        const hit = point(event);
                        if (!ctx || !hit) return;
                        ctx.lineTo(hit.x, hit.y);
                        ctx.stroke();
                      }}
                      onPointerUp={() => {
                        drawing.current = false;
                      }}
                      onPointerCancel={() => {
                        drawing.current = false;
                      }}
                    />
                  ) : (
                    <p className="rounded-xl border border-dashed border-[#155dfc] bg-white px-4 py-8 text-center text-3xl text-[#0e1a3d]" style={{ fontFamily: "\"Segoe Script\", \"Brush Script MT\", cursive" }}>
                      {`${first} ${last}`.trim() || "Votre nom"}
                    </p>
                  )}
                  <label className="flex items-start gap-2 text-sm">
                    <input className="mt-1" type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                    Je confirme être habilité à engager la société. Cette signature vaut acceptation du devis, du contrat et des conditions.
                  </label>
                </>
              ) : null}
              {note ? <p className="text-sm text-[#8a1c1c]">{note}</p> : null}
              {!read && step === "who" ? <p className="text-sm text-[#4a5578]">Le contrat défile automatiquement. La signature s’ouvre à la dernière page.</p> : null}
              <button className="btn btn-primary" type="submit" disabled={busy || (step === "who" && !read)}>
                {busy ? "Validation…" : step === "mail" ? "Recevoir le code" : step === "code" ? "Valider le code" : `Valider et émettre l’acompte de ${opened.depositLabel} %`}
              </button>
            </form>
          )}
        </aside>
      </div>
    </main>
  );
}

function drawContext(pad: HTMLCanvasElement | null) {
  if (!pad) return null;
  const rect = pad.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  if (pad.width !== width || pad.height !== height) {
    pad.width = width;
    pad.height = height;
  }
  const ctx = pad.getContext("2d");
  if (!ctx) return null;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#0e1a3d";
  return ctx;
}

function exportPad(pad: HTMLCanvasElement | null) {
  if (!pad) return "";
  const out = document.createElement("canvas");
  out.width = 640;
  out.height = 180;
  const ctx = out.getContext("2d");
  if (!ctx) return pad.toDataURL("image/png");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 640, 180);
  ctx.drawImage(pad, 0, 0, 640, 180);
  return out.toDataURL("image/png");
}

function typedSignature(name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 180;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 640, 180);
  ctx.fillStyle = "#0e1a3d";
  ctx.font = "54px \"Segoe Script\", \"Brush Script MT\", cursive";
  ctx.fillText(name.slice(0, 42), 28, 108);
  return canvas.toDataURL("image/png");
}
