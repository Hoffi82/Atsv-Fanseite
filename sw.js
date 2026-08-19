const CACHE_NAME = "atsv-fan-app-v16";

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

async function prepareIndex(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();

  // Nur den alten Button-Aufruf umleiten. Der restliche HTML-Code bleibt 1:1 erhalten.
  const fixedHtml = html
    .replace(/onclick=["']enablePushNotifications\(\)["']/gi, 'onclick="atsVEnablePush()"')
    .replace(/<\/body>/i, '<script src="./js/script.js?v=16"></script></body>');

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");

  return new Response(fixedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).then(prepareIndex)
    );
    return;
  }

  if (new URL(request.url).pathname.endsWith("/js/script.js")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "ATSV Forchheim", body: event.data ? event.data.text() : "Neue Nachricht" };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "ATSV Forchheim", {
      body: data.body || "Es gibt eine neue Nachricht.",
      icon: "./bilder/ATSV_Wappen_4K_transparent.png",
      badge: "./bilder/ATSV_Wappen_4K_transparent.png",
      data: { url: data.url || "./index.html" },
      vibrate: [200, 100, 200]
    })
  );
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
      return clients.openWindow ? clients.openWindow(targetUrl) : undefined;
    })
  );
});
