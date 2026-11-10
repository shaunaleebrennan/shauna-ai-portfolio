// The 60-second guided tour of the homepage.
// One tap scrolls the page through the proof while a caption bar narrates.
// Each stop can carry an `audio` file (narration in Shauna's voice); when it is
// present the stop lasts as long as the clip, otherwise it is timed by its length.
// Wheel, touch or arrow keys pause the tour so a visitor is never fought for the scroll.
const STOPS = [
  { target: '#top', align: 'top', text: 'Hi, I’m Shauna, Decoded. Shauna makes complex AI clear. Here’s her work in sixty seconds.' },
  { target: 'section[aria-label="Proof"]', text: 'She built Workvivo’s product marketing function from zero to a team of five, while the company grew from about $10M to $110M ARR.' },
  { target: '#scan', text: 'Her core strengths: positioning and narrative, AI-native go-to-market, PMM leadership, and category strategy.' },
  { target: '#explore', text: 'She positioned HQ Agent, led the narrative behind Workvivo HQ, and shaped the migration story when Meta closed Workplace.' },
  { target: 'section[aria-label="How I think"]', text: 'Her method is simple. Find the signal. Make the choice. Build the system.' },
  { target: '.qbgrid', offset: 96, text: 'Workvivo named her Quarterback of the Year for 2026.' },
  { find: () => [...document.querySelectorAll('#essentials h3')].find(h => /Recognised by/.test(h.textContent))?.parentElement, offset: 56, text: 'She also runs Workvivo’s analyst programme. The company is a Gartner Magic Quadrant Leader four years running and a 2026 Forrester Wave Leader.' },
  { target: '#ask', text: 'That’s the short version. Don’t just read her résumé. Ask me anything.' }
];
const WORDS_PER_SECOND = 2.7;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const starters = document.querySelectorAll('[data-tour-start]');

if (starters.length) {
  const bar = document.createElement('div');
  bar.className = 'tour';
  bar.hidden = true;
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', '60-second tour');
  bar.innerHTML = `
    <div class="tour-prog" aria-hidden="true">${STOPS.map(() => '<span><i></i></span>').join('')}</div>
    <div class="tour-row">
      <span class="tour-orb gorb" aria-hidden="true"></span>
      <p class="tour-cap" aria-live="polite"></p>
    </div>
    <div class="tour-ctl">
      <span class="lbl tour-count"></span>
      <button type="button" data-tour-toggle>Pause</button>
      <button type="button" data-tour-next>Skip</button>
      <button type="button" data-tour-end aria-label="End the tour">✕</button>
    </div>`;
  document.body.append(bar);
  const caption = bar.querySelector('.tour-cap');
  const count = bar.querySelector('.tour-count');
  const toggle = bar.querySelector('[data-tour-toggle]');
  const fills = [...bar.querySelectorAll('.tour-prog i')];

  let index = -1;
  let timer = 0;
  let endsAt = 0;
  let remaining = 0;
  let paused = false;
  let running = false;
  let audio = null;
  let opener = null;

  const seconds = stop => Math.max(3.5, stop.text.split(/\s+/).length / WORDS_PER_SECOND + 0.9);
  const element = stop => (stop.find ? stop.find() : document.querySelector(stop.target));

  const scrollToStop = stop => {
    const el = element(stop);
    if (!el) return;
    const top = stop.align === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - (stop.offset ?? 24);
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const runFill = (i, ms) => {
    const fill = fills[i];
    fill.style.transition = 'none';
    fill.style.width = `${100 - (ms / (seconds(STOPS[i]) * 1000)) * 100}%`;
    void fill.offsetWidth;
    fill.style.transition = `width ${ms}ms linear`;
    fill.style.width = '100%';
  };
  const freezeFill = i => {
    const fill = fills[i];
    fill.style.width = getComputedStyle(fill).width;
    fill.style.transition = 'none';
  };

  const schedule = ms => {
    clearTimeout(timer);
    endsAt = performance.now() + ms;
    runFill(index, ms);
    timer = setTimeout(next, ms);
  };

  const show = i => {
    index = i;
    const stop = STOPS[i];
    fills.forEach((fill, n) => { fill.style.transition = 'none'; fill.style.width = n < i ? '100%' : '0%'; });
    caption.classList.remove('is-in');
    void caption.offsetWidth;
    caption.textContent = stop.text;
    caption.classList.add('is-in');
    count.textContent = `${i + 1} / ${STOPS.length}`;
    scrollToStop(stop);
    let ms = seconds(stop) * 1000;
    audio?.pause();
    audio = null;
    if (stop.audio) {
      // Narration: the stop ends when the clip does. If it can't play, the timer stands.
      audio = new Audio(stop.audio);
      audio.addEventListener('ended', () => { if (running && !paused && STOPS[index] === stop) next(); });
      audio.play().then(() => { clearTimeout(timer); runFill(index, Math.max(ms, (audio.duration || 0) * 1000)); }).catch(() => { audio = null; });
    }
    schedule(ms);
  };

  function next() {
    if (!running) return;
    if (index + 1 >= STOPS.length) return end(true);
    show(index + 1);
  }

  const pause = () => {
    if (!running || paused) return;
    paused = true;
    remaining = Math.max(600, endsAt - performance.now());
    clearTimeout(timer);
    freezeFill(index);
    audio?.pause();
    bar.classList.add('is-paused');
    toggle.textContent = 'Resume';
  };
  const resume = () => {
    if (!running || !paused) return;
    paused = false;
    bar.classList.remove('is-paused');
    toggle.textContent = 'Pause';
    scrollToStop(STOPS[index]);
    if (audio) audio.play().catch(() => {});
    schedule(remaining);
  };

  const interrupt = () => pause();
  const onKey = event => {
    if (event.key === 'Escape') end(false);
    else if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) pause();
    else if (event.key === ' ' && !/^(INPUT|TEXTAREA|BUTTON|A)$/.test(document.activeElement?.tagName || '')) pause();
  };

  const start = from => {
    if (running) return;
    running = true;
    paused = false;
    opener = from || null;
    bar.hidden = false;
    document.body.classList.add('tour-on');
    // Sit above the analytics banner when it is showing.
    const consent = document.querySelector('.analytics-consent');
    bar.style.bottom = consent ? `${consent.getBoundingClientRect().height + 28}px` : '';
    toggle.textContent = 'Pause';
    bar.classList.remove('is-paused', 'is-done');
    window.addEventListener('wheel', interrupt, { passive: true });
    window.addEventListener('touchmove', interrupt, { passive: true });
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => bar.classList.add('is-on'));
    show(0);
  };

  function end(finished) {
    if (!running) return;
    running = false;
    clearTimeout(timer);
    audio?.pause();
    audio = null;
    window.removeEventListener('wheel', interrupt);
    window.removeEventListener('touchmove', interrupt);
    window.removeEventListener('keydown', onKey);
    bar.classList.remove('is-on');
    document.body.classList.remove('tour-on');
    setTimeout(() => { if (!running) bar.hidden = true; }, 350);
    if (finished) {
      // Finish on the conversation: the tour's last line is an invitation to ask.
      document.querySelector('#ask [data-agent-start="text"]')?.focus({ preventScroll: true });
    } else {
      opener?.focus({ preventScroll: true });
    }
  }

  toggle.addEventListener('click', () => (paused ? resume() : pause()));
  bar.querySelector('[data-tour-next]').addEventListener('click', () => { if (paused) { paused = false; bar.classList.remove('is-paused'); toggle.textContent = 'Pause'; } next(); });
  bar.querySelector('[data-tour-end]').addEventListener('click', () => end(false));
  // The bar's own controls must not count as "the visitor took over the scroll".
  bar.addEventListener('wheel', event => event.stopPropagation(), { passive: true });
  bar.addEventListener('touchmove', event => event.stopPropagation(), { passive: true });
  starters.forEach(button => button.addEventListener('click', () => start(button)));
}
