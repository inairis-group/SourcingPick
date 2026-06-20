"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (public/sw.js) so the app is installable and
 * has an offline fallback.
 *
 * Production-only: a service worker under Turbopack dev interferes with HMR
 * and can serve stale chunks. Registration is deferred to the window `load`
 * event so it never competes with first paint. Failures are swallowed — the
 * app is fully functional without the SW (progressive enhancement).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* non-fatal — the app works without the service worker */
      });
    };
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
