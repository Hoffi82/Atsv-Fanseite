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
  { date: '2026-08-15', type: 'Liga', home: 'ASV Niederndorf', away: 'ATSV Forchheim', homeScore: 3, awayScore: 0 }
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
