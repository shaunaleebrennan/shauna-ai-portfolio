const arcTabs = [...document.querySelectorAll('[data-arc]')];
const arcPanels = [...document.querySelectorAll('.pb-arc-panel')];
const arcArt = document.querySelector('.pb-arc-art');
const previousStage = document.querySelector('[data-arc-prev]');
const nextStage = document.querySelector('[data-arc-next]');
const arcStates = [
  ['The world moves', 'What changes for us?', 'Find a shift the audience can recognize.'],
  ['The familiar approach', 'The stakes become clear', 'Make the consequence specific to the audience.'],
  ['A different understanding', 'A new way to succeed', 'Teach an approach worth adopting before the product appears.'],
  ['Agreement with the idea', 'The difficulty of acting', 'Understand what makes the approach hard to put into practice.'],
  ['A useful approach', 'A credible contribution', 'Connect the product to the obstacles, with mechanisms and proof.']
];
let currentStage = 0;

function selectArc(index, moveFocus = false) {
  currentStage = Math.max(0, Math.min(arcTabs.length - 1, index));
  arcTabs.forEach((tab, i) => {
    const selected = i === currentStage;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    arcPanels[i].hidden = !selected;
  });
  arcArt.dataset.stage = String(currentStage);
  const [before, after, caption] = arcStates[currentStage];
  document.querySelector('#arc-art-before').textContent = before;
  document.querySelector('#arc-art-after').textContent = after;
  document.querySelector('#arc-art-caption').textContent = caption;
  previousStage.disabled = currentStage === 0;
  nextStage.disabled = currentStage === arcTabs.length - 1;
  document.querySelector('#arc-status').textContent = `Stage ${currentStage + 1} of 5: ${arcTabs[currentStage].textContent.replace(/^\s*0\d\s*/, '').trim()}`;
  if (moveFocus) arcTabs[currentStage].focus();
  const rail = document.querySelector('.pb-arc-tabs');
  const target = arcTabs[currentStage];
  if (target.offsetLeft < rail.scrollLeft || target.offsetLeft + target.offsetWidth > rail.scrollLeft + rail.clientWidth) {
    rail.scrollTo({left: target.offsetLeft - rail.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
}

arcTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectArc(index));
  tab.addEventListener('keydown', event => {
    const directions = {ArrowRight: 1, ArrowLeft: -1};
    if (event.key in directions) {
      event.preventDefault();
      selectArc((index + directions[event.key] + arcTabs.length) % arcTabs.length, true);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      selectArc(event.key === 'Home' ? 0 : arcTabs.length - 1, true);
    }
  });
});
previousStage.addEventListener('click', () => selectArc(currentStage - 1));
nextStage.addEventListener('click', () => selectArc(currentStage + 1));

const story = document.querySelector('#example-story');
const annotationButtons = [...document.querySelectorAll('[data-highlight]')];
const annotationNotes = {
  belief: 'The contradiction changes how success is understood: a finished checklist can coexist with a customer who still cannot get value.',
  method: 'The approach becomes practical: agree the outcome, work back to milestones, and measure progress against them.',
  product: 'The product has a defined contribution to the approach. Its capabilities and results still need appropriate proof.',
  action: 'The next step applies the idea to a real customer journey, giving the audience something useful to do.'
};
annotationButtons.forEach(button => button.addEventListener('click', () => {
  const active = button.getAttribute('aria-pressed') !== 'true';
  annotationButtons.forEach(other => other.setAttribute('aria-pressed', String(active && other === button)));
  story.classList.toggle('has-emphasis', active);
  story.querySelectorAll('[data-story-point]').forEach(paragraph => paragraph.classList.toggle('is-emphasized', active && paragraph.dataset.storyPoint === button.dataset.highlight));
  document.querySelector('#example-note').textContent = active ? annotationNotes[button.dataset.highlight] : 'Explore the decisions behind the story.';
}));

const briefForm = document.querySelector('#narrative-brief');
const briefStatus = document.querySelector('#brief-status');
const fields = [...briefForm.querySelectorAll('textarea')];
function briefText() {
  return '# Narrative Design Brief\n\n' + fields.map(field => `## ${field.name}\n\n${field.value.trim() || '[Not yet defined]'}`).join('\n\n') + '\n\n---\nPrepared using Shauna Brennan’s Narrative Design playbook.\nFive-stage change-led method: Marcus Andrews.\n';
}
function hasNotes() {
  if (fields.some(field => field.value.trim())) return true;
  briefStatus.textContent = 'Add a few notes before exporting your brief.';
  fields[0].focus();
  return false;
}
briefForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!hasNotes()) return;
  const url = URL.createObjectURL(new Blob([briefText()], {type: 'text/markdown;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'narrative-design-brief.md';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  briefStatus.textContent = 'Your brief is ready to download. Keep developing the unresolved decisions.';
});
document.querySelector('#copy-brief').addEventListener('click', async () => {
  if (!hasNotes()) return;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(briefText());
    briefStatus.textContent = 'Brief copied. Paste it into your document or narrative assistant.';
  } catch {
    briefStatus.textContent = 'Clipboard access is unavailable. Download your brief instead.';
  }
});
fields.forEach(field => field.addEventListener('input', () => { briefStatus.textContent = ''; }));

const progress = document.querySelector('.pb-progress i');
const tocLinks = [...document.querySelectorAll('.pb-sticky a')];
const chapters = tocLinks.map(link => document.querySelector(link.getAttribute('href')));
let scrollScheduled = false;
function updateReading() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? Math.min(100, Math.max(0, scrollY / max * 100)) : 0}%`;
  let active = chapters[0];
  chapters.forEach(chapter => { if (chapter.getBoundingClientRect().top <= 145) active = chapter; });
  tocLinks.forEach(link => {
    if (link.getAttribute('href') === `#${active.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollScheduled = false;
}
addEventListener('scroll', () => {
  if (!scrollScheduled) { requestAnimationFrame(updateReading); scrollScheduled = true; }
}, {passive:true});
addEventListener('resize', updateReading, {passive:true});
updateReading();

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), {threshold:.06});
  document.querySelectorAll('.pb-reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('pb-js');
}

const heroVisual = document.querySelector('.pb-hero-visual');
if (matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const orb = heroVisual.querySelector('.pb-hero-orb');
  heroVisual.addEventListener('pointermove', event => {
    const bounds = heroVisual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    orb.style.transform = `translate(${x * 14}px, ${y * 14}px) rotate(-15deg)`;
  });
  heroVisual.addEventListener('pointerleave', () => { orb.style.transform = ''; });
}
