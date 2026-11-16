/* Content pages: reading progress, and a flag once the dark fold has scrolled past. */
(() => {
  const body = document.body;
  const bar = document.querySelector('.bp-progress span');
  const fold = document.querySelector('.bp-fold');
  let queued = false;

  const update = () => {
    queued = false;
    if (!bar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
  };
  const queue = () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();

  if (fold && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      body.classList.toggle('bp-past-fold', !entry.isIntersecting);
    }, { rootMargin: '-40% 0px 0px 0px' }).observe(fold);
  } else {
    body.classList.add('bp-past-fold');
  }
})();
