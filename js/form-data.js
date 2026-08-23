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
  { date: '2026-08-23', type: 'Liga', home: 'ATSV Forchheim', away: 'DJK Erlangen II', homeScore: 2, awayScore: 0 }
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

// Korrektur für die kompakte Form-Anzeige auf der Startseite:
// Testspiele zählen zur Form, aber niemals zu den Liga-Punkten.
window.renderHomeForm = function() {
  if (document.getElementById('homeFormSection') || !window.ATSV_FORM_GAMES) return;
  const games = window.ATSV_FORM_GAMES
    .filter(g => g.homeScore !== null && g.awayScore !== null)
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(-5);
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
  for (let i=games.length-1; i>=0; i--) {
    if (result(games[i]) === lastResult) streak++;
    else break;
  }
  const streakText = lastResult === 'W' && streak >= 2 ? `🔥 ${streak} Siege in Folge` :
    lastResult === 'L' && streak >= 2 ? `🔥 ${streak} Niederlagen in Folge` :
    lastResult === 'D' && streak >= 2 ? `🔥 ${streak} Remis in Folge` : 'Aktuelle Form im Überblick';

  const badges = games.map(g => {
    const r = result(g);
    return `<span class="home-form-badge ${r.toLowerCase()}" title="${g.home} ${g.homeScore}:${g.awayScore} ${g.away}">${labels[r]}</span>`;
  }).join('');

  const section = document.createElement('section');
  section.id = 'homeFormSection';
  section.className = 'home-form-section';
  section.innerHTML = `<div class="home-form-title">📈 FORM DER MANNSCHAFT</div><div class="home-form-card"><div class="home-form-top"><div><span>LETZTE 5 SPIELE</span><strong>${counts.W} S · ${counts.D} U · ${counts.L} N</strong></div><div><span>LIGA-PUNKTE</span><strong>${points}</strong></div><div><span>TORE</span><strong>${goalsFor}:${goalsAgainst}</strong></div></div><div class="home-form-badges">${badges}</div><div class="home-form-series">${streakText}</div><a class="home-form-button" href="form.html">FORM KOMPLETT ANSEHEN</a></div>`;

  const main = document.querySelector('main');
  const live = document.getElementById('homeLiveTicker');
  if (main) main.insertBefore(section, live || main.firstChild);
};
