import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "react-email";
import { appLocaleFor, directionFor, type AppLocale, type Locale } from "@/lib/i18n/config";

type DigestItem = {
  title: string;
  description: string | null;
  createdAtLabel: string;
};

type DigestEmailProps = {
  recipientName: string;
  items: DigestItem[];
  locale: Locale;
};

const COPY: Record<
  AppLocale,
  {
    preview: (n: number) => string;
    heading: (n: number) => string;
    intro: string;
    footer: string;
  }
> = {
  fr: {
    preview: (n) =>
      `${n} ${n === 1 ? "nouvelle notification" : "nouvelles notifications"} SourcingPick`,
    heading: (n) => (n === 1 ? "1 nouvelle notification" : `${n} nouvelles notifications`),
    intro: "Voici un récapitulatif depuis hier.",
    footer: "SourcingPick · le sourcing international, industrialisé.",
  },
  en: {
    preview: (n) => `${n} new SourcingPick ${n === 1 ? "notification" : "notifications"}`,
    heading: (n) => (n === 1 ? "1 new notification" : `${n} new notifications`),
    intro: "Here's what happened since yesterday.",
    footer: "SourcingPick · international sourcing, industrialised.",
  },
  zh: {
    preview: (n) => `${n} 条 SourcingPick 新通知`,
    heading: (n) => `${n} 条新通知`,
    intro: "以下是自昨日以来的动态。",
    footer: "SourcingPick · 工业化的国际采购平台。",
  },
  ar: {
    preview: (n) => `${n} إشعار${n === 1 ? "" : "ات"} جديدة من SourcingPick`,
    heading: (n) => (n === 1 ? "إشعار جديد واحد" : `${n} إشعارات جديدة`),
    intro: "هذا ما حدث منذ الأمس.",
    footer: "SourcingPick · التوريد الدولي، بمعايير صناعية.",
  },
};

/**
 * Daily digest email. Sent by the digest cron to users on emailDigestMode
 * = DAILY. Lists every undigested in-app notification in chronological
 * order so the recipient can scan the day in one read.
 */
export default function DigestEmail({ recipientName, items, locale }: DigestEmailProps) {
  const t = COPY[appLocaleFor(locale)];
  const heading = t.heading(items.length);
  return (
    <Html lang={locale} dir={directionFor(locale)}>
      <Head />
      <Preview>{t.preview(items.length)}</Preview>
      <Body
        style={{
          backgroundColor: "#f8fafc",
          fontFamily: 'Geist, ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif',
          color: "#1e293b",
          margin: 0,
          padding: "32px 16px",
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "32px",
          }}
        >
          <Heading
            style={{
              fontSize: "18px",
              fontWeight: 600,
              margin: "0 0 8px 0",
              color: "#162456",
            }}
          >
            {heading}
          </Heading>
          <Text
            style={{
              fontSize: "13px",
              lineHeight: "18px",
              margin: "0 0 24px 0",
              color: "#475569",
            }}
          >
            {recipientName}, {t.intro}
          </Text>
          <Section>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 0",
                  borderTop: i === 0 ? "none" : "1px solid #e2e8f0",
                }}
              >
                <Text
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    margin: "0 0 4px 0",
                    color: "#1e293b",
                  }}
                >
                  {item.title}
                </Text>
                {item.description && (
                  <Text
                    style={{
                      fontSize: "13px",
                      lineHeight: "19px",
                      margin: "0 0 4px 0",
                      color: "#475569",
                    }}
                  >
                    {item.description}
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    margin: 0,
                  }}
                >
                  {item.createdAtLabel}
                </Text>
              </div>
            ))}
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
          {t.footer}
        </Text>
      </Body>
    </Html>
  );
}
