import type { ReactNode } from "react";

export function Hero({
  kicker,
  title,
  text,
  art = "/illustrations/entrepot-navire.svg",
  children,
}: {
  kicker: string;
  title: string;
  text: string;
  art?: string;
  children?: ReactNode;
}) {
  return (
    <section className="sp-hero">
      <div className="sp-hero-copy">
        <span className="sp-kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{text}</p>
        {children ? <div className="sp-hero-actions">{children}</div> : null}
      </div>
      <img src={art} alt="" />
    </section>
  );
}

export function Stat({
  label,
  value,
  unit,
  hint,
  icon,
  tone = "#EEF3FF",
  ink = "#155DFC",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  icon?: ReactNode;
  tone?: string;
  ink?: string;
}) {
  return (
    <article className="sp-stat">
      <header>
        <p>{label}</p>
        {icon ? (
          <span className="sp-ico" style={{ background: tone, color: ink }}>
            {icon}
          </span>
        ) : null}
      </header>
      <div className="sp-stat-num">
        <strong>{value}</strong>
        {unit ? <b>{unit}</b> : null}
        {hint ? <em>{hint}</em> : null}
      </div>
      <i />
    </article>
  );
}

export function Bars({ rows }: { rows: Array<{ label: string; count: number; tone?: string }> }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <ul className="sp-bars">
      {rows.map((row) => (
        <li key={row.label}>
          <span>{row.label}</span>
          <b>
            <i style={{ width: `${Math.max(6, Math.round((row.count / max) * 100))}%`, background: row.tone ?? "#155DFC" }} />
          </b>
          <em>{row.count}</em>
        </li>
      ))}
    </ul>
  );
}

export function CubeFace({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" aria-hidden="true">
      <circle cx="19" cy="19" r="19" fill="#EEF3FF" />
      <polygon points="19,8 30,14 19,20 8,14" fill="#8DB2FF" />
      <polygon points="8,14 19,20 19,31 8,25" fill="#3D7BFF" />
      <polygon points="30,14 19,20 19,31 30,25" fill="#1A55E6" />
      <polygon points="14,11 22,15.5 19,17.2 11,12.7" fill="#FFC247" />
    </svg>
  );
}