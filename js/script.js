// ATSV Fanseite – Push-Aktivierung
// Verbindet die Fanseite mit der bestehenden Supabase-Push-Tabelle.

const ATSV_SUPABASE_URL = "https://xmtrtpibldbiiikkkmnd.supabase.co";
const ATSV_SUPABASE_KEY = "sb_publishable_5dbkLVYmSklCiPcjzzFk1g_ANJoqy9B";
const ATSV_VAPID_PUBLIC_KEY = "BNjG6NWf6XHh7IS9QwmVQ1OTWnjWb8_nZIP0iAE-6KP2719wXS9H8AGT6O608mg_De4HD2j2dsKbTNs8YQppZzE";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function atsVEnablePush() {
  const button = document.getElementById("pushButton");

  try {
    if (!("Notification" in window)) {
      throw new Error("Dieser Browser unterstützt keine Push-Benachrichtigungen.");
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error("Dieser Browser unterstützt Web Push nicht.");
    }
    if (Notification.permission === "denied") {
      throw new Error("Push-Benachrichtigungen sind im Browser blockiert. Bitte die Website-Berechtigung wieder erlauben.");
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Die Push-Berechtigung wurde nicht erteilt.");
      }
    }

    if (button) {
      button.disabled = true;
      button.textContent = "🔄 Push wird aktiviert...";
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

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

    const supabase = window.supabase.createClient(
      ATSV_SUPABASE_URL,
      ATSV_SUPABASE_KEY
    );

    // Kein upsert/onConflict mehr: Die vorhandene Tabelle benötigt dafür
    // keinen UNIQUE-Index auf endpoint. Wir verwenden einen normalen INSERT.
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

    localStorage.setItem("atsv_push_enabled", "true");

    if (button) {
      button.disabled = false;
      button.textContent = "🔔 Push-Benachrichtigungen aktiviert";
      button.style.background = "#228B22";
    }

    alert("Push-Benachrichtigungen wurden erfolgreich aktiviert und in Supabase gespeichert.");

  } catch (error) {
    console.error("ATSV Push-Fehler:", error);

    if (button) {
      button.disabled = false;
      button.textContent = "🔔 Push-Benachrichtigungen aktivieren";
      button.style.background = "#d00020";
    }

    alert(
      "Push-Anmeldung fehlgeschlagen:\n\n" +
      (error?.message || String(error))
    );
  }
}

// Die Startseite besitzt bereits onclick="enablePushNotifications()".
// Diese globale Funktion ersetzt die alte Inline-Funktion.
window.enablePushNotifications = atsVEnablePush;

function initAtsvPushButton() {
  const button = document.getElementById("pushButton");
  if (!button) return;

  button.onclick = atsVEnablePush;

  if (
    Notification.permission === "granted" &&
    localStorage.getItem("atsv_push_enabled") === "true"
  ) {
    button.textContent = "🔔 Push-Benachrichtigungen aktiviert";
    button.style.background = "#228B22";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAtsvPushButton);
} else {
  initAtsvPushButton();
}
