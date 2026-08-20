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
    await navigator.serviceWorker.register("./sw.js?v=18", { scope: "./" });
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

/* ATSV Gegner-Wappen – zunächst nur für den Countdown */
const ATSV_OPPONENT_LOGOS = {
  "DJK Erlangen II": "djk-erlangen-ii.jpg.jpg"
};
const ATSV_LOGO = "bilder/ATSV_Wappen_4K_transparent.png";

function atsvFindLogo(teamName) {
  const clean = String(teamName || "").trim();
  const key = Object.keys(ATSV_OPPONENT_LOGOS).find(k => k.toLowerCase() === clean.toLowerCase());
  return key ? "bilder/" + ATSV_OPPONENT_LOGOS[key] : "";
}

function atsvLogoImage(src, alt, className) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.className = className;
  img.loading = "eager";
  return img;
}

function atsvStyleCountdownWappen() {
  if (document.getElementById("atsv-countdown-wappen-style")) return;
  const style = document.createElement("style");
  style.id = "atsv-countdown-wappen-style";
  style.textContent = `
    .atsv-countdown-crest-wrap{display:flex;align-items:center;justify-content:center;gap:24px;margin:2px auto 10px;width:100%;}
    .atsv-countdown-crest{width:72px;height:72px;object-fit:contain;display:block;flex:0 0 72px;}
    .atsv-countdown-vs{color:#d00020;font-weight:900;font-size:16px;line-height:1;flex:0 0 auto;}
    .atsv-countdown-team-name{display:inline-block;margin:0 8px 8px;color:#aaa;font-size:13px;font-weight:700;}
    @media(max-width:600px){.atsv-countdown-crest-wrap{gap:14px}.atsv-countdown-crest{width:60px;height:60px;flex-basis:60px}.atsv-countdown-vs{font-size:14px}}
  `;
  document.head.appendChild(style);
}

function atsvBuildCountdownWappen() {
  const box = document.querySelector(".next-match");
  const teams = box?.querySelector(".next-match-teams");
  if (!teams || teams.dataset.countdownWappenDone === "1") return;

  const opponent = "DJK Erlangen II";
  teams.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "atsv-countdown-crest-wrap";
  wrap.append(
    atsvLogoImage(ATSV_LOGO, "ATSV Forchheim Wappen", "atsv-countdown-crest")
  );

  const vs = document.createElement("span");
  vs.className = "atsv-countdown-vs";
  vs.textContent = "VS.";
  wrap.append(vs);

  wrap.append(
    atsvLogoImage(atsvFindLogo(opponent), opponent + " Wappen", "atsv-countdown-crest")
  );
  teams.appendChild(wrap);

  const names = document.createElement("div");
  names.innerHTML = '<span class="atsv-countdown-team-name">ATSV Forchheim</span><span class="atsv-countdown-team-name">DJK Erlangen II</span>';
  teams.appendChild(names);
  teams.dataset.countdownWappenDone = "1";
}

function initAtsvCountdownWappen() {
  atsvStyleCountdownWappen();
  atsvBuildCountdownWappen();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    updateAtsvPushButton();
    initAtsvCountdownWappen();
  });
} else {
  updateAtsvPushButton();
  initAtsvCountdownWappen();
}
