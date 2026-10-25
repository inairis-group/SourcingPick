import type { Locale } from "@/lib/i18n/config";

export type AddressGateCopy = { title: string; body: string; cta: string; login: string };

/** In place of the warehouse address on the public pages (address-gate.tsx). */
export const addressGateCopy: Record<Locale, AddressGateCopy> = {
  fr: {
    title: "Adresse communiquée après inscription",
    body: "Créez votre compte gratuit : nous vous transmettons l’adresse complète de l’entrepôt, en chinois pour vos fournisseurs, avec votre code client.",
    cta: "Créer mon compte gratuit",
    login: "J’ai déjà un compte",
  },
  en: {
    title: "Address provided after sign-up",
    body: "Create your free account: we’ll send you the full warehouse address, in Chinese for your suppliers, together with your client code.",
    cta: "Create my free account",
    login: "I already have an account",
  },
  zh: {
    title: "注册后提供仓库地址",
    body: "免费注册账户后，我们就把仓库的完整地址和您的客户编码发给您。地址附中文，方便直接转给供应商。",
    cta: "免费注册账户",
    login: "我已有账户",
  },
  es: {
    title: "Dirección facilitada tras el registro",
    body: "Cree su cuenta gratuita: le facilitamos la dirección completa del almacén, en chino para sus proveedores, junto con su código de cliente.",
    cta: "Crear mi cuenta gratuita",
    login: "Ya tengo una cuenta",
  },
  de: {
    title: "Adresse nach der Registrierung",
    body: "Erstellen Sie Ihr kostenloses Konto: Wir teilen Ihnen die vollständige Lageradresse mit – auf Chinesisch für Ihre Lieferanten – zusammen mit Ihrem Kundencode.",
    cta: "Kostenloses Konto erstellen",
    login: "Ich habe schon ein Konto",
  },
  it: {
    title: "Indirizzo comunicato dopo la registrazione",
    body: "Create il vostro account gratuito: vi comunichiamo l’indirizzo completo del magazzino, in cinese per i vostri fornitori, insieme al vostro codice cliente.",
    cta: "Crea il mio account gratuito",
    login: "Ho già un account",
  },
  pt: {
    title: "Morada comunicada após o registo",
    body: "Crie a sua conta gratuita: transmitimos-lhe a morada completa do armazém, em chinês para os seus fornecedores, com o seu código de cliente.",
    cta: "Criar a minha conta gratuita",
    login: "Já tenho conta",
  },
  nl: {
    title: "Adres beschikbaar na registratie",
    body: "Maak uw gratis account aan: wij geven u het volledige adres van het magazijn door, in het Chinees voor uw leveranciers, samen met uw klantcode.",
    cta: "Gratis account aanmaken",
    login: "Ik heb al een account",
  },
  ar: {
    title: "نرسل العنوان بعد التسجيل",
    body: "أنشئ حسابك المجاني: نرسل إليك العنوان الكامل للمستودع، بالصينية لمورّديك، مع رمز العميل الخاص بك.",
    cta: "إنشاء حسابي المجاني",
    login: "لديّ حساب بالفعل",
  },
  ru: {
    title: "Адрес сообщается после регистрации",
    body: "Создайте бесплатный аккаунт: мы сообщим вам полный адрес склада на китайском языке для ваших поставщиков, а также ваш код клиента.",
    cta: "Создать бесплатный аккаунт",
    login: "У меня уже есть аккаунт",
  },
  tr: {
    title: "Adres, kayıttan sonra iletilir",
    body: "Ücretsiz hesabınızı oluşturun: deponun tam adresini, tedarikçileriniz için Çince olarak, müşteri kodunuzla birlikte size iletiriz.",
    cta: "Ücretsiz hesap oluşturun",
    login: "Zaten hesabım var",
  },
  pl: {
    title: "Adres przekazujemy po rejestracji",
    body: "Wystarczy założyć bezpłatne konto: przekażemy Państwu pełny adres magazynu – po chińsku, dla Państwa dostawców – wraz z kodem klienta.",
    cta: "Załóż bezpłatne konto",
    login: "Mam już konto",
  },
};
