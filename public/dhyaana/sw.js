/*
 * Dhyaana service worker.
 *
 * The app is a small static SPA, so the whole shell can be precached and the
 * app then works offline. Third-party media (YouTube, thumbnails) is not
 * precached: it is large, cross-origin, and only useful when online.
 *
 * The precache list is injected at build time by tools/build-sw.mjs.
 */
const CACHE = 'dhyaana-4d6206d9440a';
const PRECACHE = [
  "/dhyaana/assets/index-1oRNvK8t.css",
  "/dhyaana/assets/index-DFsLbkUs.js",
  "/dhyaana/assets/mukta-400-BBb1pWqq.woff2",
  "/dhyaana/assets/mukta-500-B8GZSJvx.woff2",
  "/dhyaana/favicon.png",
  "/dhyaana/index.html",
  "/dhyaana/manifest.webmanifest"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Add individually: one failed asset should not abort the whole install.
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'reload' });
            if (response.ok) await cache.put(url, response);
          } catch {
            // Skip assets that fail; the app still works online.
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key.startsWith('dhyaana-') && key !== CACHE).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cross-origin (YouTube, thumbnails, fonts): network only.
  if (url.origin !== self.location.origin) return;

  // Navigations: serve the cached app shell so deep links work offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put('/dhyaana/index.html', fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          const shell =
            (await cache.match('/dhyaana/index.html')) ||
            (await cache.match('/dhyaana/')) ||
            (await cache.match(request));
          return shell || new Response('Offline', { status: 503 });
        }
      })(),
    );
    return;
  }

  // Same-origin assets: cache first, then network, and store what we fetch.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(request);
      if (hit) return hit;
      try {
        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      } catch {
        return new Response('', { status: 504 });
      }
    })(),
  );
});
