(() => {
  'use strict';

  const target = new Date('2026-09-13T15:00:00+02:00').getTime();
  const box = document.querySelector('.countdown');
  if (!box) return;

  const values = box.querySelectorAll('.countdown-box strong');
  if (values.length !== 4) return;

  const update = () => {
    const diff = Math.max(0, target - Date.now());
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    values[0].textContent = String(days).padStart(2, '0');
    values[1].textContent = String(hours).padStart(2, '0');
    values[2].textContent = String(minutes).padStart(2, '0');
    values[3].textContent = String(seconds).padStart(2, '0');
  };

  update();
  const timer = setInterval(update, 1000);
  window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
})();
