// ATSV Fanseite – Push-Aktivierung
const ATSV_SUPABASE_URL = "https://xmtrtpibldbiiikkkmnd.supabase.co";
const ATSV_SUPABASE_KEY = "sb_publishable_5dbkLVYmSklCiPcjzzFk1g_ANJoqy9B";
const ATSV_VAPID_PUBLIC_KEY = "BMAhQ9LSniSmZDTjza6FHf9-RGG-0qCd6diob0khvQFs4EqzoJMAwka2eniWHtubyMbGcYin6z2DVtx-mUmV-go";
const ATSV_REBIND_FLAG = "atsv_push_rebind_v1";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function registerAtsvServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    await navigator.serviceWorker.register("./sw.js?v=19", { scope: "./" });
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error("ATSV Service Worker konnte nicht registriert werden:", error);
    return null;
  }
}

async function atsVEnablePush() {
  const button = document.getElementById("pushButton");
  try {
    if (!("Notification" in window)) throw new Error("Dieser Browser unterstützt keine Push-Benachrichtigungen.");
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) throw new Error("Dieser Browser unterstützt Web Push nicht.");
    if (Notification.permission === "denied") throw new Error("Push-Benachrichtigungen sind im Browser blockiert. Bitte die Website-Berechtigung wieder erlauben.");
    if (button) { button.disabled = true; button.textContent = "🔄 Push wird aktiviert..."; }
    const registration = await registerAtsvServiceWorker();
    if (!registration) throw new Error("Der Push-Service konnte nicht gestartet werden.");
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Die Push-Berechtigung wurde nicht erteilt.");
    }
    let subscription = await registration.pushManager.getSubscription();
    const savedVapidKey = localStorage.getItem("atsv_vapid_public_key");
    if (subscription && localStorage.getItem(ATSV_REBIND_FLAG) !== "done") {
      await subscription.unsubscribe(); subscription = null;
    }
    if (subscription && savedVapidKey && savedVapidKey !== ATSV_VAPID_PUBLIC_KEY) {
      await subscription.unsubscribe(); subscription = null;
    }
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(ATSV_VAPID_PUBLIC_KEY)
      });
    }
    const subscriptionJson = subscription.toJSON();
    const endpoint = subscriptionJson.endpoint;
    const p256dh = subscriptionJson.keys?.p256dh;
    const auth = subscriptionJson.keys?.auth;
    if (!endpoint || !p256dh || !auth) throw new Error("Der Browser hat keine vollständigen Push-Daten geliefert.");
    const supabaseClient = window.supabase.createClient(ATSV_SUPABASE_URL, ATSV_SUPABASE_KEY);
    const { data: existing, error: lookupError } = await supabaseClient
      .from("push_subscriptions").select("id").eq("endpoint", endpoint).limit(1);
    if (lookupError) throw new Error(`Supabase ${lookupError.code || "Fehler"}: ${lookupError.message || "Unbekannter Fehler"}`);
    if (!existing?.length) {
      const { error } = await supabaseClient.from("push_subscriptions").insert({ endpoint, p256dh, auth });
      if (error) throw new Error(`Supabase ${error.code || "Fehler"}: ${error.message || "Unbekannter Fehler"}`);
    }
    localStorage.setItem("atsv_push_enabled", "true");
    localStorage.setItem("atsv_vapid_public_key", ATSV_VAPID_PUBLIC_KEY);
    localStorage.setItem(ATSV_REBIND_FLAG, "done");
    updateAtsvPushButton();
    alert("Push-Benachrichtigungen wurden erfolgreich aktiviert.");
  } catch (error) {
    console.error("ATSV Push-Fehler:", error);
    if (button) { button.disabled = false; button.textContent = "🔔 Push-Benachrichtigungen aktivieren"; button.style.background = "#d00020"; }
    alert("Push-Anmeldung fehlgeschlagen:\n\n" + (error?.message || String(error)));
  }
}

window.atsVEnablePush = atsVEnablePush;
window.enablePushNotifications = atsVEnablePush;

async function updateAtsvPushButton() {
  const button = document.getElementById("pushButton");
  if (!button) return;
  button.onclick = atsVEnablePush;
  try {
    const registration = await registerAtsvServiceWorker();
    const subscription = registration ? await registration.pushManager.getSubscription() : null;
    const enabled = Notification.permission === "granted" && !!subscription;
    if (enabled) {
      button.textContent = "🔔 Push-Benachrichtigungen aktiviert ✓";
      button.style.background = "#228B22";
    } else {
      button.textContent = "🔔 Push-Benachrichtigungen aktivieren";
      button.style.background = "#d00020";
    }
    button.disabled = false;
  } catch (error) {
    console.error("ATSV Push-Status konnte nicht geprüft werden:", error);
  }
}

// Countdown-Fix: Das nächste Spiel wird unabhängig vom alten, fest eingetragenen
// Countdown ermittelt. Nach dem heutigen Spiel ist das Uehlfeld-Spiel das Ziel.
function updateAtsvNextMatchCountdown() {
  const box = document.querySelector(".next-match");
  if (!box) return;

  const matchDate = new Date("2026-08-30T15:00:00");
  const now = new Date();
  const difference = matchDate - now;

  const dateEl = box.querySelector(".next-match-date");
  const teamsEl = box.querySelector(".next-match-teams");
  const countdown = box.querySelector(".countdown");
  const liveMessage = box.querySelector("#live-message");

  if (dateEl) dateEl.textContent = "Sonntag, 30.08.2026 · 15:00 Uhr";
  if (teamsEl) teamsEl.innerHTML = "SpVgg Uehlfeld<span>VS.</span>ATSV Forchheim";

  if (difference <= 0) return;

  if (countdown) countdown.style.display = "grid";
  if (liveMessage) liveMessage.innerHTML = "";

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value).padStart(2, "0");
  };

  set("days", Math.floor(difference / 86400000));
  set("hours", Math.floor((difference / 3600000) % 24));
  set("minutes", Math.floor((difference / 60000) % 60));
  set("seconds", Math.floor((difference / 1000) % 60));
}

function restoreAtsvCrest() {
  const crest = document.querySelector(".badge img");
  if (!crest) return;
  crest.src = "./bilder/ATSV_Wappen_4K_transparent.png?v=19";
  crest.alt = "ATSV Forchheim Wappen";
  crest.onerror = () => {
    crest.src = "./bilder/ATSV_Wappen_4K.jpg?v=19";
  };
}

function initAtsvPageFixes() {
  restoreAtsvCrest();
  updateAtsvNextMatchCountdown();
  setInterval(updateAtsvNextMatchCountdown, 1000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    updateAtsvPushButton();
    initAtsvPageFixes();
  });
} else {
  updateAtsvPushButton();
  initAtsvPageFixes();
}
