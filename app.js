const content = await fetch('./content/portfolio.json').then(r => r.json());

document.querySelector('#capabilities').innerHTML = content.capabilities.map((item, i) => `
  <article class="capability"><span>0${i + 1}</span><div><h3>${item.title}</h3><p>${item.description}</p></div></article>`).join('');

const workGrid = document.querySelector('#work-grid');
workGrid.innerHTML = content.work.map((item, index) => `
  <article class="work-card" data-category="${item.category}" data-open-work="${index}" role="button" tabindex="0" aria-label="Open ${item.title} project details">
    ${item.image ? `<div class="work-image"><img src="${item.image}" alt="" loading="lazy"></div>` : ''}
    <div class="work-content"><span class="work-number">0${index + 1}</span><span class="tag">${item.tag}</span><span class="arrow">↗</span><h3>${item.title}</h3><p>${item.summary}</p><span class="open-label">View case study</span></div>
  </article>`).join('');

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

const workDialog = document.querySelector('#work-dialog');
const workLink = document.querySelector('#work-dialog-link');
document.querySelectorAll('[data-open-work]').forEach(card => card.addEventListener('click', () => {
  const item = content.work[Number(card.dataset.openWork)];
  document.querySelector('#work-dialog-tag').textContent = item.tag;
  document.querySelector('#work-dialog-title').textContent = item.title;
  document.querySelector('#work-dialog-summary').textContent = item.summary;
  document.querySelector('#work-dialog-demonstrates').textContent = item.demonstrates;
  document.querySelector('#work-dialog-proof').textContent = item.proof;
  workLink.href = `case-study.html?case=${item.slug}`;
  workLink.hidden = false;
  workDialog.showModal();
}));
document.querySelectorAll('[data-open-work]').forEach(card => card.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    card.click();
  }
}));
document.querySelector('[data-close-work]').addEventListener('click', () => workDialog.close());
workDialog.addEventListener('click', event => { if (event.target === workDialog) workDialog.close(); });

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
