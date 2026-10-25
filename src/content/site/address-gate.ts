import type { Locale } from "@/lib/i18n/config";

export type AddressGateCopy = {
  title: string;
  body: string;
  /** Opens the form. */
  open: string;
  name: string;
  email: string;
  phone: string;
  submit: string;
  sending: string;
  /** "{email}" is the address it was sent to. */
  sent: string;
  errors: { invalid_email: string; rate_limited: string; failed: string };
  cta: string;
  login: string;
  /** The e-mail that carries the address. */
  mail: {
    subject: string;
    heading: string;
    intro: string;
    chinese: string;
    latin: string;
    hours: string;
    phone: string;
    codeNote: string;
    signupCta: string;
  };
};

/**
 * In place of the warehouse address on the public pages (address-gate.tsx),
 * and the e-mail that sends it (lib/site/address-request.ts).
 */
export const addressGateCopy: Record<Locale, AddressGateCopy> = {
  fr: {
    title: "Adresse communiquée après inscription",
    body: "Laissez-nous vos coordonnées : nous vous envoyons l’adresse complète de l’entrepôt par e-mail, en chinois pour vos fournisseurs. Votre code client vous est attribué à la création de votre compte.",
    open: "Recevoir l’adresse par e-mail",
    name: "Nom et prénom",
    email: "E-mail",
    phone: "Téléphone ou WhatsApp (facultatif)",
    submit: "Recevoir l’adresse",
    sending: "Envoi…",
    sent: "C’est envoyé à {email}. Créez maintenant votre compte pour recevoir votre code client et suivre vos envois.",
    errors: {
      invalid_email: "Indiquez une adresse e-mail valide.",
      rate_limited: "Trop de demandes. Réessayez dans une heure.",
      failed: "L’envoi a échoué. Écrivez-nous à contact@sourcingpick.com.",
    },
    cta: "Créer mon compte gratuit",
    login: "J’ai déjà un compte",
    mail: {
      subject: "L’adresse de l’entrepôt SourcingPick",
      heading: "L’adresse de notre entrepôt",
      intro:
        "Voici l’adresse à donner à vos fournisseurs. Envoyez-leur la version chinoise : c’est celle qu’ils utilisent.",
      chinese: "En chinois, pour vos fournisseurs",
      latin: "En lettres latines",
      hours: "Horaires de réception",
      phone: "Téléphone de l’entrepôt",
      codeNote:
        "Créez votre compte : nous vous attribuons un code client, que vos fournisseurs écrivent sur chaque carton pour que nous reconnaissions vos colis.",
      signupCta: "Créer mon compte",
    },
  },
  en: {
    title: "Address provided after sign-up",
    body: "Leave us your details: we’ll email you the full warehouse address, in Chinese for your suppliers. Your client code is assigned when you create your account.",
    open: "Get the address by email",
    name: "Full name",
    email: "Email",
    phone: "Phone or WhatsApp (optional)",
    submit: "Get the address",
    sending: "Sending…",
    sent: "Sent to {email}. Now create your account to receive your client code and track your shipments.",
    errors: {
      invalid_email: "Enter a valid email address.",
      rate_limited: "Too many requests. Try again in an hour.",
      failed: "Sending failed. Write to us at contact@sourcingpick.com.",
    },
    cta: "Create my free account",
    login: "I already have an account",
    mail: {
      subject: "The SourcingPick warehouse address",
      heading: "Our warehouse address",
      intro:
        "Here is the address to give your suppliers. Send them the Chinese version: it’s the one they use.",
      chinese: "In Chinese, for your suppliers",
      latin: "In Latin characters",
      hours: "Receiving hours",
      phone: "Warehouse phone",
      codeNote:
        "Create your account: we’ll assign you a client code, which your suppliers write on every carton so that we can identify your packages.",
      signupCta: "Create my account",
    },
  },
  zh: {
    title: "注册后提供仓库地址",
    body: "留下您的联系方式，我们就把仓库的完整地址发到您的邮箱，附中文版，方便直接转给供应商。注册账户后，我们会为您分配客户编码。",
    open: "把地址发到我的邮箱",
    name: "姓名",
    email: "邮箱",
    phone: "电话或 WhatsApp（选填）",
    submit: "获取地址",
    sending: "发送中…",
    sent: "已发送到 {email}。现在就注册账户，领取您的客户编码，随时跟踪您的货。",
    errors: {
      invalid_email: "请填写有效的邮箱地址。",
      rate_limited: "请求次数过多，请一小时后再试。",
      failed: "发送失败，请发邮件到 contact@sourcingpick.com 联系我们。",
    },
    cta: "免费注册账户",
    login: "我已有账户",
    mail: {
      subject: "SourcingPick 仓库地址",
      heading: "我们的仓库地址",
      intro: "以下是要提供给供应商的地址。请把中文版发给他们，他们用的都是中文地址。",
      chinese: "中文版，发给供应商",
      latin: "拼音版",
      hours: "收货时间",
      phone: "仓库电话",
      codeNote:
        "请注册账户：我们会为您分配客户编码，供应商在每个纸箱上标注这个编码，我们就能认出您的货。",
      signupCta: "注册账户",
    },
  },
  es: {
    title: "Dirección facilitada tras el registro",
    body: "Déjenos sus datos: le enviamos por correo electrónico la dirección completa del almacén, en chino para sus proveedores. Su código de cliente se le asigna al crear su cuenta.",
    open: "Recibir la dirección por correo electrónico",
    name: "Nombre y apellidos",
    email: "Correo electrónico",
    phone: "Teléfono o WhatsApp (opcional)",
    submit: "Recibir la dirección",
    sending: "Enviando…",
    sent: "Enviado a {email}. Cree ahora su cuenta para recibir su código de cliente y seguir sus envíos.",
    errors: {
      invalid_email: "Indique una dirección de correo electrónico válida.",
      rate_limited: "Demasiadas solicitudes. Vuelva a intentarlo dentro de una hora.",
      failed: "No se ha podido enviar. Escríbanos a contact@sourcingpick.com.",
    },
    cta: "Crear mi cuenta gratuita",
    login: "Ya tengo una cuenta",
    mail: {
      subject: "La dirección del almacén de SourcingPick",
      heading: "La dirección de nuestro almacén",
      intro:
        "Esta es la dirección que debe facilitar a sus proveedores. Envíeles la versión en chino: es la que utilizan.",
      chinese: "En chino, para sus proveedores",
      latin: "En caracteres latinos",
      hours: "Horario de recepción",
      phone: "Teléfono del almacén",
      codeNote:
        "Cree su cuenta: le asignamos un código de cliente, que sus proveedores indican en cada caja para que podamos reconocer sus bultos.",
      signupCta: "Crear mi cuenta",
    },
  },
  de: {
    title: "Adresse nach der Registrierung",
    body: "Hinterlassen Sie uns Ihre Kontaktdaten: Wir senden Ihnen die vollständige Lageradresse per E-Mail – auf Chinesisch für Ihre Lieferanten. Ihren Kundencode erhalten Sie, sobald Sie Ihr Konto erstellen.",
    open: "Adresse per E-Mail erhalten",
    name: "Vor- und Nachname",
    email: "E-Mail",
    phone: "Telefon oder WhatsApp (optional)",
    submit: "Adresse erhalten",
    sending: "Wird gesendet…",
    sent: "Gesendet an {email}. Erstellen Sie jetzt Ihr Konto, um Ihren Kundencode zu erhalten und Ihre Sendungen zu verfolgen.",
    errors: {
      invalid_email: "Bitte geben Sie eine gültige E-Mail-Adresse an.",
      rate_limited: "Zu viele Anfragen. Versuchen Sie es in einer Stunde erneut.",
      failed: "Das Senden ist fehlgeschlagen. Schreiben Sie uns an contact@sourcingpick.com.",
    },
    cta: "Kostenloses Konto erstellen",
    login: "Ich habe schon ein Konto",
    mail: {
      subject: "Die Lageradresse von SourcingPick",
      heading: "Die Adresse unseres Lagers",
      intro:
        "Hier ist die Adresse, die Sie Ihren Lieferanten geben. Schicken Sie ihnen die chinesische Fassung: Mit ihr arbeiten sie.",
      chinese: "Auf Chinesisch, für Ihre Lieferanten",
      latin: "In lateinischer Schrift",
      hours: "Annahmezeiten",
      phone: "Telefon des Lagers",
      codeNote:
        "Erstellen Sie Ihr Konto: Wir teilen Ihnen einen Kundencode zu, den Ihre Lieferanten auf jeden Karton schreiben, damit wir Ihre Packstücke erkennen.",
      signupCta: "Mein Konto erstellen",
    },
  },
  it: {
    title: "Indirizzo comunicato dopo la registrazione",
    body: "Lasciateci i vostri recapiti: vi inviamo via email l’indirizzo completo del magazzino, in cinese per i vostri fornitori. Il vostro codice cliente vi viene assegnato alla creazione del vostro account.",
    open: "Ricevi l’indirizzo via email",
    name: "Nome e cognome",
    email: "Email",
    phone: "Telefono o WhatsApp (facoltativo)",
    submit: "Ricevi l’indirizzo",
    sending: "Invio…",
    sent: "Inviato a {email}. Ora create il vostro account per ricevere il vostro codice cliente e seguire le vostre spedizioni.",
    errors: {
      invalid_email: "Indicate un indirizzo email valido.",
      rate_limited: "Troppe richieste. Riprovate tra un’ora.",
      failed: "L’invio non è riuscito. Scriveteci a contact@sourcingpick.com.",
    },
    cta: "Crea il mio account gratuito",
    login: "Ho già un account",
    mail: {
      subject: "L’indirizzo del magazzino SourcingPick",
      heading: "L’indirizzo del nostro magazzino",
      intro:
        "Ecco l’indirizzo da comunicare ai vostri fornitori. Inviate loro la versione in cinese: è quella che usano.",
      chinese: "In cinese, per i vostri fornitori",
      latin: "In caratteri latini",
      hours: "Orari di ricevimento merci",
      phone: "Telefono del magazzino",
      codeNote:
        "Create il vostro account: vi assegniamo un codice cliente, che i vostri fornitori riportano su ogni cartone per permetterci di riconoscere i vostri colli.",
      signupCta: "Crea il mio account",
    },
  },
  pt: {
    title: "Morada comunicada após o registo",
    body: "Deixe-nos os seus contactos: enviamos-lhe por e-mail a morada completa do armazém, em chinês para os seus fornecedores. O seu código de cliente é-lhe atribuído quando cria a sua conta.",
    open: "Receber a morada por e-mail",
    name: "Nome e apelido",
    email: "E-mail",
    phone: "Telefone ou WhatsApp (opcional)",
    submit: "Receber a morada",
    sending: "A enviar…",
    sent: "Enviado para {email}. Crie agora a sua conta para receber o seu código de cliente e acompanhar os seus envios.",
    errors: {
      invalid_email: "Indique um endereço de e-mail válido.",
      rate_limited: "Demasiados pedidos. Tente novamente dentro de uma hora.",
      failed: "O envio falhou. Escreva-nos para contact@sourcingpick.com.",
    },
    cta: "Criar a minha conta gratuita",
    login: "Já tenho conta",
    mail: {
      subject: "A morada do armazém da SourcingPick",
      heading: "A morada do nosso armazém",
      intro:
        "Eis a morada a dar aos seus fornecedores. Envie-lhes a versão em chinês: é a que eles utilizam.",
      chinese: "Em chinês, para os seus fornecedores",
      latin: "Em alfabeto latino",
      hours: "Horário de receção",
      phone: "Telefone do armazém",
      codeNote:
        "Crie a sua conta: atribuímos-lhe um código de cliente, que os seus fornecedores inscrevem em cada caixa para que possamos reconhecer os seus volumes.",
      signupCta: "Criar a minha conta",
    },
  },
  nl: {
    title: "Adres beschikbaar na registratie",
    body: "Laat uw gegevens achter: wij sturen u het volledige adres van het magazijn per e-mail, in het Chinees voor uw leveranciers. Uw klantcode krijgt u zodra u uw account aanmaakt.",
    open: "Adres per e-mail ontvangen",
    name: "Voor- en achternaam",
    email: "E-mail",
    phone: "Telefoon of WhatsApp (optioneel)",
    submit: "Adres ontvangen",
    sending: "Verzenden…",
    sent: "Verzonden naar {email}. Maak nu uw account aan om uw klantcode te ontvangen en uw zendingen te volgen.",
    errors: {
      invalid_email: "Vul een geldig e-mailadres in.",
      rate_limited: "Te veel aanvragen. Probeer het over een uur opnieuw.",
      failed: "Het verzenden is mislukt. Mail ons op contact@sourcingpick.com.",
    },
    cta: "Gratis account aanmaken",
    login: "Ik heb al een account",
    mail: {
      subject: "Het adres van het SourcingPick-magazijn",
      heading: "Het adres van ons magazijn",
      intro:
        "Hier is het adres dat u aan uw leveranciers geeft. Stuur hun de Chinese versie: die gebruiken zij.",
      chinese: "In het Chinees, voor uw leveranciers",
      latin: "In Latijnse letters",
      hours: "Ontvangsttijden",
      phone: "Telefoon magazijn",
      codeNote:
        "Maak uw account aan: wij kennen u een klantcode toe, die uw leveranciers op elke doos schrijven, zodat wij uw pakketten herkennen.",
      signupCta: "Mijn account aanmaken",
    },
  },
  ar: {
    title: "نرسل العنوان بعد التسجيل",
    body: "اترك لنا بياناتك: نرسل إليك العنوان الكامل للمستودع بالبريد الإلكتروني، بالصينية لمورّديك. ويُخصَّص لك رمز العميل عند إنشاء حسابك.",
    open: "استلام العنوان بالبريد الإلكتروني",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف أو WhatsApp (اختياري)",
    submit: "استلام العنوان",
    sending: "جارٍ الإرسال…",
    sent: "تم الإرسال إلى {email}. أنشئ حسابك الآن لتحصل على رمز العميل الخاص بك وتتابع شحناتك.",
    errors: {
      invalid_email: "أدخل عنوان بريد إلكتروني صالحًا.",
      rate_limited: "طلبات كثيرة جدًا. أعد المحاولة بعد ساعة.",
      failed: "تعذّر الإرسال. راسلنا على contact@sourcingpick.com.",
    },
    cta: "إنشاء حسابي المجاني",
    login: "لديّ حساب بالفعل",
    mail: {
      subject: "عنوان مستودع SourcingPick",
      heading: "عنوان مستودعنا",
      intro: "إليك العنوان الذي تعطيه لمورّديك. أرسل إليهم النسخة الصينية: فهي التي يستخدمونها.",
      chinese: "بالصينية، لمورّديك",
      latin: "بالحروف اللاتينية",
      hours: "مواعيد الاستلام",
      phone: "هاتف المستودع",
      codeNote: "أنشئ حسابك: نخصّص لك رمز عميل يكتبه مورّدوك على كل كرتونة، لنتعرّف على طرودك.",
      signupCta: "إنشاء حسابي",
    },
  },
  ru: {
    title: "Адрес сообщается после регистрации",
    body: "Оставьте свои контактные данные: мы пришлем вам по электронной почте полный адрес склада на китайском языке для ваших поставщиков. Код клиента присваивается вам при создании аккаунта.",
    open: "Получить адрес по электронной почте",
    name: "Имя и фамилия",
    email: "Электронная почта",
    phone: "Телефон или WhatsApp (необязательно)",
    submit: "Получить адрес",
    sending: "Отправка…",
    sent: "Отправлено на {email}. Теперь создайте аккаунт, чтобы получить код клиента и отслеживать свои отправки.",
    errors: {
      invalid_email: "Укажите действительный адрес электронной почты.",
      rate_limited: "Слишком много запросов. Повторите попытку через час.",
      failed: "Не удалось отправить. Напишите нам на contact@sourcingpick.com.",
    },
    cta: "Создать бесплатный аккаунт",
    login: "У меня уже есть аккаунт",
    mail: {
      subject: "Адрес склада SourcingPick",
      heading: "Адрес нашего склада",
      intro:
        "Вот адрес, который нужно передать вашим поставщикам. Отправьте им версию на китайском: именно ею они пользуются.",
      chinese: "На китайском — для ваших поставщиков",
      latin: "Латиницей",
      hours: "Часы приёмки",
      phone: "Телефон склада",
      codeNote:
        "Создайте аккаунт: мы присвоим вам код клиента, который ваши поставщики указывают на каждой коробке, чтобы мы могли опознать ваш груз.",
      signupCta: "Создать аккаунт",
    },
  },
  tr: {
    title: "Adres, kayıttan sonra iletilir",
    body: "İletişim bilgilerinizi bırakın: deponun tam adresini, tedarikçileriniz için Çince olarak, size e-postayla göndeririz. Müşteri kodunuz, hesabınızı oluşturduğunuzda size atanır.",
    open: "Adresi e-postayla alın",
    name: "Ad ve soyad",
    email: "E-posta",
    phone: "Telefon veya WhatsApp (isteğe bağlı)",
    submit: "Adresi alın",
    sending: "Gönderiliyor…",
    sent: "{email} adresine gönderildi. Şimdi müşteri kodunuzu almak ve sevkiyatlarınızı takip etmek için hesabınızı oluşturun.",
    errors: {
      invalid_email: "Geçerli bir e-posta adresi girin.",
      rate_limited: "Çok fazla talep var. Bir saat sonra yeniden deneyin.",
      failed: "Gönderim başarısız oldu. Bize contact@sourcingpick.com adresinden yazın.",
    },
    cta: "Ücretsiz hesap oluşturun",
    login: "Zaten hesabım var",
    mail: {
      subject: "SourcingPick deposunun adresi",
      heading: "Depomuzun adresi",
      intro:
        "Tedarikçilerinize vermeniz gereken adres aşağıdadır. Onlara Çince versiyonunu gönderin: kullandıkları adres budur.",
      chinese: "Çince, tedarikçileriniz için",
      latin: "Latin harfleriyle",
      hours: "Mal kabul saatleri",
      phone: "Depo telefonu",
      codeNote:
        "Hesabınızı oluşturun: size bir müşteri kodu atarız; tedarikçileriniz bu kodu her kolinin üzerine yazar, biz de kolilerinizi bu sayede tanırız.",
      signupCta: "Hesap oluşturun",
    },
  },
  pl: {
    title: "Adres przekazujemy po rejestracji",
    body: "Prosimy zostawić nam swoje dane kontaktowe: wyślemy Państwu e-mailem pełny adres magazynu – po chińsku, dla Państwa dostawców. Kod klienta nadajemy przy zakładaniu konta.",
    open: "Otrzymaj adres e-mailem",
    name: "Imię i nazwisko",
    email: "E-mail",
    phone: "Telefon lub WhatsApp (opcjonalnie)",
    submit: "Otrzymaj adres",
    sending: "Wysyłanie…",
    sent: "Wysłaliśmy wiadomość na adres {email}. Prosimy teraz założyć konto, aby otrzymać kod klienta i śledzić swoje wysyłki.",
    errors: {
      invalid_email: "Prosimy podać prawidłowy adres e-mail.",
      rate_limited: "Zbyt wiele zapytań. Prosimy spróbować ponownie za godzinę.",
      failed:
        "Nie udało się wysłać wiadomości. Prosimy napisać do nas na adres contact@sourcingpick.com.",
    },
    cta: "Załóż bezpłatne konto",
    login: "Mam już konto",
    mail: {
      subject: "Adres magazynu SourcingPick",
      heading: "Adres naszego magazynu",
      intro:
        "Oto adres, który należy przekazać Państwa dostawcom. Prosimy wysłać im wersję chińską: to z niej korzystają.",
      chinese: "Po chińsku, dla Państwa dostawców",
      latin: "Alfabetem łacińskim",
      hours: "Godziny przyjmowania towaru",
      phone: "Telefon do magazynu",
      codeNote:
        "Prosimy założyć konto: nadamy Państwu kod klienta, który dostawcy umieszczają na każdym kartonie, abyśmy mogli rozpoznać Państwa paczki.",
      signupCta: "Załóż konto",
    },
  },
};
