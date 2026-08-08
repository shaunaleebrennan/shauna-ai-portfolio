const content = await fetch('./content/portfolio.json').then(r => r.json());

document.querySelector('#capabilities').innerHTML = content.capabilities.map((item, i) => `
  <article class="capability"><span>0${i + 1}</span><div><h3>${item.title}</h3><p>${item.description}</p></div></article>`).join('');

const workGrid = document.querySelector('#work-grid');
workGrid.innerHTML = content.work.map(item => `
  <article class="work-card ${item.featured ? 'featured' : ''}" data-category="${item.category}">
    ${item.image ? `<div class="work-image"><img src="${item.image}" alt="" loading="lazy"></div>` : ''}
    <div class="work-content"><span class="tag">${item.tag}</span><span class="arrow">↗</span><h3>${item.title}</h3><p>${item.summary}</p><div class="proof">${item.proof}</div></div>
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
  { terms: ['lead', 'function', 'team', 'pmm'], answer: 'Shauna was Workvivo’s founding product marketer, operated as the solo PMM for three years, and built the function into a team of five as Head of Product Marketing. Her model treats PMM as a company capability: clear remit, strong cross-functional interfaces, and repeatable decision systems.' },
  { terms: ['qa', 'experiment', 'github'], answer: 'AI Positioning QA is a public GitHub experiment exploring how AI can pressure-test positioning quality and make strategic feedback more repeatable. It is included as evidence of AI-first PMM experimentation.' },
  { terms: ['workvivo', 'hq', 'agent'], answer: 'Workvivo HQ reframed a fragmented digital workplace as one AI-native headquarters for communication, knowledge, action, and employee intelligence. The evidence set includes the public launch page, a 60-slide pitch deck, campaign assets, Shauna’s launch post, and a public peer testimonial. Her exact ownership and attributable outcomes are still being confirmed.' },
  { terms: ['category', 'analyst', 'competitive'], answer: 'Shauna connects category, analyst, buyer, product, and competitive signals into one market point of view. At Workvivo, she advanced analyst-relations programs associated with recognition across Gartner, Forrester, G2, ClearBox, and Gartner Peer Insights.' },
  { terms: ['award', 'recognition'], answer: 'Recognition includes Workvivo’s Quarterback of the Year in 2026, public peer testimony describing her HQ launch contribution as world-class PMM, an LGBTQ+ Inclusion finalist recognition, and contribution to a 2023 diversity and inclusion award.' },
  { terms: ['outcome', 'arr', 'growth', 'scale'], answer: 'Shauna helped scale Workvivo from approximately $10M to more than $100M ARR through acquisition by Zoom, while the platform grew beyond 10 million users. She built PMM from zero to five people and drove GTM and differentiation for the Meta Workplace migration motion. These are presented as company journeys she materially supported, not results attributed to her alone.' },
  { terms: ['learn', 'skill', 'agent', 'rag'], answer: 'Shauna’s AI practice spans agentic enterprise search, task orchestration, permission-aware RAG, workflow automation, and AI pricing. She builds agents for repetitive PMM workflows and seller support, and advises executive and product teams on AI roadmap and GTM.' }
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
