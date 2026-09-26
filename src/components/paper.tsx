import { useId } from "react";
import { toPaper, type Document } from "@/lib/docs";
import { useAtelier } from "@/lib/store";
import { Mark } from "@/components/logo";

export function Paper({ doc }: { doc: Document }) {
  const company = useAtelier((s) => s.company);
  const client = useAtelier((s) => s.clients.find((c) => c.id === doc.clientId));
  const model = toPaper(doc, company, client);
  const sealId = useId().replace(/:/g, "");

  return (
    <article className="paper">
      <header className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="paper-dots" aria-hidden="true" />
          <div className="paper-brand">
            <Mark className="h-9 w-9" />
            <span>SourcingPick</span>
          </div>
        </div>
        <div className="paper-title">
          <h1>
            {model.title}
            {model.kicker ? <span className="mt-1 block text-[0.72em]">{model.kicker}</span> : null}
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
          <div className="h-2" />
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
        <thead>
          <tr>
            <th>#</th>
            <th>Désignation et description</th>
            <th>Unité</th>
            <th className="num">Quantité</th>
            <th className="num">Prix u.</th>
            <th className="num">TVA</th>
            <th className="num">Montant</th>
          </tr>
        </thead>
        <tbody>
          {model.lines.length === 0 ? (
            <tr>
              <td colSpan={7}>Aucune ligne pour le moment.</td>
            </tr>
          ) : (
            model.lines.map((line) => (
              <tr key={line.key}>
                <td className="doc-code">{line.code}</td>
                <td>
                  <div className="doc-desc">
                    {line.image ? <img className="doc-photo" src={line.image} alt="" /> : null}
                    <div>
                      <p className="doc-name">{line.title}</p>
                      {line.material ? <p className="doc-material">{line.material}</p> : null}
                      {line.bullets.length > 0 ? (
                        <ul className="doc-bullets">
                          {line.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td>{line.unit}</td>
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
        {model.totals.map((row) => (
          <div key={row.label} className={`total-row ${row.tone === "plain" ? "" : row.tone}`}>
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>

      <div className="end-grid">
        <section className="note-card">
          <h3>Règlement</h3>
          {model.payment.map((line, i) => (
            <p key={line} className={i === 0 ? "pay-strong" : undefined}>
              {line}
            </p>
          ))}
        </section>
        <section className="note-card">
          <h3>Conditions</h3>
          <ul>
            {model.conditions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {model.vatNote ? <p className="vat-note">{model.vatNote}</p> : null}
        </section>
        <section className="seal-box">
          <svg className="seal" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path id={`${sealId}-arc`} d="M60 60 m-40 0 a40 40 0 1 1 80 0" />
            </defs>
            <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="1" />
            <text fill="currentColor" fontSize="7.2" fontFamily="Noto Sans SC, sans-serif">
              <textPath href={`#${sealId}-arc`} startOffset="50%" textAnchor="middle">
                {model.issuerZh || "杭州起源缨科技信息有限公司"}
              </textPath>
            </text>
            <path
              d="M60 40.5 63.4 48l7.8.8-5.9 5.2 1.7 7.6L60 57.8 52.9 61.6l1.8-7.6-5.9-5.2 7.8-.8Z"
              fill="currentColor"
            />
            <text x="60" y="78" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="Noto Sans SC, sans-serif">
              合同专用章
            </text>
          </svg>
          <p className="seal-title">{model.sealTitle}</p>
          <p className="seal-hint">{model.sealHint}</p>
        </section>
      </div>

      <footer className="paper-foot">
        <p>Document généré par Sourcing Pick · sourcingpick.com</p>
        <p>Document numérique : régénéré à chaque consultation depuis votre espace.</p>
      </footer>
      <span className="dots-bottom" aria-hidden="true" />
    </article>
  );
}
