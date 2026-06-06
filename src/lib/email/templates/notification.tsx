import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";
import { directionFor, type Locale } from "@/lib/i18n/config";

type NotificationEmailProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaUrl?: string;
  locale: Locale;
};

const FOOTER: Record<Locale, string> = {
  fr: "SourcingPick · le sourcing international, industrialisé.",
  en: "SourcingPick · international sourcing, industrialised.",
  zh: "SourcingPick · 工业化的国际采购平台。",
  ar: "SourcingPick · التوريد الدولي، بمعايير صناعية.",
};

export default function NotificationEmail({
  title,
  description,
  ctaLabel,
  ctaUrl,
  locale,
}: NotificationEmailProps) {
  return (
    <Html lang={locale} dir={directionFor(locale)}>
      <Head />
      <Preview>{title}</Preview>
      <Body
        style={{
          backgroundColor: "#f8fafc",
          fontFamily:
            'Geist, ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif',
          color: "#1e293b",
          margin: 0,
          padding: "32px 16px",
        }}
      >
        <Container
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "32px",
          }}
        >
          <Section>
            <Heading
              style={{
                fontSize: "18px",
                fontWeight: 600,
                margin: "0 0 16px 0",
                color: "#162456",
              }}
            >
              {title}
            </Heading>
            {description && (
              <Text
                style={{
                  fontSize: "14px",
                  lineHeight: "22px",
                  margin: "0 0 24px 0",
                  color: "#1e293b",
                }}
              >
                {description}
              </Text>
            )}
            {ctaLabel && ctaUrl && (
              <Section style={{ margin: "0 0 16px 0" }}>
                <Button
                  href={ctaUrl}
                  style={{
                    backgroundColor: "#162456",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 600,
                    padding: "10px 18px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  {ctaLabel}
                </Button>
              </Section>
            )}
          </Section>
        </Container>
        <Text
          style={{
            fontSize: "11px",
            color: "#94a3b8",
            textAlign: "center",
            margin: "24px 0 0 0",
          }}
        >
          {FOOTER[locale]}
        </Text>
      </Body>
    </Html>
  );
}
