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
    document.title = `${item.title} — Shauna Brennan`;
    document.querySelector('meta[name="description"]').content = story.lead;
    const richText = value => escape(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const section = (id, title, text) => `<section id="${id}" class="case-grid"><h2>${title}</h2><div class="case-copy"><p>${richText(text)}</p></div></section>`;

    root.innerHTML = `
      <article>
        <header class="case-hero case-shell">
          <div class="case-hero-content">
            <div class="case-kicker">${escape(item.tag)}</div>
            <h1 class="case-title">${escape(item.title)}</h1>
            <p class="case-subtitle">${escape(story.eyebrow)}</p>
            <p class="case-intro">${escape(story.lead)}</p>
          </div>
          <figure class="case-visual"><img src="${escape(item.image)}" alt="${escape(item.title)} case study artwork" width="1600" height="2000" fetchpriority="high"></figure>
        </header>
        <div class="case-body case-shell">
          ${section('context', 'What needed to change', story.problem)}
          ${section('contribution', 'My part in it', story.contribution)}
          ${section('outcome', 'What came out of it', story.result)}
          <aside class="case-takeaway"><p>${escape(story.learning)}</p></aside>
          <nav class="case-actions" aria-label="Case study navigation">
            <a href="index.html#explore">← All selected work</a>
            <a class="next-case" href="case-study.html?case=${encodeURIComponent(next.slug)}"><span>Next story</span><strong>${escape(next.title)} →</strong></a>
          </nav>
        </div>
      </article>`;
  }
} catch (error) {
  root.innerHTML = `<section class="case-error case-shell"><div><h1>This story could not load.</h1><p>Please refresh, or <a href="index.html#explore">return to selected work</a>.</p></div></section>`;
}
