// Bol Marathi Service Worker — Offline-first with background sync
const BASE = '/learn-marathi/';
const CACHE_STATIC = 'bol-static-v2';
const CACHE_IMAGES = 'bol-images-v2';
const CACHE_PAGES = 'bol-pages-v2';
const CACHE_AUDIO = 'bol-audio-v1';
const CACHE_SEARCH = 'bol-search-v1';
const OFFLINE_FALLBACK = BASE + 'offline.html';

// Static assets to precache (populated at build by generateSW or injectManifest)
const PRECACHE_MANIFEST = self.__PRECACHE_MANIFEST || [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      const assets = [
        BASE,
        BASE + 'manifest.webmanifest',
        BASE + 'favicon.svg',
        BASE + 'og/og-default.jpg',
        BASE + 'search-index.json',
        ...PRECACHE_MANIFEST.map((entry) => BASE + entry.url),
      ].filter(Boolean);
      return cache.addAll(assets);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![CACHE_STATIC, CACHE_IMAGES, CACHE_PAGES, CACHE_AUDIO, CACHE_SEARCH].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function isStaticAsset(url) {
  return url.pathname.startsWith(BASE + '_astro/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.json') ||
         url.pathname.endsWith('.webmanifest');
}

function isImageAsset(url) {
  return url.pathname.startsWith(BASE + 'og/') ||
         url.pathname.startsWith(BASE + 'icons/') ||
         url.pathname.startsWith(BASE + 'screenshots/') ||
         url.pathname.match(/\.(png|jpg|jpeg|webp|avif|gif)$/i);
}

function isAudioAsset(url) {
  return url.pathname.startsWith(BASE + 'audio/') ||
         url.pathname.match(/\.(mp3|wav|ogg|m4a)$/i);
}

function isSearchAsset(url) {
  return url.pathname === BASE + 'search-index.json';
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || caches.match(OFFLINE_FALLBACK);
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Static assets (CSS, JS, fonts, JSON) — cache first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request, CACHE_STATIC));
    return;
  }

  // Images — stale-while-revalidate
  if (isImageAsset(url)) {
    event.respondWith(staleWhileRevalidate(event.request, CACHE_IMAGES));
    return;
  }

  // Audio — cache first (large files, don't revalidate often)
  if (isAudioAsset(url)) {
    event.respondWith(cacheFirst(event.request, CACHE_AUDIO));
    return;
  }

  // Search index — cache first, update in background
  if (isSearchAsset(url)) {
    event.respondWith(cacheFirst(event.request, CACHE_SEARCH));
    return;
  }

  // Navigation (HTML pages) — network first, fallback to cache
  if (isNavigationRequest(event.request)) {
    event.respondWith(networkFirst(event.request, CACHE_PAGES));
    return;
  }

  // API/other — network only
  event.respondWith(fetch(event.request));
});

// Background Sync for queued mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'bol-sync-mutations') {
    event.waitUntil(syncMutations());
  }
});

async function syncMutations() {
  // This would connect to IndexedDB and replay queued mutations
  // For now, we just notify clients that sync happened
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'sync-complete' });
  });
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'getVersion') {
    event.ports[0].postMessage({ version: CACHE_STATIC });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'bol-periodic-sync') {
    event.waitUntil(syncMutations());
  }
});