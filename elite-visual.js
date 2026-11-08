/* GuiGym Elite: decoração opcional. Não lê nem grava forgeDB e não intercepta ações. */
(() => {
  'use strict';
  const artByExercise = [
    [/supino.*inclinad.*halter/, './elite-assets/images/supino-inclinado-elite.webp'],
    [/remada (baixa|sentada|na polia)/, './elite-assets/images/remada-elite.webp'],
    [/desenvolvimento.*(halter|sentad)/, './elite-assets/images/desenvolvimento-elite.webp'],
    [/agachamento (livre|com barra)/, './elite-assets/images/agachamento-elite.webp']
  ];

  function paintExercisePhotos() {
    document.querySelectorAll('#exerciseList .exercise-photo-head').forEach(card => {
      const heading = card.querySelector('h3');
      const img = card.querySelector('img');
      if (!heading || !img) return;
      const name = heading.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const match = artByExercise.find(([pattern]) => pattern.test(name));
      // Exercícios não reconhecidos continuam com a imagem original do GuiGym.
      if (match && img.getAttribute('src') !== match[1]) img.setAttribute('src', match[1]);
    });
  }

  const exerciseList = document.getElementById('exerciseList');
  if (exerciseList) {
    let pending = false;
    new MutationObserver(() => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; paintExercisePhotos(); });
    }).observe(exerciseList, { childList: true, subtree: true });
    paintExercisePhotos();
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function burst(button) {
    if (reduced.matches) return;
    const rect = button.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    for (let i = 0; i < 9; i += 1) {
      const angle = (i / 9) * Math.PI * 2;
      const distance = 23 + Math.random() * 34;
      const dot = document.createElement('i');
      dot.className = 'elite-burst-dot';
      dot.setAttribute('aria-hidden', 'true');
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      dot.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      dot.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      dot.style.setProperty('--d', `${2 + Math.random() * 3}px`);
      dot.style.setProperty('--c', i % 4 === 0 ? '#ead5d0' : '#ed5148');
      document.body.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
      window.setTimeout(() => dot.remove(), 750);
    }
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button.btn.primary');
    if (button) burst(button);
  }, { passive: true });
})();
