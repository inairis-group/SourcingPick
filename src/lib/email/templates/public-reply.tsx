import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";
import { appLocaleFor, directionFor, type AppLocale, type Locale } from "@/lib/i18n/config";

/**
 * The team's answer to a public-chat visitor, delivered to their inbox.
 *
 * A widget reply only reaches someone still sitting on the page. Most people
 * ask a question and leave, so without this the answer is written into a box
 * nobody returns to. They gave us an email address precisely so we could use
 * it.
 *
 * Deliberately plain: no CTA button and no dashboard link, because the
 * recipient has no account — sending them to a login screen would be a dead
 * end. The reply is the whole payload.
 *
 * The footer invites an email reply only when the mail carries a signed
 * Reply-To that routes back into this conversation. Where inbound email isn't
 * configured it points at the chat widget instead — promising "just reply"
 * and then discarding the answer is worse than not asking.
 */

const COPY: Record<
  AppLocale,
  { heading: string; replyHint: string; replyByMail: string; footer: string }
> = {
  fr: {
    heading: "Réponse de l'équipe SourcingPick",
    replyHint:
      "Pour poursuivre, reprenez la conversation depuis le chat de notre site — nous y retrouverons tout l'historique.",
    replyByMail:
      "Répondez simplement à cet e-mail — votre réponse arrivera directement dans notre conversation.",
    footer: "SourcingPick — sourcing en Chine",
  },
  en: {
    heading: "A reply from the SourcingPick team",
    replyHint:
      "To continue, pick the conversation back up in the chat on our site — the whole history is waiting there.",
    replyByMail: "Just reply to this email — your answer lands straight back in our conversation.",
    footer: "SourcingPick — sourcing from China",
  },
  zh: {
    heading: "SourcingPick 团队回复",
    replyHint: "如需继续沟通，请回到我们网站的聊天窗口——完整记录都在那里。",
    replyByMail: "直接回复本邮件即可，您的回复会回到我们的会话中。",
    footer: "SourcingPick — 中国采购",
  },
  ar: {
    heading: "رد من فريق SourcingPick",
    replyHint:
      "لمتابعة الحديث، عُد إلى نافذة الدردشة على موقعنا — سجلّ المحادثة كاملًا محفوظ هناك.",
    replyByMail: "يكفي أن ترد على هذا البريد — سيصل ردك مباشرة إلى محادثتنا.",
    footer: "SourcingPick — التوريد من الصين",
  },
};

export default function PublicReplyEmail({
  visitorName,
  body,
  locale,
  canReplyByEmail = false,
}: {
  visitorName: string;
  body: string;
  locale: Locale;
  /**
   * True once the mail carries a signed Reply-To that routes back into the
   * conversation. The footer says so only when it's actually true — inviting a
   * reply we'd then discard is worse than not asking.
   */
  canReplyByEmail?: boolean;
}) {
  const t = COPY[appLocaleFor(locale)];
  const dir = directionFor(locale);

  return (
    <Html lang={locale} dir={dir}>
      <Head />
      <Preview>{body.slice(0, 120)}</Preview>
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
            maxWidth: "560px",
            padding: "32px",
          }}
        >
          <Text
            style={{
              color: "#6b7280",
              fontSize: "12px",
              letterSpacing: "0.04em",
              margin: "0 0 8px",
              textTransform: "uppercase",
            }}
          >
            {t.heading}
          </Text>

          <Text
            style={{
              color: "#111827",
              fontSize: "16px",
              fontWeight: 600,
              margin: "0 0 16px",
            }}
          >
            {visitorName}
          </Text>

          <Section>
            {/* The operator writes plain text with blank lines between
                paragraphs; render each as its own block rather than collapsing
                the whole reply into one wall. */}
            {body.split(/\n{2,}/).map((para, i) => (
              <Text
                key={i}
                style={{
                  color: "#1f2937",
                  fontSize: "14px",
                  lineHeight: "22px",
                  margin: "0 0 12px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {para}
              </Text>
            ))}
          </Section>

          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0 16px" }} />

          <Text style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 4px" }}>
            {canReplyByEmail ? t.replyByMail : t.replyHint}
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: "11px", margin: 0 }}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}
