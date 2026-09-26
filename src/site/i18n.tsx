import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const LANGS = [
  { id: "fr", label: "Français" },
  { id: "en", label: "English" },
  { id: "zh", label: "中文" },
  { id: "es", label: "Español" },
  { id: "de", label: "Deutsch" },
  { id: "it", label: "Italiano" },
  { id: "pt", label: "Português" },
  { id: "nl", label: "Nederlands" },
  { id: "ar", label: "العربية" },
  { id: "ru", label: "Русский" },
  { id: "tr", label: "Türkçe" },
  { id: "pl", label: "Polski" },
] as const;

export type Lang = (typeof LANGS)[number]["id"];

type Pack = {
  banner: string;
  bannerLink: string;
  services: string;
  how: string;
  warehouse: string;
  prices: string;
  faq: string;
  client: string;
  quote: string;
  kicker: string;
  heroA: string;
  heroEm: string;
  heroB: string;
  lead: string;
  steps: string;
  langNote: string;
};

const fr: Pack = {
  banner: "Sourcing Pick démarre. Nous préférons vous montrer notre entrepôt plutôt que d’inventer des avis clients.",
  bannerLink: "Ce qui est vrai aujourd’hui",
  services: "Services",
  how: "Comment ça marche",
  warehouse: "Entrepôt",
  prices: "Tarifs",
  faq: "FAQ",
  client: "Espace client",
  quote: "Demander un devis",
  kicker: "Guangzhou → Nansha → Europe",
  heroA: "Vos marchandises de Chine,",
  heroEm: "vérifiées",
  heroB: "avant d’embarquer.",
  lead: "Sourcing Pick réceptionne vos commandes dans son entrepôt de Guangzhou, contrôle chaque colis, consolide, renforce, charge le conteneur et l’expédie depuis le port de Nansha vers l’Europe. Des photos à chaque étape, le suivi dans votre espace client.",
  steps: "Voir les 6 étapes",
  langNote: "",
};

const packs: Record<Lang, Pack> = {
  fr,
  en: {
    ...fr,
    banner: "Sourcing Pick is just starting. We would rather show you the warehouse than invent customer reviews.",
    bannerLink: "What is true today",
    services: "Services",
    how: "How it works",
    warehouse: "Warehouse",
    prices: "Prices",
    faq: "FAQ",
    client: "Client area",
    quote: "Request a quote",
    kicker: "Guangzhou → Nansha → Europe",
    heroA: "Your goods from China,",
    heroEm: "checked",
    heroB: "before they sail.",
    lead: "Sourcing Pick receives your orders in Guangzhou, checks every parcel, consolidates, reinforces, loads the container and ships it from Nansha to Europe. Photos at every step, tracking in your client area.",
    steps: "See the 6 steps",
    langNote: "Detailed pages stay in French, the language of the contract.",
  },
  zh: {
    ...fr,
    banner: "Sourcing Pick 刚刚起步。我们宁可带您看仓库，也不编造客户评价。",
    bannerLink: "今天真实的情况",
    services: "服务",
    how: "如何运作",
    warehouse: "仓库",
    prices: "价格",
    faq: "常见问题",
    client: "客户空间",
    quote: "索取报价",
    heroA: "您的中国货物，",
    heroEm: "装船前已核验",
    heroB: "。",
    lead: "Sourcing Pick 在广州仓库接收订单，逐件检查、合并、加固，在南沙港装柜发往欧洲。每个步骤都有照片，并在客户空间跟踪。",
    steps: "查看 6 个步骤",
    langNote: "详细页面仍为法文，即合同语言。",
  },
  es: {
    ...fr,
    banner: "Sourcing Pick acaba de empezar. Preferimos mostrar el almacén antes que inventar opiniones.",
    bannerLink: "Lo que es cierto hoy",
    services: "Servicios",
    how: "Cómo funciona",
    warehouse: "Almacén",
    prices: "Tarifas",
    faq: "FAQ",
    client: "Área de cliente",
    quote: "Pedir un presupuesto",
    heroA: "Sus mercancías de China,",
    heroEm: "verificadas",
    heroB: "antes de embarcar.",
    lead: "Recibimos sus pedidos en Cantón, controlamos cada bulto, consolidamos, reforzamos, cargamos el contenedor y lo expedimos desde Nansha hacia Europa.",
    steps: "Ver las 6 etapas",
    langNote: "Las páginas detalladas siguen en francés, idioma del contrato.",
  },
  de: {
    ...fr,
    banner: "Sourcing Pick fängt gerade an. Lieber das Lager zeigen als erfundene Bewertungen.",
    bannerLink: "Was heute stimmt",
    services: "Leistungen",
    how: "Ablauf",
    warehouse: "Lager",
    prices: "Preise",
    faq: "FAQ",
    client: "Kundenbereich",
    quote: "Angebot anfragen",
    heroA: "Ihre Waren aus China,",
    heroEm: "geprüft",
    heroB: "bevor sie an Bord gehen.",
    lead: "Wir nehmen Ihre Sendungen in Guangzhou an, prüfen jedes Paket, konsolidieren, verstärken, beladen den Container und verschiffen ihn ab Nansha nach Europa.",
    steps: "Die 6 Schritte",
    langNote: "Ausführliche Seiten bleiben auf Französisch, der Vertragssprache.",
  },
  it: {
    ...fr,
    banner: "Sourcing Pick è appena nata. Meglio mostrarvi il magazzino che inventare recensioni.",
    bannerLink: "Ciò che è vero oggi",
    services: "Servizi",
    how: "Come funziona",
    warehouse: "Magazzino",
    prices: "Tariffe",
    faq: "FAQ",
    client: "Area clienti",
    quote: "Chiedere un preventivo",
    heroA: "Le vostre merci dalla Cina,",
    heroEm: "verificate",
    heroB: "prima dell’imbarco.",
    lead: "Riceviamo gli ordini a Guangzhou, controlliamo ogni collo, consolidiamo, rinforziamo, carichiamo il container e lo spediamo da Nansha verso l’Europa.",
    steps: "Vedere le 6 fasi",
    langNote: "Le pagine dettagliate restano in francese, lingua del contratto.",
  },
  pt: {
    ...fr,
    banner: "A Sourcing Pick está a começar. Preferimos mostrar o armazém a inventar avaliações.",
    bannerLink: "O que é verdade hoje",
    services: "Serviços",
    how: "Como funciona",
    warehouse: "Armazém",
    prices: "Preços",
    faq: "FAQ",
    client: "Área de cliente",
    quote: "Pedir um orçamento",
    heroA: "As suas mercadorias da China,",
    heroEm: "verificadas",
    heroB: "antes do embarque.",
    lead: "Recebemos as encomendas em Guangzhou, controlamos cada volume, consolidamos, reforçamos, carregamos o contentor e expedimos de Nansha para a Europa.",
    steps: "Ver as 6 etapas",
    langNote: "As páginas detalhadas ficam em francês, a língua do contrato.",
  },
  nl: {
    ...fr,
    banner: "Sourcing Pick begint net. Liever het magazijn tonen dan verzonnen reviews.",
    bannerLink: "Wat vandaag klopt",
    services: "Diensten",
    how: "Hoe het werkt",
    warehouse: "Magazijn",
    prices: "Tarieven",
    faq: "FAQ",
    client: "Klantomgeving",
    quote: "Offerte aanvragen",
    heroA: "Uw goederen uit China,",
    heroEm: "gecontroleerd",
    heroB: "voordat ze vertrekken.",
    lead: "We ontvangen uw zendingen in Guangzhou, controleren elk pakket, consolideren, verstevigen, laden de container en verschepen vanaf Nansha naar Europa.",
    steps: "De 6 stappen",
    langNote: "Uitgebreide pagina’s blijven in het Frans, de taal van het contract.",
  },
  ar: {
    ...fr,
    banner: "سورسنغ بيك في بدايتها. نفضّل أن نريكم المستودع على اختراع آراء العملاء.",
    bannerLink: "ما هو صحيح اليوم",
    services: "الخدمات",
    how: "كيف يعمل",
    warehouse: "المستودع",
    prices: "الأسعار",
    faq: "الأسئلة",
    client: "فضاء العميل",
    quote: "طلب عرض",
    heroA: "بضائعكم من الصين،",
    heroEm: "مُراجعة",
    heroB: "قبل الإبحار.",
    lead: "نستلم طلباتكم في غوانغتشو، نراجع كل طرد، نجمعها، ندعّمها، نحمّل الحاوية ونشحنها من نانشا نحو أوروبا.",
    steps: "الخطوات الست",
    langNote: "الصفحات المفصّلة تبقى بالفرنسية، لغة العقد.",
  },
  ru: {
    ...fr,
    banner: "Sourcing Pick только начинает. Лучше показать склад, чем выдумать отзывы.",
    bannerLink: "Что верно сегодня",
    services: "Услуги",
    how: "Как это работает",
    warehouse: "Склад",
    prices: "Тарифы",
    faq: "Вопросы",
    client: "Кабинет",
    quote: "Запросить смету",
    heroA: "Ваши товары из Китая,",
    heroEm: "проверенные",
    heroB: "до погрузки на судно.",
    lead: "Принимаем заказы в Гуанчжоу, проверяем каждое место, консолидируем, усиливаем упаковку, грузим контейнер и отправляем из Наньша в Европу.",
    steps: "6 этапов",
    langNote: "Подробные страницы остаются на французском — языке договора.",
  },
  tr: {
    ...fr,
    banner: "Sourcing Pick yeni başlıyor. Uydurma yorum yerine depoyu göstermeyi tercih ederiz.",
    bannerLink: "Bugün doğru olan",
    services: "Hizmetler",
    how: "Nasıl işler",
    warehouse: "Depo",
    prices: "Tarifeler",
    faq: "SSS",
    client: "Müşteri alanı",
    quote: "Teklif iste",
    heroA: "Çin’den mallarınız,",
    heroEm: "kontrol edilmiş",
    heroB: "olarak yola çıkar.",
    lead: "Siparişlerinizi Guangzhou’da teslim alır, her koliyi kontrol eder, birleştirir, güçlendirir, konteynere yükler ve Nansha’dan Avrupa’ya göndeririz.",
    steps: "6 adımı görün",
    langNote: "Ayrıntılı sayfalar sözleşmenin dili olan Fransızcada kalır.",
  },
  pl: {
    ...fr,
    banner: "Sourcing Pick dopiero startuje. Wolimy pokazać magazyn niż wymyślać opinie.",
    bannerLink: "Co jest prawdą dziś",
    services: "Usługi",
    how: "Jak to działa",
    warehouse: "Magazyn",
    prices: "Cennik",
    faq: "FAQ",
    client: "Strefa klienta",
    quote: "Poproś o wycenę",
    heroA: "Wasze towary z Chin,",
    heroEm: "sprawdzone",
    heroB: "zanim wypłyną.",
    lead: "Przyjmujemy zamówienia w Kantonie, sprawdzamy każdą paczkę, konsolidujemy, wzmacniamy, ładujemy kontener i wysyłamy z Nansha do Europy.",
    steps: "Zobacz 6 etapów",
    langNote: "Szczegółowe strony pozostają po francusku, w języku umowy.",
  },
};

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Pack }>({
  lang: "fr",
  setLang: () => {},
  t: fr,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");
  useEffect(() => {
    const saved = localStorage.getItem("sp_lang");
    if (LANGS.some((l) => l.id === saved)) setLangState(saved as Lang);
  }, []);
  function setLang(next: Lang) {
    setLangState(next);
    localStorage.setItem("sp_lang", next);
  }
  return <Ctx.Provider value={{ lang, setLang, t: packs[lang] }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}
