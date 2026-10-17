import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { submitLead } from "@/lib/backend.functions";
import { armLoadingBar, clearLoadingBar } from "@/lib/loading";
import { useLang, type Lang } from "@/site/i18n";
import { LEGAL_BOARDS, translateDom } from "@/site/translate";
import {
  BOARD_LOADERS,
  BOARD_LOADERS_MOBILE,
  type BoardVariant,
} from "@/site/board-source";

// Largeur de référence des maquettes mobile (canvas figma).
const MOBILE_BOARD_WIDTH = 390;

// Navigation canonique pour les boards mobile (leur header n'a pas de <nav>).
const DEFAULT_NAV: Array<[string, string]> = [
  ["/services", "Services"],
  ["/comment-ca-marche", "Comment ça marche"],
  ["/entrepot", "Entrepôt"],
  ["/tarifs", "Tarifs"],
  ["/faq", "FAQ"],
];
const DEFAULT_EXTRA: Array<[string, string]> = [
  ["/connexion", "Espace client"],
  ["/demande", "Demander un devis"],
];

// Plan du site injecté dans le footer des boards mobile : les maquettes 390px
// n'ont que contact + langues, les liens essentiels doivent rester accessibles.
const FOOTER_GROUPS: Array<[string, Array<[string, string]>]> = [
  [
    "Services",
    [
      ["/services", "Réception"],
      ["/services", "Vérification"],
      ["/services", "Consolidation"],
      ["/services", "Renforcement bois"],
      ["/services", "Chargement"],
      ["/services", "Expédition maritime"],
      ["/services", "Sourcing"],
    ],
  ],
  [
    "Entreprise",
    [
      ["/a-propos", "À propos"],
      ["/entrepot", "Notre entrepôt"],
      ["/#verite", "Transparence"],
      ["/contact", "Contact"],
    ],
  ],
  [
    "Aide",
    [
      ["/faq", "FAQ"],
      ["/application", "Application"],
      ["/connexion", "Espace client"],
      ["/demande", "Demander un devis"],
    ],
  ],
  [
    "Légal",
    [
      ["/mentions", "Mentions légales"],
      ["/confidentialite", "Confidentialité"],
      ["/cookies", "Cookies"],
      ["/cgv", "Conditions générales"],
    ],
  ],
];

function fold(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function control(root: ParentNode, ids: string[]) {
  for (const id of ids) {
    const el = root.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${CSS.escape(id)}`);
    if (el) return el;
  }
  return null;
}

function field(root: ParentNode, needle: string) {
  const inputs = [...root.querySelectorAll("input, textarea, select")] as Array<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  const want = fold(needle).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?:^|[^\\p{L}])${want}(?![\\p{L}])`, "u");
  for (const input of inputs) {
    if (input instanceof HTMLInputElement && (input.type === "radio" || input.type === "checkbox" || input.type === "hidden")) continue;
    const id = input.id;
    const labeled = id ? root.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
    const text = fold(`${labeled?.textContent || ""} ${input.closest("label")?.textContent || ""} ${input.getAttribute("placeholder") || ""}`);
    if (re.test(text)) return input;
  }
  return null;
}

function readValue(root: ParentNode, ids: string[], needles: string[]) {
  const el = control(root, ids) ?? needles.reduce<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>((found, needle) => found ?? field(root, needle), null);
  const value = el?.value.trim() ?? "";
  if (/^choisissez\b/i.test(value)) return "";
  return value;
}

const COUNTRIES = [
  "France",
  "Belgique",
  "Suisse",
  "Luxembourg",
  "Allemagne",
  "Espagne",
  "Italie",
  "Portugal",
  "Pays-Bas",
  "Royaume-Uni",
  "Irlande",
  "Autriche",
  "Pologne",
  "Maroc",
  "Algérie",
  "Tunisie",
  "Sénégal",
  "Côte d’Ivoire",
  "Cameroun",
  "Canada",
  "Autre",
];

function mountCountry(root: HTMLElement) {
  const node = root.querySelector<HTMLElement>("sc-raw-select, select#q-country");
  if (!node || node.dataset.ready === "1") return;
  const select = document.createElement("select");
  select.id = "q-country";
  select.dataset.ready = "1";
  select.setAttribute("aria-label", "Pays");
  select.style.cssText = "flex:1; width:100%; border:0; background:transparent; font:16px/1.2 Onest, 'Segoe UI', system-ui, sans-serif; color:#0E1A3D; outline:0; appearance:auto; min-height:44px;";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choisissez un pays";
  select.append(placeholder);
  for (const country of COUNTRIES) {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    select.append(option);
  }
  node.replaceWith(select);
}

const svgCache = new Map<string, string>();

function endY(d: string) {
  const nums = d.match(/-?\d+(?:\.\d+)?/g);
  return nums ? Number(nums[nums.length - 1]) : 0;
}

function armNodes(paths: SVGPathElement[]) {
  const nodes: Element[] = [];
  for (const path of paths) {
    nodes.push(path);
    const next = path.nextElementSibling;
    if (next?.tagName.toLowerCase() === "circle" && !nodes.includes(next)) nodes.push(next);
  }
  return nodes;
}

function wrap(nodes: Element[], className: string, origin: string) {
  if (!nodes.length || !nodes[0].parentNode) return;
  const g = nodes[0].ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", className);
  g.setAttribute("style", `transform-box: view-box; transform-origin: ${origin};`);
  nodes[0].parentNode.insertBefore(g, nodes[0]);
  for (const node of nodes) g.appendChild(node);
}

function poseOf(alt: string) {
  if (/bras/i.test(alt)) return "hop";
  if (/loupe|cherche/i.test(alt)) return "scan";
  if (/badge|valid/i.test(alt)) return "nod";
  return "float";
}

async function enliven(root: HTMLElement, live: () => boolean) {
  const images = [...root.querySelectorAll("img")].filter((img) => /mascotte/i.test(`${img.getAttribute("alt") || ""} ${img.getAttribute("src") || ""}`));
  await Promise.all(
    images.map(async (img) => {
      const src = img.getAttribute("src") || "";
      try {
        let markup = svgCache.get(src);
        if (!markup) {
          const res = await fetch(src);
          if (!res.ok) return;
          markup = await res.text();
          svgCache.set(src, markup);
        }
        if (!live() || !img.isConnected) return;
        if (!markup.includes('viewBox="-165 -185')) return;
        const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
        const svg = doc.documentElement;
        if (svg.tagName.toLowerCase() !== "svg") return;
        const alt = img.getAttribute("alt") || "";
        const pose = /mascotte/i.test(alt) ? poseOf(alt) : "";
        const paths = [...svg.querySelectorAll("path")];
        const raised = (side: "left" | "right") =>
          paths.filter((path) => {
            const d = path.getAttribute("d") || "";
            return (side === "left" ? d.startsWith("M-84 ") : d.startsWith("M84 ")) && endY(d) < 0;
          });
        wrap(armNodes(raised("right")), "sp-wave", "84px 4px");
        if (pose === "hop") {
          wrap(armNodes(raised("left")), "sp-wave sp-wave-late", "-84px 2px");
          for (const [index, rect] of [...svg.querySelectorAll("rect")].entries()) {
            if (rect.getAttribute("width") === "10") {
              rect.classList.add("sp-spark");
              rect.style.animationDelay = `${index * 0.18}s`;
            }
          }
        }
        if (pose) {
          const body = doc.createElementNS("http://www.w3.org/2000/svg", "g");
          body.setAttribute("class", `sp-pose sp-pose-${pose}`);
          while (svg.firstChild) body.appendChild(svg.firstChild);
          svg.appendChild(body);
        }
        svg.setAttribute("style", img.getAttribute("style") || "");
        svg.setAttribute("role", "img");
        if (alt) svg.setAttribute("aria-label", alt);
        svg.classList.add(...img.classList);
        svg.classList.remove("sp-mascot");
        img.replaceWith(svg);
      } catch {
        /* garde l’image si le SVG ne se lit pas */
      }
    }),
  );
}

function animateSteps(root: HTMLElement) {
  for (const svg of root.querySelectorAll("svg")) {
    const path = svg.querySelector("path");
    const d = path?.getAttribute("d") || "";
    if (!d.startsWith("M20 60")) continue;
    path?.classList.add("sp-dash");
    const circles = [...svg.querySelectorAll("circle")];
    circles.forEach((circle, index) => {
      const text = circle.nextElementSibling;
      const g = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "sp-step-dot");
      g.setAttribute("style", `animation-delay:${index * 140}ms`);
      circle.parentNode?.insertBefore(g, circle);
      g.appendChild(circle);
      if (text?.tagName.toLowerCase() === "text") g.appendChild(text);
    });
    const last = svg.querySelector("circle:last-of-type");
    if (last) {
      const ring = last.cloneNode() as SVGCircleElement;
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", "#8DB2FF");
      ring.setAttribute("class", "sp-step-ring");
      last.parentNode?.insertBefore(ring, last);
      const box = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
      box.setAttribute("class", "sp-traveler");
      box.setAttribute("style", `offset-path: path('${d}');`);
      box.setAttribute("x", "-12");
      box.setAttribute("y", "-28");
      box.setAttribute("width", "24");
      box.setAttribute("height", "16");
      box.setAttribute("rx", "3");
      box.setAttribute("fill", "#FFC247");
      box.setAttribute("stroke", "#FFFFFF");
      box.setAttribute("stroke-width", "2");
      svg.appendChild(box);
    }
    const cols = svg.nextElementSibling;
    if (cols) {
      [...cols.children].forEach((col, index) => {
        col.classList.add("sp-step-col");
        (col as HTMLElement).dataset.stagger = String(index);
      });
    }
  }

  for (const section of root.querySelectorAll("section")) {
    const articles = [...section.querySelectorAll(":scope > article")];
    if (articles.length < 4) continue;
    const badges = articles.map((article) => article.querySelector(":scope > span"));
    if (!badges.every((badge) => badge && /^\d$/.test(badge.textContent?.trim() || ""))) continue;
    section.classList.add("sp-rail");
    badges.forEach((badge, index) => {
      badge?.classList.add("sp-step-badge");
      (badge as HTMLElement).dataset.stagger = String(index);
    });
  }
  requestAnimationFrame(() => placeRails(root));
}

function placeRails(root: HTMLElement) {
  for (const rail of root.querySelectorAll<HTMLElement>(".sp-rail")) {
    const badges = [...rail.querySelectorAll<HTMLElement>(".sp-step-badge")];
    const first = badges[0];
    const last = badges.at(-1);
    if (!first || !last) continue;
    const railBox = rail.getBoundingClientRect();
    const firstBox = first.getBoundingClientRect();
    const lastBox = last.getBoundingClientRect();
    const scale = rail.offsetWidth ? railBox.width / rail.offsetWidth : 1;
    if (!scale) continue;
    const x = (firstBox.left - railBox.left) / scale + firstBox.width / scale / 2 - 1;
    const top = (firstBox.top - railBox.top) / scale + firstBox.height / scale / 2;
    const bottom = (railBox.bottom - lastBox.bottom) / scale + lastBox.height / scale / 2;
    rail.style.setProperty("--rail-x", `${Math.round(x)}px`);
    rail.style.setProperty("--rail-top", `${Math.round(top)}px`);
    rail.style.setProperty("--rail-bottom", `${Math.round(bottom)}px`);
  }
}

function ensureMenu(art: HTMLElement) {
  const header = art.querySelector("header");
  if (!header || header.querySelector(".sp-burger")) return;
  const actions = header.querySelector(":scope > div");
  if (!actions) return;
  const icons =
    '<svg class="sp-ico-open" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg><svg class="sp-ico-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>';
  // Les maquettes mobile ont déjà un burger décoratif : on l'adopte.
  let button = actions.querySelector<HTMLButtonElement>('button[aria-label="Ouvrir le menu"]');
  if (button) {
    button.className = "sp-burger";
    button.innerHTML = icons;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "sp-mobile-menu");
  } else {
    button = document.createElement("button");
    button.type = "button";
    button.className = "sp-burger";
    button.setAttribute("aria-label", "Ouvrir le menu");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "sp-mobile-menu");
    button.innerHTML = icons;
    actions.appendChild(button);
  }
  const panel = document.createElement("div");
  panel.className = "sp-menu";
  panel.id = "sp-mobile-menu";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Navigation");
  panel.setAttribute("aria-hidden", "true");
  panel.inert = true;
  const clip = document.createElement("div");
  clip.className = "sp-menu-clip";
  const nav = header.querySelector("nav");
  if (nav) {
    clip.appendChild(nav.cloneNode(true));
  } else {
    const built = document.createElement("nav");
    for (const [href, label] of DEFAULT_NAV) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      built.appendChild(link);
    }
    clip.appendChild(built);
  }
  const extra = document.createElement("div");
  extra.className = "sp-menu-extra";
  for (const link of actions.querySelectorAll("a")) extra.appendChild(link.cloneNode(true));
  if (!extra.childElementCount) {
    for (const [href, label] of DEFAULT_EXTRA) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      extra.appendChild(link);
    }
  }
  clip.appendChild(extra);
  panel.appendChild(clip);
  header.after(panel);
  const here = location.pathname.replace(/\/$/, "") || "/";
  for (const link of panel.querySelectorAll("a")) {
    const href = (link.getAttribute("href") || "").replace(/\/$/, "") || "/";
    if (href === here) link.setAttribute("aria-current", "page");
  }
  const items = () => [...panel.querySelectorAll<HTMLAnchorElement>("a")];
  const setOpen = (open: boolean) => {
    const was = button.getAttribute("aria-expanded") === "true";
    if (was === open) return;
    panel.classList.toggle("is-open", open);
    panel.inert = !open;
    // Verrouille le scroll de la page tant que le menu est ouvert : le panneau
    // (positionné en absolu sous le header sticky) ne "suit" plus le scroll.
    document.documentElement.style.overflow = open ? "hidden" : "";
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    if (open) items()[0]?.focus();
    else if (panel.contains(document.activeElement)) button.focus();
  };
  button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
  button.addEventListener("keydown", (event) => {
    if (button.getAttribute("aria-expanded") !== "true") return;
    if (event.key === "Escape") setOpen(false);
    if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)) {
      event.preventDefault();
      items()[0]?.focus();
    }
  });
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      button.focus();
      return;
    }
    const list = items();
    if (!list.length) return;
    const index = list.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey && index === list.length - 1)) {
      event.preventDefault();
      list[(index + 1) % list.length]?.focus();
    }
    if (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey && index <= 0)) {
      event.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    }
  });
  panel.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest("a")) setOpen(false);
  });
}

function relaxWide(art: HTMLElement) {
  if (art.dataset.relaxed === "1") return;
  art.dataset.relaxed = "1";
  const box = art.firstElementChild;
  if (box instanceof HTMLElement) {
    box.style.width = "100%";
    box.style.height = "auto";
    box.style.overflow = "visible";
  }
  for (const el of art.querySelectorAll<HTMLElement>("[style*='position: absolute']")) {
    const style = el.getAttribute("style") || "";
    if (style.includes("inset:") || el.closest(".sp-menu")) continue;
    const width = Number(style.match(/width:\s*(\d+)px/)?.[1] || 0);
    const left = Number(style.match(/left:\s*(-?\d+)px/)?.[1] || 0);
    if (width < 280 && left < 480) continue;
    el.classList.add("sp-m-abs");
    for (const chip of el.querySelectorAll<HTMLElement>(":scope > div")) chip.classList.add("sp-m-hide");
  }
}

function restoreWide(art: HTMLElement) {  if (art.dataset.relaxed !== "1") return;
  delete art.dataset.relaxed;
  const box = art.firstElementChild;
  if (box instanceof HTMLElement) {
    box.style.width = "";
    box.style.height = "";
    box.style.overflow = "";
  }
  for (const el of art.querySelectorAll<HTMLElement>(".sp-m-abs, .sp-m-hide")) {
    el.classList.remove("sp-m-abs", "sp-m-hide");
  }
  const menu = art.querySelector<HTMLElement>(".sp-menu");
  menu?.classList.remove("is-open");
  if (menu) {
    menu.inert = true;
    menu.setAttribute("aria-hidden", "true");
  }
  art.querySelector(".sp-burger")?.setAttribute("aria-expanded", "false");
}

// Injecte le plan du site dans le footer des maquettes mobile (qui n'ont que
// contact + langues) : les liens Services/Entreprise/Aide/Légal restent
// accessibles en mobile, groupés en grille compacte avant la barre de langues.
function ensureFooterNav(art: HTMLElement) {
  const footer = art.querySelector("footer");
  if (!footer || footer.querySelector(".sp-footnav")) return;
  if (footer.querySelector('a[href^="/"]')) return; // déjà des liens internes
  const nav = document.createElement("nav");
  nav.className = "sp-footnav";
  nav.setAttribute("aria-label", "Plan du site");
  nav.style.cssText =
    "display:grid;grid-template-columns:1fr 1fr;gap:22px 16px;padding:18px 0 4px;border-top:1px solid rgba(184,196,230,0.16);width:100%;";
  for (const [title, links] of FOOTER_GROUPS) {
    const col = document.createElement("div");
    col.style.cssText = "display:flex;flex-direction:column;gap:9px;";
    const head = document.createElement("span");
    head.textContent = title;
    head.style.cssText =
      "font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#8DB2FF;margin-bottom:2px;";
    col.appendChild(head);
    for (const [href, label] of links) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      link.style.cssText = "color:#C3CDEB;font-size:14px;line-height:1.35;text-decoration:none;";
      col.appendChild(link);
    }
    nav.appendChild(col);
  }
  // avant la barre de langues (div contenant les a[lang]), sinon avant le ©
  const langLink = footer.querySelector("a[lang]");
  const langRow = langLink?.parentElement;
  if (langRow && langRow.parentElement === footer) footer.insertBefore(nav, langRow);
  else footer.appendChild(nav);
}

function openLongBoards(root: HTMLElement, force = false) {
  const art = root.querySelector<HTMLElement>(".sp-art");
  const box = art?.firstElementChild;
  if (!art || !(box instanceof HTMLElement)) return;
  if (!force && box.scrollHeight <= box.clientHeight + 24) return;
  box.style.height = "auto";
  box.style.overflow = "visible";
  art.dataset.h = String(Math.ceil(Math.max(box.scrollHeight, art.scrollHeight)));
}

function pinLanguagesLast(root: HTMLElement) {
  const footer = root.querySelector("footer");
  if (!footer) return;
  const langLink = footer.querySelector("a[lang]");
  const langRow = langLink?.parentElement;
  if (!langRow || langRow.parentElement !== footer) return;
  const copy = [...footer.children].find((el) => el !== langRow && (el.textContent || "").includes("©"));
  if (copy) footer.appendChild(copy);
  footer.appendChild(langRow);
}

const LANG_ATTR: Record<string, Lang> = {
  fr: "fr",
  en: "en",
  "en-GB": "en",
  zh: "zh",
  "zh-Hans": "zh",
  es: "es",
  de: "de",
  it: "it",
  pt: "pt",
  "pt-PT": "pt",
  nl: "nl",
  ar: "ar",
  ru: "ru",
  tr: "tr",
  pl: "pl",
};

function markActiveLang(root: HTMLElement, lang: Lang) {
  for (const link of root.querySelectorAll<HTMLAnchorElement>("a[lang]")) {
    const id = LANG_ATTR[link.getAttribute("lang") || ""];
    const on = id === lang;
    link.style.fontWeight = on ? "700" : "500";
    link.style.color = on ? "#FFFFFF" : "#9FACD3";
  }
}

function fitCtaMascot(root: HTMLElement) {
  for (const img of root.querySelectorAll<HTMLImageElement>("img")) {
    if (!img.style.right.trim().startsWith("-")) continue;
    const section = img.parentElement;
    if (!(section instanceof HTMLElement)) continue;
    img.style.right = "0px";
    if ((parseFloat(img.style.top) || 0) < 0) img.style.top = "0px";
    section.style.overflow = "visible";
    const title = section.querySelector("h2");
    const width = parseFloat(img.style.width) || 146;
    if (title instanceof HTMLElement) title.style.paddingRight = `${Math.round(width * 0.58)}px`;
  }
}

function wireDeadLinks(root: HTMLElement) {
  const routes: Array<[RegExp, string]> = [
    [/demander un devis/, "/demande"],
    [/decrire mon besoin/, "/demande"],
    [/ouvrir l.?espace/, "/connexion"],
    [/^espace client$/, "/connexion"],
    [/^contact$/, "/contact"],
    [/^faq$/, "/faq"],
    [/^application$/, "/application"],
    [/^a propos$/, "/apropos"],
    [/notre entrepot/, "/entrepot"],
    [/mentions legales/, "/mentions"],
    [/^confidentialite$/, "/confidentialite"],
    [/conditions generales/, "/cgv"],
    [/^en savoir plus$/, "/apropos"],
  ];
  for (const link of root.querySelectorAll<HTMLAnchorElement>("a")) {
    if (link.hasAttribute("lang")) continue;
    const href = link.getAttribute("href") || "";
    if (href !== "#" && href !== "") continue;
    const label = fold((link.textContent || "").replace(/\s+/g, " ").trim());
    const route = routes.find(([pattern]) => pattern.test(label));
    if (!route) continue;
    link.setAttribute("href", route[1]);
    link.classList.add("sp-cta");
  }
}

function tagSectionJumps(root: HTMLElement) {
  const heads = [...root.querySelectorAll("h2")];
  for (const link of root.querySelectorAll("a")) {
    const href = link.getAttribute("href") || "";
    if (href !== "#" && href !== "/services" && href !== "/application") continue;
    const label = (link.textContent || "").replace(/\s+/g, " ").trim();
    const head = heads.find((node) => (node.textContent || "").replace(/\s+/g, " ").trim() === label);
    if (!head) continue;
    const id = `sp-${label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "")}`;
    head.id = id;
    link.setAttribute("href", `#${id}`);
  }
}

function mountWarehouseMap(root: HTMLElement) {
  const plan = root.querySelector<HTMLElement>('[aria-label="Plan d’accès à l’entrepôt"]');
  if (!plan || plan.querySelector("img, iframe")) return;
  plan.innerHTML = "";
  const frame = document.createElement("iframe");
  frame.title = "Carte de l’entrepôt, Zhongluotan, Baiyun, Guangzhou";
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer-when-downgrade";
  frame.src = "https://www.openstreetmap.org/export/embed.html?bbox=113.36%2C23.36%2C113.44%2C23.42&layer=mapnik&marker=23.3877%2C113.3990";
  frame.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0";
  plan.appendChild(frame);
}

function motion(root: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = root.querySelector("section");
  const heroArt = hero?.querySelector("img");
  const frame = heroArt?.parentElement;
  if (heroArt) heroArt.classList.add("sp-hero-art");
  const grid = hero?.querySelector("div[style*='mask-image']");
  grid?.classList.add("sp-grid");
  root.querySelector("span[style*='#FFC247']")?.classList.add("sp-pulse");

  const chips = frame
    ? [...frame.querySelectorAll(":scope > div")].filter((node) => (node.getAttribute("style") || "").includes("box-shadow"))
    : [];
  chips.forEach((node, index) => {
    node.classList.add("sp-chip-in");
    (node as HTMLElement).dataset.stagger = String(index);
  });

  let heroKept = false;
  for (const img of root.querySelectorAll("img")) {
    const alt = img.getAttribute("alt") || "";
    if (/mascotte/i.test(alt)) img.classList.add("sp-mascot");
    if ((img.getAttribute("style") || "").includes("width: 220px")) img.classList.add("sp-step");
    if (!heroKept && img.closest("section")) {
      heroKept = true;
      img.setAttribute("fetchpriority", "high");
    } else {
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    }
  }

  for (const link of root.querySelectorAll('a[href="/demande"]')) link.classList.add("sp-cta");

  if (reduce || root.classList.contains("sp-narrow")) return () => {};

  animateSteps(root);
  let alive = true;
  void enliven(root, () => alive);

  const heroBits = hero ? [...hero.querySelectorAll("h1, p, a")].slice(0, 5) : [];
  const cards = [...root.querySelectorAll("section > div")].filter((node) => {
    const style = node.getAttribute("style") || "";
    return style.includes("border-radius: 22px") || style.includes("border-radius: 24px");
  });
  const nodes = [...root.querySelectorAll("h2, article"), ...cards]
    .filter((node, index, all) => all.indexOf(node) === index && !hero?.contains(node))
    .slice(0, 36);
  const staged = [...heroBits, ...chips, ...root.querySelectorAll(".sp-step-col, .sp-step-badge"), ...nodes];
  const viewDriven = CSS.supports("view-timeline-name", "--sp");
  const pageDriven = CSS.supports("scroll-timeline-name", "--sp-page");

  const markIdle = () => document.documentElement.classList.toggle("sp-idle", document.hidden);
  markIdle();
  document.addEventListener("visibilitychange", markIdle);

  let dropped = false;
  let usedCss = false;
  let stopExtra = () => {};
  for (const node of staged) (node as HTMLElement).style.opacity = "0";

  const cssMotion = () => {
    for (const node of staged) (node as HTMLElement).style.opacity = "";
    if (viewDriven) {
      if (pageDriven) frame?.classList.add("sp-parallax");
      staged.forEach((node, index) => {
        const el = node as HTMLElement;
        const step = Number(el.dataset.stagger || 0);
        const start = Math.min(16, step * 4);
        const name = `--sp-r${index}`;
        const style = el.style as CSSStyleDeclaration & { viewTimelineName?: string; animationTimeline?: string; animationRange?: string };
        style.viewTimelineName = name;
        style.animationTimeline = name;
        style.animationRange = `entry ${start}% cover ${34 + start}%`;
        el.classList.add("sp-scroll");
      });
    }

    if (viewDriven && pageDriven) return () => {};

    const release = (node: Element) => {
      const done = () => {
        node.classList.remove("sp-await", "sp-in");
        (node as HTMLElement).style.transitionDelay = "";
      };
      node.addEventListener("transitionend", done, { once: true });
    };
    const pending = viewDriven ? [] : [...heroBits, ...chips, ...root.querySelectorAll(".sp-step-col, .sp-step-badge"), ...nodes];
    pending.forEach((node) => {
      node.classList.add("sp-await");
      const at = heroBits.indexOf(node);
      if (at >= 0) (node as HTMLElement).style.transitionDelay = `${40 + at * 70}ms`;
    });
    requestAnimationFrame(() => {
      for (const node of pending) {
        if (nodes.includes(node) && !heroBits.includes(node)) continue;
        node.classList.add("sp-in");
        release(node);
      }
    });
    const reveal = (el: Element) => {
      if (el.classList.contains("sp-in") || el.classList.contains("sp-scroll")) return;
      const now = performance.now();
      if (now - waveAt > 640) wave = 0;
      waveAt = now;
      (el as HTMLElement).style.transitionDelay = `${wave * 90}ms`;
      wave += 1;
      el.classList.add("sp-in");
      release(el);
    };
    let wave = 0;
    let waveAt = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        for (const entry of visible) {
          observer.unobserve(entry.target);
          reveal(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    if (!viewDriven) nodes.forEach((node) => observer.observe(node));
    const fallback = window.setTimeout(() => {
      if (viewDriven) return;
      for (const node of nodes) {
        const box = node.getBoundingClientRect();
        if (box.top < window.innerHeight * 0.9) reveal(node);
      }
    }, 1400);

    let raf = 0;
    const onScroll = () => {
      if (!frame || raf || pageDriven) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = Math.max(-18, Math.min(0, -window.scrollY * 0.02));
        frame.style.translate = `0 ${y}px`;
      });
    };
    if (frame && !pageDriven) {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  };

  const useCss = () => {
    if (dropped || usedCss || root.classList.contains("sp-gsap")) return;
    usedCss = true;
    stopExtra = cssMotion();
  };
  const slow = window.setTimeout(useCss, 1800);

  void (async () => {
    try {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (dropped || usedCss) return;
      window.clearTimeout(slow);
      gsap.registerPlugin(ScrollTrigger);
      root.classList.add("sp-gsap");
      const lead = staged.slice(0, heroBits.length + chips.length);
      const rest = staged.slice(lead.length);
      const ctx = gsap.context(() => {
        if (lead.length) {
          gsap.fromTo(lead, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", stagger: 0.05, overwrite: "auto" });
        }
        rest.forEach((node) => {
          gsap.fromTo(
            node,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              overwrite: "auto",
              scrollTrigger: { trigger: node, start: "top 92%", once: true },
            },
          );
        });
        if (frame) {
          gsap.fromTo(
            frame,
            { y: 0 },
            {
              y: -28,
              ease: "none",
              scrollTrigger: { trigger: hero || root, start: "top top", end: "45% top", scrub: 0.4 },
            },
          );
        }
      }, root);
      const onVis = () => {
        if (document.hidden) gsap.globalTimeline.pause();
        else gsap.globalTimeline.resume();
      };
      document.addEventListener("visibilitychange", onVis);
      stopExtra = () => {
        document.removeEventListener("visibilitychange", onVis);
        ctx.revert();
        root.classList.remove("sp-gsap");
      };
    } catch {
      root.classList.remove("sp-gsap");
      useCss();
    }
  })();

  return () => {
    dropped = true;
    alive = false;
    window.clearTimeout(slow);
    stopExtra();
    if (!root.classList.contains("sp-gsap")) {
      for (const node of staged) (node as HTMLElement).style.opacity = "";
    }
    document.removeEventListener("visibilitychange", markIdle);
    document.documentElement.classList.remove("sp-idle");
  };
}

export function Board({
  name,
  source = "",
  sourceVariant = "desktop",
}: {
  name: string;
  source?: string;
  sourceVariant?: BoardVariant;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { lang, setLang } = useLang();
  const [view, setView] = useState<{ html: string; variant: BoardVariant }>({
    html: source,
    variant: sourceVariant,
  });
  const [note, setNote] = useState<{ text: string; tone: "bad" | "ok" | "wait" } | null>(null);
  const [phone, setPhone] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1100,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1099px)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Sous 1100px (mobile + tablette), la maquette mobile dédiée remplace le
  // board desktop : le reflow heuristique du canvas 1440px était illisible.
  const mobileBoard = phone && Boolean(BOARD_LOADERS_MOBILE[name]);
  const want: BoardVariant = mobileBoard ? "mobile" : "desktop";

  // La route change : nouvelle source déjà adaptée au contexte (UA / viewport).
  useEffect(() => {
    setView({ html: source, variant: sourceVariant });
  }, [source, sourceVariant]);

  // Bascule de variante au redimensionnement (desktop <-> mobile).
  useEffect(() => {
    if (view.variant === want) return;
    let live = true;
    armLoadingBar();
    const load =
      (want === "mobile" ? BOARD_LOADERS_MOBILE[name] : BOARD_LOADERS[name]) ?? BOARD_LOADERS.lost;
    load()
      .then((mod) => {
        if (live) setView({ html: mod.default, variant: want });
      })
      .catch(() => {
        if (live) void BOARD_LOADERS.lost().then((mod) => setView({ html: mod.default, variant: want }));
      });
    return () => {
      live = false;
    };
  }, [want, name, view.variant]);

  const html = view.html;

  useLayoutEffect(() => {
    if (!html) return;
    clearLoadingBar();
    const stageEl = stage.current;
    const boardEl = board.current;
    if (!stageEl || !boardEl) return;
    boardEl.innerHTML = html;
    const art = boardEl.querySelector<HTMLElement>(".sp-art");
    wireDeadLinks(boardEl);
    tagSectionJumps(boardEl);
    fitCtaMascot(boardEl);
    if (mobileBoard) ensureFooterNav(boardEl as HTMLElement);
    pinLanguagesLast(boardEl);
    markActiveLang(boardEl, lang);
    if (name === "entrepot") mountWarehouseMap(boardEl);
    if (name === "devis") mountCountry(boardEl);
    openLongBoards(boardEl, mobileBoard || name === "faq" || name === "cgv");
    const height = Number(art?.dataset.h || 2000);
    const fit = () => {
      const width = stageEl.clientWidth;
      if (mobileBoard) {
        // Maquette mobile 390px servie jusqu'à 1100px : mise à l'échelle
        // centrée (x1,5 max sur tablette — vectoriel, donc net), menu OK.
        art?.classList.toggle("sp-narrow", true);
        art?.classList.toggle("sp-phone", true);
        if (art) ensureMenu(art);
        boardEl.style.width = `${MOBILE_BOARD_WIDTH}px`;
        boardEl.style.transformOrigin = "top left";
        const scale = Math.min(1.5, width / MOBILE_BOARD_WIDTH);
        const offset = Math.max(0, (width - MOBILE_BOARD_WIDTH * scale) / 2);
        boardEl.style.transform = `translateX(${offset}px) scale(${scale})`;
        stageEl.style.height = `${height * scale}px`;
        return;
      }
      const narrow = width < 1100;
      const phoneWidth = width < 720;
      art?.classList.toggle("sp-narrow", narrow);
      art?.classList.toggle("sp-phone", phoneWidth);
      if (narrow && art) {
        ensureMenu(art);
        relaxWide(art);
        boardEl.style.transform = "none";
        boardEl.style.width = "100%";
        const next = `${boardEl.scrollHeight}px`;
        if (stageEl.style.height !== next) stageEl.style.height = next;
        return;
      }
      if (art) restoreWide(art);
      boardEl.style.width = "1440px";
      boardEl.style.transformOrigin = "top left";
      const scale = Math.min(1, width / 1440);
      const offset = Math.max(0, (width - 1440 * scale) / 2);
      boardEl.style.transform = `translateX(${offset}px) scale(${scale})`;
      stageEl.style.height = `${height * scale}px`;
    };
    fit();
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        fit();
        placeRails(boardEl);
      });
    });
    observer.observe(stageEl);
    observer.observe(boardEl);
    const stopMotion = art ? motion(art) : undefined;
    placeRails(boardEl);
    if (lang === "en" && !LEGAL_BOARDS.has(name)) translateDom(boardEl);
    return () => {
      observer.disconnect();
      stopMotion?.();
      // le menu pouvait verrouiller le scroll : on libère toujours
      document.documentElement.style.overflow = "";
    };
  }, [html, lang, name, mobileBoard]);

  async function send(origin: HTMLElement) {
    const root = origin.closest(".sp-art") ?? board.current;
    if (!root) return;
    const english = lang === "en";
    const nameEl = control(root, ["q-name", "c-name"]) ?? field(root, "nom") ?? field(root, "name");
    const emailEl = control(root, ["q-email", "c-email"]) ?? field(root, "email");
    const nameValue = nameEl?.value.trim() ?? "";
    const email = emailEl?.value.trim() ?? "";
    const message = readValue(root, ["q-msg", "c-msg"], ["precisions", "message", "detail"]);
    const subject = readValue(root, ["q-subject", "c-subject"], ["sujet", "subject"]) || (name === "contact" ? "Contact" : "Demande de devis");
    const consent = root.querySelector<HTMLInputElement>('input[type="checkbox"]');
    for (const el of [nameEl, emailEl]) {
      if (el instanceof HTMLElement) {
        el.style.boxShadow = "";
        el.style.borderColor = "";
      }
    }
    const invalidName = nameValue.length < 2;
    const invalidEmail = !email.includes("@") || email.startsWith("@") || email.endsWith("@");
    if (invalidName || invalidEmail) {
      for (const el of [invalidName ? nameEl : null, invalidEmail ? emailEl : null]) {
        if (el instanceof HTMLElement) {
          el.style.boxShadow = "0 0 0 3px rgba(176, 32, 32, 0.22)";
          el.style.borderColor = "#b02020";
        }
      }
      setNote({
        tone: "bad",
        text: english ? "Enter your name and a valid email. The form stays on this page." : "Indiquez votre nom et un email valide. Le formulaire reste sur cette page.",
      });
      (invalidName ? nameEl : emailEl)?.focus();
      return;
    }
    if (consent && !consent.checked) {
      setNote({
        tone: "bad",
        text: english ? "Tick the box to let us use these details for your quote." : "Cochez la case pour que nous puissions utiliser ces informations.",
      });
      consent.focus();
      return;
    }
    const payload: Record<string, string> = {};
    const pairs: Array<[string, string[], string[]]> = [
      ["produit", ["q-products"], ["produits", "produit", "product"]],
      ["quantité", ["q-qty"], ["quantite", "quantity"]],
      ["volume", ["q-vol"], ["volume"]],
      ["valeur", ["q-val"], ["valeur", "value"]],
      ["fournisseurs", ["q-sup"], ["fournisseurs", "supplier"]],
      ["villes", ["q-cities"], ["villes"]],
      ["pays", ["q-country"], ["pays", "country"]],
      ["ville", ["q-city"], ["ville", "city"]],
      ["arrivée", ["q-date"], ["arrivee", "arrival"]],
      ["entreprise", ["q-company"], ["entreprise", "company"]],
      ["téléphone", ["q-phone"], ["telephone", "phone"]],
    ];
    for (const [key, ids, needles] of pairs) {
      const value = readValue(root, ids, needles);
      if (value) payload[key] = value;
    }
    const chosen = [...root.querySelectorAll('input[type="radio"]:checked')].map((input) =>
      (input.closest("label")?.textContent || "").replace(/\s+/g, " ").trim(),
    );
    if (chosen.length) payload.choix = chosen.join(" · ");
    setNote({ tone: "wait", text: english ? "Sending…" : "Envoi…" });
    try {
      const result = await submitLead({
        data: {
          kind: name === "contact" ? "contact" : "devis",
          name: nameValue,
          email,
          subject,
          body: message || payload.choix || subject,
          payload,
        },
      });
      const ref = result.ref ? ` ${result.ref}` : "";
      const mailed = result.mailed
        ? english
          ? ` A confirmation email was sent to ${email}.`
          : ` Un email de confirmation est parti vers ${email}.`
        : english
          ? ` The request is in our queue, but the email did not leave${result.mailNote ? ` (${result.mailNote})` : ""}.`
          : ` La demande est dans notre file, mais l’email n’est pas parti${result.mailNote ? ` (${result.mailNote})` : ""}.`;
      const access = result.account === "new"
        ? english
          ? " The email contains a code to choose your password and open your space."
          : " L’email contient un code pour choisir votre mot de passe et ouvrir votre espace."
        : result.account === "client"
          ? english
            ? " It is also in your client space."
            : " Elle est aussi dans votre espace client."
          : "";
      setNote({
        tone: "ok",
        text: english
          ? `Request${ref} recorded.${mailed}${result.mailed ? access : ""}`
          : `Demande${ref} enregistrée.${mailed}${result.mailed ? access : ""}`,
      });
    } catch (error) {
      setNote({
        tone: "bad",
        text: error instanceof Error ? error.message : english ? "Sending failed. Write to contact@sourcingpick.com." : "L’envoi a échoué. Écrivez à contact@sourcingpick.com.",
      });
    }
  }

  if (!html) return <div className="sp-stage sp-stage-wait" />;

  return (
    <div
      ref={stage}
      className="sp-stage"
      onSubmit={(event) => {
        const form = (event.target as HTMLElement | null)?.closest?.("form");
        if (!form || !board.current?.contains(form)) return;
        event.preventDefault();
        const link = board.current.querySelector<HTMLElement>('a[href="#submit-lead"]');
        if (link) void send(link);
      }}
      onClick={(event) => {
        const link = (event.target as HTMLElement).closest("a");
        if (!link || !board.current?.contains(link)) return;
        const href = link.getAttribute("href") || "";
        const langAttr = link.getAttribute("lang");
        if (langAttr && LANG_ATTR[langAttr]) {
          event.preventDefault();
          setLang(LANG_ATTR[langAttr]);
          return;
        }
        if (href === "#submit-lead") {
          event.preventDefault();
          void send(link);
          return;
        }
        if (href === "#cookies-choices") {
          // Rouvre le bandeau de consentement (politique de cookies, art. 3).
          event.preventDefault();
          window.dispatchEvent(new Event("sp:consent:open"));
          return;
        }
        if (href === "#" || href.startsWith("#")) {
          event.preventDefault();
          const id = href.slice(1);
          const target = id ? board.current.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`) : null;
          if (!target) return;
          const top = window.scrollY + target.getBoundingClientRect().top - 28;
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
          const row = link.parentElement;
          if (row) {
            for (const chip of row.querySelectorAll<HTMLElement>("a")) {
              const on = chip === link;
              chip.style.background = on ? "#0E1A3D" : "#FFFFFF";
              chip.style.color = on ? "#FFFFFF" : "#0E1A3D";
              chip.style.borderColor = on ? "#0E1A3D" : "#DCE3F2";
            }
          }
          return;
        }
        if (href.startsWith("/")) {
          event.preventDefault();
          armLoadingBar();
          const hash = href.includes("#") ? href.slice(href.indexOf("#") + 1) : undefined;
          const path = href.split("#")[0] || "/";
          void router.navigate({ to: path, hash }).finally(clearLoadingBar);
        }
      }}
    >
      <div ref={board} className="sp-board" dangerouslySetInnerHTML={{ __html: html }} />
      {note ? (
        <p className="sp-note" data-tone={note.tone} role="status">
          {note.text}
        </p>
      ) : null}
    </div>
  );
}
