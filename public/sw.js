/* eslint-disable */
/**
 * SourcingPick service worker — minimal and update-safe.
 *
 * Purpose: satisfy PWA installability (a manifest + a fetch handler) and give
 * a graceful offline fallback — WITHOUT precaching hashed build assets, which
 * would risk serving a stale app after a deploy (the usual source of PWA
 * "instability").
 *
 * Strategy:
 *   - Navigations (top-level page loads): network-first. On network failure
 *     (genuinely offline), serve the cached offline page.
 *   - Everything else (hashed JS/CSS, images, API calls): passed straight to
 *     the network, never cached here — so the latest deploy is always fetched.
 *
 * Bump CACHE_VERSION to invalidate the cached offline page.
 */

const CACHE_VERSION = "sp-pwa-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.add(OFFLINE_URL)),
  );
  // Activate this SW immediately rather than waiting for all tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches from previous versions.
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
      );
      // Faster online navigations when the browser supports it.
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept top-level navigations. Sub-resources and API calls fall
  // through to the network untouched so nothing is ever served stale.
  if (request.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;
        return await fetch(request);
      } catch {
        const cache = await caches.open(CACHE_VERSION);
        const cached = await cache.match(OFFLINE_URL);
        return (
          cached ||
          new Response("Offline", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          })
        );
      }
    })(),
  );
});
