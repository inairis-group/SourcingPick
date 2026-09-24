import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "react-email";
import { directionFor, type Locale } from "@/lib/i18n/config";
import { pick, type Localized } from "@/lib/i18n/localized";

type Props = {
  resetUrl: string;
  locale: Locale;
  expiresInMinutes: number;
};

const COPY: Localized<
  {
    preview: string;
    heading: string;
    intro: string;
    cta: string;
    expires: (m: number) => string;
    ifNotYou: string;
    footer: string;
  }
> = {
  fr: {
    preview: "Réinitialisez votre mot de passe SourcingPick",
    heading: "Réinitialiser votre mot de passe",
    intro: "Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.",
    cta: "Choisir un nouveau mot de passe",
    expires: (m) => `Ce lien expire dans ${m} minutes.`,
    ifNotYou: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.",
    footer: "SourcingPick · le sourcing international, industrialisé."
  },
  en: {
    preview: "Reset your SourcingPick password",
    heading: "Reset your password",
    intro: "Click the button below to choose a new password.",
    cta: "Choose a new password",
    expires: (m) => `This link expires in ${m} minutes.`,
    ifNotYou: "If you didn't request this, you can safely ignore this email.",
    footer: "SourcingPick · international sourcing, industrialised."
  },
  zh: {
    preview: "重置您的 SourcingPick 密码",
    heading: "重置您的密码",
    intro: "点击下方按钮选择一个新密码。",
    cta: "选择新密码",
    expires: (m) => `此链接将在 ${m} 分钟后失效。`,
    ifNotYou: "如果您没有发起此请求,可以安全地忽略此邮件。",
    footer: "SourcingPick · 工业化的国际采购平台。"
  },
  ar: {
    preview: "إعادة تعيين كلمة المرور الخاصة بك في SourcingPick",
    heading: "إعادة تعيين كلمة المرور",
    intro: "اضغط الزر أدناه لاختيار كلمة مرور جديدة.",
    cta: "اختيار كلمة مرور جديدة",
    expires: (m) => `تنتهي صلاحية هذا الرابط خلال ${m} دقيقة.`,
    ifNotYou: "إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة بأمان.",
    footer: "SourcingPick · التوريد الدولي، بمعايير صناعية."
  }
};

export default function PasswordResetEmail({ resetUrl, locale, expiresInMinutes }: Props) {
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
            <Button
              href={resetUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#155dfc",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
                padding: "12px 20px",
                borderRadius: "5px",
                margin: "0 0 24px 0"
              }}
            >
              {t.cta}
            </Button>
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
            <Text style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b", margin: 0 }}>
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
