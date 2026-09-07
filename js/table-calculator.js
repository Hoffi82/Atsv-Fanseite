// ATSV Fanseite – Tabellenberechnung
window.calculateAtsvTable = function(results) {
  // Wenn eine aktuelle offizielle Tabelle in den zentralen Daten hinterlegt ist,
  // diese verwenden. So bleibt die Anzeige auch dann korrekt, wenn noch nicht
  // alle Partien des aktuellen Spieltags als Einzelergebnis vorliegen.
  if (Array.isArray(window.ATSV_STANDINGS) && window.ATSV_STANDINGS.length) {
    return window.ATSV_STANDINGS.map(row => ({
      team: row.team,
      games: Number(row.games) || 0,
      wins: Number(row.wins) || 0,
      draws: Number(row.draws) || 0,
      losses: Number(row.losses) || 0,
      goalsFor: Number(row.goalsFor) || 0,
      goalsAgainst: Number(row.goalsAgainst) || 0,
      points: Number(row.points) || 0,
      goalDifference: (Number(row.goalsFor) || 0) - (Number(row.goalsAgainst) || 0)
    }));
  }

  const table = {};

  for (const match of (Array.isArray(results) ? results : [])) {
    if (match.status !== 'finished') continue;

    for (const team of [match.home, match.away]) {
      if (!table[team]) {
        table[team] = { team, games: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
      }
    }

    const home = table[match.home];
    const away = table[match.away];
    const hg = Number(match.homeGoals);
    const ag = Number(match.awayGoals);
    if (!Number.isFinite(hg) || !Number.isFinite(ag)) continue;

    home.games++; away.games++;
    home.goalsFor += hg; home.goalsAgainst += ag;
    away.goalsFor += ag; away.goalsAgainst += hg;

    if (hg > ag) {
      home.wins++; home.points += 3; away.losses++;
    } else if (hg < ag) {
      away.wins++; away.points += 3; home.losses++;
    } else {
      home.draws++; away.draws++; home.points++; away.points++;
    }
  }

  return Object.values(table)
    .map(row => ({ ...row, goalDifference: row.goalsFor - row.goalsAgainst }))
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.team.localeCompare(b.team, 'de'));
};
