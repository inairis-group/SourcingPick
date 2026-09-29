import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackEvent, trackVisit } from "@/lib/commerce.functions";

const PRIVATE = /^\/(admin|agent|devis|factures|avoirs|clients|commandes|demandes|documents|emails|statistiques|journal|logs|parametres|utilisateurs|sessions|agents|paiements|contrats|stock|gestion|imprimer|connexion|inscription|acces|verification|api)(\/|$)/;

function sectionName() {
  const nodes = document.querySelectorAll("h1, h2, h3");
  let name = "";
  for (const node of nodes) {
    const top = node.getBoundingClientRect().top;
    if (top < 180) name = (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
  }
  return name;
}

export function Track() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.webdriver) return;
    if (PRIVATE.test(path)) return;
    const key = "sp_vid";
    let visitor = localStorage.getItem(key) || "";
    if (!visitor) {
      visitor = crypto.randomUUID();
      localStorage.setItem(key, visitor);
    }
    const url = new URL(window.location.href);
    const width = window.innerWidth;
    const device = width < 720 ? "mobile" : width < 1100 ? "tablette" : "ordinateur";
    void trackVisit({
      data: {
        path: url.pathname,
        referrer: document.referrer,
        source: url.searchParams.get("utm_source") || "",
        medium: url.searchParams.get("utm_medium") || "",
        campaign: url.searchParams.get("utm_campaign") || "",
        device,
        visitor,
      },
    }).catch(() => undefined);

    const start = Date.now();
    const sent = new Set<number>();
    let left = false;
    const send = (kind: "scroll" | "leave", depth: number) => {
      void trackEvent({
        data: { path: url.pathname, visitor, kind, depth, section: sectionName(), seconds: kind === "leave" ? Math.round((Date.now() - start) / 1000) : 0 },
      }).catch(() => undefined);
    };
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const depth = height <= 8 ? 100 : Math.round((window.scrollY / height) * 100);
      for (const mark of [25, 50, 75, 100]) {
        if (depth >= mark && !sent.has(mark)) {
          sent.add(mark);
          send("scroll", mark);
        }
      }
    };
    const leave = () => {
      if (left) return;
      left = true;
      send("leave", sent.size ? Math.max(...sent) : 0);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") leave();
    };
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onHide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
      leave();
    };
  }, [path]);
  return null;
}
