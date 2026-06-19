import { HugeiconsIcon } from "@hugeicons/react";
import { Factory01Icon, GlobeIcon, ShoppingBag01Icon } from "@hugeicons/core-free-icons";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * About-page "Where we work" composition — stylized network of
 * sourcing hubs (left) and buyer destinations (right), connected by
 * curved dashed routes that draw themselves on mount.
 *
 * Intentionally NOT a real world map — geography is approximate;
 * the point is the narrative ("we operate across continents") and a
 * confident visual element on a page that otherwise reads text-heavy.
 *
 * Region copy lives in `dict.about.whereWeWork.*`; the country list
 * is in this file so a partner can rearrange without touching i18n.
 */
export function WhereWeWork({ dict }: { dict: Dictionary }) {
  const t = dict.about.whereWeWork;

  // Left column = sourcing hubs (factories we work with).
  const HUBS = [
    { code: "CN", city: "Shenzhen · Yiwu" },
    { code: "VN", city: "Ho Chi Minh" },
    { code: "IN", city: "Jaipur · Mumbai" },
    { code: "TR", city: "Bursa · Istanbul" },
  ];

  // Right column = buyer destinations.
  const DESTINATIONS = [
    { code: "FR", city: "Paris · Lyon" },
    { code: "DE", city: "Berlin · Munich" },
    { code: "ES", city: "Madrid · Barcelona" },
    { code: "IT", city: "Milan · Rome" },
    { code: "NL", city: "Amsterdam · Rotterdam" },
    { code: "BE", city: "Brussels · Antwerp" },
  ];

  return (
    <section className="bg-page border-y border-line-subtle">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl mb-10 lg:mb-14 animate-fade-up">
          <p className="text-xs font-medium tracking-wide uppercase text-brand-700 mb-3">
            {t.eyebrow}
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-headline tracking-tight">
            {t.title}
          </h2>
          <p className="mt-4 text-base text-muted leading-relaxed max-w-prose">
            {t.body}
          </p>
        </div>

        <div className="relative rounded-xl border border-line bg-surface overflow-hidden">
          {/* Soft brand aura + dot grid behind the network. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-br from-brand-50/40 via-transparent to-brand-50/30 pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(var(--color-line-strong) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] gap-6 lg:gap-10 p-6 lg:p-10 min-h-92">
            {/* Sourcing hubs */}
            <div className="flex flex-col gap-3 relative z-10">
              <ColumnHeader
                icon={Factory01Icon}
                label={t.hubsLabel}
                accent="brand"
              />
              <ul className="flex flex-col gap-2.5">
                {HUBS.map((h, i) => (
                  <li
                    key={h.code}
                    className="animate-fade-up"
                    style={{ animationDelay: `${100 + i * 60}ms` }}
                  >
                    <RegionNode code={h.code} city={h.city} side="left" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Connector column — SVG route lines. Hidden on small
                screens where the two columns stack vertically. */}
            <div
              aria-hidden
              className="hidden md:block relative"
            >
              <RouteLines hubs={HUBS.length} destinations={DESTINATIONS.length} />
            </div>

            {/* Buyer destinations */}
            <div className="flex flex-col gap-3 relative z-10">
              <ColumnHeader
                icon={ShoppingBag01Icon}
                label={t.destinationsLabel}
                accent="neutral"
              />
              <ul className="flex flex-col gap-2.5">
                {DESTINATIONS.map((d, i) => (
                  <li
                    key={d.code}
                    className="animate-fade-up"
                    style={{ animationDelay: `${180 + i * 50}ms` }}
                  >
                    <RegionNode code={d.code} city={d.city} side="right" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer strip — meta info. */}
          <div className="relative border-t border-line-subtle px-6 lg:px-10 py-4 flex items-center justify-between gap-3 flex-wrap text-xs text-muted">
            <span className="inline-flex items-center gap-2">
              <HugeiconsIcon icon={GlobeIcon} size={14} strokeWidth={1.5} />
              {t.footerLeft}
            </span>
            <span>{t.footerRight}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ColumnHeader({
  icon,
  label,
  accent,
}: {
  icon: typeof Factory01Icon;
  label: string;
  accent: "brand" | "neutral";
}) {
  return (
    <p
      className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-1 ${
        accent === "brand" ? "text-brand-700" : "text-headline"
      }`}
    >
      <span
        className={`inline-flex items-center justify-center h-5 w-5 rounded-sm ${
          accent === "brand"
            ? "bg-brand-600 text-on-action"
            : "bg-headline text-on-action"
        }`}
      >
        <HugeiconsIcon icon={icon} size={11} strokeWidth={1.75} />
      </span>
      {label}
    </p>
  );
}

function RegionNode({
  code,
  city,
  side,
}: {
  code: string;
  city: string;
  side: "left" | "right";
}) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-lg border border-line bg-page px-3 py-2 shadow-sm ${
        side === "left" ? "" : "flex-row-reverse text-end"
      }`}
    >
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700 text-xs font-bold font-mono tabular-nums">
        {code}
      </span>
      <span className="text-sm font-medium text-fg truncate">{city}</span>
    </div>
  );
}

/**
 * The connecting routes between hubs and destinations. Draws curved
 * SVG paths from each hub anchor to each destination anchor, brand
 * dashed strokes, with a one-shot draw-on-mount animation.
 *
 * The exact y-coordinates of the anchors depend on the rendered
 * heights of the nodes which we don't know server-side — we
 * approximate based on the relative position in each column. Reads
 * cleanly because lines are dashed; minor misalignment is invisible.
 */
function RouteLines({
  hubs,
  destinations,
}: {
  hubs: number;
  destinations: number;
}) {
  // Build a (hub × destination) cross-product of paths. Each path is
  // a smooth cubic Bézier from (0, hubY) to (1, destY) with the
  // control points pushed inward so the curves bend toward the
  // middle of the column.
  const paths: string[] = [];
  for (let h = 0; h < hubs; h++) {
    const hy = ((h + 0.5) / hubs) * 100;
    for (let d = 0; d < destinations; d++) {
      const dy = ((d + 0.5) / destinations) * 100;
      paths.push(`M0,${hy} C40,${hy} 60,${dy} 100,${dy}`);
    }
  }
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
    >
      <defs>
        <linearGradient id="route-line-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-brand-600)" stopOpacity="0.45" />
          <stop offset="50%" stopColor="var(--color-brand-700)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--color-brand-600)" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="url(#route-line-gradient)"
          strokeWidth="0.4"
          strokeDasharray="2 2"
          className="route-line"
          style={{ animationDelay: `${500 + i * 20}ms` }}
        />
      ))}
    </svg>
  );
}
