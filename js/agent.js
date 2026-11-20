// On-page conversations with Shauna's ElevenLabs portfolio agent.
// "Start a voice conversation" opens a voice call; "Type a question" and the
// prompt chips open a text chat. The SDK only loads when someone starts a
// conversation. If a session can't start, the standard ElevenLabs widget is
// offered instead so visitors are never left without the agent.
const AGENT_ID = 'agent_4401kzh72h3ff1ev937b4qdg8b7y';
const SDK_SRC = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.35.0/dist/lib.iife.js';
const WIDGET_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

// Pages tell the agent where the visitor is, so short questions such as
// "Where is the pilot now?" resolve to the right project. The note is sent as a
// contextual update: the agent reads it but doesn't reply to it.
const pageNote = (page, topic) => `Page context (sent by the website, not typed by the visitor): the visitor is reading the ${page} on Shauna's portfolio. If a question doesn't name a project, it is about ${topic}.`;
// Suggested questions handed over from a playbook page (index.html?ask=…&about=…#ask).
// Only known pages are accepted, so a crafted link can't put its own words in the note.
const HANDOVER_PAGES = {
  'narrative-design': ['Narrative design playbook', 'the Narrative design playbook'],
  'launch': ['Launch with Intent product launch playbook', 'the Launch with Intent playbook']
};

// Mount every agent block on the page, including ones a page renders later
// (case studies render theirs after loading content, then fire 'agent:mount').
// Only one conversation runs at a time: starting one ends any other on the page.
const stoppers = new Set();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Anything that needs the floor (the narrated tour) can ask every conversation to stop.
document.addEventListener('agent:stop', () => stoppers.forEach(stopOne => stopOne()));
const mountAgents = () => document.querySelectorAll('[data-agent]:not([data-agent-ready])').forEach(initAgent);
mountAgents();
document.addEventListener('agent:mount', mountAgents);

function initAgent(section) {
  section.dataset.agentReady = '';
  const panel = section.querySelector('[data-agent-panel]');
  const statusEl = section.querySelector('[data-agent-status]');
  const log = section.querySelector('[data-agent-log]');
  const form = section.querySelector('[data-agent-form]');
  const input = form?.querySelector('input');
  const endButton = section.querySelector('[data-agent-end]');
  // The orb is usually inside the block; a floating block can point at one elsewhere (the hero orb).
  const orbTarget = section.dataset.agentOrb;
  const orb = section.querySelector('[data-agent-orb]')
    || (orbTarget && /^[.#][\w-]+$/.test(orbTarget) ? document.querySelector(orbTarget) : null);

  let conversation = null;
  let session = 0; // bumps whenever a conversation starts or ends, so stale callbacks can tell they are stale
  let kind = null;
  let starting = false;
  let pulseFrame = 0;
  let level = 0;
  let lastSent = '';
  let askedSomething = false;
  let sdkPromise = null;
  let agentLines = 0;   // agent messages seen in this conversation
  let thinkingSince = 0;
  let greeted = false;  // was the agent's greeting already in when the question went out?
  let repliesSince = 0;
  let pageContext = section.dataset.agentPage
    ? pageNote(section.dataset.agentPage, section.dataset.agentTopic || section.dataset.agentPage)
    : '';

  // The orb's mood follows the conversation: lime while it listens, electric blue while it thinks,
  // warm pink while it speaks, brand violet at rest. CSS does the colour work from data-orb-state.
  // Ask boxes that open this block carry a small orb of their own, which mirrors the mood.
  const orbs = [orb, ...(section.id ? document.querySelectorAll(`form[data-agent-launch="${section.id}"] .gorb`) : [])].filter(Boolean);

  // One identity everywhere: the conversation panel wears the orb too. Its header shows a small orb and
  // the agent's name, a Call button switches a typed chat to voice, and during a call a floating card
  // shows a larger orb of its own (the page's orb may be off screen by then).
  const head = section.querySelector('.agent-head');
  const dot = head?.querySelector('.agent-dot');
  if (head && dot) {
    const avatar = document.createElement('span');
    avatar.className = 'agent-avatar gorb';
    avatar.setAttribute('aria-hidden', 'true');
    const who = document.createElement('span');
    who.className = 'agent-who';
    const name = document.createElement('strong');
    name.textContent = 'Shauna, Decoded';
    dot.replaceWith(avatar, who);
    who.append(name, statusEl);
    // Chat | Call: the two ways to talk, always visible. The live one is filled; the other switches to it.
    const modes = document.createElement('div');
    modes.className = 'agent-modes';
    modes.setAttribute('role', 'group');
    modes.setAttribute('aria-label', 'How to talk to the agent');
    modes.innerHTML = '<button type="button" data-agent-mode="text" aria-pressed="false"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9h8"></path><path d="M8 13h6"></path><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"></path></svg><span>Chat</span></button>'
      + '<button type="button" data-agent-mode="voice" aria-pressed="false"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"></path></svg><span>Call</span></button>';
    modes.querySelectorAll('button').forEach(button => button.addEventListener('click', () => switchTo(button.dataset.agentMode)));
    head.after(modes);
    // During a call the panel shows it: an orb that moves with the voice, and what to do.
    const stage = document.createElement('div');
    stage.className = 'agent-stage';
    stage.setAttribute('aria-hidden', 'true');
    stage.innerHTML = '<span class="agent-stage-orb"><span class="gorb-ring"></span><span class="gorb"></span></span>'
      + '<span class="agent-stage-copy"><strong>You’re on a call</strong><span>Just start talking. What we say appears below.</span></span>'
      + '<span class="agent-bars"><i></i><i></i><i></i><i></i><i></i></span>';
    modes.after(stage);
    orbs.push(avatar, stage);
  }
  // Labels attached to an orb on the page (the hero's "tap to talk" tag) say what the agent is doing.
  const tags = section.id ? [...document.querySelectorAll(`[data-agent-tag="${section.id}"]`)].map(el => ({ el, idle: el.textContent })) : [];
  const TAG_TEXT = { connecting: 'Connecting…', listening: 'Listening…', thinking: 'Thinking…', speaking: 'Speaking…' };
  let moodTimer = 0;
  const setMood = mood => {
    orbs.forEach(el => { el.dataset.orbState = mood; });
    tags.forEach(({ el, idle }) => { el.textContent = TAG_TEXT[mood] || idle; });
  };
  const setKind = value => {
    kind = value;
    section.dataset.mode = value || '';
    section.querySelectorAll('[data-agent-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.agentMode === value)));
  };
  const setState = (state, text) => {
    clearTimeout(moodTimer);
    section.dataset.state = state;
    setMood(state);
    if (text) statusEl.textContent = text;
  };
  // A typed answer has no voice to follow, so the orb "speaks" for about as long as the answer takes to read.
  const speakFor = text => {
    clearTimeout(moodTimer);
    setMood('speaking');
    const ms = Math.min(7000, Math.max(2400, String(text || '').split(/\s+/).length * 190));
    moodTimer = setTimeout(() => setMood(section.dataset.state), ms);
  };
  // Typing a question counts as the orb listening, as long as it isn't busy thinking or speaking.
  const listenWhileTyping = field => field?.addEventListener('input', () => {
    if (['thinking', 'speaking', 'connecting', 'listening'].includes(section.dataset.state)) return;
    clearTimeout(moodTimer);
    setMood(field.value.trim() ? 'listening' : section.dataset.state);
  });
  const history = [];
  const addMessage = (who, text) => {
    if (!text) return;
    if (who !== 'system') history.push(`${who === 'user' ? 'Visitor' : 'You'}: ${text}`);
    const line = document.createElement('p');
    line.className = `msg msg--${who}`;
    line.textContent = text;
    log.append(line);
    log.scrollTop = log.scrollHeight;
  };
  const openPanel = () => {
    panel.hidden = false;
    section.classList.add('has-panel');
  };

  const loadSdk = () => {
    if (window.ElevenLabsClient?.Conversation) return Promise.resolve(window.ElevenLabsClient.Conversation);
    if (!sdkPromise) {
      sdkPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SDK_SRC;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => window.ElevenLabsClient?.Conversation
          ? resolve(window.ElevenLabsClient.Conversation)
          : reject(new Error('ElevenLabs SDK did not initialise'));
        script.onerror = () => reject(new Error('ElevenLabs SDK failed to load'));
        document.head.append(script);
      }).catch(error => { sdkPromise = null; throw error; });
    }
    return sdkPromise;
  };

  const stopPulse = () => {
    cancelAnimationFrame(pulseFrame);
    pulseFrame = 0;
    level = 0;
    orbs.forEach(el => { el.style.setProperty('--vol', '0'); el.removeAttribute('data-orb-voiced'); });
  };
  const pulse = () => {
    if (!conversation || kind !== 'voice' || reduceMotion) return stopPulse();
    orbs.forEach(el => el.setAttribute('data-orb-voiced', ''));
    let output = 0;
    let inputLevel = 0;
    try {
      output = conversation.getOutputVolume?.() || 0;
      inputLevel = conversation.getInputVolume?.() || 0;
    } catch { /* volume is cosmetic */ }
    const target = Math.min(1, Math.max(output, inputLevel * 0.6) * 1.6);
    level += (target - level) * 0.25;
    orbs.forEach(el => el.style.setProperty('--vol', level.toFixed(3)));
    pulseFrame = requestAnimationFrame(pulse);
  };

  const showFallback = reason => {
    console.warn('[agent]', reason);
    stopPulse();
    conversation = null;
    setKind(null);
    section.classList.remove('is-live');
    setState('error', 'The agent couldn’t start here');
    addMessage('system', 'Something blocked the on-page conversation. You can still talk to the agent in the chat bubble.');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'agent-fallback';
    button.textContent = 'Open the chat bubble';
    button.addEventListener('click', () => {
      loadWidget();
      button.remove();
      addMessage('system', 'The agent is in the bottom-right corner.');
    });
    log.append(button);
  };

  const loadWidget = () => {
    if (document.querySelector('elevenlabs-convai')) return;
    document.body.classList.add('agent-widget-on');
    const widget = document.createElement('elevenlabs-convai');
    widget.setAttribute('agent-id', AGENT_ID);
    widget.setAttribute('variant', 'tiny');
    widget.setAttribute('markdown-link-allowed-hosts', '*');
    document.body.append(widget);
    const script = document.createElement('script');
    script.src = WIDGET_SRC;
    script.async = true;
    document.body.append(script);
  };

  const endConversation = async () => {
    session += 1;
    const current = conversation;
    conversation = null;
    setKind(null);
    stopPulse();
    section.classList.remove('is-live');
    if (current) {
      try { await current.endSession(); } catch { /* already closed */ }
    }
  };

  const send = text => {
    const message = text.trim();
    if (!message || !conversation) return;
    lastSent = message;
    askedSomething = true;
    addMessage('user', message);
    if (kind === 'text') {
      greeted = agentLines > 0;
      repliesSince = 0;
      thinkingSince = performance.now();
      setState('thinking', 'Thinking…');
    }
    try {
      conversation.sendUserMessage(message);
    } catch (error) {
      showFallback(error);
    }
  };

  const start = async (wanted, firstMessage = '', { force = false, carry = false } = {}) => {
    openPanel();
    if (starting) return;
    if (conversation && (wanted === kind || (wanted === 'text' && !force))) {
      if (firstMessage) send(firstMessage);
      if (wanted === 'text') input?.focus();
      return;
    }
    if (conversation) await endConversation();
    stoppers.forEach(stopOther => { if (stopOther !== stop) stopOther(); });

    starting = true;
    let mode = wanted;
    const mine = ++session;
    const current = () => mine === session;
    // A switch between chat and call keeps the transcript; a fresh start clears it.
    const earlier = carry ? history.slice(-8).join('\n').slice(-1400) : '';
    if (carry) addMessage('system', wanted === 'voice' ? 'Switching to a call…' : 'Switching to chat…');
    else { log.replaceChildren(); history.length = 0; }
    askedSomething = false;
    agentLines = 0;
    setState('connecting', 'Connecting…');
    try {
      if (mode === 'voice') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch {
          addMessage('system', 'Your microphone is off or blocked, so let’s chat by text instead.');
          mode = 'text';
        }
      }
      const Conversation = await loadSdk();
      setKind(mode);
      const opened = await Conversation.startSession({
        agentId: AGENT_ID,
        ...(mode === 'text' ? { textOnly: true } : { connectionType: 'webrtc' }),
        onConnect: () => {
          if (!current() || section.dataset.state !== 'connecting') return;
          setState(mode === 'voice' ? 'listening' : 'ready', mode === 'voice' ? 'Listening — go ahead' : 'Connected — ask away');
        },
        onDisconnect: details => {
          if (!current() || !conversation) return;
          console.info('[agent] disconnected', details);
          conversation = null;
          setKind(null);
          stopPulse();
          section.classList.remove('is-live');
          if (details?.reason === 'error') {
            setState('error', 'The connection dropped');
            addMessage('system', 'Something interrupted the conversation. Start again to pick it back up.');
          } else {
            setState('ended', 'Conversation ended');
            if (!askedSomething) addMessage('system', 'The conversation closed before a question came through. Start again whenever you’re ready.');
          }
        },
        onError: message => console.warn('[agent]', message),
        onMessage: payload => {
          if (!current()) return;
          const fromUser = payload.role === 'user' || payload.source === 'user';
          if (fromUser) askedSomething = true;
          if (fromUser && payload.message?.trim() === lastSent) { lastSent = ''; return; }
          // After a switch the agent greets again; the transcript already has that line, so don't repeat it.
          if (!fromUser && carry && agentLines === 0 && history.includes(`You: ${payload.message}`)) { agentLines += 1; return; }
          addMessage(fromUser ? 'user' : 'agent', payload.message);
          if (!fromUser) {
            agentLines += 1;
            repliesSince += 1;
            // A greeting that lands just after the first question isn't the answer; keep thinking until the answer arrives.
            const answered = greeted || repliesSince >= 2 || performance.now() - thinkingSince > 1500;
            if (kind === 'text' && section.dataset.state === 'thinking' && answered) {
              setState('ready', 'Connected — ask away');
              speakFor(payload.message);
            }
          }
        },
        onModeChange: ({ mode: speaking }) => {
          if (current() && kind === 'voice') setState(speaking === 'speaking' ? 'speaking' : 'listening', speaking === 'speaking' ? 'Speaking…' : 'Listening — go ahead');
        }
      });
      if (!current()) {
        // Ended (End, Close, or another conversation starting) while this one was still connecting.
        opened.endSession().catch(() => {});
        if (section.dataset.state === 'connecting') { setKind(null); setState('ended', 'Conversation ended'); }
        return;
      }
      conversation = opened;
      section.classList.add('is-live');
      if (section.dataset.state === 'connecting') {
        setState(mode === 'voice' ? 'listening' : 'ready', mode === 'voice' ? 'Listening — go ahead' : 'Connected — ask away');
      }
      if (mode === 'voice') pulse();
      if (earlier) {
        try { conversation.sendContextualUpdate(`Continuity note (sent by the website, not typed by the visitor): the visitor has just switched between typed chat and a voice call on the same page, and this is the same visit. Carry on from where you were; don't reintroduce yourself at length. The conversation so far:\n${earlier}`); } catch (error) { console.warn('[agent] continuity note not sent', error); }
      }
      if (pageContext) {
        try { conversation.sendContextualUpdate(pageContext); } catch (error) { console.warn('[agent] page context not sent', error); }
      }
      if (firstMessage) send(firstMessage);
      if (mode === 'text') input?.focus();
    } catch (error) {
      showFallback(error);
    } finally {
      starting = false;
    }
  };

  const openIdle = () => {
    openPanel();
    if (!conversation && !starting) setState('idle', 'Ask me anything, by chat or call');
    // Put the cursor in the box on desktop; on touch screens that would throw the keyboard over the card.
    if (window.matchMedia('(hover: hover)').matches) input?.focus({ preventScroll: true });
  };

  // The Chat | Call switch. Switching ends the current session and opens the other kind, keeping the transcript.
  function switchTo(mode) {
    if (conversation && kind === mode) { if (mode === 'text') input?.focus(); return; }
    start(mode, '', { force: true, carry: Boolean(conversation) });
  }

  const stop = async () => {
    if (!conversation) return;
    await endConversation();
    setState('ended', 'Conversation ended');
  };
  stoppers.add(stop);

  // The primary block answers the dock buttons and questions handed over from other pages.
  const first = (document.querySelector('[data-agent-primary]') || document.querySelector('[data-agent]')) === section;
  document.querySelectorAll('[data-agent-start]').forEach(button => {
    // Buttons inside this block drive it; buttons that name a block (data-agent-for, e.g. the hero orb and
    // the hero's Call button) drive that one in place; other buttons outside any block (the dock) drive the first one.
    const owner = button.closest('[data-agent]');
    const named = button.dataset.agentFor;
    if (named ? named !== section.id : (owner ? owner !== section : !first)) return;
    button.addEventListener('click', () => {
      // "open" shows the card without starting anything: the visitor picks a question, types, or calls from there.
      if (button.dataset.agentStart === 'open') return openIdle();
      start(button.dataset.agentStart);
      // From the dock, bring the conversation itself into view (the panel is open by now), not just its section.
      if (!named && !section.contains(button)) requestAnimationFrame(() => panel.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    });
  });
  // The dock's small orb belongs to the block its buttons drive.
  if (first) document.querySelectorAll('[data-dock] .gorb').forEach(el => orbs.push(el));
  section.querySelectorAll('[data-agent-ask]').forEach(chip => {
    chip.addEventListener('click', () => start('text', chip.textContent));
  });
  listenWhileTyping(input);
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value;
    input.value = '';
    if (!text.trim()) return;
    if (conversation) send(text);
    else start('text', text);
  });
  // Ask boxes elsewhere on the page (the hero) that open this block's conversation.
  if (section.id) {
    document.querySelectorAll(`form[data-agent-launch="${section.id}"]`).forEach(launcher => {
      const field = launcher.querySelector('input');
      if (!field) return;
      listenWhileTyping(field);
      launcher.addEventListener('submit', event => {
        event.preventDefault();
        const text = field.value.trim();
        field.value = '';
        start('text', text);
      });
      // Rotate a few example questions through the placeholder while the box is empty and unfocused.
      const examples = (launcher.dataset.examples || '').split('|').map(item => item.trim()).filter(Boolean);
      if (examples.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let index = 0;
        setInterval(() => {
          if (document.activeElement === field || field.value) return;
          index = (index + 1) % examples.length;
          field.placeholder = examples[index];
        }, 3600);
      }
    });
  }
  // A floating block can be closed: the conversation ends and the card goes away.
  section.querySelector('[data-agent-close]')?.addEventListener('click', async () => {
    await endConversation();
    setState('idle');
    log.replaceChildren(); // closing the card clears it, so it opens fresh next time
    history.length = 0;
    panel.hidden = true;
    section.classList.remove('has-panel');
  });
  endButton?.addEventListener('click', async () => {
    await endConversation();
    setState('ended', 'Conversation ended');
  });
  window.addEventListener('pagehide', () => { conversation?.endSession().catch(() => {}); });

  // Questions handed over from a case study (index.html?ask=…#ask) wait in the box until the visitor sends them.
  const params = new URLSearchParams(window.location.search);
  const handedOver = params.get('ask');
  if (handedOver && input && first) {
    const from = HANDOVER_PAGES[params.get('about')];
    if (from) pageContext = pageNote(...from);
    openPanel();
    setState('idle', 'Ready when you are — press Send to ask');
    input.value = handedOver.slice(0, 500);
    input.focus({ preventScroll: true });
    // The page keeps growing as work cards, fonts and reveals load, which moves the
    // section after the browser's initial jump to #ask. Land on it once things settle.
    const land = () => panel.scrollIntoView({ block: 'center' });
    window.addEventListener('load', () => { land(); setTimeout(land, 600); }, { once: true });
    setTimeout(land, 1200);
  }
}
