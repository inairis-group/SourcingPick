import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";
import { directionFor, type Locale } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/seo/site";
import { freightCopy } from "@/content/freight/simulator";
import { formatAmount, formatKg, formatMoney } from "@/lib/freight/format";
import { formatNumber } from "@/lib/i18n/formatters";
import type { FreightEstimate, FreightRequest } from "@/lib/freight/estimate";

/**
 * What the freight simulator (/livraisons) promised: the price, or the quote
 * request when the card has no price for it. Sent to the visitor in their
 * language, and to the team (in French, with the visitor's details) so it can
 * be followed up.
 */

type Ok = Extract<FreightEstimate, { ok: true }>;

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

function countryName(iso: string, lang: Locale): string {
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(iso) ?? iso;
  } catch {
    return iso;
  }
}

export default function FreightEstimateEmail({
  estimate,
  request,
  lang,
  lead,
}: {
  estimate: Ok;
  request: FreightRequest;
  lang: Locale;
  /** For the team's copy: who asked, and in which language. */
  lead?: { email: string; name: string; phone: string; lang: Locale };
}) {
  const c = freightCopy(lang);
  const n = (v: number, digits = 2) => formatNumber(v, lang, { maximumFractionDigits: digits });
  const m3 = (v: number) => `${formatNumber(v, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³`;
  const w = estimate.weights;
  const a = request.address;
  const total = estimate.priced ? formatMoney(estimate.total, lang) : "";
  const signupUrl = `${getSiteUrl()}/inscription`;
  const productName = (name: string, i: number) => name || fill(c.products.item, { n: i + 1 });
  // A container's cartons may come without their dimensions: no weights then.
  const measured = w.real > 0;
  const rows: [string, string][] = [
    [c.email.summary.mode, c.mode.names[request.mode]],
    ...(estimate.line ? [[c.email.summary.line, c.lines.names[estimate.line]] as [string, string]] : []),
    ...(request.container
      ? [[c.email.summary.container, `${n(request.container.count, 0)} × ${c.container.types[request.container.type]}`] as [string, string]]
      : []),
    [c.email.summary.formula, c.formula.names[request.formula]],
    [c.email.summary.address, [a.street, [a.postcode, a.city].filter(Boolean).join(" "), countryName(a.country, lang)].filter(Boolean).join(", ")],
    ...((measured
      ? [
          [c.email.summary.cartons, `${n(w.cartons, 0)} · ${m3(w.volume)}`],
          [c.email.summary.real, formatKg(w.real, lang)],
          [c.email.summary.volumetric, formatKg(w.volumetric, lang)],
          [
            c.email.summary.chargeable,
            formatKg(w.chargeable, lang) + (estimate.billedKg > w.chargeable ? ` → ${fill(c.calc.billed, { kg: n(estimate.billedKg, 1) })}` : ""),
          ],
        ]
      : [[c.email.summary.cartons, n(w.cartons, 0)]]) as [string, string][]),
    ...(estimate.bracket
      ? [[c.email.summary.bracket, `${estimate.bracket} kg` + (estimate.priced ? ` · ${n(estimate.rate)} RMB/kg` : "")] as [string, string]]
      : []),
    [c.email.summary.delay, c.estimate.delays[estimate.line ?? request.mode]],
  ];
  const cell = { color: "#1f2937", fontSize: "14px", lineHeight: "20px", margin: 0, padding: "6px 0" } as const;

  return (
    <Html lang={lang} dir={directionFor(lang)}>
      <Head />
      <Preview>{estimate.priced ? `${c.email.heading} — ${total}` : c.email.headingQuote}</Preview>
      <Body style={{ backgroundColor: "#f6f7f9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", margin: 0, padding: "24px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", maxWidth: "600px", padding: "32px" }}>
          {lead && (
            <Text style={{ ...cell, backgroundColor: "#EEF3FF", borderRadius: "6px", padding: "10px 12px", marginBottom: "16px" }}>
              Demande du simulateur : {lead.name || "(nom non indiqué)"} · {lead.email}
              {lead.phone ? ` · ${lead.phone}` : ""} (langue du site : {lead.lang}).{" "}
              {estimate.priced ? "Le prix lui a été envoyé." : "Devis à faire."} Le visiteur a été envoyé vers /inscription.
            </Text>
          )}
          <Text style={{ color: "#155DFC", fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em", margin: "0 0 8px", textTransform: "uppercase" }}>
            {c.mode.names[request.mode]} · {c.formula.names[request.formula]}
          </Text>
          <Text style={{ color: "#0E1A3D", fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>
            {estimate.priced ? c.email.heading : c.email.headingQuote}
          </Text>
          <Text style={{ ...cell, color: "#4A5578", marginBottom: "16px" }}>{estimate.priced ? c.email.intro : c.email.introQuote}</Text>

          <Section>
            {rows.map(([k, v]) => (
              <Text key={k} style={cell}>
                <span style={{ color: "#6b7280" }}>{k}{c.email.sep}</span>
                {v}
              </Text>
            ))}
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
          <Text style={{ ...cell, fontWeight: 600 }}>{c.email.productsTitle}</Text>
          {estimate.products.map((p, i) => (
            <Text key={i} style={{ ...cell, color: "#4A5578", padding: "2px 0" }}>
              ·{" "}
              {measured
                ? fill(c.email.product, {
                    name: productName(p.name, i),
                    cartons: n(p.cartons, 0),
                    m3: m3(p.volume),
                    chargeable: formatKg(p.chargeable, lang),
                  })
                : fill(c.email.productCount, { name: productName(p.name, i), cartons: n(p.cartons, 0) })}
            </Text>
          ))}

          <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
          {estimate.priced ? (
            <Section>
              {estimate.items.map((item, i) => (
                <Text key={`${item.key}-${i}`} style={cell}>
                  <span>
                    {fill(c.email.items[item.key], {
                      ...Object.fromEntries(Object.entries(item.detail).map(([k, v]) => [k, n(v)])),
                      product: item.product === undefined ? "" : productName(estimate.products[item.product]?.name ?? "", item.product),
                    })}
                  </span>
                  <span>{c.email.sep}</span>
                  <b style={{ whiteSpace: "nowrap" }}>{formatAmount(item.amount, item.currency, lang)}</b>
                </Text>
              ))}
              <Text style={{ ...cell, borderTop: "1px solid #e5e7eb", marginTop: "8px", paddingTop: "10px" }}>
                <span>{c.email.subtotal}{c.email.sep}</span>
                <b>{formatMoney(estimate.subtotal, lang)}</b>
              </Text>
              <Text style={cell}>
                <span>{c.email.commission}{c.email.sep}</span>
                <b>{formatMoney(estimate.commission, lang)}</b>
              </Text>
              <Text style={{ ...cell, color: "#0E1A3D", fontSize: "18px", fontWeight: 700, paddingTop: "8px" }}>
                {c.email.total}{c.email.sep}{total}
              </Text>
              <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
              <Text style={{ ...cell, fontWeight: 600 }}>{c.email.notIncludedTitle}</Text>
              {c.email.notIncluded.map((x) => (
                <Text key={x} style={{ ...cell, color: "#4A5578", padding: "2px 0" }}>
                  · {x}
                </Text>
              ))}
              <Text style={{ ...cell, color: "#6b7280", fontSize: "12px", marginTop: "12px" }}>{c.email.disclaimer}</Text>
            </Section>
          ) : (
            <Section>
              <Text style={{ ...cell, fontWeight: 600 }}>{c.quote.title}</Text>
              <Text style={{ ...cell, color: "#4A5578" }}>{c.quote.reasons[estimate.reason]}</Text>
              <Text style={cell}>{c.email.quoteNext}</Text>
            </Section>
          )}

          {!lead && (
            <Section style={{ marginTop: "20px" }}>
              <Text style={cell}>{c.email.signup}</Text>
              <Button href={signupUrl} style={{ backgroundColor: "#155DFC", borderRadius: "10px", color: "#ffffff", display: "inline-block", fontSize: "15px", fontWeight: 600, padding: "12px 20px", marginTop: "8px" }}>
                {c.email.signupCta}
              </Button>
            </Section>
          )}
          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0 12px" }} />
          <Text style={{ color: "#9ca3af", fontSize: "11px", margin: 0 }}>{c.email.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}
