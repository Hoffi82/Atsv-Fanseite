const CACHE_NAME = "atsv-fan-app-v9";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./script.js",
  "./js/script.js",
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
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

async function injectPushFix(response) {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    const html = await response.text();

    // Wichtig: Die alte Inline-Push-Funktion im index.html darf den Button
    // nicht mehr auslösen. Wir entfernen nur den onclick-Aufruf und hängen
    // anschließend unsere zentrale Push-Funktion an den Button.
    const cleanedHtml = html.replace(
      'onclick="enablePushNotifications()"',
      ''
    );

    const fixedHtml = cleanedHtml.replace(
      "</body>",
      '<script id="atsv-push-fix-script" src="./js/script.js?v=9"></script></body>'
    );

    return new Response(fixedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  } catch (error) {
    console.error("ATSV HTML-Push-Fix konnte nicht injiziert werden:", error);
    return response;
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(async response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          return injectPushFix(response);
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached ? injectPushFix(cached) : cached;
        })
    );
    return;
  }

  if (new URL(request.url).pathname.endsWith("/js/script.js")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => cachedResponse || fetch(request))
  );
});

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
    data: { url: data.url || "./index.html" },
    vibrate: [200, 100, 200]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "./index.html";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
