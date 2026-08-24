const CACHE_NAME = "atsv-fan-app-v20";

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

async function prepareIndex(response, request) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const pageUrl = new URL(request.url);
  const pathname = pageUrl.pathname.toLowerCase();
  const isHomePage = pathname.endsWith("/") || pathname.endsWith("/index.html");
  const isFormPage = pathname.endsWith("/form.html");
  const needsAtsvScript = isHomePage || isFormPage;

  let fixedHtml = html.replace(/onclick=["']enablePushNotifications\(\)["']/gi, 'onclick="atsVEnablePush()"');

  // script.js nur auf Startseite und Form-Seite laden.
  if (needsAtsvScript && !/js\/script\.js/i.test(fixedHtml)) {
    fixedHtml = fixedHtml.replace(/<\/body>/i, '<script src="./js/script.js?v=19"></script></body>');
  }

  // Der automatische Countdown gehört ausschließlich auf die Startseite.
  if (isHomePage) {
    const countdownFix = `
<script>
(function(){
  const box = document.querySelector('.next-match');
  if (!box || typeof matches === 'undefined') return;

  function getRealNextMatch(){
    const now = new Date();
    return matches
      .map(match => ({ ...match, start: new Date(match.date) }))
      .filter(match => !Number.isNaN(match.start.getTime()) && match.start > now)
      .sort((a,b) => a.start - b.start)[0] || null;
  }

  function renderRealNextMatch(){
    const match = getRealNextMatch();
    const dateEl = box.querySelector('.next-match-date');
    const teamsEl = box.querySelector('.next-match-teams');
    const countdown = box.querySelector('.countdown');
    const liveMessage = box.querySelector('#live-message');

    if (!match){
      if (dateEl) dateEl.textContent = 'Keine weiteren Spiele';
      if (teamsEl) teamsEl.innerHTML = 'Saisonpause';
      if (countdown) countdown.style.display = 'none';
      if (liveMessage) liveMessage.innerHTML = '';
      return;
    }

    const diff = match.start - new Date();
    if (dateEl) {
      dateEl.textContent = match.start.toLocaleDateString('de-DE', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
      }) + ' · ' + match.start.toLocaleTimeString('de-DE', {
        hour: '2-digit', minute: '2-digit'
      }) + ' Uhr';
    }
    if (teamsEl) teamsEl.innerHTML = match.home + '<span>VS.</span>' + match.away;

    if (diff <= 0){
      if (countdown) countdown.style.display = 'none';
      if (liveMessage) liveMessage.innerHTML = '<div class="game-live">🔴 DAS SPIEL LÄUFT!</div>';
      return;
    }

    if (countdown) countdown.style.display = 'grid';
    if (liveMessage) liveMessage.innerHTML = '';

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const d = box.querySelector('#days');
    const h = box.querySelector('#hours');
    const m = box.querySelector('#minutes');
    const s = box.querySelector('#seconds');
    if (d) d.textContent = String(days).padStart(2,'0');
    if (h) h.textContent = String(hours).padStart(2,'0');
    if (m) m.textContent = String(minutes).padStart(2,'0');
    if (s) s.textContent = String(seconds).padStart(2,'0');
  }

  renderRealNextMatch();
  setInterval(renderRealNextMatch, 1000);
})();
</script>`;
    fixedHtml = fixedHtml.replace(/<\/body>/i, countdownFix + "</body>");
  }

  const pushTitle = pageUrl.searchParams.get("pushTitle");
  const pushBody = pageUrl.searchParams.get("pushBody");

  if (pushTitle || pushBody) {
    const safeTitle = JSON.stringify(pushTitle || "ATSV Forchheim").replace(/</g, "\\u003c");
    const safeBody = JSON.stringify(pushBody || "Neue Nachricht vom ATSV Forchheim").replace(/</g, "\\u003c");

    const pushPopup = `
<style>
#atsvPushPopup{position:fixed;inset:0;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:20px;z-index:99999}
#atsvPushPopup .atsvPushBox{width:min(520px,100%);background:#151515;border:2px solid #d00020;border-radius:16px;padding:24px;color:#fff;box-shadow:0 0 35px rgba(208,0,32,.35);font-family:Arial,Helvetica,sans-serif}
#atsvPushPopup .atsvPushLabel{color:#d00020;font-size:13px;font-weight:900;letter-spacing:2px;margin-bottom:10px}
#atsvPushPopup h2{margin:0 0 12px;font-size:23px}
#atsvPushPopup p{margin:0 0 20px;color:#ddd;line-height:1.55;white-space:pre-wrap}
#atsvPushPopup button{width:100%;background:#d00020;color:#fff;border:0;border-radius:9px;padding:13px;font-size:15px;font-weight:900;cursor:pointer}
</style>
<div id="atsvPushPopup" role="dialog" aria-label="ATSV Push-Nachricht">
  <div class="atsvPushBox">
    <div class="atsvPushLabel">🔔 ATSV PUSH-NACHRICHT</div>
    <h2 id="atsvPushPopupTitle"></h2>
    <p id="atsvPushPopupBody"></p>
    <button id="atsvPushPopupClose">OK – ZUR FANSEITE</button>
  </div>
</div>
<script>
window.addEventListener("DOMContentLoaded",function(){
  document.getElementById("atsvPushPopupTitle").textContent=${safeTitle};
  document.getElementById("atsvPushPopupBody").textContent=${safeBody};
  document.getElementById("atsvPushPopupClose").addEventListener("click",function(){
    const cleanUrl=new URL(window.location.href);
    cleanUrl.searchParams.delete("pushTitle");
    cleanUrl.searchParams.delete("pushBody");
    window.history.replaceState({},"",cleanUrl.pathname+cleanUrl.search+cleanUrl.hash);
    document.getElementById("atsvPushPopup").remove();
  });
});
</script>`;
    fixedHtml = fixedHtml.replace(/<\/body>/i, pushPopup + "</body>");
  }

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
      fetch(request, { cache: "no-store" }).then(response => prepareIndex(response, request))
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
    data = {
      title: "ATSV Forchheim",
      body: event.data ? event.data.text() : "Neue Nachricht"
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "ATSV Forchheim", {
      body: data.body || "Es gibt eine neue Nachricht.",
      icon: "./bilder/ATSV_Wappen_4K_transparent.png",
      badge: "./bilder/ATSV_Wappen_4K_transparent.png",
      data: {
        url: data.url || "./index.html",
        title: data.title || "ATSV Forchheim",
        body: data.body || "Es gibt eine neue Nachricht."
      },
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const rawTarget = notificationData.url || "./index.html";
  let targetUrl = rawTarget;

  try {
    const target = new URL(rawTarget, self.location.origin);
    if (target.origin === self.location.origin) {
      target.searchParams.set("pushTitle", notificationData.title || event.notification.title || "ATSV Forchheim");
      target.searchParams.set("pushBody", notificationData.body || event.notification.body || "Neue Nachricht vom ATSV Forchheim");
      targetUrl = target.href;
    }
  } catch {
    targetUrl = rawTarget;
  }

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
