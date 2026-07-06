// Realmshaper hosted-deployment service worker (v56).
// Only ever registered by index.html when served over http/https (see the
// guarded registration in index.html) -- irrelevant to the plain offline
// single-file copy opened via file://.
// Job: cache the single app file on first (online) visit so every visit
// after that loads with zero network requests, exactly like the local copy.

const CACHE_NAME = 'realmshaper-cache-v56';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always answer navigations with the cached app shell -- this is a
  // single-page app with one real document, so any navigation should load it.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
