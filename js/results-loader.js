// ATSV Fanseite – Ergebnisdaten laden
// Liest die separate Ergebnisdatei ein, ohne den bestehenden Ergebnisplan zu verändern.

window.ATSV_RESULTS = [];

async function getAtsvResults() {
  try {
    const response = await fetch('./data/results-26-27.json?v=' + Date.now(), {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Ergebnisdaten konnten nicht geladen werden.');
    }

    const data = await response.json();
    window.ATSV_RESULTS = Array.isArray(data.results) ? data.results : [];
    return window.ATSV_RESULTS;
  } catch (error) {
    console.error('ATSV Ergebnisdaten:', error);
    window.ATSV_RESULTS = [];
    return [];
  }
}

window.getAtsvResults = getAtsvResults;
