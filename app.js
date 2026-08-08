const content = await fetch('./content/portfolio.json').then(r => r.json());

document.querySelector('#capabilities').innerHTML = content.capabilities.map((item, i) => `
  <article class="capability"><span>0${i + 1}</span><div><h3>${item.title}</h3><p>${item.description}</p></div></article>`).join('');

const workGrid = document.querySelector('#work-grid');
workGrid.innerHTML = content.work.map((item, index) => `
  <article class="work-card ${item.featured ? 'featured' : ''}" data-category="${item.category}" data-open-work="${index}" role="button" tabindex="0" aria-label="Open ${item.title} project details">
    ${item.image ? `<div class="work-image"><img src="${item.image}" alt="" loading="lazy"></div>` : ''}
    <div class="work-content"><span class="tag">${item.tag}</span><span class="arrow">↗</span><h3>${item.title}</h3><p>${item.summary}</p><div class="proof">${item.proof}</div><span class="open-label">Open project</span></div>
  </article>`).join('');

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(x => x.classList.remove('active'));
  button.classList.add('active');
  document.querySelectorAll('.work-card').forEach(card => {
    card.classList.toggle('hidden', button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter);
    card.classList.add('fade-in');
  });
}));

document.querySelectorAll('[data-focus-agent]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#shauna-os-widget').scrollIntoView({ behavior: 'smooth', block: 'center' });
}));

const workDialog = document.querySelector('#work-dialog');
const workLink = document.querySelector('#work-dialog-link');
document.querySelectorAll('[data-open-work]').forEach(card => card.addEventListener('click', () => {
  const item = content.work[Number(card.dataset.openWork)];
  document.querySelector('#work-dialog-tag').textContent = item.tag;
  document.querySelector('#work-dialog-title').textContent = item.title;
  document.querySelector('#work-dialog-summary').textContent = item.summary;
  document.querySelector('#work-dialog-demonstrates').textContent = item.demonstrates;
  document.querySelector('#work-dialog-proof').textContent = item.proof;
  workLink.hidden = !item.url;
  if (item.url) workLink.href = item.url;
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
