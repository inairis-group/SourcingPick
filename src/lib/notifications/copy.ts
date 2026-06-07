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
    | "dispute_responded"
    | "order_dispute_resolved"
    | "request_received"
    | "auction_outbid"
    | "auction_won"
    | "auction_sold"
    | "pre_tender_approved"
    | "pre_tender_rejected"
    | "forwarder_proof_uploaded"
    | "support_ticket_created"
    | "support_ticket_resolved"
    | "marketplace_re_review_requested"
    | "marketplace_listing_blocked"
    | "marketplace_listing_unblocked"
    | "marketplace_listing_archived_by_admin"
    | "marketplace_listing_edited_by_admin"
    | "marketplace_sample_ordered"
    | "quote_relance"
    | "research_fee_refunded";
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
  dispute_responded: {
    fr: "Réponse de l'usine au litige",
    en: "Factory responded to the dispute",
    zh: "工厂已回复争议",
    ar: "ردّ المصنع على النزاع",
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
  auction_outbid: {
    fr: "Vous avez été surenchéri sur une enchère",
    en: "You've been outbid on an auction",
    zh: "您在拍卖中被超过出价",
    ar: "تم تجاوز عرضك في المزاد",
  },
  auction_won: {
    fr: "Vous avez remporté une enchère",
    en: "You won an auction",
    zh: "您赢得了拍卖",
    ar: "لقد ربحت المزاد",
  },
  auction_sold: {
    fr: "Votre enchère a été remportée",
    en: "Your auction has sold",
    zh: "您的拍卖已成交",
    ar: "تم بيع مزادك",
  },
  pre_tender_approved: {
    fr: "Demande validée — vous pouvez lancer l'appel d'offres",
    en: "Request approved — you can dispatch the tender",
    zh: "需求已审核通过 — 可以发起招标",
    ar: "تمت الموافقة على الطلب — يمكنك إطلاق المناقصة",
  },
  pre_tender_rejected: {
    fr: "Demande renvoyée pour révision avant appel d'offres",
    en: "Request returned for revision before tendering",
    zh: "需求需修订后才能招标",
    ar: "تمت إعادة الطلب للمراجعة قبل المناقصة",
  },
  forwarder_proof_uploaded: {
    fr: "Le transitaire a déposé des preuves d'expédition",
    en: "Forwarder uploaded shipment proofs",
    zh: "货运代理已上传发货证明",
    ar: "حمّل وكيل الشحن إثباتات الشحنة",
  },
  support_ticket_created: {
    fr: "Nouveau ticket support ouvert",
    en: "New support ticket opened",
    zh: "已创建新的支持工单",
    ar: "تم فتح تذكرة دعم جديدة",
  },
  support_ticket_resolved: {
    fr: "Ticket support marqué comme résolu",
    en: "Support ticket marked as resolved",
    zh: "支持工单已标记为已解决",
    ar: "تم وضع تذكرة الدعم على أنها محلولة",
  },
  marketplace_re_review_requested: {
    fr: "Modification d'annonce — à réexaminer",
    en: "Listing edited — needs re-review",
    zh: "商品已修改 — 需要重新审核",
    ar: "تم تعديل قائمة — يلزم إعادة المراجعة",
  },
  research_fee_refunded: {
    fr: "Frais de recherche remboursés en crédit",
    en: "Research fee refunded as credit",
    zh: "调研费已退款至账户",
    ar: "تم استرداد رسوم البحث كرصيد",
  },
  marketplace_listing_blocked: {
    fr: "Annonce temporairement bloquée par SourcingPick",
    en: "Listing temporarily blocked by SourcingPick",
    zh: "商品已被 SourcingPick 暂时下架",
    ar: "تم حظر القائمة مؤقتًا من SourcingPick",
  },
  marketplace_listing_unblocked: {
    fr: "Annonce débloquée — de retour en ligne",
    en: "Listing unblocked — back live",
    zh: "商品已解除封锁 — 已恢复上架",
    ar: "تم رفع الحظر — عاد الإعلان مباشرًا",
  },
  marketplace_listing_archived_by_admin: {
    fr: "Annonce archivée par SourcingPick",
    en: "Listing archived by SourcingPick",
    zh: "商品已被 SourcingPick 归档",
    ar: "تمت أرشفة القائمة من SourcingPick",
  },
  marketplace_listing_edited_by_admin: {
    fr: "Annonce modifiée par SourcingPick",
    en: "Listing edited by SourcingPick",
    zh: "商品已被 SourcingPick 编辑",
    ar: "تم تعديل القائمة من SourcingPick",
  },
  marketplace_sample_ordered: {
    fr: "Commande d'échantillon reçue",
    en: "Sample order received",
    zh: "收到样品订单",
    ar: "تم استلام طلب عيّنة",
  },
  quote_relance: {
    fr: "Relance — devis en attente de décision",
    en: "Reminder — quote awaiting your decision",
    zh: "提醒 — 报价等待您决定",
    ar: "تذكير — العرض بانتظار قرارك",
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
