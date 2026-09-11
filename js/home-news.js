(() => {
  'use strict';

  const SUPABASE_URL = 'https://xmtrtpibldbiiikkkmnd.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_5dbkLVYmSklCiPcjzzFk1g_ANJoqy9B';
  const list = document.querySelector('.news-list');
  if (!list || !window.supabase) return;

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const formatDate = (value) => {
    if (!value) return '';
    const parts = String(value).split('-');
    return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : value;
  };

  async function loadNews() {
    try {
      const { data, error } = await client
        .from('news')
        .select('title, text, date')
        .order('date', { ascending: false })
        .limit(3);

      if (error || !data || data.length === 0) return;

      list.innerHTML = data.map(item => `
        <article class="news-item">
          <div class="news-item-date">${escapeHtml(formatDate(item.date))}</div>
          <div class="news-item-title">${escapeHtml(item.title)}</div>
          <div class="news-item-text">${escapeHtml(item.text)}</div>
        </article>
      `).join('');
    } catch (error) {
      console.warn('ATSV News konnten nicht aktualisiert werden:', error);
    }
  }

  loadNews();
  const timer = setInterval(loadNews, 60000);
  window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
})();
