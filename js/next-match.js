// ATSV Fanseite – automatische Ermittlung des nächsten Spiels
// Wird separat gehalten und verändert den bestehenden Countdown noch nicht.

window.ATSV_NEXT_MATCH = null;

async function getAtsvNextMatch() {
  try {
    const response = await fetch('./data/fixtures.json?v=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Spielplan konnte nicht geladen werden.');

    const data = await response.json();
    const now = new Date();

    const upcoming = (data.fixtures || [])
      .map(match => ({
        ...match,
        start: new Date(`${match.date}T${match.time || '00:00'}:00`)
      }))
      .filter(match => !Number.isNaN(match.start.getTime()) && match.start > now)
      .sort((a, b) => a.start - b.start);

    window.ATSV_NEXT_MATCH = upcoming[0] || null;
    return window.ATSV_NEXT_MATCH;
  } catch (error) {
    console.error('ATSV nächstes Spiel:', error);
    window.ATSV_NEXT_MATCH = null;
    return null;
  }
}

window.getAtsvNextMatch = getAtsvNextMatch;
