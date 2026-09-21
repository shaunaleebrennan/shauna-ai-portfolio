const root = document.querySelector('#case-study');
try {
const response = await fetch('./content/portfolio.json', { cache: 'no-store' });
if (!response.ok) throw new Error('Portfolio content unavailable');
const content = await response.json();
const requestedSlug = new URLSearchParams(window.location.search).get('case');
const legacySlugs = { 'shauna-decoded': 'portfolio-voice-agent' };
const slug = legacySlugs[requestedSlug] ?? requestedSlug;
const index = content.work.findIndex(item => item.slug === slug);

if (index === -1) {
  root.innerHTML = `<section class="case-error case-shell"><div><h1>Case study not found.</h1><p><a href="index.html#explore">Return to selected work</a></p></div></section>`;
} else {
  const item = content.work[index];
  const study = item.caseStudy;
  const next = content.work[(index + 1) % content.work.length];
  document.title = `${item.title} — Shauna Brennan`;
  document.querySelector('meta[name="description"]').content = item.summary;

  const list = items => `<ul>${items.map(value => `<li>${value}</li>`).join('')}</ul>`;
  const optionalList = (title, items) => items?.length
    ? `<section id="${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="case-grid case-grid--technical"><h2>${title}</h2><div class="case-copy">${list(items)}</div></section>`
    : '';
  root.innerHTML = `
    <article>
      <header class="case-hero case-shell">
        <div class="case-kicker">${item.tag} · Case study 0${index + 1}</div>
        <h1 class="case-title">${item.title}</h1>
        <div class="case-deck">
          <p>${study.eyebrow}</p>
          <div class="case-meta"><div>Focus</div><div>${item.demonstrates.split(',').slice(0, 2).join(' ·')}</div><div>Evidence standard</div><div>Contribution and company outcomes separated</div></div>
        </div>
      </header>

      <section class="case-shell case-overview" aria-label="Case study at a glance"><div><span class="case-kicker">What this demonstrates</span><p>${item.demonstrates}</p></div><div><span class="case-kicker">My contribution</span><p>${study.contribution.slice(0, 3).join('; ')}.</p></div></section>
      <nav class="case-shell case-jumps" aria-label="On this page"><a href="#context">Context</a><a href="#contribution">My contribution</a><a href="#decisions">Key decisions</a>${study.architecture ? '<a href="#system-architecture">System design</a><a href="#evaluation">Evaluation</a>' : ''}<a href="#outcome">Outcome</a><a href="#evidence">Evidence & documents</a></nav>
      <figure class="case-visual"><img src="${item.image}" alt="${item.title} case study artwork"></figure>

      <div class="case-body">
        <div class="case-shell">
          <section id="context" class="case-grid"><h2>Context</h2><div class="case-copy"><p>${study.context}</p></div></section>
          <section id="challenge" class="case-grid"><h2>The challenge</h2><div class="case-copy"><p>${study.challenge}</p></div></section>
          <section id="insight" class="case-grid"><h2>Strategic insight</h2><div class="case-copy"><p>${study.insight}</p></div></section>
          <section id="contribution" class="case-grid"><h2>My contribution</h2><div class="case-copy">${list(study.contribution)}</div></section>
          <section id="decisions" class="case-grid"><h2>Key decisions</h2><div class="case-copy">${list(study.decisions)}</div></section>
          ${optionalList('System architecture', study.architecture)}
          ${optionalList('Tools & implementation', study.tooling)}
          ${optionalList('Reliability & safeguards', study.safeguards)}
          ${optionalList('Evaluation', study.validation)}
          <section id="outcome" class="case-grid"><h2>Outcome</h2><div class="case-copy"><p>${study.outcome}</p></div></section>
          ${study.award ? `<aside class="case-award"><span>External recognition · ${study.award.issuer}</span><div><h2>${study.award.title}</h2><p>${study.award.description}</p><a href="${study.award.url}" target="_blank" rel="noreferrer">Read the Forrester announcement ↗</a></div></aside>` : ''}
          <aside class="case-quote"><span>What I learned</span><blockquote>${study.learning}</blockquote></aside>
          <section id="evidence" class="case-evidence"><h2>Evidence & supporting documents</h2><p>Role and contribution statements are professional self-report unless a source independently confirms them. Company outcomes are shared results.</p><div class="evidence-links">${item.evidence.map(e => `<article><span>${e.kind}</span><h3><a href="${e.url}">${e.title} ↗</a></h3><p>${e.note}</p></article>`).join('')}</div><p><a href="documents/evidence-register.html">Claims and sources</a> · <a href="library.html#documents">All supporting documents</a></p></section>
          <nav class="case-actions" aria-label="Case study navigation">
            <a class="button primary" href="library.html">All case studies & documents</a>
            <a class="next-case" href="case-study.html?case=${next.slug}"><span>Next case study</span><strong>${next.title} →</strong></a>
          </nav>
        </div>
      </div>
    </article>`;
}

} catch (error) {
  root.innerHTML = `<section class="case-error case-shell"><div><h1>This case study could not load.</h1><p>Please refresh, or <a href="library.html">browse the case-study library</a>.</p></div></section>`;
}
