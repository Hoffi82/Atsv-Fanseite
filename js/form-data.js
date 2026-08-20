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
    'SpVgg Jahn Forchheim 2': 'bilder/spvgg-jahn-forchheim-ii.jpg',
    'ASV Möhrendorf': 'bilder/asv-moehrendorf.jpg',
    'DJK Schnaid-Rothensand': 'bilder/djk-schnaid-rothensand.jpg',
    'DJK Schnaid/Rothensand': 'bilder/djk-schnaid-rothensand.jpg',
    'ATSV Erlangen U23 2': 'bilder/atsv-erlangen-u23.jpg',
    'ATSV Erlangen 1898': 'bilder/atsv-erlangen-u23.jpg',
    'BSC Erlangen': 'bilder/bsc-erlangen.jpg',
    'DJK Hallerndorf': 'bilder/djk-hallerndorf.jpg',
    'ASV Niederndorf': 'bilder/asv-niederndorf.jpg',
    'DJK Erlangen II': 'bilder/djk-erlangen-ii.jpg',
    'SpVgg Uehlfeld': 'bilder/spvgg-uehlfeld.png',
    'SpVgg Hausen': 'bilder/spvgg-hausen.jpg',
    'SV Buckenhofen II': 'bilder/sv-buckenhofen-ii.jpg',
    'TSV Neuhaus': 'bilder/tsv-neuhaus.jpg',
    'Hammerbacher SV': 'bilder/hammerbacher-sv.jpg',
    'SpVgg Heßdorf/Großenseebach': 'bilder/spvgg-hessdorf-grossenseebach.jpg',
    'SpVgg Hessdorf/Großenseebach': 'bilder/spvgg-hessdorf-grossenseebach.jpg',
    'TKV Forchheim': 'bilder/tkv-forchheim.jpg',
    'DJK Eggolsheim': 'bilder/djk-eggolsheim.png',
    'TSV Hemhofen': 'bilder/tsv-hemhofen.jpg',
    'SpVgg Heroldsbach': 'bilder/spvgg-heroldsbach-thurn.jpg',
    'SpVgg/DJK Heroldsbach-Thurn': 'bilder/spvgg-heroldsbach-thurn.jpg'
  }
};
