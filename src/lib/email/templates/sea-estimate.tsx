import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";
import { directionFor, type Locale } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/seo/site";
import { seaCopy } from "@/content/freight/sea-simulator";
import { formatKg, formatPrice } from "@/lib/freight/format";
import { formatNumber } from "@/lib/i18n/formatters";
import type { SeaEstimate, SeaRequest } from "@/lib/freight/sea-europe";
import { cartonWeights } from "@/lib/freight/weights";

/**
 * The price the sea simulator (/livraisons) promised: sent to the visitor in
 * their language, and to the team (in French, with the visitor's address) so
 * the estimate can be followed up.
 */

type Ok = Extract<SeaEstimate, { ok: true }>;

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

export function deliveryLabel(estimate: Ok, lang: Locale): string {
  const c = seaCopy(lang);
  const line = estimate.line;
  if (line.kind !== "country") return `${line.kind === "amazon" ? c.deliverTo.amazon : c.deliverTo.thirdParty} ${line.warehouses ?? ""} · ${c.carrier.truck}`;
  let names = line.countries ?? [];
  try {
    const dn = new Intl.DisplayNames([lang], { type: "region" });
    names = names.map((iso) => dn.of(iso) ?? iso);
  } catch {
    /* the ISO codes, then */
  }
  return `${names.join(", ")} · ${c.carrier[line.carrier]}`;
}

export default function SeaEstimateEmail({
  estimate,
  request,
  lang,
  lead,
}: {
  estimate: Ok;
  request: SeaRequest;
  lang: Locale;
  /** For the team's copy: who asked, and in which language. */
  lead?: { email: string; lang: Locale };
}) {
  const c = seaCopy(lang);
  const n = (v: number, digits = 2) => formatNumber(v, lang, { maximumFractionDigits: digits });
  const money = (amount: number, currency: "RMB" | "EUR") =>
    currency === "RMB"
      ? `${formatNumber(amount, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RMB`
      : formatNumber(amount, lang, { style: "currency", currency: "EUR" });
  const w = cartonWeights(request.cartons, estimate.line.minKgPerCarton);
  const total = formatPrice(estimate.totalRmb, estimate.totalEur, lang);
  const signupUrl = `${getSiteUrl()}/inscription`;
  const rows: [string, string][] = [
    [c.email.summary.regime, request.regime === "ddp" ? c.regime.ddp : c.regime.vat],
    [c.email.summary.delivery, deliveryLabel(estimate, lang) + (request.nonAmazon && estimate.line.nonAmazonAllowed ? ` · ${c.deliverTo.other}` : "")],
    [c.email.summary.cartons, `${n(w.cartons, 0)} · ${n(w.volume)} m³`],
    [c.email.summary.real, formatKg(w.real, lang)],
    [c.email.summary.volumetric, formatKg(w.volumetric, lang)],
    [
      c.email.summary.chargeable,
      formatKg(estimate.chargeableKg, lang) +
        (estimate.billedKg > estimate.chargeableKg ? ` → ${fill(c.calc.billed, { kg: n(estimate.billedKg, 1) })}` : ""),
    ],
    [c.email.summary.bracket, `${estimate.bracket} kg · ${n(estimate.rate)} RMB/kg`],
    [c.email.summary.delay, c.estimate.delay],
  ];
  const cell = { color: "#1f2937", fontSize: "14px", lineHeight: "20px", margin: 0, padding: "6px 0" } as const;

  return (
    <Html lang={lang} dir={directionFor(lang)}>
      <Head />
      <Preview>{`${c.email.heading} — ${total}`}</Preview>
      <Body style={{ backgroundColor: "#f6f7f9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", margin: 0, padding: "24px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", maxWidth: "600px", padding: "32px" }}>
          {lead && (
            <Text style={{ ...cell, backgroundColor: "#EEF3FF", borderRadius: "6px", padding: "10px 12px", marginBottom: "16px" }}>
              Demande d’estimation de {lead.email} (langue du site : {lead.lang}). Le visiteur a été envoyé vers /inscription.
            </Text>
          )}
          <Text style={{ color: "#155DFC", fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em", margin: "0 0 8px", textTransform: "uppercase" }}>
            {c.estimate.mode}
          </Text>
          <Text style={{ color: "#0E1A3D", fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>{c.email.heading}</Text>
          <Text style={{ ...cell, color: "#4A5578", marginBottom: "16px" }}>{c.email.intro}</Text>

          <Section>
            {rows.map(([k, v]) => (
              <Text key={k} style={cell}>
                <span style={{ color: "#6b7280" }}>{k}{c.email.sep}</span>
                {v}
              </Text>
            ))}
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />

          <Section>
            {estimate.items.map((item) => (
              <Text key={item.key} style={cell}>
                <span>{fill(c.email.items[item.key], Object.fromEntries(Object.entries(item.detail).map(([k, v]) => [k, n(v)])))}</span>
                <span>{c.email.sep}</span>
                <b style={{ whiteSpace: "nowrap" }}>{money(item.amount, item.currency)}</b>
              </Text>
            ))}
            <Text style={{ ...cell, borderTop: "1px solid #e5e7eb", marginTop: "8px", paddingTop: "10px" }}>
              <span>{c.email.subtotal}{c.email.sep}</span>
              <b>{formatPrice(estimate.subtotalRmb, estimate.subtotalEur, lang)}</b>
            </Text>
            <Text style={cell}>
              <span>{c.email.commission}{c.email.sep}</span>
              <b>{formatPrice(estimate.commissionRmb, estimate.commissionEur, lang)}</b>
            </Text>
            <Text style={{ ...cell, color: "#0E1A3D", fontSize: "18px", fontWeight: 700, paddingTop: "8px" }}>
              {c.email.total}{c.email.sep}{total}
            </Text>
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
          <Text style={{ ...cell, fontWeight: 600 }}>{c.email.notIncludedTitle}</Text>
          {c.email.notIncluded.map((x) => (
            <Text key={x} style={{ ...cell, color: "#4A5578", padding: "2px 0" }}>
              · {x}
            </Text>
          ))}
          <Text style={{ ...cell, color: "#6b7280", fontSize: "12px", marginTop: "12px" }}>{c.email.disclaimer}</Text>

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
