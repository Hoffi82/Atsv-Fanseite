// ATSV Forchheim – Formkurve 2026/27
// Die Liste wächst mit jedem neuen Spiel. Ab Spiel 11 werden automatisch die ältesten Spiele entfernt.
// Testspiele fließen in die Formkurve ein, aber nicht in die Liga-Punkte.

window.ATSV_FORM_GAMES = [
  { date: '2026-07-12', type: 'Testspiel', home: 'SpVgg Jahn Forchheim 2', away: 'ATSV Forchheim', homeScore: 1, awayScore: 4 },
  { date: '2026-07-16', type: 'Testspiel', home: 'ASV Möhrendorf', away: 'ATSV Forchheim', homeScore: 1, awayScore: 4 },
  { date: '2026-07-19', type: 'Testspiel', home: 'ATSV Forchheim', away: 'DJK Schnaid-Rothensand', homeScore: 4, awayScore: 2 },
  { date: '2026-07-24', type: 'Testspiel', home: 'ATSV Erlangen U23 2', away: 'ATSV Forchheim', homeScore: 0, awayScore: 3 },
  { date: '2026-08-02', type: 'Testspiel', home: 'ATSV Forchheim', away: 'BSC Erlangen', homeScore: 2, awayScore: 5 },
  { date: '2026-08-09', type: 'Liga', home: 'ATSV Forchheim', away: 'DJK Hallerndorf', homeScore: 2, awayScore: 4 },
  { date: '2026-08-15', type: 'Liga', home: 'ASV Niederndorf', away: 'ATSV Forchheim', homeScore: 3, awayScore: 0 },
  { date: '2026-08-23', type: 'Liga', home: 'ATSV Forchheim', away: 'DJK Erlangen II', homeScore: 2, awayScore: 0 },
  { date: '2026-08-30', type: 'Liga', home: 'SpVgg Uehlfeld', away: 'ATSV Forchheim', homeScore: 2, awayScore: 4 }
];

window.ATSV_FORM_CONFIG = {
  maxGames: 10,
  atsvLogo: 'bilder/ATSV_Wappen_4K_transparent.png',
  opponentLogos: {
    'SpVgg Jahn Forchheim 2': 'bilder/spvgg-jahn-forchheim-ii.jpg.jpg',
    'ASV Möhrendorf': 'bilder/asv-moehrendorf.jpg.jpg',
    'DJK Schnaid-Rothensand': 'bilder/djk-schnaid-rothensand.jpg.jpg',
    'DJK Schnaid/Rothensand': 'bilder/djk-schnaid-rothensand.jpg.jpg',
    'ATSV Erlangen U23 2': 'bilder/atsv-erlangen-u23.jpg.jpg',
    'ATSV Erlangen 1898': 'bilder/atsv-erlangen-u23.jpg.jpg',
    'BSC Erlangen': 'bilder/bsc-erlangen.jpg.jpg',
    'DJK Hallerndorf': 'bilder/djk-hallerndorf.jpg.jpg',
    'ASV Niederndorf': 'bilder/asv-niederndorf.jpg.jpg',
    'DJK Erlangen II': 'bilder/djk-erlangen-ii.jpg.jpg',
    'SpVgg Uehlfeld': 'bilder/spvgg-uehlfeld.png.png',
    'SpVgg Hausen': 'bilder/spvgg-hausen.jpg.jpg',
    'SV Buckenhofen II': 'bilder/sv-buckenhofen-ii.jpg.jpg',
    'TSV Neuhaus': 'bilder/tsv-neuhaus.jpg.jpg',
    'Hammerbacher SV': 'bilder/hammerbacher-sv.jpg.jpg',
    'SpVgg Heßdorf/Großenseebach': 'bilder/spvgg-hessdorf-grossenseebach.jpg.jpg',
    'SpVgg Hessdorf/Großenseebach': 'bilder/spvgg-hessdorf-grossenseebach.jpg.jpg',
    'TKV Forchheim': 'bilder/tkv-forchheim.jpg.jpg',
    'DJK Eggolsheim': 'bilder/djk-eggolsheim.png.png',
    'TSV Hemhofen': 'bilder/tsv-hemhofen.jpg.jpg',
    'SpVgg Heroldsbach': 'bilder/spvgg-heroldsbach-thurn.jpg.jpg',
    'SpVgg/DJK Heroldsbach-Thurn': 'bilder/spvgg-heroldsbach-thurn.jpg.jpg'
  }
};

window.renderHomeForm = function() {
  if (document.getElementById('homeFormSection') || !window.ATSV_FORM_GAMES) return;
  const games = window.ATSV_FORM_GAMES.filter(g => g.homeScore !== null && g.awayScore !== null).sort((a,b) => a.date.localeCompare(b.date)).slice(-5);
  if (!games.length) return;
  const atsv = 'ATSV Forchheim';
  const result = g => g.homeScore === g.awayScore ? 'D' : ((g.home === atsv ? g.homeScore > g.awayScore : g.awayScore > g.homeScore) ? 'W' : 'L');
  const labels = {W:'S', D:'U', L:'N'};
  const counts = games.reduce((o,g) => { o[result(g)]++; return o; }, {W:0,D:0,L:0});
  const points = games.reduce((p,g) => p + (g.type === 'Liga' ? (result(g) === 'W' ? 3 : result(g) === 'D' ? 1 : 0) : 0), 0);
  const goalsFor = games.reduce((n,g) => n + (g.home === atsv ? g.homeScore : g.awayScore), 0);
  const goalsAgainst = games.reduce((n,g) => n + (g.home === atsv ? g.awayScore : g.homeScore), 0);
  let streak = 0;
  const lastResult = result(games[games.length - 1]);
  for (let i=games.length-1; i>=0; i--) { if (result(games[i]) === lastResult) streak++; else break; }
  const streakText = lastResult === 'W' && streak >= 2 ? `🔥 ${streak} Siege in Folge` : lastResult === 'L' && streak >= 2 ? `🔥 ${streak} Niederlagen in Folge` : lastResult === 'D' && streak >= 2 ? `🔥 ${streak} Remis in Folge` : 'Aktuelle Form im Überblick';
  const badges = games.map(g => { const r=result(g); return `<span class="home-form-badge ${r.toLowerCase()}" title="${g.home} ${g.homeScore}:${g.awayScore} ${g.away}">${labels[r]}</span>`; }).join('');
  const section = document.createElement('section');
  section.id = 'homeFormSection';
  section.className = 'home-form-section';
  section.innerHTML = `<div class="home-form-title">📈 FORM DER MANNSCHAFT</div><div class="home-form-card"><div class="home-form-top"><div><span>LETZTE 5 SPIELE</span><strong>${counts.W} S · ${counts.D} U · ${counts.L} N</strong></div><div><span>LIGA-PUNKTE</span><strong>${points}</strong></div><div><span>TORE</span><strong>${goalsFor}:${goalsAgainst}</strong></div></div><div class="home-form-badges">${badges}</div><div class="home-form-series">${streakText}</div><a class="home-form-button" href="form.html">FORM KOMPLETT ANSEHEN</a></div>`;
  const main = document.querySelector('main');
  const live = document.getElementById('homeLiveTicker');
  if (main) main.insertBefore(section, live || main.firstChild);
};

function resetAtsvFinishedHomeTicker() {
  const statusEl = document.getElementById('homeLiveStatus');
  const awayEl = document.getElementById('liveAwayTeam');
  const homeEl = document.getElementById('liveHomeTeam');
  const homeScoreEl = document.getElementById('liveHomeScore');
  const awayScoreEl = document.getElementById('liveAwayScore');
  const minuteEl = document.getElementById('liveCurrentMinute');
  const eventsEl = document.getElementById('homeLiveEvents');
  if (!statusEl || !awayEl || !homeEl || !homeScoreEl || !awayScoreEl || !minuteEl || !eventsEl) return;
  const noGameMessage = (eventsEl.textContent || '').includes('Aktuell findet kein Spiel statt.');
  if (!noGameMessage) return;
  statusEl.textContent = 'KEIN SPIEL LIVE';
  statusEl.style.background = '#333';
  homeEl.textContent = 'ATSV Forchheim';
  awayEl.textContent = 'Kein Spiel';
  homeScoreEl.textContent = '–';
  awayScoreEl.textContent = '–';
  minuteEl.textContent = '-';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { setTimeout(resetAtsvFinishedHomeTicker, 250); setInterval(resetAtsvFinishedHomeTicker, 1000); });
} else {
  setTimeout(resetAtsvFinishedHomeTicker, 250); setInterval(resetAtsvFinishedHomeTicker, 1000);
}

// Countdown-Fix: immer das nächste noch nicht gestartete ATSV-Ligaspiel anzeigen.
window.updateAtsvNextMatchCountdown = function() {
  const box = document.querySelector('.next-match');
  if (!box) return;
  const matches = [
    { date: '2026-09-06T15:00:00', label: 'Sonntag, 06.09.2026 · 15:00 Uhr', home: 'ATSV Forchheim', away: 'SpVgg Hausen' },
    { date: '2026-09-13T15:00:00', label: 'Sonntag, 13.09.2026 · 15:00 Uhr', home: 'SV Buckenhofen II', away: 'ATSV Forchheim' },
    { date: '2026-09-20T15:00:00', label: 'Sonntag, 20.09.2026 · 15:00 Uhr', home: 'ATSV Forchheim', away: 'TSV Neuhaus' },
    { date: '2026-09-27T15:00:00', label: 'Sonntag, 27.09.2026 · 15:00 Uhr', home: 'Hammerbacher SV', away: 'ATSV Forchheim' },
    { date: '2026-10-04T15:00:00', label: 'Sonntag, 04.10.2026 · 15:00 Uhr', home: 'ATSV Forchheim', away: '(SG) Hessdorf II / Großenseebach' },
    { date: '2026-10-11T15:00:00', label: 'Sonntag, 11.10.2026 · 15:00 Uhr', home: 'TKV Forchheim', away: 'ATSV Forchheim' },
    { date: '2026-10-18T15:00:00', label: 'Sonntag, 18.10.2026 · 15:00 Uhr', home: 'ATSV Forchheim', away: 'SV DJK Eggolsheim' },
    { date: '2026-10-25T15:00:00', label: 'Sonntag, 25.10.2026 · 15:00 Uhr', home: 'TSV Hemhofen', away: 'ATSV Forchheim' },
    { date: '2026-11-01T14:30:00', label: 'Sonntag, 01.11.2026 · 14:30 Uhr', home: 'ATSV Forchheim', away: 'SpVgg / DJK Heroldsbach / Thurn' },
    { date: '2026-11-08T14:30:00', label: 'Sonntag, 08.11.2026 · 14:30 Uhr', home: 'DJK Hallerndorf', away: 'ATSV Forchheim' },
    { date: '2026-11-15T14:30:00', label: 'Sonntag, 15.11.2026 · 14:30 Uhr', home: 'ATSV Forchheim', away: 'ASV Niederndorf' }
  ];
  const now = new Date();
  const next = matches.find(match => new Date(match.date) > now);
  const dateEl = box.querySelector('.next-match-date');
  const teamsEl = box.querySelector('.next-match-teams');
  const countdown = box.querySelector('.countdown');
  const liveMessage = box.querySelector('#live-message');
  if (!next) {
    if (dateEl) dateEl.textContent = 'Saisonpause';
    if (teamsEl) teamsEl.innerHTML = 'Keine weiteren Spiele<span>VORERST</span>Winterpause';
    if (countdown) countdown.style.display = 'none';
    if (liveMessage) liveMessage.innerHTML = '';
    return;
  }
  const target = new Date(next.date);
  const difference = target - now;
  if (dateEl) dateEl.textContent = next.label;
  if (teamsEl) teamsEl.innerHTML = `${next.home}<span>VS.</span>${next.away}`;
  if (countdown) countdown.style.display = 'grid';
  if (liveMessage) liveMessage.innerHTML = '';
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(Math.max(0, value)).padStart(2, '0');
  };
  set('days', Math.floor(difference / 86400000));
  set('hours', Math.floor((difference / 3600000) % 24));
  set('minutes', Math.floor((difference / 60000) % 60));
  set('seconds', Math.floor((difference / 1000) % 60));
};
