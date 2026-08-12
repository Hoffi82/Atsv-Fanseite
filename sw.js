const CACHE_NAME = "atsv-fan-app-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./script.js",
  "./spieler.html",
  "./spielerprofil.html",
  "./ergebnisse.html",
  "./spielberichte.html",
  "./galerie.html",
  "./liga-26-27.html",
  "./vorbereitung-26-27.html",
  "./impressum.html",
  "./bilder/ATSV_Wappen_4K_transparent.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
