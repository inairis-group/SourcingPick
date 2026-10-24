/**
 * The blue band the SEO pack's pages close on (see seo-article.tsx): the
 * canvas's closing band — its heading and line, as every page of the site
 * words them in each language — with the quote button and WhatsApp.
 */
import type { Locale } from "@/lib/i18n/config";

export type CtaBandCopy = { heading: string; line: string; quote: string; whatsapp: string };

export const CTA_BAND: Record<Locale, CtaBandCopy> = {
  fr: {
    heading: "Parlez-nous de votre prochaine commande.",
    line: "Vous recevez un devis détaillé sous 24 à 72 heures, en français, en anglais ou en chinois.",
    quote: "Demander un devis",
    whatsapp: "Nous écrire sur WhatsApp",
  },
  en: {
    heading: "Tell us about your next order.",
    line: "You’ll receive a detailed quotation within 24 to 72 hours, in French, English or Chinese.",
    quote: "Request a quotation",
    whatsapp: "Message us on WhatsApp",
  },
  zh: {
    heading: "下一批货，跟我们聊聊。",
    line: "24 到 72 小时内给你发详细报价，中文、英文或法语都可以。",
    quote: "获取报价",
    whatsapp: "WhatsApp 联系我们",
  },
  es: {
    heading: "Háblenos de su próximo pedido.",
    line: "Recibirá un presupuesto detallado en 24 a 72 horas, en francés, inglés o chino.",
    quote: "Solicitar presupuesto",
    whatsapp: "Escríbanos por WhatsApp",
  },
  de: {
    heading: "Erzählen Sie uns von Ihrer nächsten Bestellung.",
    line: "Sie erhalten innerhalb von 24 bis 72 Stunden ein detailliertes Angebot – auf Französisch, Englisch oder Chinesisch.",
    quote: "Angebot anfordern",
    whatsapp: "Schreiben Sie uns auf WhatsApp",
  },
  it: {
    heading: "Parlateci del vostro prossimo ordine.",
    line: "Riceverete un preventivo dettagliato entro 24-72 ore, in francese, inglese o cinese.",
    quote: "Richiedi un preventivo",
    whatsapp: "Scriveteci su WhatsApp",
  },
  pt: {
    heading: "Fale-nos da sua próxima encomenda.",
    line: "Recebe, em 24 a 72 horas, um orçamento detalhado em francês, inglês ou chinês.",
    quote: "Pedir orçamento",
    whatsapp: "Escreva-nos no WhatsApp",
  },
  nl: {
    heading: "Vertel ons over uw volgende bestelling.",
    line: "U ontvangt binnen 24 tot 72 uur een gedetailleerde offerte, in het Frans, Engels of Chinees.",
    quote: "Offerte aanvragen",
    whatsapp: "Stuur ons een WhatsApp",
  },
  ar: {
    heading: "حدّثنا عن طلبيتك القادمة.",
    line: "تتلقّى عرض سعر مفصّلًا خلال من 24 إلى 72 ساعة، بالفرنسية أو الإنجليزية أو الصينية.",
    quote: "اطلب عرض سعر",
    whatsapp: "راسلنا على WhatsApp",
  },
  ru: {
    heading: "Расскажите о вашем следующем заказе.",
    line: "Вы получите подробный расчёт стоимости в течение 24–72 часов — на французском, английском или китайском языке.",
    quote: "Запросить расчёт",
    whatsapp: "Написать нам в WhatsApp",
  },
  tr: {
    heading: "Bir sonraki siparişinizi bize anlatın.",
    line: "24 ila 72 saat içinde Fransızca, İngilizce veya Çince ayrıntılı bir fiyat teklifi alırsınız.",
    quote: "Teklif isteyin",
    whatsapp: "WhatsApp’tan bize yazın",
  },
  pl: {
    heading: "Porozmawiajmy o Państwa kolejnym zamówieniu.",
    line: "Szczegółową wycenę otrzymają Państwo w ciągu 24 do 72 godzin – po francusku, angielsku lub chińsku.",
    quote: "Poproś o wycenę",
    whatsapp: "Napisz do nas na WhatsAppie",
  },
};
