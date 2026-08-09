const content = await fetch('./content/portfolio.json').then(r => r.json());

document.querySelector('#capabilities').innerHTML = content.capabilities.map((item, i) => `
  <article class="capability"><span>0${i + 1}</span><div><h3>${item.title}</h3><p>${item.description}</p></div></article>`).join('');

const workGrid = document.querySelector('#work-grid');
workGrid.innerHTML = content.work.map((item, index) => `
  <a class="work-card" data-category="${item.category}" href="./case-study.html?case=${encodeURIComponent(item.slug)}" aria-label="Open ${item.title} case study">
    ${item.image ? `<div class="work-image"><img src="${item.image}" alt="" loading="lazy"></div>` : ''}
    <div class="work-content"><span class="work-number">0${index + 1}</span><span class="tag">${item.tag}</span><span class="arrow">↗</span><h3>${item.title}</h3><p>${item.summary}</p><span class="open-label">View case study</span></div>
  </a>`).join('');

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(x => x.classList.remove('active'));
  button.classList.add('active');
  document.querySelectorAll('.work-card').forEach(card => {
    card.classList.toggle('hidden', button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter);
    card.classList.add('fade-in');
  });
}));

const scrollRail = direction => {
  const visibleCard = workGrid.querySelector('.work-card:not(.hidden)');
  if (!visibleCard) return;
  workGrid.scrollBy({ left: direction * (visibleCard.getBoundingClientRect().width + 18), behavior: 'smooth' });
};
document.querySelector('[data-rail-prev]').addEventListener('click', () => scrollRail(-1));
document.querySelector('[data-rail-next]').addEventListener('click', () => scrollRail(1));

let railPointerStart = 0;
let railScrollStart = 0;
let railWasDragged = false;
workGrid.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse') {
    railPointerStart = event.clientX;
    railScrollStart = workGrid.scrollLeft;
    railWasDragged = false;
    workGrid.classList.add('is-dragging');
    workGrid.setPointerCapture(event.pointerId);
  }
});
workGrid.addEventListener('pointermove', event => {
  if (!workGrid.classList.contains('is-dragging')) return;
  if (Math.abs(event.clientX - railPointerStart) > 6) railWasDragged = true;
  workGrid.scrollLeft = railScrollStart - (event.clientX - railPointerStart);
});
workGrid.addEventListener('pointerup', event => {
  workGrid.classList.remove('is-dragging');
  if (workGrid.hasPointerCapture(event.pointerId)) workGrid.releasePointerCapture(event.pointerId);
});
workGrid.addEventListener('click', event => {
  if (!railWasDragged) return;
  event.preventDefault();
  event.stopPropagation();
  railWasDragged = false;
}, true);

const essentialTabs = [...document.querySelectorAll('[data-essential-tab]')];
const selectEssentialTab = tab => {
  const target = tab.dataset.essentialTab;
  essentialTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', selected);
    item.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll('[data-essential-panel]').forEach(panel => {
    panel.hidden = panel.dataset.essentialPanel !== target;
  });
};
essentialTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectEssentialTab(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = essentialTabs[(index + direction + essentialTabs.length) % essentialTabs.length];
    selectEssentialTab(next);
    next.focus();
  });
});
