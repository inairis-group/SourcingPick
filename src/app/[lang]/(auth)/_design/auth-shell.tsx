import Image from "next/image";
import type { ReactNode } from "react";
import { localeLabels, type Locale } from "@/lib/i18n/config";

/**
 * The two-pane frame the 2026-09 SaaS canvas draws behind every access screen
 * — login, signup, verification.
 *
 * Values are the artboard's: a flexible left pane holding a 420px column, a
 * fixed 560px navy panel on the right, 48px and 56px/48px padding, 22px and
 * 24px stacks. Unlike the marketing boards this is not transcribed — the app's
 * artboards are pictures of a working product, full of sample data (the login
 * field is drawn pre-filled with a customer's address), so only the frame and
 * its styling cross over. Every string here comes from the dictionaries the
 * app already has, which is also why this works in the four languages the
 * canvas does not draw.
 *
 * The right panel is hidden below 1024px rather than stacked: it is a
 * reassurance panel, and on a phone it would push the form — the reason the
 * page exists — under a fold.
 */

type Copy = { headline: string; body: string; note: string };

/**
 * The panel's own words, from the canvas. Kept beside the component rather
 * than in the app dictionaries because they belong to this frame and nothing
 * else renders them; the canvas draws fr and en, and the other two are ours.
 */
const PANEL: Record<Locale, Copy> = {
  fr: {
    headline: "Chaque étape, une trace.",
    body: "Photos de réception, contrôle, chargement et documents : tout reste dans votre espace.",
    note: "L’application mobile est en cours de construction. L’espace web fait tout.",
  },
  en: {
    headline: "Every step leaves a trace.",
    body: "Receiving photos, inspection, loading and documents: everything stays in your client area.",
    note: "The mobile app is still being built. The web client area does everything.",
  },
  zh: {
    headline: "每一步，都有据可查。",
    body: "收货照片、验货、装柜与单证：全部保留在您的账户中。",
    note: "手机应用仍在开发中，网页端功能齐全。",
  },
  ar: {
    headline: "لكل مرحلة أثر.",
    body: "صور الاستلام والفحص والتحميل والمستندات: كل شيء يبقى في حسابك.",
    note: "تطبيق الهاتف قيد الإنشاء. مساحة الويب تقوم بكل شيء.",
  },
  es: {
    headline: "Cada etapa deja rastro.",
    body: "Fotos de recepción, inspección, carga y documentos: todo queda en su área de cliente.",
    note: "La aplicación móvil está en construcción. El área web lo hace todo.",
  },
  de: {
    headline: "Jeder Schritt hinterlässt eine Spur.",
    body: "Fotos vom Wareneingang, Prüfung, Verladung und Dokumente: alles bleibt in Ihrem Bereich.",
    note: "Die mobile App entsteht noch. Der Webbereich kann alles.",
  },
  it: {
    headline: "Ogni fase lascia una traccia.",
    body: "Foto di ricevimento, controllo, carico e documenti: tutto resta nella vostra area.",
    note: "L’app mobile è in costruzione. L’area web fa tutto.",
  },
  pt: {
    headline: "Cada etapa deixa rasto.",
    body: "Fotos de receção, controlo, carga e documentos: fica tudo na sua área de cliente.",
    note: "A aplicação móvel está a ser construída. A área web faz tudo.",
  },
  nl: {
    headline: "Elke stap laat een spoor na.",
    body: "Ontvangstfoto’s, controle, belading en documenten: alles blijft in uw omgeving.",
    note: "De mobiele app wordt nog gebouwd. De webomgeving doet alles.",
  },
  ru: {
    headline: "Каждый шаг оставляет след.",
    body: "Фото приёмки, контроль, погрузка и документы — всё остаётся в вашем кабинете.",
    note: "Мобильное приложение ещё разрабатывается. Веб-кабинет умеет всё.",
  },
  tr: {
    headline: "Her aşama iz bırakır.",
    body: "Mal kabul fotoğrafları, kontrol, yükleme ve belgeler: hepsi alanınızda kalır.",
    note: "Mobil uygulama hâlâ geliştiriliyor. Web alanı her şeyi yapıyor.",
  },
  pl: {
    headline: "Każdy etap zostawia ślad.",
    body: "Zdjęcia z przyjęcia, kontrola, załadunek i dokumenty — wszystko zostaje w Państwa panelu.",
    note: "Aplikacja mobilna jest w budowie. Panel webowy robi wszystko.",
  },
};

export function AuthShell({
  lang,
  children,
}: {
  lang: Locale;
  children: ReactNode;
}) {
  const t = PANEL[lang];
  return (
    <div className="flex min-h-dvh bg-white">
      <div className="flex min-w-0 flex-1 items-center justify-center p-6 sm:p-12">
        <div className="flex w-full max-w-[420px] flex-col gap-[22px]">{children}</div>
      </div>

      <aside
        aria-hidden="true"
        className="hidden w-[560px] shrink-0 flex-col justify-center gap-6 bg-[#0B1433] px-12 py-14 text-white lg:flex"
      >
        <Image
          src="/design/logo-white.svg"
          alt=""
          width={132}
          height={30}
          className="h-[30px] w-auto self-start"
        />
        <h2 className="font-display m-0 text-[34px] leading-[1.2] font-semibold tracking-[-0.02em]">
          {t.headline}
        </h2>
        <p className="m-0 text-[16.5px] leading-[1.6] text-[#C6D2EE]">{t.body}</p>
        <Image
          src="/design/app/auth-traceability.svg"
          alt=""
          width={464}
          height={340}
          className="h-auto w-full max-w-[464px] self-center"
          priority
        />
        <p className="m-0 flex items-center gap-2.5 rounded-[14px] bg-white/[0.08] px-4 py-3.5 text-sm text-[#C6D2EE]">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFC247"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" />
          </svg>
          {t.note}
        </p>
      </aside>
      <span className="sr-only">{localeLabels[lang]}</span>
    </div>
  );
}

/** The heading pair every access screen opens with — 30px display, 15px body. */
export function AuthHeading({ title, body }: { title: string; body: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display m-0 text-[30px] leading-[1.2] font-semibold tracking-[-0.02em] text-[#0E1A3D]">
        {title}
      </h1>
      <p className="m-0 text-[15px] leading-[1.6] text-[#4A5578]">{body}</p>
    </div>
  );
}
