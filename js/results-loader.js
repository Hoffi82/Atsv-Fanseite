// ATSV Fanseite – zentrale Ergebnis- und Tabellendaten laden
window.ATSV_RESULTS = [];
window.ATSV_STANDINGS = [];

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('de-DE');
}

function renderAtsvResults(results) {
  const tableSection = Array.from(document.querySelectorAll('.section-title')).find(el => el.textContent.includes('Tabelle'));
  if (!tableSection) return;

  document.querySelectorAll('.matchday-box').forEach(box => box.remove());

  const grouped = {};
  results.filter(r => r && r.status === 'finished').forEach(match => {
    const md = Number(match.matchday) || 0;
    if (!grouped[md]) grouped[md] = [];
    grouped[md].push(match);
  });

  Object.keys(grouped).map(Number).sort((a,b) => b-a).forEach(matchday => {
    const box = document.createElement('div');
    box.className = 'matchday-box';

    const title = document.createElement('div');
    title.className = 'matchday-title';
    title.textContent = 'Spieltag ' + matchday;
    box.appendChild(title);

    grouped[matchday].forEach(match => {
      const card = document.createElement('div');
      card.className = 'result-card' + (match.home === 'ATSV Forchheim' || match.away === 'ATSV Forchheim' ? ' atsv' : '');

      if (match.home === 'ATSV Forchheim' || match.away === 'ATSV Forchheim') {
        const date = document.createElement('div');
        date.className = 'result-date';
        date.textContent = formatDate(match.date);
        card.appendChild(date);
      }

      const teams = document.createElement('div');
      teams.className = 'result-teams';
      const home = document.createElement('div');
      home.className = 'result-team home';
      home.textContent = match.home;
      const score = document.createElement('div');
      score.className = 'result-score';
      score.textContent = Number(match.homeGoals) + ' : ' + Number(match.awayGoals);
      const away = document.createElement('div');
      away.className = 'result-team away';
      away.textContent = match.away;
      teams.append(home, score, away);
      card.appendChild(teams);
      box.appendChild(card);
    });

    tableSection.before(box);
  });
}

async function getAtsvResults() {
  try {
    const response = await fetch('./data/results-26-27.json?v=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Ergebnisdaten konnten nicht geladen werden.');

    const data = await response.json();
    window.ATSV_RESULTS = Array.isArray(data.results) ? data.results : [];
    window.ATSV_STANDINGS = Array.isArray(data.standings) ? data.standings : [];

    renderAtsvResults(window.ATSV_RESULTS);
    return window.ATSV_RESULTS;
  } catch (error) {
    console.error('ATSV Ergebnisdaten:', error);
    window.ATSV_RESULTS = [];
    window.ATSV_STANDINGS = [];
    return [];
  }
}

window.getAtsvResults = getAtsvResults;
