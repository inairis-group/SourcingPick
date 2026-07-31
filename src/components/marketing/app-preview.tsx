import { HugeiconsIcon } from "@hugeicons/react";
import {
  Factory01Icon,
  PackageIcon,
  SecurityCheckIcon,
  StoreManagement01Icon,
  WalletDoneIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

/**
 * Vector product renders for the dark stacking panels on the landing and
 * factories pages. Two variants, picked by breakpoint: a full desktop window
 * from `lg`, and a phone below it (see the Mobile section at the foot of this
 * file) — a desktop window shrunk to phone width is an illegible smudge.
 *
 * Everything here is markup — window chrome, sidebar, tables — rather than
 * screenshots. It stays crisp at any size, costs no image payload, and can't
 * silently drift out of date the way a captured screenshot does.
 *
 * These are built oversized on purpose. The caller anchors the frame to the
 * panel's inline-end edge and lets it run past it, so the panel's
 * `overflow-hidden` crops it — the window reads as a real screen continuing
 * beyond the card rather than a small picture sitting inside one. Nothing
 * here should be centred or scaled down to "fit".
 *
 * The frames sit on `bg-ink-deep` panels, so the screens use the light surface
 * tokens: a light app window against a near-black panel is what makes it read
 * as a screen. Marketing is pinned to the light palette (see `.theme-light`),
 * so those resolve light whatever theme the visitor has chosen for the app.
 *
 * All decorative — callers wrap these in `aria-hidden`, because the panel's
 * own heading and body already carry the meaning.
 */

const NAV = ["Dashboard", "Requests", "Quotes", "Orders", "Marketplace", "Invoices"] as const;

type NavItem = (typeof NAV)[number] | "Tenders" | "Certification" | "Settings";

export function DesktopFrame({
  children,
  active,
  path,
}: {
  children: React.ReactNode;
  active: NavItem;
  path: string;
}) {
  return (
    /* Fixed pixel width, not a percentage: the frame is meant to overflow its
       container and be cropped, so it must not reflow to fit. */
    <div className="bg-page w-[1040px] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15">
      <WindowChrome path={path} />
      <div className="flex h-[560px]">
        <Sidebar active={active} />
        <div className="min-w-0 flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

function WindowChrome({ path }: { path: string }) {
  return (
    <div className="border-line bg-subtle flex items-center gap-3 border-b px-4 py-3">
      <div className="flex items-center gap-1.5">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="border-line bg-page text-faint mx-auto flex h-7 w-[380px] items-center justify-center rounded-md border text-[11px]">
        {path}
      </div>
    </div>
  );
}

function Sidebar({ active }: { active: NavItem }) {
  const items: NavItem[] = [...NAV];
  if (!items.includes(active)) items.splice(1, 0, active);

  return (
    <aside className="border-line bg-subtle w-52 shrink-0 border-e p-4">
      <div className="mb-6 flex items-center gap-2">
        <span className="bg-action h-6 w-6 rounded-md" />
        <span className="text-headline text-[13px] font-bold tracking-tight">SourcingPick</span>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              "flex h-8 items-center rounded-md px-2.5 text-[12px] font-medium",
              item === active ? "bg-info-soft text-info font-semibold" : "text-muted",
            )}
          >
            {item}
          </span>
        ))}
      </nav>
    </aside>
  );
}

/* ---------------------------------------------------------------------------
 * Shared primitives
 * ------------------------------------------------------------------------ */

function PageHead({ title, kicker }: { title: string; kicker?: string }) {
  return (
    <div className="mb-5">
      {kicker && (
        <p className="text-faint font-mono text-[10px] tracking-wide uppercase">{kicker}</p>
      )}
      <p className="text-headline mt-1 text-[19px] font-bold tracking-tight">{title}</p>
    </div>
  );
}

const TILE = "rounded-xl border border-line bg-surface p-4";

function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "info";
}) {
  const tones = {
    neutral: "border-line bg-subtle text-muted",
    success: "border-success-edge bg-success-soft text-success",
    warning: "border-warning-edge bg-warning-soft text-warning",
    info: "border-info-edge bg-info-soft text-info",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-semibold tracking-wide uppercase",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function Bar({ w }: { w: string }) {
  return <span className="bg-line block h-2 rounded-full" style={{ width: w }} />;
}

function StatusDot({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
        done ? "border-success-edge bg-success-soft text-success" : "border-line bg-subtle",
      )}
    >
      {done ? (
        <HugeiconsIcon icon={SecurityCheckIcon} size={13} strokeWidth={2} />
      ) : (
        <span className="bg-faint h-1.5 w-1.5 rounded-full" />
      )}
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * Landing panels
 * ------------------------------------------------------------------------ */

/** Sourcing on demand — quotes lined up side by side for comparison. */
export function SourcingScreen() {
  const quotes = [
    { factory: "Shenzhen Acme Mfg", price: "€1.84", lead: "24 d", moq: "1 000", best: true },
    { factory: "Ningbo Rivet Co.", price: "€1.91", lead: "18 d", moq: "1 500", best: false },
    { factory: "Bursa Textile A.Ş.", price: "€2.05", lead: "12 d", moq: "500", best: false },
  ];
  return (
    <>
      <PageHead kicker="REQ-2214" title="Cotton tote bags · 5 000 u" />

      <div className="mb-4 flex items-center gap-3">
        <Chip tone="info">4 factories invited</Chip>
        <Chip tone="success">3 quotes in</Chip>
      </div>

      <div className="border-line overflow-hidden rounded-xl border">
        <div className="border-line bg-subtle text-faint grid grid-cols-12 gap-3 border-b px-4 py-2.5 text-[10px] font-semibold tracking-wide uppercase">
          <span className="col-span-5">Factory</span>
          <span className="col-span-2">Unit</span>
          <span className="col-span-2">Lead</span>
          <span className="col-span-2">MOQ</span>
          <span className="col-span-1" />
        </div>
        {quotes.map((q) => (
          <div
            key={q.factory}
            className={cn(
              "border-line grid grid-cols-12 items-center gap-3 border-b px-4 py-3.5 last:border-b-0",
              q.best && "bg-info-soft/40",
            )}
          >
            <span className="text-headline col-span-5 flex items-center gap-2 text-[12px] font-semibold">
              <span className="bg-info-soft text-info inline-flex h-6 w-6 items-center justify-center rounded-md">
                <HugeiconsIcon icon={Factory01Icon} size={12} strokeWidth={1.5} />
              </span>
              {q.factory}
            </span>
            <span className="text-headline col-span-2 font-mono text-[12px] font-semibold tabular-nums">
              {q.price}
            </span>
            <span className="text-muted col-span-2 text-[12px] tabular-nums">{q.lead}</span>
            <span className="text-muted col-span-2 text-[12px] tabular-nums">{q.moq}</span>
            <span className="col-span-1 flex justify-end">
              {q.best && <Chip tone="success">Best</Chip>}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="bg-action text-on-action flex h-9 items-center rounded-md px-4 text-[12px] font-semibold">
          Accept quote
        </span>
        <span className="border-line text-muted flex h-9 items-center rounded-md border px-4 text-[12px] font-semibold">
          Ask a question
        </span>
      </div>
    </>
  );
}

/** Marketplace — pre-negotiated stock, ordered in one click. */
export function MarketplaceScreen() {
  const items = [
    { name: "Kraft mailers", price: "€0.12", moq: "MOQ 2 000" },
    { name: "Enamel mugs", price: "€1.40", moq: "MOQ 500" },
    { name: "Canvas aprons", price: "€3.20", moq: "MOQ 300" },
    { name: "Cotton totes", price: "€1.84", moq: "MOQ 1 000" },
    { name: "Kraft boxes", price: "€0.34", moq: "MOQ 5 000" },
    { name: "Glass jars", price: "€0.88", moq: "MOQ 1 200" },
  ];
  return (
    <>
      <PageHead kicker="In stock · pre-negotiated" title="Marketplace" />

      <div className="mb-4 flex items-center gap-2">
        {["All", "Packaging", "Homeware", "Textile"].map((f, i) => (
          <span
            key={f}
            className={cn(
              "flex h-7 items-center rounded-full border px-3 text-[11px] font-medium",
              i === 0 ? "border-info-edge bg-info-soft text-info" : "border-line text-muted",
            )}
          >
            {f}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.name} className={cn(TILE, "flex flex-col gap-2")}>
            <div className="bg-subtle flex h-20 items-center justify-center rounded-lg">
              <HugeiconsIcon
                icon={PackageIcon}
                size={22}
                strokeWidth={1.5}
                className="text-faint"
              />
            </div>
            <p className="text-headline truncate text-[12px] font-semibold">{item.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-headline font-mono text-[12px] font-semibold tabular-nums">
                {item.price}
              </span>
              <span className="text-faint text-[10px]">{item.moq}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Certification — a dossier moving through the standards bodies. */
export function CertificationScreen() {
  const bodies = [
    { name: "Bureau Veritas", scope: "Quality management", done: true },
    { name: "AFNOR", scope: "Document review", done: true },
    { name: "SGS", scope: "On-site audit", done: false, active: true },
    { name: "LNE", scope: "Final certification", done: false },
  ];
  return (
    <>
      <PageHead kicker="ISO 9001 · dossier" title="Certification programme" />

      <div className={cn(TILE, "mb-4")}>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-headline text-[12px] font-semibold">Overall progress</span>
          <span className="text-headline font-mono text-[12px] tabular-nums">2 / 4</span>
        </div>
        <div className="bg-line h-2 overflow-hidden rounded-full">
          <span className="bg-action block h-full w-1/2" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {bodies.map((b) => (
          <div key={b.name} className={cn(TILE, "flex items-center gap-3")}>
            <StatusDot done={b.done} />
            <div className="min-w-0 flex-1">
              <p
                className={cn("text-[12px] font-semibold", b.done ? "text-headline" : "text-muted")}
              >
                {b.name}
              </p>
              <p className="text-faint text-[10px]">{b.scope}</p>
            </div>
            {b.active && <Chip tone="warning">In review</Chip>}
            {b.done && <Chip tone="success">Cleared</Chip>}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="bg-success-soft text-success inline-flex h-7 w-7 items-center justify-center rounded-md">
          <HugeiconsIcon icon={WalletDoneIcon} size={14} strokeWidth={1.5} />
        </span>
        <p className="text-faint text-[11px]">
          Audit fees held in escrow until each body signs off
        </p>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
 * Factories panels
 * ------------------------------------------------------------------------ */

/** Step 1 — KYC: registration, tax, facility documents. */
export function KycScreen() {
  const docs = [
    { label: "Business registration", hint: "PDF · 2.1 MB", done: true },
    { label: "Tax certificate", hint: "PDF · 640 KB", done: true },
    { label: "Facility photos", hint: "6 images required", done: false },
    { label: "Quality certifications", hint: "Optional", done: false },
  ];
  return (
    <>
      <PageHead kicker="Step 1" title="Verify your factory" />

      <div className={cn(TILE, "mb-4 flex items-center gap-3")}>
        <span className="bg-info-soft text-info inline-flex h-10 w-10 items-center justify-center rounded-lg">
          <HugeiconsIcon icon={Factory01Icon} size={18} strokeWidth={1.5} />
        </span>
        <div className="flex flex-1 flex-col gap-1.5">
          <Bar w="180px" />
          <Bar w="110px" />
        </div>
        <Chip tone="warning">Review pending</Chip>
      </div>

      <div className="flex flex-col gap-2">
        {docs.map((d) => (
          <div key={d.label} className={cn(TILE, "flex items-center gap-3")}>
            <StatusDot done={d.done} />
            <div className="min-w-0 flex-1">
              <p
                className={cn("text-[12px] font-semibold", d.done ? "text-headline" : "text-muted")}
              >
                {d.label}
              </p>
              <p className="text-faint text-[10px]">{d.hint}</p>
            </div>
            {!d.done && (
              <span className="border-line text-muted flex h-7 items-center rounded-md border px-3 text-[11px] font-semibold">
                Upload
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/** Step 2 — tender invitations matched to the factory's capabilities. */
export function TenderScreen() {
  const tenders = [
    { ref: "REQ-2214", item: "Cotton tote bags", qty: "5 000 u", fresh: true },
    { ref: "REQ-2209", item: "Enamel mugs", qty: "1 200 u", fresh: false },
    { ref: "REQ-2201", item: "Canvas aprons", qty: "800 u", fresh: false },
    { ref: "REQ-2198", item: "Kraft mailers", qty: "12 000 u", fresh: false },
  ];
  return (
    <>
      <PageHead kicker="Step 2" title="Tender invitations" />

      <div className="border-line overflow-hidden rounded-xl border">
        <div className="border-line bg-subtle text-faint grid grid-cols-12 gap-3 border-b px-4 py-2.5 text-[10px] font-semibold tracking-wide uppercase">
          <span className="col-span-3">Reference</span>
          <span className="col-span-5">Item</span>
          <span className="col-span-2">Quantity</span>
          <span className="col-span-2" />
        </div>
        {tenders.map((t) => (
          <div
            key={t.ref}
            className="border-line grid grid-cols-12 items-center gap-3 border-b px-4 py-3.5 last:border-b-0"
          >
            <span className="text-muted col-span-3 font-mono text-[11px]">{t.ref}</span>
            <span className="text-headline col-span-5 text-[12px] font-semibold">{t.item}</span>
            <span className="text-muted col-span-2 text-[12px] tabular-nums">{t.qty}</span>
            <span className="col-span-2 flex justify-end">
              {t.fresh ? <Chip tone="info">New</Chip> : <Chip>Open</Chip>}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="bg-subtle text-muted inline-flex h-7 w-7 items-center justify-center rounded-md">
          <HugeiconsIcon icon={StoreManagement01Icon} size={14} strokeWidth={1.5} />
        </span>
        <p className="text-faint text-[11px]">Or publish products straight to the marketplace</p>
      </div>
    </>
  );
}

/** Step 3 — the quote form: price, lead time, MOQ. */
export function QuoteScreen() {
  const fields = [
    { label: "Unit price", value: "€1.84", hint: "EXW, per unit" },
    { label: "Lead time", value: "24 days", hint: "From deposit" },
    { label: "Minimum order", value: "1 000 u", hint: "MOQ" },
    { label: "Incoterm", value: "FOB Shenzhen", hint: "Port of loading" },
  ];
  return (
    <>
      <PageHead kicker="Step 3 · REQ-2214" title="Submit your quote" />

      <div className="mb-4 grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.label} className={cn(TILE, "flex flex-col gap-1")}>
            <span className="text-faint text-[10px] font-semibold tracking-wide uppercase">
              {f.label}
            </span>
            <span className="text-headline font-mono text-[16px] font-semibold tabular-nums">
              {f.value}
            </span>
            <span className="text-faint text-[10px]">{f.hint}</span>
          </div>
        ))}
      </div>

      <div className={cn(TILE, "mb-4 flex items-center gap-3")}>
        <span className="bg-success-soft text-success inline-flex h-9 w-9 items-center justify-center rounded-lg">
          <HugeiconsIcon icon={WalletDoneIcon} size={16} strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <p className="text-headline text-[12px] font-semibold">Escrow-backed payment</p>
          <p className="text-faint text-[10px]">
            Buyer funds are held until you ship and delivery is confirmed
          </p>
        </div>
      </div>

      <span className="bg-action text-on-action flex h-10 w-40 items-center justify-center rounded-md text-[12px] font-semibold">
        Send quote
      </span>
    </>
  );
}

/** Step 4 — confirmed order, deposit funded, production underway. */
export function ProductionScreen() {
  const milestones = [
    { label: "Deposit funded", hint: "€18,420 held in escrow", done: true },
    { label: "In production", hint: "Started 4 days ago", done: true, active: true },
    { label: "QC inspection", hint: "Scheduled", done: false },
    { label: "Shipped", hint: "DAP · Geodis", done: false },
  ];
  return (
    <>
      <PageHead kicker="ORD-58127" title="Production underway" />

      <div className={cn(TILE, "mb-4")}>
        <div className="mb-3 flex items-center justify-between">
          <Chip tone="success">Escrow funded</Chip>
          <span className="text-headline font-mono text-[16px] font-semibold tabular-nums">
            €18,420
          </span>
        </div>
        <div className="bg-line h-2 overflow-hidden rounded-full">
          <span className="bg-action block h-full w-2/5" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {milestones.map((m) => (
          <div key={m.label} className={cn(TILE, "flex items-center gap-3")}>
            <StatusDot done={m.done} />
            <div className="min-w-0 flex-1">
              <p
                className={cn("text-[12px] font-semibold", m.done ? "text-headline" : "text-muted")}
              >
                {m.label}
              </p>
              <p className="text-faint text-[10px]">{m.hint}</p>
            </div>
            {m.active && <Chip tone="warning">Now</Chip>}
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
 * Mobile
 *
 * Below `lg` the desktop window is useless — scaled down far enough to fit a
 * phone it becomes an illegible smudge. So small screens get a real phone
 * frame instead, with a condensed version of the same screen.
 *
 * The content is data-driven rather than seven more bespoke components: at
 * 248px wide a screen is a title, an optional progress bar and a short list of
 * rows, so one parameterised component covers every panel.
 * ------------------------------------------------------------------------ */

type PhoneRow = {
  label: string;
  value?: string;
  hint?: string;
  done?: boolean;
  chip?: { text: string; tone: "neutral" | "success" | "warning" | "info" };
};

export type PhoneScreenData = {
  kicker: string;
  title: string;
  /** 0–1. Renders a progress bar with a "n / m" readout above the rows. */
  progress?: { value: number; label: string };
  rows: PhoneRow[];
  cta?: string;
};

export function PhoneScreen({ data }: { data: PhoneScreenData }) {
  return (
    /* Bezel + screen. The inner ring stops the near-black frame vanishing
       into the near-black panel behind it. */
    <div className="bg-ink-deep w-full rounded-[2.25rem] p-2.5 shadow-2xl ring-1 ring-white/20 ring-inset">
      <div className="bg-page relative overflow-hidden rounded-[1.85rem]">
        <div className="bg-ink-deep absolute start-1/2 top-2 h-4 w-16 -translate-x-1/2 rounded-full" />

        <div className="flex items-center justify-between px-4 pt-3 pb-3">
          <span className="text-headline text-[9px] font-semibold tabular-nums">9:41</span>
          <div className="text-headline flex items-center gap-1">
            <svg viewBox="0 0 16 10" className="h-2 w-3" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <rect
                  key={i}
                  x={i * 4}
                  y={7 - i * 2.2}
                  width="2.6"
                  height={3 + i * 2.2}
                  rx="0.8"
                  fill="currentColor"
                />
              ))}
            </svg>
            <svg viewBox="0 0 26 12" className="h-2 w-5" aria-hidden>
              <rect
                x="0.7"
                y="0.7"
                width="21"
                height="10.6"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.3"
                fill="none"
                opacity="0.5"
              />
              <rect x="2.4" y="2.4" width="15" height="7.2" rx="1.8" fill="currentColor" />
            </svg>
          </div>
        </div>

        <div className="px-3 pb-5">
          <div className="mb-3 px-1">
            <p className="text-faint font-mono text-[8px] tracking-wide uppercase">{data.kicker}</p>
            <p className="text-headline mt-0.5 text-[14px] font-bold tracking-tight">
              {data.title}
            </p>
          </div>

          {data.progress && (
            <div className="border-line bg-surface mb-2 rounded-xl border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-faint text-[9px] font-semibold">Progress</span>
                <span className="text-headline font-mono text-[9px] tabular-nums">
                  {data.progress.label}
                </span>
              </div>
              <div className="bg-line h-1.5 overflow-hidden rounded-full">
                <span
                  className="bg-action block h-full"
                  style={{ width: `${Math.round(data.progress.value * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            {data.rows.map((row) => (
              <div
                key={row.label}
                className="border-line bg-surface flex items-center gap-2.5 rounded-xl border p-2.5"
              >
                {row.done !== undefined && (
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      row.done
                        ? "border-success-edge bg-success-soft text-success"
                        : "border-line bg-subtle",
                    )}
                  >
                    {row.done ? (
                      <HugeiconsIcon icon={SecurityCheckIcon} size={10} strokeWidth={2} />
                    ) : (
                      <span className="bg-faint h-1 w-1 rounded-full" />
                    )}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-[11px] font-semibold",
                      row.done === false ? "text-faint" : "text-headline",
                    )}
                  >
                    {row.label}
                  </p>
                  {row.hint && <p className="text-faint truncate text-[9px]">{row.hint}</p>}
                </div>

                {row.value && (
                  <span className="text-headline shrink-0 font-mono text-[11px] font-semibold tabular-nums">
                    {row.value}
                  </span>
                )}
                {row.chip && <Chip tone={row.chip.tone}>{row.chip.text}</Chip>}
              </div>
            ))}
          </div>

          {data.cta && (
            <div className="bg-action mt-2.5 flex h-8 items-center justify-center rounded-lg">
              <span className="text-on-action text-[11px] font-semibold">{data.cta}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Landing panels */

export const SOURCING_PHONE: PhoneScreenData = {
  kicker: "REQ-2214",
  title: "Cotton tote bags",
  rows: [
    { label: "Shenzhen Acme Mfg", value: "€1.84", hint: "24 d · MOQ 1 000" },
    { label: "Ningbo Rivet Co.", value: "€1.91", hint: "18 d · MOQ 1 500" },
    { label: "Bursa Textile A.Ş.", value: "€2.05", hint: "12 d · MOQ 500" },
  ],
  cta: "Compare quotes",
};

export const MARKETPLACE_PHONE: PhoneScreenData = {
  kicker: "In stock",
  title: "Marketplace",
  rows: [
    { label: "Kraft mailers", value: "€0.12", hint: "MOQ 2 000" },
    { label: "Enamel mugs", value: "€1.40", hint: "MOQ 500" },
    { label: "Canvas aprons", value: "€3.20", hint: "MOQ 300" },
    { label: "Cotton totes", value: "€1.84", hint: "MOQ 1 000" },
  ],
};

export const CERTIFICATION_PHONE: PhoneScreenData = {
  kicker: "ISO 9001",
  title: "Certification",
  progress: { value: 0.5, label: "2 / 4" },
  rows: [
    { label: "Bureau Veritas", done: true },
    { label: "AFNOR", done: true },
    {
      label: "SGS",
      done: false,
      chip: { text: "Review", tone: "warning" },
    },
    { label: "LNE", done: false },
  ],
};

/* Factories panels */

export const KYC_PHONE: PhoneScreenData = {
  kicker: "Step 1",
  title: "Verify your factory",
  rows: [
    { label: "Business registration", hint: "PDF · 2.1 MB", done: true },
    { label: "Tax certificate", hint: "PDF · 640 KB", done: true },
    { label: "Facility photos", hint: "6 images", done: false },
  ],
};

export const TENDER_PHONE: PhoneScreenData = {
  kicker: "Step 2",
  title: "Tender invitations",
  rows: [
    {
      label: "Cotton tote bags",
      hint: "REQ-2214 · 5 000 u",
      chip: { text: "New", tone: "info" },
    },
    { label: "Enamel mugs", hint: "REQ-2209 · 1 200 u" },
    { label: "Canvas aprons", hint: "REQ-2201 · 800 u" },
  ],
  cta: "Submit a quote",
};

export const QUOTE_PHONE: PhoneScreenData = {
  kicker: "Step 3 · REQ-2214",
  title: "Submit your quote",
  rows: [
    { label: "Unit price", value: "€1.84", hint: "EXW, per unit" },
    { label: "Lead time", value: "24 d", hint: "From deposit" },
    { label: "Minimum order", value: "1 000", hint: "MOQ" },
  ],
  cta: "Send quote",
};

export const PRODUCTION_PHONE: PhoneScreenData = {
  kicker: "ORD-58127",
  title: "Production",
  progress: { value: 0.4, label: "€18,420" },
  rows: [
    { label: "Deposit funded", done: true },
    {
      label: "In production",
      done: true,
      chip: { text: "Now", tone: "warning" },
    },
    { label: "QC inspection", done: false },
    { label: "Shipped", done: false },
  ],
};
