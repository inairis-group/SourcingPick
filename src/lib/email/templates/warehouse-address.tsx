import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";
import { directionFor, type Locale } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/seo/site";
import { addressGateCopy } from "@/content/site/address-gate";
import {
  WAREHOUSE_ADDRESS_ZH,
  WAREHOUSE_PHONE,
  warehouseAddress,
} from "@/content/warehouse-address";

/**
 * The warehouse address, sent to a visitor who asked for it on the site
 * (address-gate.tsx): the public pages no longer print it. To the visitor in
 * their language; to the team in French, with who asked.
 */
export default function WarehouseAddressEmail({
  lang,
  lead,
}: {
  lang: Locale;
  /** For the team's copy: who asked, and in which language. */
  lead?: { email: string; name: string; phone: string; lang: Locale };
}) {
  const c = addressGateCopy[lang].mail;
  const signupUrl = `${getSiteUrl()}/inscription`;
  const cell = {
    color: "#1f2937",
    fontSize: "14px",
    lineHeight: "20px",
    margin: 0,
    padding: "6px 0",
  } as const;
  const rows: [string, string][] = [
    [c.latin, warehouseAddress[lang].latin],
    [c.hours, warehouseAddress[lang].hours],
    [c.phone, `${WAREHOUSE_PHONE} · WhatsApp`],
  ];

  return (
    <Html lang={lang} dir={directionFor(lang)}>
      <Head />
      <Preview>{c.heading}</Preview>
      <Body
        style={{
          backgroundColor: "#f6f7f9",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
          margin: 0,
          padding: "24px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            maxWidth: "600px",
            padding: "32px",
          }}
        >
          {lead && (
            <Text
              style={{
                ...cell,
                backgroundColor: "#EEF3FF",
                borderRadius: "6px",
                padding: "10px 12px",
                marginBottom: "16px",
              }}
            >
              Demande d’adresse de l’entrepôt : {lead.name || "(nom non indiqué)"} · {lead.email}
              {lead.phone ? ` · ${lead.phone}` : ""} (langue du site : {lead.lang}). L’adresse lui a
              été envoyée ; il n’a pas encore de compte.
            </Text>
          )}
          <Text style={{ color: "#0E1A3D", fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>
            {c.heading}
          </Text>
          <Text style={{ ...cell, color: "#4A5578", marginBottom: "16px" }}>{c.intro}</Text>
          <Section
            style={{ backgroundColor: "#F5F7FC", borderRadius: "8px", padding: "14px 16px" }}
          >
            <Text style={{ ...cell, color: "#6b7280", padding: 0 }}>{c.chinese}</Text>
            <Text
              lang="zh-Hans"
              style={{ ...cell, color: "#0E1A3D", fontSize: "18px", fontWeight: 700 }}
            >
              {WAREHOUSE_ADDRESS_ZH}
            </Text>
          </Section>
          <Section style={{ marginTop: "12px" }}>
            {rows.map(([k, v]) => (
              <Section key={k} style={{ padding: "4px 0" }}>
                <Text style={{ ...cell, color: "#6b7280", fontSize: "12.5px", padding: 0 }}>
                  {k}
                </Text>
                <Text style={{ ...cell, padding: 0 }}>{v}</Text>
              </Section>
            ))}
          </Section>
          <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
          <Text style={{ ...cell, marginBottom: "12px" }}>{c.codeNote}</Text>
          <Button
            href={signupUrl}
            style={{
              backgroundColor: "#155DFC",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              padding: "12px 18px",
            }}
          >
            {c.signupCta}
          </Button>
          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0 12px" }} />
          <Text style={{ ...cell, color: "#9ca3af", fontSize: "12px" }}>
            SourcingPick · contact@sourcingpick.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
