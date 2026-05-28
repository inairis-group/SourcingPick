import "server-only";
import { NotificationType } from "@prisma/client";
import type { Locale } from "@/lib/i18n/config";

/**
 * Notification copy is rendered at *emit* time using the recipient's
 * locale and inserted as plain text into the DB. This means a stored
 * notification is frozen in the recipient's then-current language;
 * changing locale after the fact won't retro-translate the inbox.
 *
 * Variables: each event passes a `vars` bag (e.g. {reference, factoryName})
 * — the templates consume what they need and ignore the rest.
 */
export type NotificationVars = {
  reference?: string;
  factoryName?: string;
  clientName?: string;
  title?: string;
  status?: string;
  /**
   * Optional key into SYSTEM_TITLES below. Used for SYSTEM notifications
   * whose title should be localised at emit time. Falls back to `title`
   * (verbatim) if the key isn't recognised.
   */
  systemKey?:
    | "tender_invited"
    | "quote_rejected_by_client"
    | "agent_assigned"
    | "order_cancelled"
    | "order_completed"
    | "order_disputed"
    | "order_dispute_resolved"
    | "request_received";
};

const SYSTEM_TITLES: Record<
  NonNullable<NotificationVars["systemKey"]>,
  Record<Locale, string>
> = {
  tender_invited: {
    fr: "Nouvel appel d'offres reçu",
    en: "New tender invitation",
    zh: "收到新的招标邀请",
    ar: "تمت دعوتك إلى مناقصة جديدة",
  },
  quote_rejected_by_client: {
    fr: "Votre devis a été refusé",
    en: "Your quote was rejected",
    zh: "您的报价被拒绝",
    ar: "تم رفض عرض السعر الخاص بك",
  },
  agent_assigned: {
    fr: "Une demande vous a été assignée",
    en: "A request was assigned to you",
    zh: "一项需求已分配给您",
    ar: "تم تعيين طلب جديد لك",
  },
  order_cancelled: {
    fr: "Commande annulée",
    en: "Order cancelled",
    zh: "订单已取消",
    ar: "تم إلغاء الطلب",
  },
  order_completed: {
    fr: "Commande terminée",
    en: "Order completed",
    zh: "订单已完成",
    ar: "اكتمل الطلب",
  },
  order_disputed: {
    fr: "Commande en litige",
    en: "Order under dispute",
    zh: "订单进入争议",
    ar: "الطلب قيد النزاع",
  },
  order_dispute_resolved: {
    fr: "Litige résolu",
    en: "Dispute resolved",
    zh: "争议已解决",
    ar: "تم حل النزاع",
  },
  request_received: {
    fr: "Nouvelle demande de sourcing reçue",
    en: "New sourcing request received",
    zh: "收到新的采购需求",
    ar: "تم استلام طلب توريد جديد",
  },
};

export type NotificationCopy = {
  title: string;
  description: string;
};

type Renderer = (vars: NotificationVars) => NotificationCopy;
type Pack = Record<NotificationType, Renderer>;

const FR: Pack = {
  QUOTE_RECEIVED: ({ factoryName, reference }) => ({
    title: `Nouveau devis · ${reference ?? ""}`.trim(),
    description: factoryName
      ? `${factoryName} a soumis un devis pour votre demande.`
      : "Une usine a soumis un devis.",
  }),
  QUOTE_ACCEPTED: ({ clientName, reference }) => ({
    title: `Devis accepté · ${reference ?? ""}`.trim(),
    description: clientName
      ? `${clientName} a accepté votre devis. La commande est créée.`
      : "Le client a accepté un devis et la commande est créée.",
  }),
  PAYMENT_RECEIVED: ({ reference }) => ({
    title: `Paiement reçu · ${reference ?? ""}`.trim(),
    description:
      "Le paiement est confirmé. Vous pouvez démarrer la production.",
  }),
  SHIPMENT: ({ reference, factoryName }) => ({
    title: `Commande expédiée · ${reference ?? ""}`.trim(),
    description: factoryName
      ? `${factoryName} a expédié votre commande.`
      : "Votre commande a été expédiée.",
  }),
  INVOICE_DUE: ({ reference }) => ({
    title: `Facture à payer · ${reference ?? ""}`.trim(),
    description: "Une facture est en attente de règlement.",
  }),
  CERT_UPDATE: ({ title }) => ({
    title: title ?? "Mise à jour certification",
    description: "Votre dossier de certification a évolué.",
  }),
  KYC_DECISION: ({ status }) => ({
    title: "Décision KYC",
    description:
      status === "VERIFIED"
        ? "Votre KYC est validé. Vous pouvez recevoir des appels d'offres."
        : status === "REJECTED"
          ? "Votre KYC a été refusé. Contactez kyc@sourcingpick.com."
          : status === "FLAGGED"
            ? "Votre KYC est signalé pour vérification additionnelle."
            : "Votre dossier KYC a été mis à jour.",
  }),
  MESSAGE_MENTION: ({ title }) => ({
    title: title ? `Nouveau message · ${title}` : "Nouveau message",
    description: "Vous avez reçu un nouveau message.",
  }),
  SYSTEM: ({ title, systemKey }) => ({
    title: (systemKey && SYSTEM_TITLES[systemKey]?.fr) ?? title ?? "Notification",
    description: "",
  }),
};

const EN: Pack = {
  QUOTE_RECEIVED: ({ factoryName, reference }) => ({
    title: `New quote · ${reference ?? ""}`.trim(),
    description: factoryName
      ? `${factoryName} submitted a quote on your request.`
      : "A factory submitted a quote.",
  }),
  QUOTE_ACCEPTED: ({ clientName, reference }) => ({
    title: `Quote accepted · ${reference ?? ""}`.trim(),
    description: clientName
      ? `${clientName} accepted your quote. The order is now open.`
      : "The client accepted a quote and the order is open.",
  }),
  PAYMENT_RECEIVED: ({ reference }) => ({
    title: `Payment received · ${reference ?? ""}`.trim(),
    description: "Payment is confirmed. You can start production.",
  }),
  SHIPMENT: ({ reference, factoryName }) => ({
    title: `Order shipped · ${reference ?? ""}`.trim(),
    description: factoryName
      ? `${factoryName} shipped your order.`
      : "Your order has shipped.",
  }),
  INVOICE_DUE: ({ reference }) => ({
    title: `Invoice due · ${reference ?? ""}`.trim(),
    description: "An invoice is awaiting payment.",
  }),
  CERT_UPDATE: ({ title }) => ({
    title: title ?? "Certification update",
    description: "Your certification file has been updated.",
  }),
  KYC_DECISION: ({ status }) => ({
    title: "KYC decision",
    description:
      status === "VERIFIED"
        ? "Your KYC is approved. You can now receive tender invitations."
        : status === "REJECTED"
          ? "Your KYC was rejected. Contact kyc@sourcingpick.com."
          : status === "FLAGGED"
            ? "Your KYC is flagged for additional review."
            : "Your KYC file has been updated.",
  }),
  MESSAGE_MENTION: ({ title }) => ({
    title: title ? `New message · ${title}` : "New message",
    description: "You have a new message.",
  }),
  SYSTEM: ({ title, systemKey }) => ({
    title: (systemKey && SYSTEM_TITLES[systemKey]?.en) ?? title ?? "Notification",
    description: "",
  }),
};

const ZH: Pack = {
  QUOTE_RECEIVED: ({ factoryName, reference }) => ({
    title: `新报价 · ${reference ?? ""}`.trim(),
    description: factoryName
      ? `${factoryName} 已对您的需求提交报价。`
      : "工厂已提交报价。",
  }),
  QUOTE_ACCEPTED: ({ clientName, reference }) => ({
    title: `报价已接受 · ${reference ?? ""}`.trim(),
    description: clientName
      ? `${clientName} 已接受您的报价,订单已创建。`
      : "客户已接受报价,订单已创建。",
  }),
  PAYMENT_RECEIVED: ({ reference }) => ({
    title: `已收到付款 · ${reference ?? ""}`.trim(),
    description: "付款已确认,您可以开始生产。",
  }),
  SHIPMENT: ({ reference, factoryName }) => ({
    title: `订单已发货 · ${reference ?? ""}`.trim(),
    description: factoryName ? `${factoryName} 已发出您的订单。` : "您的订单已发货。",
  }),
  INVOICE_DUE: ({ reference }) => ({
    title: `发票待支付 · ${reference ?? ""}`.trim(),
    description: "一张发票等待支付。",
  }),
  CERT_UPDATE: ({ title }) => ({
    title: title ?? "认证更新",
    description: "您的认证文件已更新。",
  }),
  KYC_DECISION: ({ status }) => ({
    title: "KYC 决定",
    description:
      status === "VERIFIED"
        ? "您的 KYC 已通过,可以开始接收招标邀请。"
        : status === "REJECTED"
          ? "您的 KYC 被拒绝。请联系 kyc@sourcingpick.com。"
          : status === "FLAGGED"
            ? "您的 KYC 被标记需进一步审核。"
            : "您的 KYC 文件已更新。",
  }),
  MESSAGE_MENTION: ({ title }) => ({
    title: title ? `新消息 · ${title}` : "新消息",
    description: "您有一条新消息。",
  }),
  SYSTEM: ({ title, systemKey }) => ({
    title: (systemKey && SYSTEM_TITLES[systemKey]?.zh) ?? title ?? "通知",
    description: "",
  }),
};

const AR: Pack = {
  QUOTE_RECEIVED: ({ factoryName, reference }) => ({
    title: `عرض سعر جديد · ${reference ?? ""}`.trim(),
    description: factoryName
      ? `${factoryName} قدّم عرض سعر على طلبك.`
      : "قدّم أحد المصانع عرض سعر.",
  }),
  QUOTE_ACCEPTED: ({ clientName, reference }) => ({
    title: `تم قبول عرض السعر · ${reference ?? ""}`.trim(),
    description: clientName
      ? `${clientName} قبل عرض السعر الخاص بك. تم فتح الطلب.`
      : "قبل العميل عرض السعر وتم فتح الطلب.",
  }),
  PAYMENT_RECEIVED: ({ reference }) => ({
    title: `تم استلام الدفعة · ${reference ?? ""}`.trim(),
    description: "تم تأكيد الدفع. يمكنك بدء الإنتاج.",
  }),
  SHIPMENT: ({ reference, factoryName }) => ({
    title: `تم شحن الطلب · ${reference ?? ""}`.trim(),
    description: factoryName
      ? `${factoryName} شحن طلبك.`
      : "تم شحن طلبك.",
  }),
  INVOICE_DUE: ({ reference }) => ({
    title: `فاتورة مستحقة · ${reference ?? ""}`.trim(),
    description: "هناك فاتورة بانتظار الدفع.",
  }),
  CERT_UPDATE: ({ title }) => ({
    title: title ?? "تحديث على الشهادة",
    description: "تم تحديث ملف الشهادة الخاص بك.",
  }),
  KYC_DECISION: ({ status }) => ({
    title: "قرار التحقق من الهوية",
    description:
      status === "VERIFIED"
        ? "تمت الموافقة على ملف KYC. يمكنك الآن استلام دعوات المناقصات."
        : status === "REJECTED"
          ? "تم رفض ملف KYC. تواصل مع kyc@sourcingpick.com."
          : status === "FLAGGED"
            ? "تم وضع ملف KYC قيد المراجعة الإضافية."
            : "تم تحديث ملف KYC.",
  }),
  MESSAGE_MENTION: ({ title }) => ({
    title: title ? `رسالة جديدة · ${title}` : "رسالة جديدة",
    description: "لديك رسالة جديدة.",
  }),
  SYSTEM: ({ title, systemKey }) => ({
    title: (systemKey && SYSTEM_TITLES[systemKey]?.ar) ?? title ?? "إشعار",
    description: "",
  }),
};

const PACKS: Record<Locale, Pack> = { fr: FR, en: EN, zh: ZH, ar: AR };

export function renderNotification(
  type: NotificationType,
  locale: Locale,
  vars: NotificationVars,
): NotificationCopy {
  return PACKS[locale][type](vars);
}

/**
 * Types that warrant an email beyond the in-app banner. The rest stay
 * in-app only to avoid notification fatigue.
 */
export const EMAIL_TYPES: Set<NotificationType> = new Set([
  NotificationType.QUOTE_RECEIVED,
  NotificationType.QUOTE_ACCEPTED,
  NotificationType.KYC_DECISION,
  NotificationType.SHIPMENT,
]);
