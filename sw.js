const CACHE_NAME = 'atsv-fan-app-v25';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Navigation wird bewusst nicht mehr abgefangen.
// Dadurch kann der Service Worker keine Seitenaufrufe mehr blockieren.

self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: 'ATSV Forchheim',
      body: event.data ? event.data.text() : 'Neue Nachricht'
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'ATSV Forchheim', {
      body: data.body || 'Es gibt eine neue Nachricht.',
      icon: './bilder/ATSV_Wappen_4K_transparent.png',
      badge: './bilder/ATSV_Wappen_4K_transparent.png',
      data: { url: data.url || './index.html' },
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow ? clients.openWindow(url) : undefined;
    })
  );
});
