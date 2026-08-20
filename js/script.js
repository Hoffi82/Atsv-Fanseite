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
    await navigator.serviceWorker.register("./sw.js?v=17", { scope: "./" });
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
      await subscription.unsubscribe();
      subscription = null;
    }

    if (subscription && savedVapidKey && savedVapidKey !== ATSV_VAPID_PUBLIC_KEY) {
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
    if (!endpoint || !p256dh || !auth) throw new Error("Der Browser hat keine vollständigen Push-Daten geliefert.");

    const supabaseClient = window.supabase.createClient(ATSV_SUPABASE_URL, ATSV_SUPABASE_KEY);
    const { data: existing, error: lookupError } = await supabaseClient
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", endpoint)
      .limit(1);
    if (lookupError) throw new Error(`Supabase ${lookupError.code || "Fehler"}: ${lookupError.message || "Unbekannter Fehler"}`);

    if (!existing?.length) {
      const { error } = await supabaseClient.from("push_subscriptions").insert({ endpoint, p256dh, auth });
      if (error) throw new Error(`Supabase ${error.code || "Fehler"}: ${error.message || "Unbekannter Fehler"}${error.details ? ` | Details: ${error.details}` : ""}${error.hint ? ` | Hinweis: ${error.hint}` : ""}`);
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

/* ATSV Gegner-Wappen – Countdown und Live-Ticker */
const ATSV_OPPONENT_LOGOS = {
  "SpVgg Jahn Forchheim 2": "spvgg-jahn-forchheim-ii.jpg",
  "ASV Möhrendorf": "asv-moehrendorf.jpg",
  "DJK Schnaid-Rothensand": "djk-schnaid-rothensand.jpg",
  "DJK Schnaid/Rothensand": "djk-schnaid-rothensand.jpg",
  "ATSV Erlangen U23 2": "atsv-erlangen-u23.jpg",
  "ATSV Erlangen 1898": "atsv-erlangen-u23.jpg",
  "BSC Erlangen": "bsc-erlangen.jpg",
  "DJK Hallerndorf": "djk-hallerndorf.jpg",
  "ASV Niederndorf": "asv-niederndorf.jpg",
  "DJK Erlangen II": "djk-erlangen-ii.jpg",
  "SpVgg Uehlfeld": "spvgg-uehlfeld.png",
  "SpVgg Hausen": "spvgg-hausen.jpg",
  "SV Buckenhofen II": "sv-buckenhofen-ii.jpg",
  "TSV Neuhaus": "tsv-neuhaus.jpg",
  "Hammerbacher SV": "hammerbacher-sv.jpg",
  "SpVgg Heßdorf/Großenseebach": "spvgg-hessdorf-grossenseebach.jpg",
  "SpVgg Hessdorf/Großenseebach": "spvgg-hessdorf-grossenseebach.jpg",
  "TKV Forchheim": "tkv-forchheim.jpg",
  "DJK Eggolsheim": "djk-eggolsheim.png",
  "TSV Hemhofen": "tsv-hemhofen.jpg",
  "SpVgg Heroldsbach": "spvgg-heroldsbach-thurn.jpg",
  "SpVgg/DJK Heroldsbach-Thurn": "spvgg-heroldsbach-thurn.jpg"
};

const ATSV_LOGO = "bilder/ATSV_Wappen_4K_transparent.png";

function atsvLogoFile(name) {
  const file = ATSV_OPPONENT_LOGOS[name] || "";
  return file ? "bilder/" + file : "";
}

function atsvLogoImage(src, alt, className) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.className = className;
  img.loading = "eager";
  img.onerror = function () {
    if (!this.dataset.fallback && /\.(jpg|jpeg|png)$/i.test(this.src)) {
      this.dataset.fallback = "1";
      this.src = this.src.replace(/\.(jpg|jpeg|png)$/i, ".$&".replace(".", ""));
    }
  };
  return img;
}

function atsvFindLogo(teamName) {
  const clean = String(teamName || "").trim();
  const key = Object.keys(ATSV_OPPONENT_LOGOS).find(k => k.toLowerCase() === clean.toLowerCase());
  return atsvLogoFile(key || clean);
}

function atsvStyleWappen() {
  if (document.getElementById("atsv-wappen-style")) return;
  const style = document.createElement("style");
  style.id = "atsv-wappen-style";
  style.textContent = `
    .atsv-match-crest-wrap{display:flex;align-items:center;justify-content:center;gap:18px;margin:4px 0 18px}
    .atsv-match-crest{width:78px;height:78px;object-fit:contain;display:block}
    .atsv-match-crest-vs{color:#d00020;font-weight:900;font-size:18px}
    .home-live-team .atsv-team-name,.next-match-team-name{display:block;margin-top:6px;font-size:13px;color:#aaa}
    .home-live-crest{width:70px;height:70px;object-fit:contain;margin:auto;display:block}
    @media(max-width:600px){.atsv-match-crest{width:62px;height:62px}.atsv-match-crest-wrap{gap:12px}.home-live-crest{width:58px;height:58px}}
  `;
  document.head.appendChild(style);
}

function atsvBuildCountdownWappen() {
  const box = document.querySelector(".next-match");
  if (!box || box.dataset.wappenDone) return;
  const teams = box.querySelector(".next-match-teams");
  if (!teams) return;
  const text = teams.textContent.replace(/\s+/g," ").trim();
  const opponent = /ASV Niederndorf/i.test(text) ? "ASV Niederndorf" : "";
  if (!opponent) return;
  teams.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "atsv-match-crest-wrap";
  const home = atsvLogoImage(ATSV_LOGO,"ATSV Forchheim Wappen","atsv-match-crest");
  const vs = document.createElement("span"); vs.className="atsv-match-crest-vs"; vs.textContent="VS.";
  const awaySrc = atsvFindLogo(opponent);
  const away = atsvLogoImage(awaySrc,opponent+" Wappen","atsv-match-crest");
  wrap.append(home,vs,away);
  const names = document.createElement("div");
  names.innerHTML = "<span class=\"next-match-team-name\">ATSV Forchheim</span><span class=\"next-match-team-name\">"+opponent+"</span>";
  teams.append(wrap,names);
  box.dataset.wappenDone="1";
}

function atsvBuildLiveWappen() {
  const teams = document.querySelector(".teams");
  if (!teams) return;
  const teamEls = teams.querySelectorAll(".team");
  if (teamEls.length < 2) return;
  const homeName = teamEls[0].textContent.trim();
  const awayName = teamEls[1].textContent.trim();
  if (!homeName || !awayName || homeName === "Gegner" || awayName === "Gegner") return;
  let wrap = teams.querySelector(".atsv-match-crest-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className="atsv-match-crest-wrap";
    teams.insertBefore(wrap, teams.firstChild);
  }
  wrap.innerHTML="";
  const homeSrc = /atsv/i.test(homeName) ? ATSV_LOGO : atsvFindLogo(homeName);
  const awaySrc = /atsv/i.test(awayName) ? ATSV_LOGO : atsvFindLogo(awayName);
  wrap.append(atsvLogoImage(homeSrc,homeName+" Wappen","atsv-match-crest"));
  const vs=document.createElement("span"); vs.className="atsv-match-crest-vs"; vs.textContent="VS."; wrap.append(vs);
  wrap.append(atsvLogoImage(awaySrc,awayName+" Wappen","atsv-match-crest"));
  teamEls.forEach(el=>el.style.fontSize="13px");
}

function initAtsvWappenDisplays() {
  atsvStyleWappen();
  atsvBuildCountdownWappen();
  atsvBuildLiveWappen();
  const observer = new MutationObserver(() => atsvBuildLiveWappen());
  const teams = document.querySelector(".teams");
  if (teams) observer.observe(teams,{subtree:true,childList:true,characterData:true});
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { updateAtsvPushButton(); initAtsvWappenDisplays(); });
} else {
  updateAtsvPushButton();
  initAtsvWappenDisplays();
}
