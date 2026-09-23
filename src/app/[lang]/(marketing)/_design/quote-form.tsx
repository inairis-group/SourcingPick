"use client";

import { useActionState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { submitQuoteRequest, type QuoteRequestState } from "@/lib/quotes/public-request";
import type { Locale } from "@/lib/i18n/config";
import { FILE_ERRORS } from "@/lib/quotes/file-copy";
import type { FileRejection } from "@/lib/quotes/files";

/**
 * The quote form on /devis.
 *
 * The canvas draws the form; it cannot make one submit. This stands in for the
 * transcribed `<form>` element, keeping its inline style and — importantly —
 * its children, which stay server-rendered. Wrapping a client component around
 * server-rendered children is the whole reason the fields are not in the
 * browser bundle: only this file and the two controls are.
 *
 * On success the form is replaced by its receipt rather than cleared. Someone
 * who has just typed out fifteen fields needs to see that it landed, and a
 * reference they can quote back at us; an emptied form reads like it failed.
 */

type ErrorCode = Extract<QuoteRequestState, { ok: false }>["error"];

/**
 * A rejected file is explained by the picker's own copy — see file-copy.ts.
 * The server can still refuse one the browser let through, and when it does it
 * has to say the same thing the picker would have.
 */
function messageFor(lang: Locale, code: ErrorCode): string {
  if (code in FILE_ERRORS[lang]) {
    return FILE_ERRORS[lang][code as FileRejection];
  }
  return ERRORS[lang][code as Exclude<ErrorCode, FileRejection>];
}

const ERRORS: Record<Locale, Record<Exclude<ErrorCode, FileRejection>, string>> = {
  fr: {
    missing_products: "Indiquez au moins les produits concernés.",
    missing_country: "Choisissez le pays de destination.",
    missing_name: "Indiquez votre nom.",
    invalid_email: "Cette adresse e-mail semble incorrecte.",
    missing_consent: "Cochez la case pour que nous puissions traiter votre demande.",
    too_many_open: "Vous avez déjà plusieurs demandes en cours. Nous y répondons.",
    rate_limited: "Trop de demandes envoyées. Réessayez dans une heure.",
    failed: "L’envoi a échoué. Réessayez dans un instant.",
  },
  en: {
    missing_products: "Tell us at least what the goods are.",
    missing_country: "Choose the destination country.",
    missing_name: "Tell us your name.",
    invalid_email: "That email address doesn’t look right.",
    missing_consent: "Tick the box so we can act on your request.",
    too_many_open: "You already have several requests open. We're on them.",
    rate_limited: "Too many requests sent. Try again in an hour.",
    failed: "Sending failed. Try again in a moment.",
  },
  zh: {
    missing_products: "请至少说明货物是什么。",
    missing_country: "请选择目的地国家/地区。",
    missing_name: "请填写您的姓名。",
    invalid_email: "该电子邮箱地址似乎有误。",
    missing_consent: "请勾选同意框，我们才能处理您的请求。",
    too_many_open: "您已有多个待处理请求，我们正在处理。",
    rate_limited: "提交次数过多，请一小时后再试。",
    failed: "提交失败，请稍后再试。",
  },
  ar: {
    missing_products: "أخبرنا على الأقل بنوع البضائع.",
    missing_country: "اختر بلد الوجهة.",
    missing_name: "أدخل اسمك.",
    invalid_email: "يبدو أن عنوان البريد الإلكتروني غير صحيح.",
    missing_consent: "ضع علامة في المربع حتى نتمكّن من معالجة طلبك.",
    too_many_open: "لديك عدة طلبات مفتوحة بالفعل، ونحن نعمل عليها.",
    rate_limited: "تم إرسال طلبات كثيرة. حاول بعد ساعة.",
    failed: "فشل الإرسال. حاول مرة أخرى بعد قليل.",
  },
  es: {
    missing_products: "Indíquenos al menos de qué mercancía se trata.",
    missing_country: "Elija el país de destino.",
    missing_name: "Indique su nombre.",
    invalid_email: "Esa dirección de correo no parece correcta.",
    missing_consent: "Marque la casilla para que podamos tramitar su solicitud.",
    too_many_open: "Ya tiene varias solicitudes abiertas. Estamos con ellas.",
    rate_limited: "Demasiadas solicitudes enviadas. Inténtelo dentro de una hora.",
    failed: "El envío ha fallado. Inténtelo de nuevo en un momento.",
  },
  de: {
    missing_products: "Sagen Sie uns zumindest, um welche Waren es geht.",
    missing_country: "Wählen Sie das Zielland.",
    missing_name: "Bitte geben Sie Ihren Namen an.",
    invalid_email: "Diese E-Mail-Adresse sieht nicht richtig aus.",
    missing_consent: "Bitte ankreuzen, damit wir Ihre Anfrage bearbeiten dürfen.",
    too_many_open: "Sie haben bereits mehrere offene Anfragen. Wir kümmern uns darum.",
    rate_limited: "Zu viele Anfragen gesendet. Versuchen Sie es in einer Stunde erneut.",
    failed: "Das Senden ist fehlgeschlagen. Versuchen Sie es gleich noch einmal.",
  },
  it: {
    missing_products: "Diteci almeno di che merce si tratta.",
    missing_country: "Scegliete il paese di destinazione.",
    missing_name: "Indicate il vostro nome.",
    invalid_email: "Questo indirizzo e-mail non sembra corretto.",
    missing_consent: "Spuntate la casella per permetterci di trattare la richiesta.",
    too_many_open: "Avete già diverse richieste aperte. Ce ne stiamo occupando.",
    rate_limited: "Troppe richieste inviate. Riprovate tra un’ora.",
    failed: "Invio non riuscito. Riprovate tra un momento.",
  },
  pt: {
    missing_products: "Diga-nos pelo menos qual é a mercadoria.",
    missing_country: "Escolha o país de destino.",
    missing_name: "Indique o seu nome.",
    invalid_email: "Esse endereço de e-mail não parece correto.",
    missing_consent: "Assinale a caixa para podermos tratar do seu pedido.",
    too_many_open: "Já tem vários pedidos em aberto. Estamos a tratar deles.",
    rate_limited: "Demasiados pedidos enviados. Tente novamente dentro de uma hora.",
    failed: "O envio falhou. Tente novamente daqui a pouco.",
  },
  nl: {
    missing_products: "Vertel ons minstens om welke goederen het gaat.",
    missing_country: "Kies het land van bestemming.",
    missing_name: "Vul uw naam in.",
    invalid_email: "Dat e-mailadres lijkt niet te kloppen.",
    missing_consent: "Vink het vakje aan zodat we uw aanvraag mogen behandelen.",
    too_many_open: "U hebt al meerdere aanvragen openstaan. We zijn ermee bezig.",
    rate_limited: "Te veel aanvragen verstuurd. Probeer het over een uur opnieuw.",
    failed: "Verzenden is mislukt. Probeer het zo meteen opnieuw.",
  },
  ru: {
    missing_products: "Укажите хотя бы, о каком товаре идёт речь.",
    missing_country: "Выберите страну назначения.",
    missing_name: "Укажите ваше имя.",
    invalid_email: "Этот адрес электронной почты выглядит неверным.",
    missing_consent: "Отметьте поле, чтобы мы могли обработать вашу заявку.",
    too_many_open: "У вас уже несколько открытых заявок. Мы ими занимаемся.",
    rate_limited: "Слишком много заявок. Попробуйте через час.",
    failed: "Отправить не удалось. Попробуйте ещё раз через минуту.",
  },
  tr: {
    missing_products: "En azından hangi mal olduğunu belirtin.",
    missing_country: "Varış ülkesini seçin.",
    missing_name: "Adınızı yazın.",
    invalid_email: "Bu e-posta adresi doğru görünmüyor.",
    missing_consent: "Talebinizi işleme alabilmemiz için kutuyu işaretleyin.",
    too_many_open: "Zaten birkaç açık talebiniz var. İlgileniyoruz.",
    rate_limited: "Çok fazla talep gönderildi. Bir saat sonra tekrar deneyin.",
    failed: "Gönderim başarısız oldu. Birazdan tekrar deneyin.",
  },
  pl: {
    missing_products: "Proszę podać przynajmniej, o jaki towar chodzi.",
    missing_country: "Proszę wybrać kraj docelowy.",
    missing_name: "Proszę podać imię i nazwisko.",
    invalid_email: "Ten adres e-mail wygląda na nieprawidłowy.",
    missing_consent: "Proszę zaznaczyć pole, abyśmy mogli zająć się zgłoszeniem.",
    too_many_open: "Mają Państwo już kilka otwartych zgłoszeń. Zajmujemy się nimi.",
    rate_limited: "Wysłano zbyt wiele zgłoszeń. Proszę spróbować za godzinę.",
    failed: "Wysyłanie nie powiodło się. Proszę spróbować za chwilę.",
  },
};

const SENT: Record<Locale, { title: string; body: string; ref: string }> = {
  fr: {
    title: "Demande envoyée.",
    body: "Nous revenons vers vous avec un devis détaillé.",
    ref: "Référence",
  },
  en: {
    title: "Request sent.",
    body: "We’ll come back to you with a detailed quote.",
    ref: "Reference",
  },
  zh: { title: "请求已提交。", body: "我们会带着详细报价与您联系。", ref: "编号" },
  ar: { title: "تم إرسال الطلب.", body: "سنعود إليك بعرض سعر مفصّل.", ref: "المرجع" },
  es: {
    title: "Solicitud enviada.",
    body: "Le responderemos con un presupuesto detallado.",
    ref: "Referencia",
  },
  de: {
    title: "Anfrage gesendet.",
    body: "Wir melden uns mit einem detaillierten Angebot.",
    ref: "Referenz",
  },
  it: {
    title: "Richiesta inviata.",
    body: "Vi risponderemo con un preventivo dettagliato.",
    ref: "Riferimento",
  },
  pt: {
    title: "Pedido enviado.",
    body: "Voltaremos com um orçamento detalhado.",
    ref: "Referência",
  },
  nl: {
    title: "Aanvraag verzonden.",
    body: "We komen bij u terug met een gedetailleerde offerte.",
    ref: "Referentie",
  },
  ru: {
    title: "Заявка отправлена.",
    body: "Мы вернёмся к вам с подробным расчётом.",
    ref: "Номер",
  },
  tr: {
    title: "Talep gönderildi.",
    body: "Ayrıntılı bir teklifle size döneceğiz.",
    ref: "Referans",
  },
  pl: {
    title: "Zgłoszenie wysłane.",
    body: "Wrócimy do Państwa ze szczegółową wyceną.",
    ref: "Numer",
  },
};

const PANEL: CSSProperties = {
  padding: "32px",
  borderRadius: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

export function QuoteForm({
  lang,
  style,
  children,
}: {
  lang: Locale;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [state, action] = useActionState<QuoteRequestState | null, FormData>(
    submitQuoteRequest,
    null,
  );

  if (state?.ok) {
    const t = SENT[lang];
    return (
      <div
        style={{
          ...PANEL,
          background: "#E3F6EC",
          border: "1px solid #1F8F55",
          color: "#0E1A3D",
        }}
        // Announced rather than merely rendered: the form it replaces was the
        // thing that had focus.
        role="status"
        aria-live="polite"
      >
        <span
          style={{
            fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif",
            fontSize: "22px",
            fontWeight: 600,
            letterSpacing: "-0.03em",
          }}
        >
          {t.title}
        </span>
        <span style={{ fontSize: "16px", lineHeight: 1.6, color: "#4A5578" }}>{t.body}</span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: "14px",
            fontWeight: 600,
            color: "#1F8F55",
          }}
        >
          {t.ref} {state.reference}
        </span>
      </div>
    );
  }

  return (
    <form action={action} style={style} noValidate>
      {state && !state.ok && (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: "14px 18px",
            borderRadius: "14px",
            background: "#FBE7EB",
            border: "1px solid #C8364F",
            color: "#8A1C30",
            fontSize: "15px",
            lineHeight: 1.5,
          }}
        >
          {messageFor(lang, state.error)}
        </p>
      )}
      {children}
    </form>
  );
}
