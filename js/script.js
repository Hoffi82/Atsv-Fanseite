// ATSV Fanseite – zentrale Seitenskripte
const ATSV_SUPABASE_URL = 'https://xmtrtpibldbiiikkkmnd.supabase.co';
const ATSV_SUPABASE_KEY = 'sb_publishable_5dbkLVYmSklCiPcjzzFk1g_ANJoqy9B';
const ATSV_VAPID_PUBLIC_KEY = 'BMAhQ9LSniSmZDTjza6FHf9-RGG-0qCd6diob0khvQFs4EqzoJMAwka2eniWHtubyMbGcYin6z2DVtx-mUmV-go';
const ATSV_REBIND_FLAG = 'atsv_push_rebind_v1';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function registerAtsvServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('./sw.js?v=25', { scope: './' });
    return await navigator.serviceWorker.ready || registration;
  } catch (error) {
    console.error('ATSV Service Worker konnte nicht registriert werden:', error);
    return null;
  }
}

async function atsVEnablePush() {
  const button = document.getElementById('pushButton');
  try {
    if (!('Notification' in window)) throw new Error('Dieser Browser unterstützt keine Push-Benachrichtigungen.');
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Dieser Browser unterstützt Web Push nicht.');
    if (Notification.permission === 'denied') throw new Error('Push-Benachrichtigungen sind im Browser blockiert.');
    if (button) { button.disabled = true; button.textContent = '🔄 Push wird aktiviert...'; }

    const registration = await registerAtsvServiceWorker();
    if (!registration) throw new Error('Der Push-Service konnte nicht gestartet werden.');
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Die Push-Berechtigung wurde nicht erteilt.');
    }

    let subscription = await registration.pushManager.getSubscription();
    const savedVapidKey = localStorage.getItem('atsv_vapid_public_key');
    if (subscription && localStorage.getItem(ATSV_REBIND_FLAG) !== 'done') {
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

    const json = subscription.toJSON();
    const endpoint = json.endpoint;
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!endpoint || !p256dh || !auth) throw new Error('Der Browser hat keine vollständigen Push-Daten geliefert.');

    const client = window.supabase.createClient(ATSV_SUPABASE_URL, ATSV_SUPABASE_KEY);
    const { data: existing, error: lookupError } = await client.from('push_subscriptions').select('id').eq('endpoint', endpoint).limit(1);
    if (lookupError) throw new Error(`Supabase ${lookupError.code || 'Fehler'}: ${lookupError.message || 'Unbekannter Fehler'}`);
    if (!existing?.length) {
      const { error } = await client.from('push_subscriptions').insert({ endpoint, p256dh, auth });
      if (error) throw new Error(`Supabase ${error.code || 'Fehler'}: ${error.message || 'Unbekannter Fehler'}`);
    }

    localStorage.setItem('atsv_push_enabled', 'true');
    localStorage.setItem('atsv_vapid_public_key', ATSV_VAPID_PUBLIC_KEY);
    localStorage.setItem(ATSV_REBIND_FLAG, 'done');
    updateAtsvPushButton();
    alert('Push-Benachrichtigungen wurden erfolgreich aktiviert.');
  } catch (error) {
    console.error('ATSV Push-Fehler:', error);
    if (button) {
      button.disabled = false;
      button.textContent = '🔔 Push-Benachrichtigungen aktivieren';
      button.style.background = '#d00020';
    }
    alert('Push-Anmeldung fehlgeschlagen:\n\n' + (error?.message || String(error)));
  }
}

window.atsVEnablePush = atsVEnablePush;
window.enablePushNotifications = atsVEnablePush;

async function updateAtsvPushButton() {
  const button = document.getElementById('pushButton');
  if (!button) return;
  button.onclick = atsVEnablePush;
  try {
    const registration = await registerAtsvServiceWorker();
    const subscription = registration ? await registration.pushManager.getSubscription() : null;
    const enabled = Notification.permission === 'granted' && !!subscription;
    button.textContent = enabled ? '🔔 Push-Benachrichtigungen aktiviert ✓' : '🔔 Push-Benachrichtigungen aktivieren';
    button.style.background = enabled ? '#228B22' : '#d00020';
    button.disabled = false;
  } catch (error) {
    console.error('ATSV Push-Status konnte nicht geprüft werden:', error);
  }
}

function restoreAtsvCrest() {
  const crest = document.querySelector('.badge img');
  if (!crest) return;
  crest.src = './bilder/ATSV_Wappen_4K_transparent.png?v=25';
  crest.alt = 'ATSV Forchheim Wappen';
  crest.onerror = () => { crest.src = './bilder/ATSV_Wappen_4K.jpg?v=25'; };
}

function removeAtsvSponsors() {
  document.querySelectorAll('a[href="ausruester-sponsoren.html"]').forEach(el => el.remove());
}

const ATSV_NEXT_MATCHES = [
  ['2026-09-13T15:00:00', 'Sonntag, 13.09.2026 · 15:00 Uhr', 'SV Buckenhofen II', 'ATSV Forchheim'],
  ['2026-09-20T15:00:00', 'Sonntag, 20.09.2026 · 15:00 Uhr', 'ATSV Forchheim', 'TSV Neuhaus'],
  ['2026-09-27T15:00:00', 'Sonntag, 27.09.2026 · 15:00 Uhr', 'Hammerbacher SV', 'ATSV Forchheim'],
  ['2026-10-04T15:00:00', 'Sonntag, 04.10.2026 · 15:00 Uhr', 'ATSV Forchheim', '(SG) Hessdorf II / Großenseebach'],
  ['2026-10-11T15:00:00', 'Sonntag, 11.10.2026 · 15:00 Uhr', 'TKV Forchheim', 'ATSV Forchheim'],
  ['2026-10-18T15:00:00', 'Sonntag, 18.10.2026 · 15:00 Uhr', 'ATSV Forchheim', 'SV DJK Eggolsheim'],
  ['2026-10-25T15:00:00', 'Sonntag, 25.10.2026 · 15:00 Uhr', 'TSV Hemhofen', 'ATSV Forchheim'],
  ['2026-11-01T14:30:00', 'Sonntag, 01.11.2026 · 14:30 Uhr', 'ATSV Forchheim', 'SpVgg / DJK Heroldsbach / Thurn'],
  ['2026-11-08T14:30:00', 'Sonntag, 08.11.2026 · 14:30 Uhr', 'DJK Hallerndorf', 'ATSV Forchheim'],
  ['2026-11-15T14:30:00', 'Sonntag, 15.11.2026 · 14:30 Uhr', 'ATSV Forchheim', 'ASV Niederndorf']
];

function updateAtsvNextMatchCountdown() {
  const box = document.querySelector('.next-match');
  if (!box) return;
  const now = new Date();
  const next = ATSV_NEXT_MATCHES.find(match => new Date(match[0]) > now);
  const dateEl = box.querySelector('.next-match-date');
  const teamsEl = box.querySelector('.next-match-teams');
  const countdown = box.querySelector('.countdown');
  const liveMessage = box.querySelector('#live-message');

  if (!next) {
    if (dateEl) dateEl.textContent = 'Saisonpause';
    if (teamsEl) teamsEl.innerHTML = 'Keine weiteren Spiele<span>VORERST</span>Winterpause';
    if (countdown) countdown.style.display = 'none';
    if (liveMessage) liveMessage.textContent = '';
    return;
  }

  const difference = new Date(next[0]) - now;
  if (dateEl) dateEl.textContent = next[1];
  if (teamsEl) teamsEl.innerHTML = `${next[2]}<span>VS.</span>${next[3]}`;
  if (countdown) countdown.style.display = 'grid';
  if (liveMessage) liveMessage.textContent = '';

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(Math.max(0, value)).padStart(2, '0');
  };
  set('days', Math.floor(difference / 86400000));
  set('hours', Math.floor((difference / 3600000) % 24));
  set('minutes', Math.floor((difference / 60000) % 60));
  set('seconds', Math.floor((difference / 1000) % 60));
}
window.updateAtsvNextMatchCountdown = updateAtsvNextMatchCountdown;

async function refreshAtsvHomeLiveTicker() {
  const statusEl = document.getElementById('homeLiveStatus');
  const homeEl = document.getElementById('liveHomeTeam');
  const awayEl = document.getElementById('liveAwayTeam');
  const homeScoreEl = document.getElementById('liveHomeScore');
  const awayScoreEl = document.getElementById('liveAwayScore');
  const minuteEl = document.getElementById('liveCurrentMinute');
  const eventsEl = document.getElementById('homeLiveEvents');
  if (!statusEl || !homeEl || !awayEl || !homeScoreEl || !awayScoreEl || !minuteEl || !eventsEl || !window.supabase) return;

  try {
    const client = window.supabase.createClient(ATSV_SUPABASE_URL, ATSV_SUPABASE_KEY);
    const { data: matches, error } = await client.from('live_matches').select('*').eq('status', 'live').order('created_at', { ascending: false }).limit(1);
    if (error) throw error;
    const match = matches?.[0] || null;

    if (!match) {
      statusEl.textContent = 'KEIN SPIEL LIVE';
      statusEl.style.background = '#333';
      homeEl.textContent = 'ATSV Forchheim';
      awayEl.textContent = 'Kein Spiel';
      homeScoreEl.textContent = '–';
      awayScoreEl.textContent = '–';
      minuteEl.textContent = '-';
      eventsEl.innerHTML = '<div class="home-live-no-events">Aktuell findet kein Spiel statt.</div>';
      return;
    }

    statusEl.textContent = '🔴 LIVE';
    statusEl.style.background = '#d00020';
    homeEl.textContent = match.home_team || 'ATSV Forchheim';
    awayEl.textContent = match.away_team || 'Gegner';
    homeScoreEl.textContent = match.home_score ?? 0;
    awayScoreEl.textContent = match.away_score ?? 0;
    minuteEl.textContent = match.current_minute ?? 0;

    const { data: events } = await client.from('live_events').select('*').eq('match_id', match.id).order('created_at', { ascending: false });
    if (!events?.length) {
      eventsEl.innerHTML = '<div class="home-live-no-events">Noch keine Ereignisse.</div>';
      return;
    }
    eventsEl.innerHTML = events.map(item => {
      let message = item.description || 'Ereignis';
      if (item.event_type === 'homeGoal') message = '⚽ Tor Heimteam ' + (item.player || '');
      if (item.event_type === 'awayGoal') message = '⚽ Tor Gastteam ' + (item.player || '');
      if (item.event_type === 'yellow') message = '🟨 Gelbe Karte ' + (item.player || '');
      if (item.event_type === 'red') message = '🟥 Rote Karte ' + (item.player || '');
      if (item.event_type === 'substitution') message = '🔄 Wechsel ' + (item.player || '');
      if (item.event_type === 'halftime') message = '⏱️ Halbzeit';
      if (item.event_type === 'final') message = '🏁 Abpfiff';
      return `<div class="home-live-event"><span class="home-live-event-minute">${item.minute ?? '-'}'</span>${message}</div>`;
    }).join('');
  } catch (error) {
    console.error('ATSV Startseiten-Liveticker Fehler:', error);
  }
}

function loadFormData() {
  return new Promise(resolve => {
    if (window.ATSV_FORM_GAMES) return resolve();
    const existing = document.querySelector('script[data-atsv-form-data]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', resolve, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = './js/form-data.js?v=1';
    script.dataset.atsvFormData = 'true';
    script.onload = resolve;
    script.onerror = resolve;
    document.head.appendChild(script);
  });
}

function addHomeFormStyles() {
  if (document.getElementById('homeFormStyles')) return;
  const style = document.createElement('style');
  style.id = 'homeFormStyles';
  style.textContent = '.home-form-section{width:min(900px,92%);margin:0 auto 45px}.home-form-title{text-align:center;color:#d00020;font-size:20px;font-weight:900;letter-spacing:3px;margin-bottom:15px}.home-form-card{background:#111;border:2px solid #d00020;border-radius:16px;padding:20px;box-shadow:0 0 25px rgba(208,0,32,.18);text-align:center}.home-form-top{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}.home-form-top div{background:#181818;border-radius:10px;padding:12px}.home-form-top span{display:block;color:#888;font-size:11px;margin-bottom:5px}.home-form-top strong{display:block;color:white;font-size:17px}.home-form-badges{display:flex;justify-content:center;gap:9px;flex-wrap:wrap;margin:10px 0 12px}.home-form-badge{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;border:2px solid #222}.home-form-badge.w{background:#36c76f}.home-form-badge.d{background:#f0b429}.home-form-badge.l{background:#e00020}.home-form-series{color:#aaa;font-size:13px;margin:10px 0 15px}.home-form-button{display:inline-block;background:#d00020;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:900;font-size:12px}@media(max-width:600px){.home-form-top{grid-template-columns:1fr 1fr}.home-form-top div:first-child{grid-column:1/-1}}';
  document.head.appendChild(style);
}

function renderHomeForm() {
  if (document.getElementById('homeFormSection') || !window.ATSV_FORM_GAMES) return;
  const games = window.ATSV_FORM_GAMES.filter(g => g.homeScore !== null && g.awayScore !== null).sort((a,b) => a.date.localeCompare(b.date)).slice(-5);
  if (!games.length) return;
  const atsv = 'ATSV Forchheim';
  const result = g => g.homeScore === g.awayScore ? 'D' : ((g.home === atsv ? g.homeScore > g.awayScore : g.awayScore > g.homeScore) ? 'W' : 'L');
  const labels = {W:'S',D:'U',L:'N'};
  const counts = games.reduce((o,g) => { o[result(g)]++; return o; }, {W:0,D:0,L:0});
  const points = games.reduce((p,g) => p + (g.type === 'Liga' ? (result(g) === 'W' ? 3 : result(g) === 'D' ? 1 : 0) : 0), 0);
  const goalsFor = games.reduce((n,g) => n + (g.home===atsv ? g.homeScore : g.awayScore), 0);
  const goalsAgainst = games.reduce((n,g) => n + (g.home===atsv ? g.awayScore : g.homeScore), 0);
  let streak = 0;
  const last = result(games[games.length - 1]);
  for (let i=games.length-1;i>=0;i--) { if (result(games[i]) === last) streak++; else break; }
  const streakText = last === 'W' && streak >= 2 ? `🔥 ${streak} Siege in Folge` : last === 'L' && streak >= 2 ? `🔥 ${streak} Niederlagen in Folge` : last === 'D' && streak >= 2 ? `🔥 ${streak} Remis in Folge` : 'Aktuelle Form im Überblick';
  const badges = games.map(g => { const r=result(g); return `<span class="home-form-badge ${r.toLowerCase()}" title="${g.home} ${g.homeScore}:${g.awayScore} ${g.away}">${labels[r]}</span>`; }).join('');
  const section = document.createElement('section');
  section.id = 'homeFormSection';
  section.className = 'home-form-section';
  section.innerHTML = `<div class="home-form-title">📈 FORM DER MANNSCHAFT</div><div class="home-form-card"><div class="home-form-top"><div><span>LETZTE 5 SPIELE</span><strong>${counts.W} S · ${counts.D} U · ${counts.L} N</strong></div><div><span>LIGA-PUNKTE</span><strong>${points}</strong></div><div><span>TORE</span><strong>${goalsFor}:${goalsAgainst}</strong></div></div><div class="home-form-badges">${badges}</div><div class="home-form-series">${streakText}</div><a class="home-form-button" href="form.html">FORM KOMPLETT ANSEHEN</a></div>`;
  const main = document.querySelector('main');
  const live = document.getElementById('homeLiveTicker');
  if (main) main.insertBefore(section, live || main.firstChild);
}

function resetAtsvFinishedHomeTicker() {
  const statusEl = document.getElementById('homeLiveStatus');
  const awayEl = document.getElementById('liveAwayTeam');
  const homeEl = document.getElementById('liveHomeTeam');
  const homeScoreEl = document.getElementById('liveHomeScore');
  const awayScoreEl = document.getElementById('liveAwayScore');
  const minuteEl = document.getElementById('liveCurrentMinute');
  const eventsEl = document.getElementById('homeLiveEvents');
  if (!statusEl || !awayEl || !homeEl || !homeScoreEl || !awayScoreEl || !minuteEl || !eventsEl) return;
  if ((eventsEl.textContent || '').includes('Aktuell findet kein Spiel statt.')) {
    statusEl.textContent = 'KEIN SPIEL LIVE';
    statusEl.style.background = '#333';
    homeEl.textContent = 'ATSV Forchheim';
    awayEl.textContent = 'Kein Spiel';
    homeScoreEl.textContent = '–';
    awayScoreEl.textContent = '–';
    minuteEl.textContent = '-';
  }
}

function setupAtsvIosInstallButton() {
  const button = document.getElementById('installAppButton');
  if (!button) return;
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  if (!isIOS) return;
  button.textContent = isStandalone ? '📱 App geöffnet' : '📱 Zum Home-Bildschirm';
  button.onclick = () => {
    if (!isStandalone) alert('ATSV Fanseite installieren:\n\n1. Tippe unten auf das Teilen-Symbol (□↑).\n2. Wähle „Zum Home-Bildschirm“.\n3. Tippe oben rechts auf „Hinzufügen“.');
  };
}

async function initAtsvPage() {
  restoreAtsvCrest();
  removeAtsvSponsors();
  setupAtsvIosInstallButton();
  updateAtsvPushButton();
  updateAtsvNextMatchCountdown();
  setInterval(updateAtsvNextMatchCountdown, 1000);

  await loadFormData();
  addHomeFormStyles();
  renderHomeForm();
  refreshAtsvHomeLiveTicker();
  setInterval(refreshAtsvHomeLiveTicker, 10000);
  setTimeout(resetAtsvFinishedHomeTicker, 250);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAtsvPage, { once: true });
} else {
  initAtsvPage();
}
