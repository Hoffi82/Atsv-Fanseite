const CACHE_NAME = "atsv-fan-app-v14";

const FILES_TO_CACHE = ["./", "./index.html", "./manifest.webmanifest", "./css/style.css", "./script.js", "./js/script.js", "./spieler.html", "./spielerprofil.html", "./ergebnisse.html", "./spielberichte.html", "./galerie.html", "./liga-26-27.html", "./vorbereitung-26-27.html", "./impressum.html", "./bilder/ATSV_Wappen_4K_transparent.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

async function cleanIndexHtml(response) {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;
    let html = await response.text();

    // Den alten Inline-Push-Handler vollständig entfernen.
    html = html.replace(/<script[^>]*>\s*async\s+function\s+enablePushNotifications\s*\([\s\S]*?<\/script>/gi, "");

    // Der Button darf die alte Funktion nicht mehr aufrufen.
    html = html.replace(/\s+onclick\s*=\s*["']enablePushNotifications\s*\(\)\s*["']/gi, "");

    // Alte Push-Skript-Einbindungen entfernen.
    html = html.replace(/<script[^>]*id=["']atsv-push-fix-script["'][^>]*>[\s\S]*?<\/script>/gi, "");
    html = html.replace(/<script[^>]*src=["'][^"']*\/js\/script\.js[^"']*["'][^>]*><\/script>/gi, "");

    // Nur die aktuelle Push-Datei laden.
    html = html.replace(/<\/body>/i, '<script id="atsv-push-fix-script" src="./js/script.js?v=14"></script></body>');

    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.delete("content-encoding");
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    console.error("ATSV HTML-Push-Bereinigung fehlgeschlagen:", error);
    return response;
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request, { cache: "no-store" }).then(response => cleanIndexHtml(response)).catch(async () => {
      const cached = await caches.match(request);
      return cached ? cleanIndexHtml(cached) : cached;
    }));
    return;
  }
  if (new URL(request.url).pathname.endsWith("/js/script.js")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }
  event.respondWith(caches.match(request).then(cachedResponse => cachedResponse || fetch(request)));
});

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (error) { data = { title: "ATSV Forchheim", body: event.data ? event.data.text() : "Neue Nachricht" }; }
  event.waitUntil(self.registration.showNotification(data.title || "ATSV Forchheim", {
    body: data.body || "Es gibt eine neue Nachricht.",
    icon: "./bilder/ATSV_Wappen_4K_transparent.png",
    badge: "./bilder/ATSV_Wappen_4K_transparent.png",
    data: { url: data.url || "./index.html" },
    vibrate: [200, 100, 200]
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "./index.html";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
    for (const client of windowClients) {
      if ("focus" in client) { client.navigate(targetUrl); return client.focus(); }
    }
    if (clients.openWindow) return clients.openWindow(targetUrl);
  }));
});
