// ATSV Fanseite – Tabellenberechnung
window.calculateAtsvTable = function(results) {
  // Wenn eine aktuelle offizielle Tabelle in den zentralen Daten hinterlegt ist,
  // diese verwenden. Die Reihenfolge wird trotzdem immer nach den Tabellenregeln
  // neu berechnet: Punkte, Tordifferenz, erzielte Tore.
  if (Array.isArray(window.ATSV_STANDINGS) && window.ATSV_STANDINGS.length) {
    const computed = {};
    for (const match of (Array.isArray(results) ? results : [])) {
      if (!['finished', 'special'].includes(match.status)) continue;
      const hg = Number(match.homeGoals), ag = Number(match.awayGoals);
      if (!Number.isFinite(hg) || !Number.isFinite(ag)) continue;
      for (const team of [match.home, match.away]) {
        if (!computed[team]) computed[team] = { wins: 0, draws: 0, losses: 0 };
      }
      if (hg > ag) { computed[match.home].wins++; computed[match.away].losses++; }
      else if (hg < ag) { computed[match.away].wins++; computed[match.home].losses++; }
      else { computed[match.home].draws++; computed[match.away].draws++; }
    }
    return window.ATSV_STANDINGS
      .map(row => ({
        position: Number(row.position) || 999,
        team: row.team,
        games: Number(row.games) || 0,
        wins: Number(row.wins ?? computed[row.team]?.wins) || 0,
        draws: Number(row.draws ?? computed[row.team]?.draws) || 0,
        losses: Number(row.losses ?? computed[row.team]?.losses) || 0,
        goalsFor: Number(row.goalsFor) || 0,
        goalsAgainst: Number(row.goalsAgainst) || 0,
        points: Number(row.points) || 0,
        goalDifference: (Number(row.goalsFor) || 0) - (Number(row.goalsAgainst) || 0)
      }))
      .sort((a, b) => a.position - b.position);
  }

  const table = {};

  for (const match of (Array.isArray(results) ? results : [])) {
    if (match.status === 'special') {
      for (const team of [match.home, match.away]) {
        if (!table[team]) table[team] = { team, games: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
      }
      const home = table[match.home];
      const away = table[match.away];
      home.games++; away.games++;
      home.goalsFor += Number(match.tableHomeGoalsFor) || 0;
      home.goalsAgainst += Number(match.tableHomeGoalsAgainst) || 0;
      away.goalsFor += Number(match.tableAwayGoalsFor) || 0;
      away.goalsAgainst += Number(match.tableAwayGoalsAgainst) || 0;
      if (match.tableAwayPoints > match.tableHomePoints) {
        away.wins++; away.points += Number(match.tableAwayPoints) || 3; home.losses++;
      } else if (match.tableHomePoints > match.tableAwayPoints) {
        home.wins++; home.points += Number(match.tableHomePoints) || 3; away.losses++;
      } else {
        home.draws++; away.draws++;
        home.points += Number(match.tableHomePoints) || 0;
        away.points += Number(match.tableAwayPoints) || 0;
      }
      continue;
    }
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
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.team.localeCompare(b.team, 'de')
    );
};
