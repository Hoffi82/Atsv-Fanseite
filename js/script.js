// ATSV Fanseite – Push-Aktivierung
// Verbindet die Fanseite mit der bestehenden Supabase-Push-Tabelle.

const ATSV_SUPABASE_URL = "https://xmtrtpibldbiiikkkmnd.supabase.co";
const ATSV_SUPABASE_KEY = "sb_publishable_5dbkLVYmSklCiPcjzzFk1g_ANJoqy9B";
const ATSV_VAPID_PUBLIC_KEY = "BMAhQ9LSniSmZDTjza6FHf9-RGG-0qCd6diob0khvQFs4EqzoJMAwka2eniWHtubyMbGcYin6z2DVtx-mUmV-go";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function registerAtsvServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("./sw.js", { scope: "./" });
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

    if (button) {
      button.disabled = true;
      button.textContent = "🔄 Push wird aktiviert...";
    }

    const registration = await registerAtsvServiceWorker();
    if (!registration) throw new Error("Der Push-Service konnte nicht gestartet werden.");

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Die Push-Berechtigung wurde nicht erteilt.");
    }

    await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    const savedVapidKey = localStorage.getItem("atsv_vapid_public_key");

    // Ein Browser-Push-Abo ist fest an den VAPID-Key gebunden.
    // Falls noch ein altes Abo vorhanden ist, wird es einmalig ersetzt.
    if (subscription && savedVapidKey !== ATSV_VAPID_PUBLIC_KEY) {
      await subscription.unsubscribe();
      subscription = null;
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

    if (!endpoint || !p256dh || !auth) {
      throw new Error("Der Browser hat keine vollständigen Push-Daten geliefert.");
    }

    const supabase = window.supabase.createClient(ATSV_SUPABASE_URL, ATSV_SUPABASE_KEY);

    const { data: existing, error: lookupError } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", endpoint)
      .limit(1);

    if (lookupError) {
      throw new Error(`Supabase ${lookupError.code || "Fehler"}: ${lookupError.message || "Unbekannter Fehler"}`);
    }

    if (!existing?.length) {
      const { error } = await supabase
        .from("push_subscriptions")
        .insert({ endpoint, p256dh, auth });

      if (error) {
        throw new Error(
          `Supabase ${error.code || "Fehler"}: ${error.message || "Unbekannter Fehler"}` +
          (error.details ? ` | Details: ${error.details}` : "") +
          (error.hint ? ` | Hinweis: ${error.hint}` : "")
        );
      }
    }

    localStorage.setItem("atsv_push_enabled", "true");
    localStorage.setItem("atsv_vapid_public_key", ATSV_VAPID_PUBLIC_KEY);
    updateAtsvPushButton();
    alert("Push-Benachrichtigungen wurden erfolgreich aktiviert.");
  } catch (error) {
    console.error("ATSV Push-Fehler:", error);
    if (button) {
      button.disabled = false;
      button.textContent = "🔔 Push-Benachrichtigungen aktivieren";
      button.style.background = "#d00020";
    }
    alert("Push-Anmeldung fehlgeschlagen:\n\n" + (error?.message || String(error)));
  }
}

window.enablePushNotifications = atsVEnablePush;

async function updateAtsvPushButton() {
  const button = document.getElementById("pushButton");
  if (!button) return;

  button.onclick = atsVEnablePush;

  try {
    const registration = await registerAtsvServiceWorker();
    const subscription = registration ? await registration.pushManager.getSubscription() : null;
    const enabled = Notification.permission === "granted" && !!subscription && localStorage.getItem("atsv_vapid_public_key") === ATSV_VAPID_PUBLIC_KEY;

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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateAtsvPushButton);
} else {
  updateAtsvPushButton();
}
