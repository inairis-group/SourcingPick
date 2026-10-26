import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";
import { directionFor, type Locale } from "@/lib/i18n/config";

/**
 * A freight quote the team made with the freight calculator, sent to the
 * client's users in their language: the amount in euros, how long it holds,
 * what it covers, and the button to the client space where it is accepted
 * (which issues the invoice) or declined.
 */
export default function FreightQuoteEmail({
  lang,
  copy,
  amount,
  rows,
  notes,
  ctaUrl,
}: {
  lang: Locale;
  copy: { heading: string; intro: string; amount: string; notesTitle: string; cta: string; footer: string; sep: string };
  /** Formatted, in euros. */
  amount: string;
  /** Label and value: reference, validity, transport, delivery… */
  rows: [string, string][];
  notes: string | null;
  ctaUrl: string;
}) {
  const cell = { color: "#1f2937", fontSize: "14px", lineHeight: "20px", margin: 0, padding: "4px 0" } as const;
  return (
    <Html lang={lang} dir={directionFor(lang)}>
      <Head />
      <Preview>{`${copy.heading} — ${amount}`}</Preview>
      <Body style={{ backgroundColor: "#f6f7f9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", margin: 0, padding: "24px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", maxWidth: "600px", padding: "32px" }}>
          <Text style={{ color: "#0E1A3D", fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>{copy.heading}</Text>
          <Text style={{ ...cell, color: "#4A5578", marginBottom: "16px" }}>{copy.intro}</Text>
          <Section style={{ backgroundColor: "#F5F7FC", borderRadius: "8px", padding: "14px 16px" }}>
            <Text style={{ ...cell, color: "#6b7280", padding: 0 }}>{copy.amount}</Text>
            <Text style={{ ...cell, color: "#0E1A3D", fontSize: "24px", fontWeight: 700 }}>{amount}</Text>
          </Section>
          <Section style={{ marginTop: "12px" }}>
            {rows.map(([k, v]) => (
              <Text key={k} style={cell}>
                <span style={{ color: "#6b7280" }}>
                  {k}
                  {copy.sep}
                </span>
                {v}
              </Text>
            ))}
          </Section>
          {notes && (
            <Section style={{ marginTop: "12px" }}>
              <Text style={{ ...cell, fontWeight: 600 }}>{copy.notesTitle}</Text>
              <Text style={{ ...cell, color: "#4A5578", whiteSpace: "pre-line" }}>{notes}</Text>
            </Section>
          )}
          <Button
            href={ctaUrl}
            style={{ backgroundColor: "#155DFC", borderRadius: "8px", color: "#ffffff", fontSize: "15px", fontWeight: 600, padding: "12px 20px", marginTop: "20px" }}
          >
            {copy.cta}
          </Button>
          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0 12px" }} />
          <Text style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>{copy.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}
