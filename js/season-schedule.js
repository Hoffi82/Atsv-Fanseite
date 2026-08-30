// ATSV Forchheim – gemeinsamer Spielplan Liga 26/27
// Diese Datei ist die gemeinsame Quelle für Countdown und Live-Ticker.
window.ATSV_SEASON_SCHEDULE = [
  { matchday: 1, date: "2026-08-09", time: "15:00", home: "ATSV Forchheim", away: "DJK Hallerndorf", homeScore: 2, awayScore: 4 },
  { matchday: 2, date: "2026-08-15", time: "15:00", home: "ASV Niederndorf", away: "ATSV Forchheim", homeScore: 3, awayScore: 0 },
  { matchday: 3, date: "2026-08-23", time: "15:00", home: "ATSV Forchheim", away: "DJK Erlangen II", homeScore: 2, awayScore: 0 },
  { matchday: 4, date: "2026-08-30", time: "15:00", home: "SpVgg Uehlfeld", away: "ATSV Forchheim", homeScore: 2, awayScore: 4 },
  { matchday: 5, date: "2026-09-06", time: "15:00", home: "ATSV Forchheim", away: "SpVgg Hausen", homeScore: null, awayScore: null },
  { matchday: 6, date: "2026-09-13", time: "15:00", home: "SV Buckenhofen II", away: "ATSV Forchheim", homeScore: null, awayScore: null },
  { matchday: 7, date: "2026-09-20", time: "15:00", home: "ATSV Forchheim", away: "TSV Neuhaus", homeScore: null, awayScore: null },
  { matchday: 8, date: "2026-09-27", time: "15:00", home: "Hammerbacher SV", away: "ATSV Forchheim", homeScore: null, awayScore: null },
  { matchday: 9, date: "2026-10-04", time: "15:00", home: "ATSV Forchheim", away: "(SG) Hessdorf II / Großenseebach", homeScore: null, awayScore: null },
  { matchday: 10, date: "2026-10-11", time: "15:00", home: "TKV Forchheim", away: "ATSV Forchheim", homeScore: null, awayScore: null },
  { matchday: 11, date: "2026-10-18", time: "15:00", home: "ATSV Forchheim", away: "SV DJK Eggolsheim", homeScore: null, awayScore: null },
  { matchday: 12, date: "2026-10-25", time: "15:00", home: "TSV Hemhofen", away: "ATSV Forchheim", homeScore: null, awayScore: null },
  { matchday: 13, date: "2026-11-01", time: "14:30", home: "ATSV Forchheim", away: "SpVgg / DJK Heroldsbach / Thurn", homeScore: null, awayScore: null },
  { matchday: 14, date: "2026-11-08", time: "14:30", home: "DJK Hallerndorf", away: "ATSV Forchheim", homeScore: null, awayScore: null },
  { matchday: 15, date: "2026-11-15", time: "14:30", home: "ATSV Forchheim", away: "ASV Niederndorf", homeScore: null, awayScore: null }
];

window.ATSV_getNextScheduledMatch = function() {
  const now = new Date();
  return window.ATSV_SEASON_SCHEDULE.find(g => {
    const kickoff = new Date(`${g.date}T${g.time}:00`);
    return g.homeScore === null && g.awayScore === null && kickoff > now;
  }) || null;
};
