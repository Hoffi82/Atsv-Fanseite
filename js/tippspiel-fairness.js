(() => {
  const normalizeName = s => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');

  const originalRender = render;
  render = function () {
    originalRender();
    document.querySelectorAll('#games .game').forEach((card, index) => {
      const g = games[index];
      if (!g || closed(g)) return;
      const t = tips.find(x => x.participant_id === pid && x.match_id === g.id);
      if (!t) return;

      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'btn tip-edit';
      edit.textContent = '✏️ Tipp ändern';
      edit.style.marginTop = '10px';
      edit.style.width = '100%';
      edit.onclick = () => {
        card.querySelectorAll('input').forEach(input => {
          input.disabled = false;
        });
        edit.remove();
        const hint = card.querySelector('.tiphint');
        if (hint) hint.innerHTML = '✏️ Tipp kann bis zum Anpfiff geändert werden.';
        document.getElementById('save').disabled = false;
        const first = card.querySelector('input');
        if (first) first.focus();
      };
      card.querySelector('.status').after(edit);
    });
  };

  const originalNameClick = document.getElementById('nameBtn').onclick;
  document.getElementById('nameBtn').onclick = async () => {
    const n = nameEl.value.trim();
    if (n.length < 2) {
      originalNameClick();
      return;
    }

    const sameName = tips.find(t => normalizeName(t.name) === normalizeName(n));
    const currentHasTips = tips.some(t => t.participant_id === pid);

    if (sameName && sameName.participant_id !== pid) {
      if (currentHasTips) {
        document.getElementById('nameMsg').textContent = 'Dieser Name wird bereits verwendet. Bitte den gespeicherten Namen verwenden.';
        return;
      }
      pid = sameName.participant_id;
      localStorage.setItem('atsv_tippspiel_participant_id', pid);
      document.getElementById('nameMsg').textContent = 'Teilnehmer gefunden – deine bisherigen Tipps wurden geladen ✓';
    }

    originalNameClick();
    render();
  };

  const originalSaveClick = document.getElementById('save').onclick;
  document.getElementById('save').onclick = async () => {
    const n = nameEl.value.trim();
    if (n.length < 2) return;

    const sameName = tips.find(t => normalizeName(t.name) === normalizeName(n));
    const currentHasTips = tips.some(t => t.participant_id === pid);
    if (sameName && sameName.participant_id !== pid) {
      if (currentHasTips) {
        document.getElementById('saveMsg').textContent = 'Dieser Name wird bereits verwendet. Bitte den gespeicherten Teilnehmer verwenden.';
        return;
      }
      pid = sameName.participant_id;
      localStorage.setItem('atsv_tippspiel_participant_id', pid);
    }

    document.getElementById('save').textContent = '💾 Tipps speichern / ändern';
    await originalSaveClick();
  };

  const saveButton = document.getElementById('save');
  saveButton.textContent = '💾 Tipps speichern / ändern';
})();
