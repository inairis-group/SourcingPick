import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "react-email";
import { directionFor, type Locale } from "@/lib/i18n/config";
import { pick, type Localized } from "@/lib/i18n/localized";

type OtpEmailProps = {
  code: string;
  locale: Locale;
  expiresInMinutes: number;
};

const COPY: Localized<
  {
    preview: string;
    heading: string;
    intro: string;
    expires: (m: number) => string;
    ifNotYou: string;
    footer: string;
  }
> = {
  fr: {
    preview: "Votre code de vérification SourcingPick",
    heading: "Votre code de vérification",
    intro: "Saisissez ce code à 6 chiffres pour terminer votre connexion.",
    expires: (m) => `Ce code expire dans ${m} minutes.`,
    ifNotYou:
      "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.",
    footer: "SourcingPick · le sourcing international, industrialisé."
  },
  en: {
    preview: "Your SourcingPick verification code",
    heading: "Your verification code",
    intro: "Enter this 6-digit code to complete your sign-in.",
    expires: (m) => `This code expires in ${m} minutes.`,
    ifNotYou: "If you didn't request this, you can safely ignore this email.",
    footer: "SourcingPick · international sourcing, industrialised."
  },
  zh: {
    preview: "您的 SourcingPick 验证码",
    heading: "您的验证码",
    intro: "请输入此 6 位数验证码以完成登录。",
    expires: (m) => `此验证码将在 ${m} 分钟后失效。`,
    ifNotYou: "如果您没有发起此请求,可以安全地忽略此邮件。",
    footer: "SourcingPick · 工业化的国际采购平台。"
  },
  ar: {
    preview: "رمز التحقق الخاص بك في SourcingPick",
    heading: "رمز التحقق الخاص بك",
    intro: "أدخل هذا الرمز المؤلف من 6 أرقام لإكمال تسجيل الدخول.",
    expires: (m) => `تنتهي صلاحية هذا الرمز خلال ${m} دقيقة.`,
    ifNotYou: "إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة بأمان.",
    footer: "SourcingPick · التوريد الدولي، بمعايير صناعية."
  }
};

export default function OtpEmail({ code, locale, expiresInMinutes }: OtpEmailProps) {
  const t = pick(COPY, locale);

  return (
    <Html lang={locale} dir={directionFor(locale)}>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body
        style={{
          backgroundColor: "#f8fafc",
          fontFamily: 'Geist, ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif',
          color: "#1e293b",
          margin: 0,
          padding: "32px 16px"
        }}
      >
        <Container
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "32px"
          }}
        >
          <Section>
            <Heading
              style={{
                fontSize: "18px",
                fontWeight: 600,
                margin: "0 0 16px 0",
                color: "#162456"
              }}
            >
              {t.heading}
            </Heading>
            <Text style={{ fontSize: "14px", lineHeight: "20px", margin: "0 0 24px 0" }}>
              {t.intro}
            </Text>
            <Section
              style={{
                textAlign: "center",
                backgroundColor: "#f1f5f9",
                borderRadius: "5px",
                padding: "20px",
                margin: "0 0 24px 0"
              }}
            >
              <Text
                style={{
                  fontSize: "32px",
                  fontWeight: 600,
                  letterSpacing: "0.4em",
                  fontFamily: '"Geist Mono", ui-monospace, monospace',
                  color: "#162456",
                  margin: 0
                }}
              >
                {code}
              </Text>
            </Section>
            <Text
              style={{
                fontSize: "13px",
                lineHeight: "18px",
                color: "#475569",
                margin: "0 0 16px 0"
              }}
            >
              {t.expires(expiresInMinutes)}
            </Text>
            <Text
              style={{
                fontSize: "13px",
                lineHeight: "18px",
                color: "#64748b",
                margin: 0
              }}
            >
              {t.ifNotYou}
            </Text>
          </Section>
        </Container>
        <Text
          style={{
            fontSize: "11px",
            color: "#94a3b8",
            textAlign: "center",
            margin: "24px 0 0 0"
          }}
        >
          {t.footer}
        </Text>
      </Body>
    </Html>
  );
}
