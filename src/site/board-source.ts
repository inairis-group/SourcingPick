/**
 * Sélection de la variante de board (desktop 1440px / mobile 390px) dès le
 * rendu serveur, en fonction du User-Agent — plus de flash du design desktop
 * sur mobile : le HTML SSR est directement la bonne maquette.
 *
 * Côté client (navigations SPA), le choix se fait via matchMedia, en accord
 * avec le seuil utilisé par `Board` (max-width: 1099px).
 */
export type BoardVariant = "desktop" | "mobile";

export const BOARD_LOADERS: Record<string, () => Promise<{ default: string }>> = {
  accueil: () => import("@/site/boards/accueil.html?raw"),
  services: () => import("@/site/boards/services.html?raw"),
  comment: () => import("@/site/boards/comment.html?raw"),
  entrepot: () => import("@/site/boards/entrepot.html?raw"),
  tarifs: () => import("@/site/boards/tarifs.html?raw"),
  faq: () => import("@/site/boards/faq.html?raw"),
  devis: () => import("@/site/boards/devis.html?raw"),
  contact: () => import("@/site/boards/contact.html?raw"),
  apropos: () => import("@/site/boards/apropos.html?raw"),
  application: () => import("@/site/boards/application.html?raw"),
  mentions: () => import("@/site/boards/mentions.html?raw"),
  confidentialite: () => import("@/site/boards/confidentialite.html?raw"),
  cookies: () => import("@/site/boards/cookies.html?raw"),
  cgv: () => import("@/site/boards/cgv.html?raw"),
  lost: () => import("@/site/boards/lost.html?raw"),
};

export const BOARD_LOADERS_MOBILE: Record<string, () => Promise<{ default: string }>> = {
  accueil: () => import("@/site/boards/accueil-mobile.html?raw"),
  services: () => import("@/site/boards/services-mobile.html?raw"),
  comment: () => import("@/site/boards/comment-mobile.html?raw"),
  entrepot: () => import("@/site/boards/entrepot-mobile.html?raw"),
  tarifs: () => import("@/site/boards/tarifs-mobile.html?raw"),
  faq: () => import("@/site/boards/faq-mobile.html?raw"),
  devis: () => import("@/site/boards/devis-mobile.html?raw"),
  contact: () => import("@/site/boards/contact-mobile.html?raw"),
  apropos: () => import("@/site/boards/apropos-mobile.html?raw"),
  application: () => import("@/site/boards/application-mobile.html?raw"),
  mentions: () => import("@/site/boards/mentions-mobile.html?raw"),
  confidentialite: () => import("@/site/boards/confidentialite-mobile.html?raw"),
  cookies: () => import("@/site/boards/cookies-mobile.html?raw"),
  cgv: () => import("@/site/boards/cgv-mobile.html?raw"),
  lost: () => import("@/site/boards/lost-mobile.html?raw"),
};

const UA_MOBILE = /Mobi|Android|iPhone|iPad|iPod|Mobile|Tablet|Silk|Kindle|PlayBook|webOS/i;

/** Charge le board adapté : UA mobile côté serveur, matchMedia côté client. */
export async function boardHtml(name: string): Promise<{ html: string; variant: BoardVariant }> {
  let mobile: boolean;
  if (import.meta.env.SSR) {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    mobile = UA_MOBILE.test(getRequestHeader("user-agent") ?? "");
  } else {
    mobile = window.matchMedia("(max-width: 1099px)").matches;
  }
  const mobileLoad = BOARD_LOADERS_MOBILE[name];
  if (mobile && mobileLoad) {
    try {
      return { html: (await mobileLoad()).default, variant: "mobile" };
    } catch {
      /* repli sur le board desktop */
    }
  }
  const load = BOARD_LOADERS[name] ?? BOARD_LOADERS.lost;
  return { html: (await load()).default, variant: "desktop" };
}
