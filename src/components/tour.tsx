import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Check, FileText, FolderOpen, LayoutGrid, MessageSquare, Plus } from "lucide-react";
import { loadSession } from "@/lib/session";
import { useAtelier } from "@/lib/store";

const STEPS = [
  {
    title: "Tableau de bord",
    body: "L’accueil résume ce qui vous attend : devis à signer, paiements, et l’état de vos dossiers.",
    icon: LayoutGrid,
    target: "nav-board",
    to: "/espace",
  },
  {
    title: "Demandes",
    body: "Vous décrivez vos produits, joignez des photos et des fichiers. Ce n’est pas encore une commande.",
    icon: Plus,
    target: "nav-demandes",
    to: "/espace/demandes",
  },
  {
    title: "Commandes",
    body: "Une demande devient une commande quand le devis est signé et l’acompte reçu. Le suivi est ici.",
    icon: FileText,
    target: "nav-commandes",
    to: "/espace/commandes",
  },
  {
    title: "Facturation",
    body: "Devis à signer, acomptes et factures. Vous payez et vous téléchargez les pièces depuis cet onglet.",
    icon: FileText,
    target: "nav-facturation",
    to: "/espace/facturation",
  },
  {
    title: "Documents",
    body: "Toutes vos photos, fichiers, devis et factures, classés et téléchargeables.",
    icon: FolderOpen,
    target: "nav-documents",
    to: "/espace/documents",
  },
  {
    title: "Messages",
    body: "Un fil par demande. Vous écrivez à l’équipe, même avant la première réponse.",
    icon: MessageSquare,
    target: "nav-messages",
    to: "/espace/messages",
  },
] as const;

const CHECKS = [
  "Confirmer votre email",
  "Compléter votre société et votre adresse de livraison",
  "Envoyer votre première demande",
  "Ajouter les coordonnées de vos fournisseurs",
  "Choisir vos notifications",
];

type Saved = { done: boolean; step: number };
type Phase =
  | null
  | { kind: "welcome" }
  | { kind: "resume"; step: number }
  | { kind: "skip" }
  | { kind: "coach"; step: number }
  | { kind: "end" };

function storageKey(email: string) {
  return `sp-tour:${email}`;
}

function legacyKey(email: string) {
  return `sp-tour-done:${email}`;
}

const LIVE = "sp-tour-live";

function readLive(): Phase | null {
  try {
    const raw = sessionStorage.getItem(LIVE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Phase;
    if (!parsed || typeof parsed !== "object" || !("kind" in parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLive(phase: Phase) {
  if (!phase) sessionStorage.removeItem(LIVE);
  else sessionStorage.setItem(LIVE, JSON.stringify(phase));
}

function readSaved(email: string): Saved {
  if (localStorage.getItem(legacyKey(email)) === "1") return { done: true, step: 0 };
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return { done: false, step: 0 };
    const parsed = JSON.parse(raw) as Partial<Saved>;
    const step = typeof parsed.step === "number" ? parsed.step : 0;
    return { done: parsed.done === true, step };
  } catch {
    return { done: false, step: 0 };
  }
}

function writeSaved(email: string, saved: Saved) {
  localStorage.setItem(storageKey(email), JSON.stringify(saved));
  if (saved.done) localStorage.setItem(legacyKey(email), "1");
  else localStorage.removeItem(legacyKey(email));
}

export function replayTour() {
  window.dispatchEvent(new Event("sp-tour-replay"));
}

export function useFirstStepsCount() {
  const clients = useAtelier((s) => s.clients);
  const docs = useAtelier((s) => s.docs);
  const [email, setEmail] = useState("");
  useEffect(() => {
    loadSession()
      .then((session) => setEmail(session.user?.email ?? ""))
      .catch(() => setEmail(""));
  }, []);
  if (!email) return 1;
  const mine = clients.find((client) => (client.email || "").trim().toLowerCase() === email.trim().toLowerCase());
  let count = 1;
  if (mine && (mine.legalName || "").trim() && (mine.address || "").trim()) count += 1;
  if (mine && docs.some((doc) => doc.clientId === mine.id)) count += 1;
  return count;
}

function Veil({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1A3D]/55 px-4" role="dialog" aria-modal="true">
      {children}
    </div>
  );
}

export function Tour() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<Phase>(null);
  const [box, setBox] = useState<DOMRect | null>(null);

  function go(next: Phase) {
    writeLive(next);
    setPhase(next);
  }

  useEffect(() => {
    let live = true;
    function openFor(address: string, fullName: string, force: boolean) {
      setEmail(address);
      setName(fullName.split(" ")[0] || fullName);
      if (force) {
        writeLive({ kind: "welcome" });
        setPhase({ kind: "welcome" });
        return;
      }
      const running = readLive();
      if (running) {
        setPhase(running);
        return;
      }
      const saved = readSaved(address);
      if (saved.done) {
        setPhase(null);
        return;
      }
      if (saved.step >= 1 && saved.step <= STEPS.length) setPhase({ kind: "resume", step: saved.step });
      else if (saved.step > STEPS.length) setPhase({ kind: "end" });
      else setPhase({ kind: "welcome" });
    }
    loadSession()
      .then((session) => {
        if (!live || !session.user || session.user.role !== "client") return;
        const force = sessionStorage.getItem("sp-tour-force") === "1";
        if (force) sessionStorage.removeItem("sp-tour-force");
        openFor(session.user.email, session.user.name, force);
      })
      .catch(() => {});
    function replay() {
      loadSession()
        .then((session) => {
          if (!live || !session.user || session.user.role !== "client") return;
          openFor(session.user.email, session.user.name, true);
        })
        .catch(() => {});
    }
    window.addEventListener("sp-tour-replay", replay);
    return () => {
      live = false;
      window.removeEventListener("sp-tour-replay", replay);
    };
  }, []);

  function remember(step: number) {
    if (!email) return;
    writeSaved(email, { done: false, step });
  }

  function start(step: number) {
    if (step >= 1 && step <= STEPS.length) {
      remember(step);
      const next = STEPS[step - 1];
      go({ kind: "coach", step });
      window.dispatchEvent(new Event("sp-nav-open"));
      const path = window.location.pathname;
      if (path !== next.to && !path.startsWith(`${next.to}/`)) void navigate({ to: next.to });
      return;
    }
    if (step > STEPS.length) {
      remember(STEPS.length + 1);
      go({ kind: "end" });
      return;
    }
    remember(0);
    go({ kind: "welcome" });
  }

  function finish() {
    if (email) writeSaved(email, { done: true, step: 0 });
    go(null);
  }

  const coachStep = phase?.kind === "coach" ? phase.step : 0;
  const target = coachStep ? STEPS[coachStep - 1].target : "";

  useLayoutEffect(() => {
    if (!target) {
      setBox(null);
      return;
    }
    window.dispatchEvent(new Event("sp-nav-open"));
    let frame = 0;
    const timers: number[] = [];
    const measure = () => {
      const nodes = [...document.querySelectorAll(`[data-tour="${target}"]`)];
      const el = nodes.find((node) => node instanceof HTMLElement && node.getBoundingClientRect().width > 8);
      if (!(el instanceof HTMLElement)) return;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        el.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
      setBox(el.getBoundingClientRect());
    };
    const ping = () => {
      window.dispatchEvent(new Event("sp-nav-open"));
      measure();
    };
    frame = requestAnimationFrame(measure);
    for (const delay of [0, 80, 240, 520]) timers.push(window.setTimeout(ping, delay));
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      for (const timer of timers) window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [target, pathname]);

  useEffect(() => {
    if (!phase) return;
    const current = phase;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (current.kind === "skip" || current.kind === "resume") go({ kind: "welcome" });
        else go({ kind: "skip" });
        return;
      }
      if (event.key !== "Enter") return;
      const tag = event.target instanceof HTMLElement ? event.target.tagName : "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      event.preventDefault();
      if (current.kind === "welcome") start(1);
      else if (current.kind === "skip") finish();
      else if (current.kind === "resume") start(current.step);
      else if (current.kind === "coach") start(current.step === STEPS.length ? STEPS.length + 1 : current.step + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!phase) return null;

  if (phase.kind === "welcome") {
    return (
      <Veil>
        <div className="flex w-full max-w-[560px] flex-col items-center gap-4 rounded-[26px] bg-white px-8 py-9 text-center">
          <img src="/illustrations/mascotte-ronde.svg" alt="" className="h-36 w-36" />
          <h2 className="display text-3xl">Bienvenue, {name}&nbsp;!</h2>
          <p className="text-base leading-relaxed text-muted">
            Votre espace est prêt. Trois minutes pour faire le tour, et vous saurez où tout se trouve.
          </p>
          <button className="btn btn-primary mt-1 w-full" type="button" onClick={() => start(1)}>
            Commencer la visite <ArrowRight size={18} />
          </button>
          <button className="btn btn-quiet w-full" type="button" onClick={() => go({ kind: "skip" })}>
            Passer, je verrai plus tard
          </button>
        </div>
      </Veil>
    );
  }

  if (phase.kind === "skip") {
    return (
      <Veil>
        <div className="flex w-full max-w-[480px] flex-col gap-4 rounded-[26px] bg-white p-8">
          <h2 className="display text-2xl">Passer le didacticiel&nbsp;?</h2>
          <p className="text-sm leading-relaxed text-muted">
            Vous pourrez le relancer à tout moment depuis le menu Aide. Vos premiers pas restent affichés sur le tableau de bord.
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" type="button" onClick={finish}>
              Passer
            </button>
            <button className="btn btn-quiet" type="button" onClick={() => start(1)}>
              Commencer la visite
            </button>
          </div>
        </div>
      </Veil>
    );
  }

  if (phase.kind === "resume") {
    const title = STEPS[phase.step - 1]?.title ?? "";
    return (
      <Veil>
        <div className="flex w-full max-w-[480px] flex-col gap-4 rounded-[26px] bg-white p-8">
          <h2 className="display text-2xl">Reprendre là où vous en étiez&nbsp;?</h2>
          <p className="text-sm leading-relaxed text-muted">
            Vous vous êtes arrêté à l’étape {phase.step} sur {STEPS.length}, «&nbsp;{title}&nbsp;».
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" type="button" onClick={() => start(phase.step)}>
              Reprendre
            </button>
            <button className="btn btn-quiet" type="button" onClick={() => start(1)}>
              Recommencer depuis le début
            </button>
          </div>
        </div>
      </Veil>
    );
  }

  if (phase.kind === "end") {
    return (
      <Veil>
        <div className="flex max-h-[calc(100vh-32px)] w-full max-w-[620px] flex-col gap-4 overflow-auto rounded-[26px] bg-white p-8">
          <div className="flex items-center gap-4">
            <img src="/illustrations/mascotte-badge.svg" alt="" className="h-20 w-20" />
            <div>
              <h2 className="display text-2xl">Vous êtes prêt.</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Vous pouvez relancer cette visite à tout moment depuis le menu Aide.
              </p>
            </div>
          </div>
          <FirstSteps />
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                finish();
                void navigate({ to: "/espace/demandes/nouvelle" });
              }}
            >
              Créer ma première demande <ArrowRight size={18} />
            </button>
            <button className="btn btn-quiet" type="button" onClick={() => go({ kind: "welcome" })}>
              Revoir le didacticiel
            </button>
          </div>
        </div>
      </Veil>
    );
  }

  const current = STEPS[phase.step - 1];
  const Icon = current.icon;
  const width = Math.min(380, (typeof window === "undefined" ? 1200 : window.innerWidth) - 32);
  const margin = 16;
  const viewW = typeof window === "undefined" ? 1200 : window.innerWidth;
  const viewH = typeof window === "undefined" ? 800 : window.innerHeight;
  let left = viewW - width - 32;
  let top = viewH - 300;
  if (box) {
    const beside = box.right + 18;
    if (beside + width <= viewW - margin) {
      left = beside;
      top = box.top;
    } else {
      left = Math.max(margin, Math.min(box.left, viewW - width - margin));
      top = box.bottom + 16;
    }
    if (top + 260 > viewH) top = Math.max(margin, box.top - 270);
  }
  left = Math.min(Math.max(margin, left), viewW - width - margin);
  top = Math.min(Math.max(margin, top), viewH - 220);
  const hole = box
    ? {
        top: Math.max(8, box.top - 8),
        left: Math.max(8, box.left - 8),
        width: box.width + 16,
        height: box.height + 16,
      }
    : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="tour-step-title">
      {hole ? (
        <>
          <div className="pointer-events-auto fixed bg-[#0E1A3D]/55" style={{ top: 0, left: 0, right: 0, height: hole.top }} />
          <div className="pointer-events-auto fixed bg-[#0E1A3D]/55" style={{ top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }} />
          <div className="pointer-events-auto fixed bg-[#0E1A3D]/55" style={{ top: hole.top, left: 0, width: hole.left, height: hole.height }} />
          <div className="pointer-events-auto fixed bg-[#0E1A3D]/55" style={{ top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }} />
          <div
            className="pointer-events-none fixed rounded-2xl"
            style={{
              top: hole.top,
              left: hole.left,
              width: hole.width,
              height: hole.height,
              boxShadow: "0 0 0 3px #fff, 0 0 0 6px #155DFC",
            }}
          />
        </>
      ) : (
        <div className="pointer-events-auto absolute inset-0 bg-[#0E1A3D]/45" />
      )}
      <div className="pointer-events-auto fixed z-10" style={{ top, left, width }}>
        <div className="flex flex-col gap-3 rounded-[20px] bg-white p-5 shadow-[0_28px_60px_-28px_rgba(14,26,61,0.6)]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#155DFC]">
            <Icon size={18} />
          </span>
          <p className="mono text-[11.5px] font-semibold text-[#155DFC]">Étape {phase.step} sur {STEPS.length}</p>
          <h3 id="tour-step-title" className="display text-xl">
            {current.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted">{current.body}</p>
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex gap-1.5">
              {STEPS.map((_, index) => (
                <span key={index} className={`h-1.5 w-1.5 rounded-full ${index === phase.step - 1 ? "bg-[#155DFC]" : "bg-[#CBD5E8]"}`} />
              ))}
            </div>
            <div className="flex gap-2">
              {phase.step > 1 ? (
                <button className="btn btn-quiet" type="button" onClick={() => start(phase.step - 1)}>
                  Précédent
                </button>
              ) : null}
              <button className="btn btn-primary" type="button" onClick={() => start(phase.step === STEPS.length ? STEPS.length + 1 : phase.step + 1)}>
                {phase.step === STEPS.length ? "Terminer la visite" : "Suivant"}
                {phase.step === STEPS.length ? null : <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FirstSteps() {
  const done = useFirstStepsCount();
  return (
    <section className="card flex flex-col gap-3" data-tour="premiers-pas">
      <div className="flex items-center gap-3">
        <img src="/illustrations/pastille.svg" alt="" className="h-12 w-12" />
        <div>
          <h3 className="display text-lg">Vos premiers pas</h3>
          <p className="text-xs text-muted">
            {done} sur 5 terminée{done > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#DCE3F2]">
        <div className="h-full bg-[#0E9F6E]" style={{ width: `${(done / 5) * 100}%` }} />
      </div>
      {CHECKS.map((label, index) => (
        <p key={label} className="flex items-center gap-2 text-sm">
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${index < done ? "bg-[#E3F6EC] text-[#1F8F55]" : "border border-[#DCE3F2] text-transparent"}`}
          >
            <Check size={12} />
          </span>
          {label}
        </p>
      ))}
    </section>
  );
}
