// On-page conversations with Shauna's ElevenLabs portfolio agent.
// "Start a voice conversation" opens a voice call; "Type a question" and the
// prompt chips open a text chat. The SDK only loads when someone starts a
// conversation. If a session can't start, the standard ElevenLabs widget is
// offered instead so visitors are never left without the agent.
const AGENT_ID = 'agent_4401kzh72h3ff1ev937b4qdg8b7y';
const SDK_SRC = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.35.0/dist/lib.iife.js';
const WIDGET_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

const section = document.querySelector('[data-agent]');
if (section) initAgent(section);

function initAgent(section) {
  const panel = section.querySelector('[data-agent-panel]');
  const statusEl = section.querySelector('[data-agent-status]');
  const log = section.querySelector('[data-agent-log]');
  const form = section.querySelector('[data-agent-form]');
  const input = form?.querySelector('input');
  const endButton = section.querySelector('[data-agent-end]');
  const orb = section.querySelector('[data-agent-orb]');

  let conversation = null;
  let kind = null;
  let starting = false;
  let pulseFrame = 0;
  let level = 0;
  let lastSent = '';
  let sdkPromise = null;

  const setState = (state, text) => {
    section.dataset.state = state;
    if (text) statusEl.textContent = text;
  };
  const addMessage = (who, text) => {
    if (!text) return;
    const line = document.createElement('p');
    line.className = `msg msg--${who}`;
    line.textContent = text;
    log.append(line);
    log.scrollTop = log.scrollHeight;
  };
  const openPanel = () => {
    panel.hidden = false;
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
    orb?.style.setProperty('--vol', '0');
  };
  const pulse = () => {
    if (!conversation || kind !== 'voice') return stopPulse();
    let output = 0;
    let inputLevel = 0;
    try {
      output = conversation.getOutputVolume?.() || 0;
      inputLevel = conversation.getInputVolume?.() || 0;
    } catch { /* volume is cosmetic */ }
    const target = Math.min(1, Math.max(output, inputLevel * 0.6) * 1.6);
    level += (target - level) * 0.25;
    orb?.style.setProperty('--vol', level.toFixed(3));
    pulseFrame = requestAnimationFrame(pulse);
  };

  const showFallback = reason => {
    console.warn('[agent]', reason);
    stopPulse();
    conversation = null;
    kind = null;
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
    const current = conversation;
    conversation = null;
    kind = null;
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
    addMessage('user', message);
    try {
      conversation.sendUserMessage(message);
    } catch (error) {
      showFallback(error);
    }
  };

  const start = async (wanted, firstMessage = '') => {
    openPanel();
    if (starting) return;
    if (conversation && (wanted === kind || wanted === 'text')) {
      if (firstMessage) send(firstMessage);
      if (wanted === 'text') input?.focus();
      return;
    }
    if (conversation) await endConversation();

    starting = true;
    let mode = wanted;
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
      kind = mode;
      conversation = await Conversation.startSession({
        agentId: AGENT_ID,
        ...(mode === 'text' ? { textOnly: true } : { connectionType: 'webrtc' }),
        onConnect: () => {
          setState(mode === 'voice' ? 'listening' : 'ready', mode === 'voice' ? 'Listening — go ahead' : 'Connected — ask away');
        },
        onDisconnect: () => {
          if (!conversation) return;
          conversation = null;
          kind = null;
          stopPulse();
          section.classList.remove('is-live');
          setState('ended', 'Conversation ended');
        },
        onError: message => console.warn('[agent]', message),
        onMessage: payload => {
          const fromUser = payload.role === 'user' || payload.source === 'user';
          if (fromUser && payload.message?.trim() === lastSent) { lastSent = ''; return; }
          addMessage(fromUser ? 'user' : 'agent', payload.message);
        },
        onModeChange: ({ mode: speaking }) => {
          if (kind === 'voice') setState(speaking === 'speaking' ? 'speaking' : 'listening', speaking === 'speaking' ? 'Speaking…' : 'Listening — go ahead');
        }
      });
      section.classList.add('is-live');
      if (section.dataset.state === 'connecting') {
        setState(mode === 'voice' ? 'listening' : 'ready', mode === 'voice' ? 'Listening — go ahead' : 'Connected — ask away');
      }
      if (mode === 'voice') pulse();
      if (firstMessage) send(firstMessage);
      if (mode === 'text') input?.focus();
    } catch (error) {
      showFallback(error);
    } finally {
      starting = false;
    }
  };

  document.querySelectorAll('[data-agent-start]').forEach(button => {
    button.addEventListener('click', () => {
      if (!section.contains(button)) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      start(button.dataset.agentStart);
    });
  });
  section.querySelectorAll('[data-agent-ask]').forEach(chip => {
    chip.addEventListener('click', () => start('text', chip.textContent));
  });
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value;
    input.value = '';
    if (!text.trim()) return;
    if (conversation) send(text);
    else start('text', text);
  });
  endButton?.addEventListener('click', async () => {
    await endConversation();
    setState('ended', 'Conversation ended');
  });
  window.addEventListener('pagehide', () => { conversation?.endSession().catch(() => {}); });

  // Questions handed over from a case study (index.html?ask=…#ask) wait in the box until the visitor sends them.
  const handedOver = new URLSearchParams(window.location.search).get('ask');
  if (handedOver && input) {
    openPanel();
    setState('idle', 'Ready when you are — press Send to ask');
    input.value = handedOver.slice(0, 500);
    input.focus({ preventScroll: true });
  }
}
