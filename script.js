// ATSV Fanseite – zentrale JavaScript-Funktionen

const PUSH_ENABLED_KEY = "atsv_push_enabled";
const PUSH_SUBSCRIPTION_KEY = "atsv_push_subscription";

// Öffentlicher VAPID-Schlüssel für Web Push.
// Der private VAPID-Schlüssel darf niemals im Frontend oder GitHub stehen.
const ATSV_VAPID_PUBLIC_KEY = "BFfOhezeEsiPraVBJfFyh61utj2GxfIsR19fzbXsdst9qoOAwFcByxRVQdJq-8Az1NPC_70lgdKsMoBwB56PSIk";

async function getATSVServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker wird von diesem Browser nicht unterstützt.");
  }
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
    button.disabled = true;
    button.style.opacity = "0.75";
    button.style.cursor = "default";
    return;
  }

  if (permission === "granted" && enabled) {
    button.textContent = "⏳ Push wird vorbereitet...";
    button.disabled = true;
    button.style.opacity = "0.75";
    button.style.cursor = "default";
    return;
  }

  if (permission === "denied") {
    button.textContent = "🔕 Push in den Browser-Einstellungen gesperrt";
    button.disabled = true;
    button.style.opacity = "0.65";
    button.style.cursor = "default";
    return;
  }

  button.textContent = "🔔 Push-Benachrichtigungen aktivieren";
  button.disabled = false;
  button.style.opacity = "1";
  button.style.cursor = "pointer";
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function subscribeToATSVPush(registration) {
  if (!registration.pushManager) {
    throw new Error("Push API wird von diesem Browser nicht unterstützt.");
  }

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(ATSV_VAPID_PUBLIC_KEY)
    });
  }

  // Die Subscription bleibt lokal erhalten. Im nächsten Schritt wird sie
  // zusätzlich an unseren sicheren Push-Server übergeben, damit echte
  // ATSV-Nachrichten verschickt werden können.
  localStorage.setItem(PUSH_ENABLED_KEY, "true");
  localStorage.setItem(PUSH_SUBSCRIPTION_KEY, "true");
  localStorage.setItem("atsv_push_subscription_data", JSON.stringify(subscription.toJSON()));

  return subscription;
}

async function enablePushNotifications() {
  const button = document.getElementById("pushButton");

  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Dieser Browser unterstützt keine Web-Push-Benachrichtigungen.");
    return;
  }

  if (!window.isSecureContext) {
    alert("Push-Benachrichtigungen funktionieren nur über HTTPS bzw. localhost.");
    return;
  }

  if (Notification.permission === "denied") {
    alert("Push-Benachrichtigungen sind für diese Website bereits gesperrt. Bitte erlaube sie in den Browser-Einstellungen.");
    return;
  }

  try {
    if (button) {
      button.disabled = true;
      button.textContent = "⏳ Push wird aktiviert...";
    }

    const registration = await getATSVServiceWorker();
    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      updatePushButton();
      return;
    }

    await navigator.serviceWorker.ready;
    await subscribeToATSVPush(registration);
    updatePushButton();
    console.log("ATSV Push-Subscription erfolgreich eingerichtet.");
  } catch (error) {
    console.error("Push-Aktivierung fehlgeschlagen:", error);
    localStorage.removeItem(PUSH_ENABLED_KEY);
    localStorage.removeItem(PUSH_SUBSCRIPTION_KEY);
    localStorage.removeItem("atsv_push_subscription_data");

    if (button) {
      button.disabled = false;
      button.textContent = "🔔 Push-Benachrichtigungen aktivieren";
    }

    alert("Die Push-Benachrichtigungen konnten noch nicht aktiviert werden.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  updatePushButton();

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
