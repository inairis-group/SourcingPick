import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { paperLabels, toPaper, type Client, type Company, type Document } from "@/lib/docs";
import { marks } from "@/components/marks";
import { useAtelier } from "@/lib/store";

function Seal({ text }: { text: string }) {
  const ring = [...(text || "杭州起源缨科技信息有限公司")];
  const radius = 48;
  return (
    <svg className="seal" viewBox="0 0 140 140" aria-hidden="true">
      <circle cx="70" cy="70" r="66" fill="#fff" stroke="currentColor" strokeWidth="3.6" />
      <circle cx="70" cy="70" r="58.5" fill="none" stroke="currentColor" strokeWidth="1.15" />
      {ring.map((char, index) => {
        const angle = -90 - 96 + ((index + 0.5) * 192) / ring.length;
        const rad = (angle * Math.PI) / 180;
        const x = 70 + Math.cos(rad) * radius;
        const y = 70 + Math.sin(rad) * radius;
        return (
          <text
            key={`${index}-${char}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="currentColor"
            fontSize="9"
            fontWeight="700"
            fontFamily='"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
            transform={`rotate(${angle + 90} ${x} ${y})`}
          >
            {char}
          </text>
        );
      })}
      <path
        d="M70 46.2 74.2 55.2 84 56.2 76.6 62.6 78.7 72.2 70 67.4 61.3 72.2 63.4 62.6 56 56.2 65.8 55.2Z"
        fill="currentColor"
      />
      <text
        x="70"
        y="90"
        textAnchor="middle"
        fill="currentColor"
        fontSize="11"
        fontWeight="700"
        fontFamily='"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
      >
        合同专用章
      </text>
    </svg>
  );
}

function SignatureSpace({ doc }: { doc: Document }) {
  const signed = doc.kind === "devis" ? doc.signature : undefined;
  const copy = paperLabels(doc.lang);
  const en = doc.lang === "en";
  const when = signed?.at
    ? new Date(signed.at).toLocaleString(en ? "en-GB" : "fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Paris" })
    : "";
  const rows = signed
    ? [
        { label: en ? "Signed on" : "Signé le", value: when && when !== "Invalid Date" ? when : signed.at },
        { label: en ? "Signer" : "Signataire", value: signed.name },
        { label: en ? "Role" : "Fonction", value: signed.role || "" },
        { label: en ? "Company" : "Société", value: signed.company || "" },
        { label: "Email", value: signed.email || "" },
        { label: en ? "IP address" : "Adresse IP", value: signed.ip || "" },
        { label: en ? "Connection" : "Lieu de connexion", value: signed.place || "" },
        { label: en ? "Browser" : "Navigateur", value: signed.browser || "" },
        { label: en ? "Device" : "Appareil", value: signed.ua || "", wide: true },
      ].filter((row) => row.value)
    : [];
  return (
    <section className="e-sign">
      <p className="e-sign-kicker">{copy.signKicker}</p>
      <p className="e-sign-title">{copy.signTitle}</p>
      <p className="e-sign-note">{copy.signNote}</p>
      {rows.length ? (
        <dl className="e-sign-facts">
          {rows.map((row) => (
            <div key={row.label} className={row.wide ? "wide" : ""}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {signed?.image ? (
        <div className="e-sign-pad">
          <img src={signed.image} alt="" />
        </div>
      ) : null}
    </section>
  );
}

function Rich({ text }: { text: string }) {
  const parts = String(text ?? "").split(/(https?:\/\/\S+)/g);
  const nodes: ReactNode[] = parts.map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <a key={index} href={part} className="doc-link">
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
  return <>{nodes}</>;
}

function DotField({ cols, rows, x, y, dx, dy, r }: { cols: number; rows: number; x: number; y: number; dx: number; dy: number; r: number }) {
  const dots = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      dots.push(<circle key={`${col}-${row}`} cx={x + col * dx} cy={y + row * dy} r={r} fill="#8DB2FF" />);
    }
  }
  return <>{dots}</>;
}

export function Paper({ doc, company: givenCompany, client: givenClient }: { doc: Document; company?: Company; client?: Client | null }) {
  const storedCompany = useAtelier((s) => s.company);
  const storedClient = useAtelier((s) => s.clients.find((c) => c.id === doc.clientId));
  const company = givenCompany ?? storedCompany;
  const client = givenClient === undefined ? storedClient : givenClient ?? undefined;
  const model = toPaper(doc, company, client);
  const copy = paperLabels(doc.lang);
  const font = paperFont(doc.font);

  return (
    <article className="paper" data-font={font}>
      <svg className="paper-deco paper-deco-top" viewBox="0 0 794 168" preserveAspectRatio="none" aria-hidden="true">
        <path fill="#EEF3FF" d="M0 0H794V92C640 150 520 28 392 62 250 100 140 148 0 108Z" />
        <path fill="#DCE7FF" d="M0 0H794V48C620 96 500 8 360 36 230 62 130 98 0 64Z" />
        <DotField cols={7} rows={4} x={22} y={20} dx={16} dy={15} r={3.1} />
      </svg>
      <header className="paper-head">
        <img className="paper-logo" src="/illustrations/logo.svg" alt="SourcingPick" />
        <div className="paper-title">
          <h1>
            {model.title}
            {model.kicker ? <span>{model.kicker}</span> : null}
          </h1>
          <p className="paper-num">{model.number}</p>
          {model.headline ? <p className="paper-headline">{model.headline}</p> : null}
        </div>
      </header>

      <div className="parties">
        <div className="party">
          <p className="party-name">{model.issuerName}</p>
          <p className="party-brand">{model.issuerBrand}</p>
          <p className="party-zh">{model.issuerZh}</p>
          {model.issuerLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="party party-right">
          <p className="party-name">{model.clientName}</p>
          {model.clientLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>

      <dl className="meta">
        {model.meta.map((row) => (
          <div key={row.label} className="contents">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      <table className="doc-table">
        <colgroup>
          <col className="c-code" />
          <col className="c-desc" />
          <col className="c-unit" />
          <col className="c-qty" />
          <col className="c-price" />
          <col className="c-vat" />
          <col className="c-amt" />
        </colgroup>
        <thead>
          <tr>
            <th>#</th>
            <th>{copy.designation}</th>
            <th>{copy.unit}</th>
            <th className="num">{copy.qty}</th>
            <th className="num">{copy.price}</th>
            <th className="num">{copy.vat}</th>
            <th className="num">{copy.amount}</th>
          </tr>
        </thead>
        <tbody>
          {model.lines.length === 0 ? (
            <tr>
              <td colSpan={7}>{copy.empty}</td>
            </tr>
          ) : (
            model.lines.map((line) => (
              <tr key={line.key}>
                <td className="doc-code">{line.code}</td>
                <td>
                  <div className="doc-desc">
                    {line.images.length ? (
                      <div className="doc-photos">
                        {line.images.map((src, index) => (
                          <img key={`${line.key}-${index}`} className="doc-photo" src={src} alt="" />
                        ))}
                      </div>
                    ) : null}
                    <div>
                      <p className="doc-name">{line.title}</p>
                      {line.material ? <p className="doc-material">{line.material}</p> : null}
                      {line.bullets.map((b, index) => (
                        <p key={`${line.key}-${index}`} className="doc-detail">
                          {marks(b)}
                        </p>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="unit">{line.unit}</td>
                <td className="num">{line.qty}</td>
                <td className="num">{line.unitPrice}</td>
                <td className="num">{line.vat}</td>
                <td className="num">{line.amount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="totals">
        {model.totals.map((row, index) => (
          <div key={`${row.label}-${index}`} className={`total-row ${row.tone}${row.rule ? " rule" : ""}`}>
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>

      <div className="end-grid">
        <section className="pay-plain">
          <h3>{copy.payment}</h3>
          {model.payment.map((line) => (
            <p key={line.text} className={`pay-${line.tone}`}>
              {line.text}
            </p>
          ))}
        </section>
        <section className="terms-box">
          <h3>{copy.terms}</h3>
          {model.conditions.map((line) => (
            <p key={line}>
              <Rich text={line} />
            </p>
          ))}
          {model.vatNote ? (
            <p className="vat-note">
              <Rich text={model.vatNote} />
            </p>
          ) : null}
        </section>
        <div className="seal-side">
          <Seal text={model.issuerZh} />
        </div>
      </div>

      <div className={doc.kind === "devis" ? "paper-close paper-close-break" : "paper-close"}>
        {doc.kind === "devis" ? <SignatureSpace doc={doc} /> : null}
        <div className="paper-grow" />
        <footer className="paper-foot">
          <p>Document généré par Sourcing Pick · sourcingpick.com</p>
          <p>Document numérique : régénéré à chaque consultation depuis votre espace client.</p>
        </footer>
      </div>
      <svg className="paper-deco paper-deco-bot" viewBox="0 0 794 168" preserveAspectRatio="none" aria-hidden="true">
        <path fill="#EEF3FF" d="M0 168H794V78C640 22 500 128 360 102 230 78 130 36 0 72Z" />
        <path fill="#DCE7FF" d="M0 168H794V112C630 78 500 140 350 122 220 106 120 88 0 108Z" />
        <DotField cols={8} rows={3} x={36} y={112} dx={16} dy={15} r={3.1} />
        <circle cx="688" cy="86" r="52" fill="none" stroke="#D6E4FF" strokeWidth="11" />
      </svg>
    </article>
  );
}

const PAPER_W = 794;

const FONTS = [
  { id: "onest", label: "Onest" },
  { id: "baskerville", label: "Baskerville" },
  { id: "newsreader", label: "Newsreader" },
  { id: "nunito", label: "Nunito" },
  { id: "caveat", label: "Manuscrite" },
] as const;

export function paperFont(value?: string) {
  return FONTS.some((item) => item.id === value) ? value! : "onest";
}

export function PaperView({ doc, onFont }: { doc: Document; onFont?: (font: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ scale: 1, height: 1123 });
  const [font, setFont] = useState(paperFont(doc.font));

  useEffect(() => setFont(paperFont(doc.font)), [doc.font]);

  useLayoutEffect(() => {
    const hostEl = host.current;
    const sheetEl = sheet.current;
    if (!hostEl || !sheetEl) return;
    const measure = () => {
      const scale = Math.min(1, hostEl.clientWidth / PAPER_W);
      setBox({ scale: scale || 1, height: Math.ceil(sheetEl.offsetHeight * (scale || 1)) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hostEl);
    ro.observe(sheetEl);
    return () => ro.disconnect();
  }, [doc, font]);

  return (
    <div ref={host} className="paper-view">
      <div className="mb-3 flex flex-wrap gap-2">
        {FONTS.map((item) => (
          <button
            key={item.id}
            className={`btn ${font === item.id ? "btn-primary" : "btn-quiet"}`}
            type="button"
            onClick={() => {
              setFont(item.id);
              onFont?.(item.id);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="paper-scale" style={{ height: box.height }}>
        <div ref={sheet} className="paper-sheet" style={{ transform: `scale(${box.scale})` }}>
          <Paper doc={{ ...doc, font }} />
        </div>
      </div>
    </div>
  );
}