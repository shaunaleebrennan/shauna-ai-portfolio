// The 60-second guided tour of the homepage.
// One tap scrolls the page through the proof while a caption bar narrates.
// Each stop carries an `audio` clip (narration in the same studio voice as the agent) and
// its length in seconds (`dur`). With sound on, the stop lasts as long as the clip; muted,
// or if the clip can't play, it is timed by the length of its caption instead.
// Each stop is framed in the space above the caption bar, so the bar never covers it.
// Wheel, touch or arrow keys pause the tour so a visitor is never fought for the scroll.
const STOPS = [
  { target: '#top', align: 'top', audio: 'assets/tour/tour-1.mp3', dur: 8.28, text: 'Hi, I’m Shauna, Decoded. Shauna turns AI products into stories that sell. Here’s her work in sixty seconds.' },
  { target: 'section[aria-label="Proof"]', audio: 'assets/tour/tour-2.mp3', dur: 10.68, text: 'She built Workvivo’s product marketing function from zero to a team of five, while the company grew from about $10M to $110M ARR.' },
  { target: '#scan', audio: 'assets/tour/tour-3.mp3', dur: 8.67, text: 'Her core strengths: positioning and narrative, AI-native go-to-market, PMM leadership, and category strategy.' },
  { target: '[data-rail]', audio: 'assets/tour/tour-4.mp3', dur: 8.75, text: 'She positioned HQ Agent, led the narrative behind Workvivo HQ, and shaped the migration story when Meta closed Workplace.' },
  { target: 'section[aria-label="How I think"]', audio: 'assets/tour/tour-5.mp3', dur: 5.33, text: 'Her method is simple. Find the signal. Make the choice. Build the system.' },
  { target: '.qbgrid', audio: 'assets/tour/tour-6.mp3', dur: 3.97, text: 'Workvivo named her Quarterback of the Year for 2026.' },
  { find: () => document.querySelector('#essentials .arcard')?.parentElement, offset: 150, audio: 'assets/tour/tour-7.mp3', dur: 10.03, text: 'She also runs Workvivo’s analyst programme. The company is a Gartner Magic Quadrant Leader four years running and a 2026 Forrester Wave Leader.' },
  { target: '#ask', audio: 'assets/tour/tour-8.mp3', dur: 4.83, text: 'That’s the short version. Don’t just read her résumé. Ask me anything.' }
];
// Loudness of each clip, one digit (0–9) per 50ms, measured from the audio files. The orb swells
// with it while the clip plays, so it moves with the voice without touching the audio path.
const LOUDNESS = [
  '04977432100004987215753221100002922742221110000000001189756412778931566666511443342101783510036444552035100003321111000000000688217646651236530063104513311221100000',
  '11596675313851268758751011575631498743444204432144551467632465444332113683114676510005422111110000000099582376389842454541688476410112555764433445414664111443453379611135777666777746653332312464245444333332211100',
  '1791215754101442110100000000000197872155544337777432222111100000000099788767886577432576415853202211100000000119967117874367775434222441000007997121476624333101321111111100',
  '115737546214554276221115743332234421000000589964778776656410843666753475012674765244111112564344000000029942165311289765366521552014433345478878654421235433123521012111000000',
  '179997305354004631211100000000000059887550064443331000000598620412164433100000000337986634500420021111000',
  '399711377476579889723740116646476415437655653223115211167763156541022101000000',
  '21667852077655568534841467667763256676431011232122111110000000003943862655543738623875256679977626102177624523443542000565445465641244432223000000799421575521555510551101048665101556465421122121110000',
  '399700261276312321221220000000668743182123565426524451432111100000000873026652005985310211110000'
];
const LOUDNESS_STEP = 0.05;
const WORDS_PER_SECOND = 2.7;
const GAP = 320; // breath between clips, in ms
const SOUND_KEY = 'tour-sound';
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
      <button type="button" data-tour-sound aria-pressed="true">Sound on</button>
      <button type="button" data-tour-toggle>Pause</button>
      <button type="button" data-tour-next>Skip</button>
      <button type="button" data-tour-end aria-label="End the tour">✕</button>
    </div>`;
  document.body.append(bar);
  const caption = bar.querySelector('.tour-cap');
  const count = bar.querySelector('.tour-count');
  const toggle = bar.querySelector('[data-tour-toggle]');
  const soundButton = bar.querySelector('[data-tour-sound]');
  const fills = [...bar.querySelectorAll('.tour-prog i')];

  let index = -1;
  let timer = 0;
  let endsAt = 0;
  let remaining = 0;
  let paused = false;
  let running = false;
  let audio = null;
  let opener = null;
  let warmed = null;
  let voiceFrame = 0;
  let voiceLevel = 0;
  let sound = true;
  try { sound = sessionStorage.getItem(SOUND_KEY) !== 'off'; } catch { /* storage can be blocked */ }

  const readingSeconds = stop => Math.max(3.5, stop.text.split(/\s+/).length / WORDS_PER_SECOND + 0.9);
  // How long a stop lasts: the clip plus a breath when it will be heard, reading time otherwise.
  const seconds = stop => (sound && stop.audio && stop.dur ? stop.dur + GAP / 1000 : readingSeconds(stop));
  const warm = stop => { if (sound && stop?.audio) { warmed = new Audio(stop.audio); warmed.preload = 'auto'; } };
  const paintSound = () => {
    soundButton.textContent = sound ? 'Sound on' : 'Sound off';
    soundButton.setAttribute('aria-pressed', String(sound));
  };
  const element = stop => (stop.find ? stop.find() : document.querySelector(stop.target));

  const scrollToStop = stop => {
    const el = element(stop);
    if (!el) return;
    // Frame the stop in the space above the caption bar, so the bar never covers what it is describing:
    // centred when it fits, otherwise top-aligned.
    // A block that hasn't faded in yet still sits 48px low; measure it where it will come to rest.
    const pending = el.closest('.rv:not(.in)');
    if (pending) { pending.style.transition = 'none'; pending.style.transform = 'none'; }
    const rect = el.getBoundingClientRect();
    if (pending) { pending.style.transform = ''; void pending.offsetWidth; pending.style.transition = ''; }
    const barBox = bar.getBoundingClientRect();
    const room = window.innerHeight - (barBox.height + (parseFloat(getComputedStyle(bar).bottom) || 0) + 16);
    const lead = stop.offset ?? 24;
    const gap = rect.height + 2 * lead <= room ? (room - rect.height) / 2 : lead;
    const top = stop.align === 'top' ? 0 : rect.top + window.scrollY - gap;
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
    audio?.pause();
    audio = null;
    schedule(seconds(stop) * 1000);
    if (sound) narrate(stop);
    warm(STOPS[i + 1]);
  };

  // While a clip plays, the orbs on stage (the bar's own, the hero orb, the Ask orb) turn to their
  // speaking mood and swell with the clip's loudness.
  const stage = () => [bar.querySelector('.tour-orb'), document.querySelector('.orbwrap'), document.querySelector('#ask [data-agent-orb]')].filter(Boolean);
  const quiet = () => {
    cancelAnimationFrame(voiceFrame);
    voiceFrame = 0;
    voiceLevel = 0;
    stage().forEach(el => {
      delete el.dataset.orbState;
      el.removeAttribute('data-orb-voiced');
      el.style.removeProperty('--vol');
    });
  };
  const follow = () => {
    const clip = audio;
    const curve = LOUDNESS[index] || '';
    const live = clip && !clip.paused && !clip.ended;
    const target = live ? (Number(curve[Math.floor(clip.currentTime / LOUDNESS_STEP)]) || 0) / 9 : 0;
    voiceLevel += (target - voiceLevel) * 0.35;
    stage().forEach(el => el.style.setProperty('--vol', (el.classList.contains('tour-orb') ? voiceLevel : voiceLevel * 0.5).toFixed(3)));
    voiceFrame = running && audio ? requestAnimationFrame(follow) : 0;
  };
  const speak = () => {
    stage().forEach(el => {
      el.dataset.orbState = 'speaking';
      if (!reduceMotion) el.setAttribute('data-orb-voiced', '');
    });
    if (!reduceMotion && !voiceFrame) voiceFrame = requestAnimationFrame(follow);
  };

  // Narration. The timer stays the single clock; each time the clip actually starts (or restarts
  // after buffering or a pause) the clock is re-set to what is left of the clip, so sound,
  // caption and progress bar stay together. If the clip can't play, the stop falls back to reading time.
  // One audio element plays every clip. Phones only let sound start from a tap, and that permission
  // belongs to the element that was tapped into life, so a fresh element per stop goes silent after stop one.
  let player = null;
  let playing = null;
  const live = stop => running && audio === player && STOPS[index] === stop;
  const fallback = stop => {
    if (!stop || !live(stop)) return;
    audio = null;
    quiet();
    if (!paused) schedule(readingSeconds(stop) * 1000);
  };
  const getPlayer = () => {
    if (player) return player;
    player = new Audio();
    player.preload = 'auto';
    player.addEventListener('playing', () => {
      const stop = playing;
      if (!live(stop) || paused) return;
      speak();
      const left = ((player.duration || stop.dur) - player.currentTime) * 1000;
      if (Number.isFinite(left)) schedule(Math.max(0, left) + GAP);
    });
    player.addEventListener('error', () => fallback(playing));
    return player;
  };
  const narrate = stop => {
    const clip = getPlayer();
    playing = stop;
    audio = clip;
    clip.muted = false;
    clip.src = stop.audio;
    clip.play().catch(() => fallback(stop));
  };
  // Sound switched on by a tap mid-tour: use that tap to get the player permission to speak at the next stop.
  const unlock = stop => {
    if (!stop?.audio || audio) return;
    const clip = getPlayer();
    clip.muted = true;
    clip.src = stop.audio;
    clip.play().then(() => { if (audio !== clip) clip.pause(); }).catch(() => {}).finally(() => { if (audio !== clip) clip.currentTime = 0; clip.muted = false; });
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
    schedule(remaining);
    if (audio && !audio.ended) audio.play().catch(() => {});
  };

  const setSound = on => {
    sound = on;
    try { sessionStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); } catch { /* storage can be blocked */ }
    paintSound();
    if (!running) return;
    const stop = STOPS[index];
    if (!on) {
      // Muted mid-stop: keep the time already earned, finish on reading time.
      audio?.pause();
      audio = null;
      quiet();
      if (paused) remaining = Math.max(600, Math.min(remaining, readingSeconds(stop) * 1000));
      else schedule(Math.max(1200, Math.min(endsAt - performance.now(), readingSeconds(stop) * 1000)));
    } else if (!paused) {
      // Sound back on: narration picks up from the next stop, so a line is never heard from the middle.
      warm(STOPS[index + 1]);
      unlock(STOPS[index + 1]);
    }
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
    // The narration takes the floor: end any conversation with the agent first.
    document.dispatchEvent(new Event('agent:stop'));
    // Sit above the analytics banner when it is showing.
    const consent = document.querySelector('.analytics-consent');
    // On phones the banner is hidden for the length of the tour instead (see redesign.css).
    const phone = window.matchMedia('(max-width: 700px)').matches;
    bar.style.bottom = consent && !phone ? `${consent.getBoundingClientRect().height + 28}px` : '';
    toggle.textContent = 'Pause';
    paintSound();
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
    quiet();
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
  soundButton.addEventListener('click', () => setSound(!sound));
  bar.querySelector('[data-tour-next]').addEventListener('click', () => { if (paused) { paused = false; bar.classList.remove('is-paused'); toggle.textContent = 'Pause'; } next(); });
  bar.querySelector('[data-tour-end]').addEventListener('click', () => end(false));
  // The bar's own controls must not count as "the visitor took over the scroll".
  bar.addEventListener('wheel', event => event.stopPropagation(), { passive: true });
  bar.addEventListener('touchmove', event => event.stopPropagation(), { passive: true });
  starters.forEach(button => {
    button.addEventListener('click', () => start(button));
    // Fetch the first clip as soon as the visitor shows interest, so the tour starts speaking at once.
    ['pointerenter', 'focus', 'touchstart'].forEach(type => button.addEventListener(type, () => { if (!running && !warmed) warm(STOPS[0]); }, { passive: true, once: true }));
  });
}
