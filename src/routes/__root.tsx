import { useEffect } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteNotFound } from "@/components/site-layout";
import { Boot } from "@/components/boot";
import { Track } from "@/components/track";
import appCss from "../styles.css?url";

function Fonts() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    const core = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&family=Onest:wght@400;500;600;700&family=Unbounded:wght@500;600&display=swap";
    const extra = "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Libre+Baskerville:wght@400;700&family=Newsreader:opsz,wght@6..72,400;600;700&family=Noto+Sans+SC:wght@500;700&family=Nunito:wght@400;600;700&display=swap";
    const office = /^\/(admin|devis|factures|avoirs|clients|paiements|demandes|espace|commandes|documents|contrats|emails|journal|logs|agents|utilisateurs|parametres|stock|statistiques|gestion|sessions)(\/|$)/.test(path);
    const add = (href: string, mark: string) => {
      if (document.querySelector(`link[data-sp-fonts="${mark}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.spFonts = mark;
      document.head.appendChild(link);
    };
    add(core, "core");
    if (office) return;
    let idleId = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(() => add(extra, "extra"));
    else timer = globalThis.setTimeout(() => add(extra, "extra"), 1200);
    return () => {
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timer) globalThis.clearTimeout(timer);
    };
  }, [path]);
  return null;
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0B1433" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg?v=2" },
      { rel: "icon", href: "/favicon.ico?v=2" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
    scripts: [
      {
        children:
          'try{if(!localStorage.getItem("sp-cache-clean")){localStorage.setItem("sp-cache-clean","1");if("serviceWorker"in navigator)navigator.serviceWorker.getRegistrations().then(function(list){list.forEach(function(item){item.unregister()})});if(window.caches)caches.keys().then(function(keys){keys.forEach(function(key){caches.delete(key)})})}}catch(e){}',
      },
    ],
  }),
  notFoundComponent: SiteNotFound,
  component: () => (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body style={{ margin: 0, background: "#f5f7fc", color: "#0e1a3d" }}>
        <PreviewHostBridge />
        <Fonts />
        <Track />
        <AuthProvider>
          <Boot>
            <Outlet />
          </Boot>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
