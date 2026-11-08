// Homepage behaviour for the redesign: parallax orb, decode headline,
// scroll reveals, count-up proof, the case-study rail and the agent dock.
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
window.__portfolioReady = true;

/* ---------- Parallax, orb travel and dock ---------- */
const page = document.querySelector('[data-page]');
const dock = document.querySelector('[data-dock]');
let mouseX = 0;
let mouseY = 0;
let frame = 0;

const applyMotion = () => {
  frame = 0;
  const y = window.scrollY || 0;
  const scrollY = reduceMotion ? 0 : Math.min(y, 1200);
  const round = n => Math.round(n * 10) / 10;
  const travel = reduceMotion ? 0 : Math.min(y, 900) / 900;
  const dockShown = Math.max(0, Math.min(1, (y - 520) / 300));
  const set = (name, value) => root.style.setProperty(name, value);
  set('--orbX', `${round(mouseX * -44)}px`);
  set('--orbY', `${round(mouseY * -32 + scrollY * 0.28)}px`);
  set('--orbS', (1 - travel * 0.3).toFixed(3));
  set('--orbO', (1 - travel * 0.85).toFixed(2));
  set('--fieldX', `${round(mouseX * 60)}px`);
  set('--fieldY', `${round(mouseY * 40 + scrollY * 0.12)}px`);
  set('--textX', `${round(mouseX * 14)}px`);
  set('--textY', `${round(mouseY * 10 + scrollY * 0.1)}px`);
  set('--dockO', dockShown.toFixed(2));
  set('--dockY', `${Math.round((1 - dockShown) * 24)}px`);
  dock?.classList.toggle('is-on', dockShown > 0.5);
};
const requestMotion = () => { if (!frame) frame = requestAnimationFrame(applyMotion); };
window.addEventListener('scroll', requestMotion, { passive: true });
window.addEventListener('resize', requestMotion);
if (page && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
  page.addEventListener('mousemove', event => {
    const box = page.getBoundingClientRect();
    if (-box.top > 900) return;
    mouseX = (event.clientX - box.left) / box.width - 0.5;
    mouseY = (event.clientY - Math.max(box.top, 0)) / 900 - 0.5;
    requestMotion();
  });
}
applyMotion();

/* ---------- Decode → Aura headline loop ---------- */
const headline = document.querySelector('[data-decode]');
const decodeTarget = document.querySelector('[data-decode-target]');
if (headline && decodeTarget && !reduceMotion) {
  const scramble = decodeTarget.querySelector('.scr');
  const aura = decodeTarget.querySelector('.aura');
  const glyphs = '01#/<>{}=+*%$&';
  let step = 18;
  let ticker = 0;
  let pause = 0;
  const render = () => {
    const decoded = step >= 16;
    scramble.hidden = decoded;
    aura.hidden = !decoded;
    if (!decoded) {
      const pick = i => glyphs[(step * 7 + i * 13) % glyphs.length];
      scramble.textContent = (step >= 10 ? 'A' : pick(0)) + pick(1);
    }
  };
  const start = () => {
    clearInterval(ticker);
    clearTimeout(pause);
    if (window.scrollY > 1100 || document.hidden) {
      pause = setTimeout(start, 2500);
      return;
    }
    step = 0;
    render();
    ticker = setInterval(() => {
      step += 1;
      render();
      if (step >= 18) {
        clearInterval(ticker);
        pause = setTimeout(start, 5200);
      }
    }, 70);
  };
  headline.addEventListener('mouseenter', start);
  pause = setTimeout(start, 600);
}

/* ---------- Scroll reveals and count-up ---------- */
const counters = [...document.querySelectorAll('[data-count]')];
let counted = false;
const countUp = () => {
  if (counted) return;
  counted = true;
  if (reduceMotion) return;
  const began = performance.now();
  const tick = now => {
    const t = Math.min(1, (now - began) / 1300);
    const eased = 1 - Math.pow(1 - t, 3);
    counters.forEach(el => { el.textContent = Math.round(Number(el.dataset.count) * eased); });
    if (t < 1) requestAnimationFrame(tick);
  };
  counters.forEach(el => { el.textContent = '0'; });
  requestAnimationFrame(tick);
};
const reveals = [...document.querySelectorAll('[data-reveal]')];
if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach(el => el.classList.add('in'));
} else {
  counters.forEach(el => { el.textContent = '0'; });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
      if (entry.target.dataset.reveal === 'proof') countUp();
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));
}

/* ---------- Selected work rail ---------- */
const rail = document.querySelector('[data-rail]');
const railRoot = rail?.closest('[data-rail-root]');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const idxEl = document.querySelector('[data-rail-idx]');
const totalEl = document.querySelector('[data-rail-total]');
const barEl = document.querySelector('[data-rail-bar]');
const countEl = document.querySelector('[data-work-count]');

const visibleCards = () => [...rail.querySelectorAll('.rcard:not([hidden])')];
const updateRail = () => {
  const cards = visibleCards();
  const n = cards.length;
  const max = rail.scrollWidth - rail.clientWidth;
  const progress = max > 0 ? rail.scrollLeft / max : 0;
  const index = n ? Math.min(n, Math.round(progress * Math.max(0, n - 1)) + 1) : 0;
  if (idxEl) idxEl.textContent = pad(index);
  if (totalEl) totalEl.textContent = pad(n);
  if (barEl) barEl.style.width = `${Math.round(Math.max(0.08, index / Math.max(1, n)) * 100)}%`;
};

const renderRail = async () => {
  if (!rail) return;
  let work = [];
  try {
    const response = await fetch('./content/portfolio.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    work = (await response.json()).work || [];
  } catch (error) {
    rail.innerHTML = '<p class="rail-error">The case studies couldn’t load. Please refresh the page.</p>';
    return;
  }
  const studies = work.filter(item => !item.href);
  const playbooks = work.filter(item => item.href);
  if (countEl) countEl.textContent = `${studies.length} case studies · ${playbooks.length} playbooks`;
  rail.innerHTML = studies.map((item, i) => {
    const quote = (item.caseStudy?.overview?.learning || '').replace(/^[“"]|[”"]$/g, '');
    const image = escapeHtml(item.image);
    return `<a class="rcard" href="case-study.html?case=${encodeURIComponent(item.slug)}" data-cat="${escapeHtml(item.category)}" draggable="false">`
      + `<span class="rglow" aria-hidden="true"><img src="${image}" alt="" loading="lazy" draggable="false"></span>`
      + `<span class="rimg"><img src="${image}" alt="${escapeHtml(item.title)} cover" loading="${i < 3 ? 'eager' : 'lazy'}" draggable="false"></span>`
      + `<span class="lbl rmeta" style="font-size: 11px">${pad(i + 1)} · ${escapeHtml(item.tag)}</span>`
      + `<strong class="rt">${escapeHtml(item.title)}</strong>`
      + (quote ? `<span class="rq">“${escapeHtml(quote)}”</span>` : '')
      + '</a>';
  }).join('');
  updateRail();
};

if (rail) {
  let railFrame = 0;
  rail.addEventListener('scroll', () => {
    if (!railFrame) railFrame = requestAnimationFrame(() => { railFrame = 0; updateRail(); });
  }, { passive: true });

  filterButtons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.filter;
    filterButtons.forEach(b => {
      const on = b === button;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    rail.querySelectorAll('.rcard').forEach(card => { card.hidden = key !== 'all' && card.dataset.cat !== key; });
    rail.scrollTo({ left: 0, behavior: 'auto' });
    updateRail();
  }));

  const nudge = direction => rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
  railRoot?.querySelector('[data-rail-prev]')?.addEventListener('click', () => nudge(-1));
  railRoot?.querySelector('[data-rail-next]')?.addEventListener('click', () => nudge(1));
  rail.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); nudge(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); nudge(-1); }
  });

  let drag = null;
  let dragged = false;
  rail.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, left: rail.scrollLeft, moved: false, id: event.pointerId };
    dragged = false;
  });
  rail.addEventListener('pointermove', event => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6) {
      drag.moved = true;
      rail.classList.add('dragging');
      rail.setPointerCapture?.(drag.id);
    }
    if (drag.moved) rail.scrollLeft = drag.left - dx;
  });
  const endDrag = () => {
    if (!drag) return;
    dragged = drag.moved;
    if (rail.hasPointerCapture?.(drag.id)) rail.releasePointerCapture(drag.id);
    drag = null;
    rail.classList.remove('dragging');
  };
  rail.addEventListener('pointerup', endDrag);
  rail.addEventListener('pointercancel', endDrag);
  rail.addEventListener('pointerleave', endDrag);
  rail.addEventListener('click', event => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  }, true);

  renderRail();
}
