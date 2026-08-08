const content = await fetch('./content/portfolio.json').then(r => r.json());

document.querySelector('#capabilities').innerHTML = content.capabilities.map((item, i) => `
  <article class="capability"><span>0${i + 1}</span><div><h3>${item.title}</h3><p>${item.description}</p></div></article>`).join('');

const workGrid = document.querySelector('#work-grid');
workGrid.innerHTML = content.work.map(item => `
  <article class="work-card ${item.featured ? 'featured' : ''}" data-category="${item.category}">
    <span class="tag">${item.tag}</span><span class="arrow">↗</span><h3>${item.title}</h3><p>${item.summary}</p><div class="proof">${item.proof}</div>
  </article>`).join('');

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(x => x.classList.remove('active'));
  button.classList.add('active');
  document.querySelectorAll('.work-card').forEach(card => {
    card.classList.toggle('hidden', button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter);
    card.classList.add('fade-in');
  });
}));

const dialog = document.querySelector('#agent-dialog');
const input = document.querySelector('#agent-input');
const messages = document.querySelector('#messages');
const responses = [
  { terms: ['position', 'narrative'], answer: 'Shauna treats positioning as a decision system: identify the audience and urgent problem, choose the differentiated value the company can credibly own, then translate that choice into product, GTM, and enablement decisions.' },
  { terms: ['lead', 'function', 'team', 'pmm'], answer: 'Her portfolio frames PMM leadership around building a company capability: a clear remit, strong cross-functional interfaces, and repeatable decision systems. Specific team scope and outcomes are intentionally pending source verification.' },
  { terms: ['qa', 'experiment', 'github'], answer: 'AI Positioning QA is a public GitHub experiment exploring how AI can pressure-test positioning quality and make strategic feedback more repeatable. It is included as evidence of AI-first PMM experimentation.' },
  { terms: ['workvivo', 'hq', 'agent'], answer: 'Workvivo HQ & HQ Agent is a selected case study focused on AI product positioning and GTM. The current version labels it as a case-study shell until supporting artifacts and outcomes are added.' },
  { terms: ['category', 'analyst', 'competitive'], answer: 'Shauna connects category, analyst, buyer, product, and competitive signals into one market point of view—so these activities reinforce the same strategic choice rather than run as separate programs.' }
];
function answer(question) {
  const lower = question.toLowerCase();
  return responses.find(item => item.terms.some(term => lower.includes(term)))?.answer || 'I don’t have enough verified portfolio evidence to answer that yet. Try asking about positioning, PMM leadership, Workvivo HQ, category strategy, or AI Positioning QA.';
}
function submitQuestion(question) {
  if (!question.trim()) return;
  messages.insertAdjacentHTML('beforeend', `<div class="message user">${question.replace(/[<>]/g, '')}</div>`);
  setTimeout(() => { messages.insertAdjacentHTML('beforeend', `<div class="message agent fade-in">${answer(question)}</div>`); messages.scrollTop = messages.scrollHeight; }, 350);
  messages.scrollTop = messages.scrollHeight;
}
document.querySelectorAll('[data-open-agent]').forEach(x => x.addEventListener('click', () => { dialog.showModal(); setTimeout(() => input.focus(), 100); }));
document.querySelector('[data-close-agent]').addEventListener('click', () => dialog.close());
document.querySelectorAll('[data-question]').forEach(x => x.addEventListener('click', () => { dialog.showModal(); submitQuestion(x.dataset.question); }));
document.querySelector('#agent-form').addEventListener('submit', event => { event.preventDefault(); submitQuestion(input.value); input.value = ''; });
