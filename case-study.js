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
    const next = content.work[(index + 1) % content.work.length];
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
      return `<div class="ds-visual ds-visual--${escape(data.type)}"><div class="ds-visual-heading"><h3>${escape(data.title)}</h3></div>${body}${data.caption ? `<p class="ds-visual-caption">${escape(data.caption)}</p>` : ''}${projectLink(data)}</div>`;
    };
    const scope = data => data?.scope ? `<div class="ds-scope"><span class="ds-scope-label">Project coverage</span><dl>${data.scope.map(entry => `<div><dt>${escape(entry.label)}</dt><dd>${escape(entry.value)}</dd></div>`).join('')}</dl></div>` : '';
    const section = (block, index) => {
      const label = `<div class="ds-section-label"><span>${String(index + 1).padStart(2, '0')}</span><span>${escape(block.label || block.title)}</span></div>`;
      const heading = `<h2>${escape(block.title)}</h2>`;
      let body;
      if (block.layout === 'decisions') {
        body = `<div class="ds-decisions-head">${heading}<div class="ds-copy">${paragraphs(block.paragraphs)}</div></div><div class="ds-decision-grid">${(block.items || []).map((text, i) => {
          const end = text.indexOf('. ');
          const title = end === -1 ? text : text.slice(0, end + 1);
          const detail = end === -1 ? '' : text.slice(end + 2);
          return `<article class="ds-decision"><span class="ds-decision-number">${String(i + 1).padStart(2, '0')}</span><h3>${richText(title)}</h3>${detail ? `<p>${richText(detail)}</p>` : ''}</article>`;
        }).join('')}</div>`;
      } else if (block.layout === 'split') {
        body = `<div class="ds-opening-grid"><div class="ds-copy">${heading}${paragraphs((block.paragraphs || []).slice(0, 1))}</div><div class="ds-secondary">${paragraphs((block.paragraphs || []).slice(1))}${block.aside ? `<aside class="ds-question"><span>${escape(block.aside.label)}</span><p>${richText(block.aside.text)}</p></aside>` : ''}${visual(block.visual)}</div></div>`;
      } else if (block.layout === 'showcase' && block.visual) {
        body = `<div class="ds-decisions-head">${heading}<div class="ds-copy">${paragraphs(block.paragraphs)}</div></div>${visual(block.visual)}`;
      } else if (block.layout === 'artifact' && block.visual) {
        body = `<div class="ds-experience-grid"><div class="ds-copy">${heading}${paragraphs(block.paragraphs)}${scope(block.visual)}</div>${visual(block.visual)}</div>`;
      } else {
        body = `<div class="ds-text-grid">${heading}<div class="ds-copy">${paragraphs(block.paragraphs)}${block.items?.length ? `<ul>${block.items.map(text => `<li>${richText(text)}</li>`).join('')}</ul>` : ''}</div></div>`;
      }
      const film = block.media?.type === 'wistia' && /^[a-z0-9]{10}$/.test(block.media.id) ? `<figure class="ds-film"><div class="ds-film-heading"><span>${escape(block.media.label)}</span><h3>${escape(block.media.title)}</h3></div><div class="ds-film-frame"><iframe src="https://fast.wistia.net/embed/iframe/${escape(block.media.id)}?seo=false&amp;videoFoam=true&amp;autoPlay=false&amp;silentAutoPlay=false" title="${escape(block.media.title)}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><figcaption>${escape(block.media.caption)} <a href="${safeUrl(block.media.source)}" target="_blank" rel="noopener noreferrer">Watch on Workvivo ↗</a></figcaption></figure>` : '';
      return `<section id="${escape(block.id)}" class="ds-section ds-section--${escape(block.layout || 'text')}">${label}${body}${film}</section>`;
    };

    root.innerHTML = `
      <article>
        <header class="case-hero case-shell${item.heroImage ? ' case-hero--wide-art' : ''}">
          <div class="case-hero-content">
            <div class="case-kicker">${escape(item.tag)}</div>
            <h1 class="case-title">${escape(item.title)}</h1>
            <p class="case-subtitle">${escape(story.eyebrow)}</p>
            <p class="case-intro">${escape(story.lead)}</p>
            ${item.projectUrl ? `<div class="pb-case-link"><a class="button primary" href="${escape(item.projectUrl)}" target="_blank" rel="noopener noreferrer">${escape(item.projectLabel || 'Explore the project')} <span aria-hidden="true">↗</span></a></div>` : ''}
            ${item.href ? `<div class="pb-case-link"><a class="button primary" href="${escape(item.href)}">Explore the playbook <span aria-hidden="true">↗</span></a></div>` : ''}
          </div>
          <figure class="case-visual"><img src="${escape(item.heroImage?.src || item.image)}" alt="${escape(item.heroImage?.alt || `${item.title} case study artwork`)}" width="${escape(item.heroImage?.width || 1600)}" height="${escape(item.heroImage?.height || 2000)}" fetchpriority="high"></figure>
        </header>
        ${item.projectPreview ? `<figure class="case-project-preview case-shell"><a href="${escape(item.projectUrl)}" target="_blank" rel="noopener noreferrer"><img src="${escape(item.projectPreview.image)}" alt="${escape(item.projectPreview.alt)}" loading="lazy" width="${escape(item.projectPreview.width || 1248)}" height="${escape(item.projectPreview.height || 824)}"></a><figcaption>${escape(item.projectPreview.caption)}</figcaption></figure>` : ''}
        <div class="ds-body case-shell">
          <nav class="ds-index" aria-label="Case study sections">${item.caseStudy.story.map((block, index) => `<a href="#${escape(block.id)}"><span>${String(index + 1).padStart(2, '0')}</span>${escape(block.navLabel || block.title)}</a>`).join('')}</nav>
          ${item.caseStudy.story.map(section).join('')}
          ${story.learning ? `<aside class="ds-pov"><span class="ds-pov-label">My point of view</span><blockquote>“${escape(story.learning.replace(/^[“"]|[”"]$/g, ''))}”</blockquote><p class="ds-pov-signature">Shauna Azevedo-Brennan</p></aside>` : ''}
          <nav class="case-actions" aria-label="Case study navigation">
            <a href="index.html#explore">← All selected work</a>
            <a class="next-case" href="${escape(next.href || `case-study.html?case=${encodeURIComponent(next.slug)}`)}"><span>Next story</span><strong>${escape(next.title)} →</strong></a>
          </nav>
        </div>
      </article>`;
  }
} catch (error) {
  root.innerHTML = `<section class="case-error case-shell"><div><h1>This story could not load.</h1><p>Please refresh, or <a href="index.html#explore">return to selected work</a>.</p></div></section>`;
}
