const CACHE_NAME = "atsv-fan-app-v3";

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
// PUSH-BENACHRICHTIGUNGEN

self.addEventListener("push", event => {

  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = {
      title: "ATSV Forchheim",
      body: event.data ? event.data.text() : "Neue Nachricht"
    };
  }

  const title = data.title || "ATSV Forchheim";

  const options = {
    body: data.body || "Es gibt eine neue Nachricht.",
    icon: "./bilder/icon-192.png",
    badge: "./bilder/icon-192.png",
    data: {
      url: data.url || "./index.html"
    },
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );

});

self.addEventListener("notificationclick", event => {

  event.notification.close();

  const targetUrl =
    event.notification.data?.url || "./index.html";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(windowClients => {

      for (const client of windowClients) {

        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }

      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

    })
  );

});
