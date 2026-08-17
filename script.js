// ATSV Fanseite – zentrale JavaScript-Funktionen

const PUSH_ENABLED_KEY = "atsv_push_enabled";

async function getATSVServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker wird von diesem Browser nicht unterstützt.");
  }

  return navigator.serviceWorker.register("./sw.js", { scope: "./" });
}

function updatePushButton() {
  const button = document.getElementById("pushButton");
  if (!button) return;

  const permission = "Notification" in window
    ? Notification.permission
    : "unsupported";

  if (permission === "granted" || localStorage.getItem(PUSH_ENABLED_KEY) === "true") {
    button.textContent = "🔔 Push-Benachrichtigungen aktiviert";
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
  }
}

async function enablePushNotifications() {
  const button = document.getElementById("pushButton");

  if (!("Notification" in window)) {
    alert("Dieser Browser unterstützt keine Push-Benachrichtigungen.");
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
      if (button) {
        button.disabled = false;
        button.textContent = "🔔 Push-Benachrichtigungen aktivieren";
      }
      return;
    }

    // Die Browser-Berechtigung bleibt bestehen, bis der Nutzer sie selbst
    // in den Browser-/Website-Einstellungen widerruft.
    localStorage.setItem(PUSH_ENABLED_KEY, "true");

    // Service Worker aktiv halten. Die eigentliche Push-Subscription wird
    // im nächsten Schritt mit unserem VAPID-Public-Key eingerichtet.
    await navigator.serviceWorker.ready;

    updatePushButton();

    console.log("ATSV Push-Benachrichtigungen sind aktiviert.", registration.scope);
  } catch (error) {
    console.error("Push-Aktivierung fehlgeschlagen:", error);

    if (button) {
      button.disabled = false;
      button.textContent = "🔔 Push-Benachrichtigungen aktivieren";
    }

    alert("Die Push-Benachrichtigungen konnten noch nicht aktiviert werden.");
  }
}

// Beim Öffnen der Seite prüfen wir den gespeicherten Status.
document.addEventListener("DOMContentLoaded", () => {
  updatePushButton();

  // Falls der Nutzer bereits zugestimmt hat, registrieren wir den Service
  // Worker automatisch. Es erscheint dabei keine neue Berechtigungsfrage.
  if ("Notification" in window && Notification.permission === "granted") {
    getATSVServiceWorker()
      .then(() => updatePushButton())
      .catch(error => console.error("Service Worker konnte nicht registriert werden:", error));
  }
});
