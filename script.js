// ATSV Fanseite – zentrale JavaScript-Funktionen

const PUSH_ENABLED_KEY = "atsv_push_enabled";
const PUSH_SUBSCRIPTION_KEY = "atsv_push_subscription";
const ATSV_VAPID_PUBLIC_KEY = "BFfOhezeEsiPraVBJfFyh61utj2GxfIsR19fzbXsdst9qoOAwFcByxRVQdJq-8Az1NPC_70lgdKsMoBwB56PSIk";

async function getATSVServiceWorker() {
  if (!("serviceWorker" in navigator)) throw new Error("Service Worker wird von diesem Browser nicht unterstützt.");
  return navigator.serviceWorker.register("./sw.js", { scope: "./" });
}

function updatePushButton() {
  const button = document.getElementById("pushButton");
  if (!button) return;
  const permission = "Notification" in window ? Notification.permission : "unsupported";
  const enabled = localStorage.getItem(PUSH_ENABLED_KEY) === "true";
  const hasSubscription = localStorage.getItem(PUSH_SUBSCRIPTION_KEY) === "true";
  if (permission === "granted" && enabled && hasSubscription) {
    button.textContent = "🔔 Push-Benachrichtigungen aktiviert";
    button.disabled = true; button.style.opacity = "0.75"; button.style.cursor = "default"; return;
  }
  if (permission === "granted" && enabled) {
    button.textContent = "⏳ Push wird vorbereitet...";
    button.disabled = true; button.style.opacity = "0.75"; button.style.cursor = "default"; return;
  }
  if (permission === "denied") {
    button.textContent = "🔕 Push in den Browser-Einstellungen gesperrt";
    button.disabled = true; button.style.opacity = "0.65"; button.style.cursor = "default"; return;
  }
  button.textContent = "🔔 Push-Benachrichtigungen aktivieren";
  button.disabled = false; button.style.opacity = "1"; button.style.cursor = "pointer";
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function subscribeToATSVPush(registration) {
  if (!registration.pushManager) throw new Error("Push API wird von diesem Browser nicht unterstützt.");
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(ATSV_VAPID_PUBLIC_KEY) });
  }
  localStorage.setItem(PUSH_ENABLED_KEY, "true");
  localStorage.setItem(PUSH_SUBSCRIPTION_KEY, "true");
  localStorage.setItem("atsv_push_subscription_data", JSON.stringify(subscription.toJSON()));
  return subscription;
}

async function enablePushNotifications() {
  const button = document.getElementById("pushButton");
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) { alert("Dieser Browser unterstützt keine Web-Push-Benachrichtigungen."); return; }
  if (!window.isSecureContext) { alert("Push-Benachrichtigungen funktionieren nur über HTTPS bzw. localhost."); return; }
  if (Notification.permission === "denied") { alert("Push-Benachrichtigungen sind für diese Website bereits gesperrt. Bitte erlaube sie in den Browser-Einstellungen."); return; }
  try {
    if (button) { button.disabled = true; button.textContent = "⏳ Push wird aktiviert..."; }
    const registration = await getATSVServiceWorker();
    let permission = Notification.permission;
    if (permission === "default") permission = await Notification.requestPermission();
    if (permission !== "granted") { updatePushButton(); return; }
    await navigator.serviceWorker.ready;
    await subscribeToATSVPush(registration);
    updatePushButton();
  } catch (error) {
    console.error("Push-Aktivierung fehlgeschlagen:", error);
    localStorage.removeItem(PUSH_ENABLED_KEY); localStorage.removeItem(PUSH_SUBSCRIPTION_KEY); localStorage.removeItem("atsv_push_subscription_data");
    if (button) { button.disabled = false; button.textContent = "🔔 Push-Benachrichtigungen aktivieren"; }
    alert("Die Push-Benachrichtigungen konnten noch nicht aktiviert werden.");
  }
}

// Startseiten-Liveticker: Ein Spiel bleibt nicht unbegrenzt LIVE, selbst wenn
// der Admin den Abpfiff noch nicht gesetzt hat. Nach vier Stunden wird ein
// veralteter Live-Datensatz automatisch nicht mehr als LIVE angezeigt.
async function updateHomeLiveTickerSafely() {
  const status = document.getElementById("homeLiveStatus");
  const homeTeam = document.getElementById("liveHomeTeam");
  const awayTeam = document.getElementById("liveAwayTeam");
  const homeScore = document.getElementById("liveHomeScore");
  const awayScore = document.getElementById("liveAwayScore");
  const minute = document.getElementById("liveCurrentMinute");
  const events = document.getElementById("homeLiveEvents");
  if (!status || !window.supabase) return;

  try {
    const client = window.supabase.createClient("https://xmtrtpibldbiiikkkmnd.supabase.co", "sb_publishable_5dbkLVYmSklCiPcjzzFk1g_ANJoqy9B");
    const { data: match, error } = await client.from("live_matches").select("*").eq("status", "live").order("created_at", { ascending: false }).limit(1).maybeSingle();

    const createdAt = match?.created_at ? new Date(match.created_at).getTime() : 0;
    const isStale = createdAt > 0 && (Date.now() - createdAt) > (4 * 60 * 60 * 1000);

    if (error || !match || isStale) {
      status.textContent = "KEIN SPIEL LIVE";
      status.style.background = "#333";
      if (homeTeam) homeTeam.textContent = "ATSV Forchheim";
      if (awayTeam) awayTeam.textContent = "Kein Spiel";
      if (homeScore) homeScore.textContent = "–";
      if (awayScore) awayScore.textContent = "–";
      if (minute) minute.textContent = "–";
      if (events) events.innerHTML = '<div class="home-live-no-events">Aktuell läuft kein Spiel.</div>';
      return;
    }

    status.textContent = "🔴 LIVE";
    status.style.background = "#d00020";
    if (homeTeam) homeTeam.textContent = match.home_team || "ATSV Forchheim";
    if (awayTeam) awayTeam.textContent = match.away_team || "Gegner";
    if (homeScore) homeScore.textContent = match.home_score ?? 0;
    if (awayScore) awayScore.textContent = match.away_score ?? 0;
    if (minute) minute.textContent = match.current_minute ?? 0;
  } catch (error) {
    console.error("Home-Liveticker konnte nicht aktualisiert werden:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  updatePushButton();
  updateHomeLiveTickerSafely();
  setInterval(updateHomeLiveTickerSafely, 5000);

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      const registration = await getATSVServiceWorker();
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        localStorage.setItem(PUSH_ENABLED_KEY, "true");
        localStorage.setItem(PUSH_SUBSCRIPTION_KEY, "true");
        localStorage.setItem("atsv_push_subscription_data", JSON.stringify(subscription.toJSON()));
      }
      updatePushButton();
    } catch (error) {
      console.error("Push-Status konnte nicht geprüft werden:", error);
    }
  }
});
