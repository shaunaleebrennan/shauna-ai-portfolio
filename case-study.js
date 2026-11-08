const root = document.querySelector('#case-study');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try {
  const response = await fetch('./content/portfolio.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Portfolio content unavailable');
  const content = await response.json();
  const requestedSlug = new URLSearchParams(window.location.search).get('case');
  const slug = requestedSlug === 'shauna-decoded' ? 'portfolio-voice-agent' : requestedSlug;
  const index = content.work.findIndex(item => item.slug === slug);

  if (index === -1) {
    root.innerHTML = `<section class="case-error case-shell"><div><h1>Case study not found.</h1><p><a href="index.html#explore">Return to selected work</a></p></div></section>`;
  } else {
    const item = content.work[index];
    const story = item.caseStudy.overview;
    const studies = content.work.filter(entry => !entry.href && !entry.stage);
    const studyIndex = studies.findIndex(entry => entry.slug === item.slug);
    const next = studyIndex === -1 ? studies[0] : studies[(studyIndex + 1) % studies.length];
    document.title = `${item.title} — Shauna Azevedo-Brennan`;
    document.querySelector('meta[name="description"]').content = story.lead;
    const richText = value => escape(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const paragraphs = values => (values || []).map(text => `<p>${richText(text)}</p>`).join('');
    const safeUrl = value => {
      const url = new URL(value, window.location.href);
      if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Unsupported project link');
      return escape(value);
    };
    const projectLink = visual => visual.href ? `<a class="ds-visual-link" href="${safeUrl(visual.href)}">${escape(visual.linkLabel || 'Explore the project')} <span aria-hidden="true">↗</span></a>` : '';
    const image = (entry, className = '') => `<img class="${className}" src="${safeUrl(entry.src)}" alt="${escape(entry.alt)}" loading="lazy">`;
    const visual = data => {
      if (!data) return '';
      let body = '';
      if (data.type === 'image') body = image(data, 'ds-evidence-image');
      if (data.type === 'journey') {
        body = `${data.src ? image(data, 'ds-product-image') : ''}<ol class="ds-journey" style="--steps:${data.steps.length}">${data.steps.map((step, index) => `<li><span class="ds-step-number">${String(index + 1).padStart(2, '0')}</span><span>${escape(step)}</span></li>`).join('')}</ol>`;
      }
      if (data.type === 'relationship') body = `<ul class="ds-network">${data.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ul>`;
      if (data.type === 'compare') body = `<div class="ds-comparison"><div><span>${escape(data.beforeLabel)}</span><strong>${escape(data.before)}</strong></div><span class="ds-comparison-arrow" aria-hidden="true">→</span><div><span>${escape(data.afterLabel)}</span><strong>${escape(data.after)}</strong></div></div>`;
      if (data.type === 'gallery') body = `<div class="ds-gallery">${data.images.map(entry => `<figure><a href="${safeUrl(entry.src)}">${image(entry)}</a><figcaption>${escape(entry.caption)}</figcaption></figure>`).join('')}</div>`;
      if (data.type === 'resources') body = `<div class="ds-resources">${data.links.map(entry => `<a href="${safeUrl(entry.url)}"><strong>${escape(entry.title)} <span aria-hidden="true">↗</span></strong><span>${escape(entry.note)}</span></a>`).join('')}</div>`;

      if (data.type === 'statement') body = `<div class="ds-brand-statement"><span>${escape(data.eyebrow)}</span><blockquote>${escape(data.statement)}<em>${escape(data.answer)}</em></blockquote><div class="ds-brand-orbit" aria-hidden="true"><span></span><span></span><span></span></div></div>`;
      if (data.type === 'signals') body = `<div class="ds-signal-list">${data.rows.map(row => `<div class="ds-signal"><div class="ds-signal-top"><strong>${escape(row.value)}<span>%</span></strong><span>${escape(row.label)}</span></div><meter min="0" max="100" value="${Math.max(0,Math.min(100,Number(row.value)||0))}" aria-label="${escape(row.label)}: ${escape(row.value)} percent">${escape(row.value)}%</meter><p>${escape(row.detail)}</p></div>`).join('')}</div>`;
      if (data.type === 'steps') body = `<ol class="ds-story-steps">${data.steps.map((step,i)=>`<li><span class="ds-story-marker">${String(i+1).padStart(2,'0')}</span><div><h4>${escape(step.title)}</h4><p>${escape(step.detail)}</p></div></li>`).join('')}</ol>`;
      if (data.type === 'quote') body = `<figure class="ds-outcome-quote"><span aria-hidden="true">“</span><blockquote>${escape(data.quote)}</blockquote><figcaption>${escape(data.attribution)}</figcaption></figure>`;
      if (data.type === 'messaging-house') body = `<div class="ds-messaging-house"><div class="ds-house-promise"><span>One master narrative</span><strong>${escape(data.promise)}</strong><p>${escape(data.subtitle)}</p></div><div class="ds-house-pillars">${data.pillars.map((pillar,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><h4>${escape(pillar.title)}</h4><p>${escape(pillar.detail)}</p></div>`).join('')}</div><div class="ds-house-audiences"><div class="ds-house-audience-heading"><span>Adapt the message</span><p>One narrative. Different reasons to care.</p></div><div class="ds-persona-grid">${data.personas.map(persona=>`<details><summary><span>${escape(persona.name)}</span><strong>${escape(persona.focus)}</strong><span class="ds-persona-toggle" aria-hidden="true">+</span></summary><p>${escape(persona.detail)}</p></details>`).join('')}</div></div></div>`;
      if (data.type === 'work-modes') body = `<ol class="ds-work-modes">${data.modes.map(mode=>`<li class="${mode.focus ? 'ds-work-mode--focus' : ''}"><div><h4>${escape(mode.title)}</h4><p>${escape(mode.meaning)}</p></div><div class="ds-work-mode-role"><strong>${escape(mode.role)}</strong><p>${escape(mode.examples)}</p></div></li>`).join('')}</ol>`;
      if (data.type === 'example-journey') body = `<div class="ds-employee-example"><div class="ds-employee-scene">${image(data, 'ds-employee-illustration')}<div><span>Illustrative employee need</span><h4>${escape(data.question)}</h4></div></div><ol class="ds-story-steps ds-employee-progression">${data.steps.map((step,i)=>`<li><span class="ds-story-marker">${String(i+1).padStart(2,'0')}</span><div><h4>${escape(step.title)}</h4><p>${escape(step.detail)}</p></div></li>`).join('')}</ol></div>`;
      if (data.type === 'research-system') body = `<div class="ds-research-system"><div class="ds-research-sources">${data.sources.map((source,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><h4>${escape(source.title)}</h4><p>${escape(source.detail)}</p></article>`).join('')}</div><div class="ds-research-synthesis"><span>${escape(data.synthesis)}</span><ul>${data.outputs.map(output=>`<li>${escape(output)}</li>`).join('')}</ul></div></div>`;
      return `<div class="ds-visual ds-visual--${escape(data.type)}"><div class="ds-visual-heading"><h3>${escape(data.title)}</h3></div>${body}${data.caption ? `<p class="ds-visual-caption">${escape(data.caption)}</p>` : ''}${projectLink(data)}</div>`;
    };
    const scope = data => data?.scope ? `<dl class="cx-scope">${data.scope.map(entry => `<div><dt class="lbl">${escape(entry.label)}</dt><dd>${escape(entry.value)}</dd></div>`).join('')}</dl>` : '';
    const pad = n => String(n).padStart(2, '0');
    const cs = item.caseStudy;
    // The last sentence (or the clause after the last comma) carries the highlighter.
    const highlightTail = value => {
      const text = String(value).replace(/^[“"]|[”"]$/g, '');
      const sentences = text.match(/[^.!?]+[.!?]+["”’]?\s*/g);
      if (sentences && sentences.length > 1) {
        const tail = sentences.pop();
        return `${escape(sentences.join(''))}<span class="mk">${escape(tail.trim())}</span>`;
      }
      const comma = text.lastIndexOf(', ');
      if (comma > 0) return `${escape(text.slice(0, comma + 2))}<span class="mk">${escape(text.slice(comma + 2))}</span>`;
      return escape(text);
    };
    const copyText = value => escape(value).replace(/\*\*(.+?)\*\*/g, '<strong class="mk">$1</strong>');
    const copy = values => (values || []).map(text => `<p>${copyText(text)}</p>`).join('');
    const link = data => data.href ? `<a class="cx-link" href="${safeUrl(data.href)}"${/^https?:/.test(data.href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escape(data.linkLabel || 'Explore the project')} <span aria-hidden="true">↗</span></a>` : '';
    const caption = data => data.caption ? `<p class="cx-caption">${escape(data.caption)}</p>` : '';

    const panel = data => {
      if (!data) return '';
      if (data.type === 'research-system') {
        return `<div class="cx-panel cx-loop"><div class="cx-panel-head"><h3>${escape(data.title)}</h3><span class="lbl">${data.sources.length} inputs · 1 synthesis · ${data.outputs.length} outputs</span></div>
          <div class="cx-loop-grid">${data.sources.map((source, i) => `<article><span class="lbl">${pad(i + 1)}</span><h4>${escape(source.title)}</h4><p>${escape(source.detail)}</p></article>`).join('')}</div>
          <span class="cx-loop-line" aria-hidden="true"></span>
          <div class="cx-loop-strip"><span class="lbl">${escape(data.synthesis)} →</span><ul>${data.outputs.map(output => `<li>${escape(output)}</li>`).join('')}</ul></div>
          ${caption(data)}${link(data)}</div>`;
      }
      if (data.type === 'work-modes') {
        return `<div class="cx-panel cx-panel--dark cx-modes"><h3>${escape(data.title)}</h3><ol>${data.modes.map(mode => `<li class="${mode.focus ? 'is-focus' : ''}"><div><h4>${escape(mode.title)}</h4><p>${escape(mode.meaning)}</p></div><div><span class="lbl">${escape(mode.role)}</span><p>${escape(mode.examples)}</p></div></li>`).join('')}</ol>${caption(data)}${link(data)}</div>`;
      }
      if (data.type === 'steps') {
        const variant = data.variant || 'list';
        if (variant === 'layers') {
          return `<div class="cx-layers"><h3>${escape(data.title)}</h3>${data.steps.map((step, i) => `${i ? '<span class="cx-plus" aria-hidden="true">+</span>' : ''}<article class="${i === data.steps.length - 1 ? 'is-last' : ''}"><span class="lbl">Layer ${i + 1}</span><h4>${escape(step.title)}</h4><p>${escape(step.detail)}</p>${i === data.steps.length - 1 ? '<span class="cx-layer-orb gorb" aria-hidden="true"></span>' : ''}</article>`).join('')}${caption(data)}${link(data)}</div>`;
        }
        if (variant === 'path') {
          return `<div class="cx-path"><ol>${data.steps.map((step, i) => `<li class="${i === data.steps.length - 1 ? 'is-last' : ''}"><span class="cx-path-num">${i + 1}</span><h4>${escape(step.title)}</h4><p>${escape(step.detail)}</p></li>`).join('')}</ol>${caption(data)}${link(data)}</div>`;
        }
        return `<div class="cx-list"><h3>${escape(data.title)}</h3><ol>${data.steps.map((step, i) => `<li><span class="cx-list-num">${pad(i + 1)}</span><div><h4>${escape(step.title)}</h4><p>${escape(step.detail)}</p></div></li>`).join('')}</ol>${caption(data)}${link(data)}</div>`;
      }
      const head = (title, extra = '') => `<div class="cx-panel-head"><h3>${escape(title)}</h3>${extra}</div>`;
      if (data.type === 'recognition') return '<div class="cx-recognition" data-recognition></div>';
      if (data.type === 'g2') {
        const row = entry => `<li${entry.rank === 1 ? ' class="is-first"' : ''}><span class="cx-g2-rank">${entry.rank ? `#${entry.rank}<span>/${entry.of}</span>` : '<span>—</span>'}</span><span class="cx-g2-cat">${escape(entry.category)}${entry.new ? ' <em>New</em>' : ''}</span></li>`;
        return `<div class="cx-panel cx-panel--dark cx-g2"><div class="cx-panel-head"><h3>Leader in ${data.leader.length} Grids. New in AI.</h3><span class="lbl">${escape(data.title)}</span></div>
          <div class="cx-g2-grid">
            <div class="cx-g2-col"><div class="cx-g2-badge"><img src="assets/recognition/g2-leader-fall-2026.png" alt="G2 Leader, Fall 2026" loading="lazy"><div><strong>Grid Leader</strong><span>Top-tier market leadership rankings</span></div></div><ol class="cx-g2-list">${data.leader.map(row).join('')}</ol></div>
            <div class="cx-g2-col"><div class="cx-g2-badge"><img src="assets/recognition/g2-high-performer-ai-agents-fall-2026.png" alt="G2 High Performer, AI Agents, Fall 2026" loading="lazy"><div><strong>High Performer</strong><span>New AI categories</span></div></div><ol class="cx-g2-list">${data.highPerformer.map(row).join('')}</ol>
            <div class="cx-g2-sub"><span class="lbl">Also newly listed</span><ol class="cx-g2-list">${data.listings.map(row).join('')}</ol></div>
            <p class="cx-g2-love"><span class="cx-g2-star" aria-hidden="true">★</span><span><strong>Users Love Us</strong> G2 milestone for consistently high satisfaction ratings</span></p></div>
          </div>${caption(data)}</div>`;
      }
      if (data.type === 'signals') {
        const top = Math.max(...data.rows.map(row => Number(row.value) || 0));
        return `<div class="cx-panel cx-panel--dark cx-signals">${head(data.title)}${data.rows.map(row => {
          const value = Math.max(0, Math.min(100, Number(row.value) || 0));
          return `<div class="cx-signal${value === top ? ' is-top' : ''}"><div class="cx-signal-top"><strong>${escape(row.value)}<span>%</span></strong><span class="cx-signal-label">${escape(row.label)}</span></div><div class="cx-signal-bar" role="img" aria-label="${escape(row.label)}: ${escape(row.value)} percent"><span style="width:${value}%"></span></div><p>${escape(row.detail)}</p></div>`;
        }).join('')}${caption(data)}${link(data)}</div>`;
      }
      if (data.type === 'statement') {
        return `<div class="cx-panel cx-panel--dark cx-statement"><span class="lbl">${escape(data.eyebrow)}</span><blockquote>${escape(data.statement)} <em>${escape(data.answer)}</em></blockquote>${caption(data)}${link(data)}</div>`;
      }
      if (data.type === 'quote') {
        return `<figure class="cx-panel cx-panel--dark cx-quote"><span class="lbl">${escape(data.title)}</span><blockquote>“${escape(data.quote)}”</blockquote><figcaption class="lbl">${escape(data.attribution)}</figcaption>${caption(data)}</figure>`;
      }
      if (data.type === 'relationship') {
        return `<div class="cx-flow">${head(data.title)}<ol>${data.steps.map((step, i) => `<li class="${i === data.steps.length - 1 ? 'is-last' : ''}"><span class="lbl">${pad(i + 1)}</span><strong>${escape(step)}</strong></li>`).join('')}</ol>${caption(data)}${link(data)}</div>`;
      }
      if (data.type === 'compare') {
        return `<div class="cx-compare">${head(data.title)}<div class="cx-compare-row"><div class="cx-compare-before"><span class="lbl">${escape(data.beforeLabel)}</span><strong>${escape(data.before)}</strong></div><span class="cx-compare-arrow" aria-hidden="true">→</span><div class="cx-compare-after"><span class="lbl">${escape(data.afterLabel)}</span><strong>${escape(data.after)}</strong></div></div>${caption(data)}${link(data)}</div>`;
      }
      if (data.type === 'journey') {
        return `<div class="cx-panel cx-track">${head(data.title, `<span class="lbl">${data.steps.length} steps</span>`)}${data.src ? `<img class="cx-track-image" src="${safeUrl(data.src)}" alt="${escape(data.alt || '')}" loading="lazy">` : ''}<ol style="--n:${data.steps.length}">${data.steps.map((step, i) => `<li class="${i === data.steps.length - 1 ? 'is-last' : ''}"><span class="cx-track-dot" aria-hidden="true"></span><span class="lbl">${pad(i + 1)}</span><strong>${escape(step)}</strong></li>`).join('')}</ol>${caption(data)}${link(data)}</div>`;
      }
      if (data.type === 'gallery') {
        return `<div class="cx-panel cx-gallery">${head(data.title)}<div class="cx-gallery-grid">${data.images.map(entry => `<figure><a href="${safeUrl(entry.src)}"><img src="${safeUrl(entry.src)}" alt="${escape(entry.alt)}" loading="lazy"></a><figcaption class="lbl">${escape(entry.caption)}</figcaption></figure>`).join('')}</div>${caption(data)}${link(data)}</div>`;
      }
      if (data.type === 'resources') {
        return `<div class="cx-resources">${head(data.title)}${data.links.map((entry, i) => `<a href="${safeUrl(entry.url)}"${/^https?:/.test(entry.url) ? ' target="_blank" rel="noopener noreferrer"' : ''}><span class="lbl">${pad(i + 1)}</span><span><strong>${escape(entry.title)}</strong><span>${escape(entry.note)}</span></span><span class="cx-go" aria-hidden="true">↗</span></a>`).join('')}${caption(data)}</div>`;
      }
      if (data.type === 'image') {
        const img = `<img src="${safeUrl(data.src)}" alt="${escape(data.alt)}" loading="lazy">`;
        return `<figure class="cx-shot">${data.title ? `<span class="lbl">${escape(data.title)}</span>` : ''}${data.href ? `<a href="${safeUrl(data.href)}"${/^https?:/.test(data.href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${img}</a>` : img}${data.caption ? `<figcaption>${escape(data.caption)}</figcaption>` : ''}${link(data)}</figure>`;
      }
      if (data.type === 'messaging-house') {
        return `<div class="cx-panel cx-house">${head(data.title)}<div class="cx-house-roof"><span class="lbl">One master narrative</span><strong>${escape(data.promise)}</strong><p>${escape(data.subtitle)}</p></div><div class="cx-house-pillars">${data.pillars.map((pillar, i) => `<div><span class="lbl">Pillar ${pad(i + 1)}</span><h4>${escape(pillar.title)}</h4><p>${escape(pillar.detail)}</p></div>`).join('')}</div><div class="cx-house-audiences"><div class="cx-house-audience-head"><span class="lbl">Adapt the message</span><span>One narrative. Different reasons to care.</span></div><div class="cx-house-personas">${data.personas.map(persona => `<details><summary><span class="lbl">${escape(persona.name)}</span><strong>${escape(persona.focus)}</strong><span class="cx-plus-toggle" aria-hidden="true">+</span></summary><p>${escape(persona.detail)}</p></details>`).join('')}</div></div>${caption(data)}${link(data)}</div>`;
      }
      return `<div class="cx-panel cx-panel--${escape(data.type)}">${visual(data)}</div>`;
    };

    const label = (block, index) => `<p class="cx-label lbl"><span>${pad(index + 1)}</span> · ${escape(block.label || block.title)}</p>`;
    const twoUp = (block, index, extra = '') => `<div class="cx-two"><div class="cx-two-head">${label(block, index)}<h2 class="cx-h2">${escape(block.title)}</h2></div><div class="cx-copy">${copy(block.paragraphs)}${block.items?.length && block.layout !== 'decisions' ? `<ul class="cx-bullets">${block.items.map(text => `<li>${copyText(text)}</li>`).join('')}</ul>` : ''}${extra}</div></div>`;
    const section = (block, index) => {
      const data = block.visual;
      let body;
      if (data?.type === 'example-journey') {
        const parts = String(data.title).split(/,\s*/);
        const band = parts.map((part, i) => `<span class="${i === parts.length - 1 ? 'is-last' : i ? 'is-mid' : ''}">${escape(part)}${i < parts.length - 1 ? ',' : '.'}</span>`).join(' ');
        body = `<div class="cx-two-head cx-solo">${label(block, index)}<h2 class="cx-h2">${escape(block.title)}</h2></div>
          <div class="cx-band"><div class="wrap"><p class="cx-band-line">${band}</p></div></div>
          <div class="cx-journey"><figure class="cx-journey-scene"><img src="${safeUrl(data.src)}" alt="${escape(data.alt)}" loading="lazy"><figcaption>“${escape(data.question)}”</figcaption></figure>
          <div class="cx-copy">${copy(block.paragraphs)}<ol class="cx-journey-steps">${data.steps.map(step => `<li><span class="lbl">${escape(step.title)}</span><p>${escape(step.detail)}</p></li>`).join('')}</ol></div></div>`;
      } else if (block.layout === 'decisions') {
        body = `${twoUp(block, index)}<div class="cx-options">${(block.items || []).map((text, i, all) => {
          const end = text.indexOf('. ');
          const title = end === -1 ? text : text.slice(0, end + 1);
          const detail = end === -1 ? '' : text.slice(end + 2);
          return `<article class="${block.highlightLast && i === all.length - 1 ? 'is-chosen' : ''}"><span class="lbl">${escape(block.itemLabel || 'Decision')} ${pad(i + 1)}</span><h3>${copyText(title)}</h3>${detail ? `<p>${copyText(detail)}</p>` : ''}</article>`;
        }).join('')}</div>`;
      } else if (block.layout === 'artifact' && data && !(data.type === 'steps' && data.variant === 'path') && data.type !== 'recognition') {
        body = `<div class="cx-artifact"><div class="cx-artifact-copy">${label(block, index)}<h2 class="cx-h2">${escape(block.title)}</h2><div class="cx-copy">${copy(block.paragraphs)}</div>${scope(data)}</div><div class="cx-artifact-visual">${panel(data)}</div></div>`;
      } else {
        body = `${twoUp(block, index)}${block.aside ? `<figure class="cx-question${String(block.aside.text).length > 110 ? ' is-long' : ''}"><p class="lbl">${escape(block.aside.label)}</p><blockquote>“${highlightTail(block.aside.text)}”</blockquote></figure>` : ''}${data ? `<div class="cx-wide">${panel(data)}</div>` : ''}`;
      }
      const film = block.media?.type === 'wistia' && /^[a-z0-9]{10}$/.test(block.media.id) ? `<figure class="ds-film cx-film"><div class="ds-film-heading"><span class="lbl">${escape(block.media.label)}</span><h3>${escape(block.media.title)}</h3></div><div class="ds-film-frame"><iframe src="https://fast.wistia.net/embed/iframe/${escape(block.media.id)}?seo=false&amp;videoFoam=true&amp;autoPlay=false&amp;silentAutoPlay=false" title="${escape(block.media.title)}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><figcaption>${escape(block.media.caption)} <a href="${safeUrl(block.media.source)}" target="_blank" rel="noopener noreferrer">Watch on Workvivo ↗</a></figcaption></figure>` : '';
      return `<section id="${escape(block.id)}" class="ds-section cx-section cx-section--${escape(block.layout || 'text')}${data?.type === 'example-journey' ? ' cx-section--band' : ''}">${body}${film}</section>`;
    };

    const leadSplit = value => {
      const text = String(value).trim();
      const match = text.match(/^(.+?[.!?])\s+(.+)$/s);
      if (text.length <= 150 || !match || match[1].length < 24) return { lead: text, rest: '' };
      return { lead: match[1], rest: match[2] };
    };
    const outcomeParts = String(cs.outcome || '').match(/[^.!?]+[.!?]+\s*/g) || [];
    const outcomeNote = outcomeParts.filter(sentence => /^\s*Shauna\b/.test(sentence)).join('').trim();
    const outcomeMain = outcomeParts.filter(sentence => !/^\s*Shauna\b/.test(sentence)).join('').trim() || cs.outcome;
    const glanceCards = (cs.challenge || cs.insight || cs.outcome)
      ? [['The challenge', cs.challenge], ['The insight', cs.insight], ['The outcome', cs.outcome ? outcomeMain : '', outcomeNote]].filter(entry => entry[1])
      : [['The project', item.summary], ['What it shows', item.demonstrates], ['The proof', item.proof]].filter(entry => entry[1]);
    const glance = glanceCards.length ? `<section class="cx-glance" aria-label="At a glance"><p class="lbl cx-kick">At a glance</p><div class="cx-glance-grid" style="--cards:${glanceCards.length}">${glanceCards.map(([name, text, note], i) => {
      const { lead, rest } = leadSplit(text);
      return `<article class="${i === glanceCards.length - 1 ? 'is-dark' : ''}"><span class="lbl">${name}</span><p class="cx-glance-lead">${escape(lead)}</p>${rest ? `<p class="cx-glance-rest">${escape(rest)}</p>` : ''}${note ? `<small>${escape(note)}</small>` : ''}</article>`;
    }).join('')}</div></section>` : '';
    const did = (cs.contribution?.length || cs.decisions?.length) ? `<section class="cx-did${cs.contribution?.length && cs.decisions?.length ? '' : ' is-single'}">${cs.contribution?.length ? `<div><p class="lbl cx-kick">What I did</p><ul class="cx-did-list">${cs.contribution.map(text => `<li>${escape(text)}</li>`).join('')}</ul></div>` : ''}${cs.decisions?.length ? `<div><p class="lbl cx-kick">Key decisions</p><ol class="cx-decision-list">${cs.decisions.map((text, i) => `<li><span class="lbl">${pad(i + 1)}</span>${escape(text)}</li>`).join('')}</ol></div>` : ''}</section>` : '';
    const learning = story.learning || cs.learning;
    const pov = learning ? `<section class="cx-pov"><p class="lbl cx-kick">The point of view</p><blockquote>“${highlightTail(learning)}”</blockquote><p class="cx-pov-by">Shauna Azevedo-Brennan</p></section>` : '';
    const evidence = item.evidence?.length ? `<section class="cx-evidence"><p class="lbl cx-kick">Evidence</p><div class="cx-evidence-grid">${item.evidence.map(entry => `<a href="${safeUrl(entry.url)}"${/^https?:/.test(entry.url) ? ' target="_blank" rel="noopener noreferrer"' : ''}><span class="lbl">${escape(entry.kind)}</span><strong>${escape(entry.title)} <span aria-hidden="true">↗</span></strong><span>${escape(entry.note)}</span></a>`).join('')}</div></section>` : '';
    const meta = cs.meta?.length ? cs.meta : [{ label: 'Discipline', value: item.tag }, { label: 'Demonstrates', value: item.demonstrates }];
    const askPrompts = item.askPrompts?.length ? item.askPrompts : [`What was the hardest call on ${item.title}?`, `What evidence backs up ${item.title}?`, `What would you do differently on ${item.title}?`];
    const nextLine = next.caseStudy?.overview?.learning || next.caseStudy?.learning || next.caseStudy?.overview?.eyebrow || next.tag;

    root.innerHTML = `
      <article class="cs cx">
        <div class="cs-fold cx-fold">
          <div class="cx-fold-grid" aria-hidden="true"></div>
          <div class="cs-fold-glow" aria-hidden="true"></div>
          <div class="wrap cx-fold-inner">
            ${item.stage ? '<a class="cx-back lbl" href="playbooks.html">← All playbooks</a>' : '<a class="cx-back lbl" href="index.html#explore">← All work</a>'}
            <header class="cx-hero${item.heroImage ? ' cx-hero--wide' : ''}">
              <div class="cx-hero-copy">
                <p class="cx-kicker lbl"><span class="cx-dot" aria-hidden="true"></span>${item.stage ? 'Playbook · In progress' : `Case study · ${escape(item.tag)}`}</p>
                <h1 class="cx-title">${escape(item.title)}</h1>
                <p class="cx-subtitle">${escape(story.eyebrow)}</p>
                <p class="cx-intro">${escape(story.lead)}</p>
                ${item.projectUrl ? `<p class="cx-actions"><a class="cx-btn" href="${escape(item.projectUrl)}" target="_blank" rel="noopener noreferrer">${escape(item.projectLabel || 'Explore the project')} <span aria-hidden="true">↗</span></a></p>` : ''}
                ${item.href ? `<p class="cx-actions"><a class="cx-btn" href="${escape(item.href)}">Explore the playbook <span aria-hidden="true">↗</span></a></p>` : ''}
              </div>
              <figure class="cx-cover" data-cs-parallax><img src="${escape(item.heroImage?.src || item.image)}" alt="${escape(item.heroImage?.alt || `${item.title} case study artwork`)}" width="${escape(item.heroImage?.width || 1600)}" height="${escape(item.heroImage?.height || 2000)}" fetchpriority="high"></figure>
            </header>
            <dl class="cx-meta" style="--cols:${meta.length}">${meta.map(entry => `<div><dt class="lbl">${escape(entry.label)}</dt><dd>${escape(entry.value)}</dd></div>`).join('')}</dl>
          </div>
        </div>
        <div class="cs-sheet cx-sheet">
          <nav class="cx-chapters" aria-label="Case study chapters"><div class="wrap">${cs.story.map((block, i) => `<a href="#${escape(block.id)}"><span class="lbl">${pad(i + 1)}</span> <span class="cx-chap">${escape(block.navLabel || block.title)}</span></a>`).join('')}</div></nav>
          ${item.projectPreview ? `<figure class="case-project-preview wrap"><a href="${escape(item.projectUrl)}" target="_blank" rel="noopener noreferrer"><img src="${escape(item.projectPreview.image)}" alt="${escape(item.projectPreview.alt)}" loading="lazy" width="${escape(item.projectPreview.width || 1248)}" height="${escape(item.projectPreview.height || 824)}"></a><figcaption>${escape(item.projectPreview.caption)}</figcaption></figure>` : ''}
          <div class="wrap cx-body">
            ${glance}
            ${cs.story.map(section).join('')}
            ${did}
            ${pov}
            ${evidence}
          </div>
        </div>
        <section class="cs-close cx-close" aria-label="Keep exploring">
          <div class="wrap cx-close-grid">
            <div class="cx-ask" data-agent data-agent-page="${escape(`${item.title.replace(/^The /, '')} ${item.stage ? 'page (a playbook in progress)' : 'case study'}`)}" data-agent-topic="${escape(item.title)}" data-state="idle">
              <p class="cx-ask-top"><span class="cx-orb gorb" data-agent-orb aria-hidden="true"></span><span class="lbl">Ask my portfolio agent</span></p>
              <h2>Got a question about ${escape(item.title)}? Ask it directly.</h2>
              <div class="cs-prompts">${askPrompts.map(question => `<button class="cs-chip" type="button" data-agent-ask>${escape(question)}</button>`).join('')}</div>
              <div class="cx-ask-actions"><button class="cx-btn" type="button" data-agent-start="voice">Start a voice conversation</button><button class="cx-ghost" type="button" data-agent-start="text">Type a question</button></div>
              <div class="agent-panel" data-agent-panel hidden>
                <div class="agent-head"><span class="agent-dot" aria-hidden="true"></span><strong class="agent-status" data-agent-status role="status">Connecting…</strong><button class="agent-end" type="button" data-agent-end>End</button></div>
                <div class="agent-log" data-agent-log aria-live="polite"></div>
                <form class="agent-form" data-agent-form><label class="sr-only" for="agent-input">Ask a question</label><input id="agent-input" type="text" autocomplete="off" placeholder="Type your question…" maxlength="500"><button type="submit">Send</button></form>
                <p class="agent-note">Conversations run on ElevenLabs. Please don’t share confidential information.</p>
              </div>
            </div>
            <a class="cx-next" href="${escape(next.href || `case-study.html?case=${encodeURIComponent(next.slug)}`)}">
              <span class="cx-next-img"><img src="${escape(next.image)}" alt="" loading="lazy"></span>
              <span class="cx-next-copy"><span class="lbl">Next case study</span><strong>${escape(next.title)}</strong><span class="cx-next-line">${escape(nextLine)}</span><span class="cx-next-go">Read next →</span></span>
            </a>
          </div>
        </section>
      </article>`;
    const recognition = root.querySelector('[data-recognition]');
    if (recognition) {
      fetch('./partials/analyst-recognition.html', { cache: 'no-store' }).then(r => r.ok ? r.text() : '').then(html => { recognition.innerHTML = html; }).catch(() => {});
    }
    enhance();
    document.dispatchEvent(new Event('agent:mount'));
  }
} catch (error) {
  root.innerHTML = `<section class="case-error case-shell"><div><h1>This story could not load.</h1><p>Please refresh, or <a href="index.html#explore">return to selected work</a>.</p></div></section>`;
}

function enhance() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bar = document.querySelector('[data-cs-progress]');
  const visual = document.querySelector('[data-cs-parallax]');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (bar) bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    if (visual && !reduceMotion) visual.style.transform = `translateY(${Math.round(Math.min(window.scrollY, 900) * 0.08)}px)`;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Chapter bar: the current chapter carries the highlighter and stays in view.
  const nav = document.querySelector('.cx-chapters .wrap');
  const links = new Map([...document.querySelectorAll('.cx-chapters a')].map(link => [decodeURIComponent(link.hash.slice(1)), link]));
  const setCurrent = id => {
    links.forEach(link => { link.removeAttribute('aria-current'); link.querySelector('.cx-chap')?.classList.remove('mk'); });
    const link = links.get(id);
    if (!link) return;
    link.setAttribute('aria-current', 'true');
    link.querySelector('.cx-chap')?.classList.add('mk');
    if (nav) nav.scrollTo({ left: Math.max(0, link.offsetLeft - 24), behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  setCurrent(links.keys().next().value);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setCurrent(entry.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    document.querySelectorAll('.cx-section[id]').forEach(section => spy.observe(section));
  }

  if (window.location.hash) {
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }

  const pieces = document.querySelectorAll('.case-project-preview, .cx-glance, .cx-section, .cx-did, .cx-pov, .cx-evidence, .cx-ask, .cx-next');
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  pieces.forEach(piece => piece.classList.add('rv'));
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      reveal.unobserve(entry.target);
    });
  }, { threshold: 0.06 });
  pieces.forEach(piece => reveal.observe(piece));
}
