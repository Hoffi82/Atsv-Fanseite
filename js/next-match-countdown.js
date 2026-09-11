(() => {
  'use strict';

  // Separater, kleiner Countdown – ohne Supabase und ohne Service Worker.
  const target = new Date('2026-09-13T15:00:00+02:00').getTime();
  const box = document.querySelector('.countdown');
  if (box) {
    const values = box.querySelectorAll('.countdown-box strong');
    if (values.length === 4) {
      const update = () => {
        const diff = Math.max(0, target - Date.now());
        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        values[0].textContent = String(days).padStart(2, '0');
        values[1].textContent = String(hours).padStart(2, '0');
        values[2].textContent = String(minutes).padStart(2, '0');
        values[3].textContent = String(seconds).padStart(2, '0');
      };
      update();
      const timer = setInterval(update, 1000);
      window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
    }
  }

  // Separater Live-Ticker für die Startseite. Bei Fehlern bleibt die statische Anzeige erhalten.
  const SUPABASE_URL = 'https://xmtrtpibldbiiikkkmnd.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_5dbkLVYmSklCiPcjzzFk1g_ANJoqy9B';
  const headers = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };
  const get = async path => {
    const response = await fetch(SUPABASE_URL + '/rest/v1/' + path, { headers, cache: 'no-store' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  };

  async function refreshHomeLive() {
    const card = document.querySelector('.home-live-card');
    if (!card) return;
    try {
      let matches = await get('live_matches?select=*&status=eq.live&order=created_at.desc&limit=1');
      if (!matches.length) matches = await get('live_matches?select=*&status=eq.upcoming&order=created_at.desc&limit=1');
      const match = matches[0];
      const status = card.querySelector('.home-live-status');
      const teams = card.querySelectorAll('.home-live-team');
      const score = card.querySelector('.home-live-score');
      const minute = card.querySelector('.home-live-minute');
      const events = card.querySelector('.home-live-no-events');
      if (!match) {
        status.textContent = 'KEIN SPIEL LIVE';
        score.textContent = '–:–';
        minute.innerHTML = 'Spielminute: <strong>-</strong>';
        events.textContent = 'Aktuell findet kein Spiel statt.';
        return;
      }
      teams[0].textContent = match.home_team || 'ATSV Forchheim';
      teams[1].textContent = match.away_team || 'Gegner';
      score.textContent = (match.home_score ?? 0) + ' : ' + (match.away_score ?? 0);
      if (match.status === 'live') {
        status.textContent = '🔴 LIVE';
        let currentMinute = match.current_minute ?? 1;
        if (match.live_started_at) currentMinute = Math.min(120, Math.max(1, Math.floor((Date.now() - new Date(match.live_started_at).getTime()) / 60000) + 1));
        minute.innerHTML = 'Spielminute: <strong>' + currentMinute + '</strong>';
      } else {
        status.textContent = '📅 VORBEREITET';
        minute.innerHTML = 'Spielminute: <strong>-</strong>';
      }
      const data = await get('live_events?select=*&match_id=eq.' + encodeURIComponent(match.id) + '&order=created_at.desc&limit=5');
      events.innerHTML = data.length
        ? data.map(e => '<div><strong style="color:#d00020">' + (e.minute ?? '-') + "'</strong> " + (e.description || e.event_type || 'Ereignis') + '</div>').join('')
        : (match.status === 'live' ? 'Noch keine Ereignisse.' : 'Aktuell findet kein Spiel statt.');
    } catch (error) {
      console.warn('ATSV Live-Ticker:', error);
    }
  }

  if (document.querySelector('.home-live-card')) {
    refreshHomeLive();
    const liveTimer = setInterval(refreshHomeLive, 30000);
    window.addEventListener('pagehide', () => clearInterval(liveTimer), { once: true });
  }
})();
