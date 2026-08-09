const content = await fetch('./content/portfolio.json').then(response => response.json());
const slug = new URLSearchParams(window.location.search).get('case');
const index = content.work.findIndex(item => item.slug === slug);
const root = document.querySelector('#case-study');

if (index === -1) {
  root.innerHTML = `<section class="case-error case-shell"><div><h1>Case study not found.</h1><p><a href="index.html#explore">Return to selected work</a></p></div></section>`;
} else {
  const item = content.work[index];
  const study = item.caseStudy;
  const next = content.work[(index + 1) % content.work.length];
  document.title = `${item.title} — Shauna Brennan`;
  document.querySelector('meta[name="description"]').content = item.summary;

  const list = items => `<ul>${items.map(value => `<li>${value}</li>`).join('')}</ul>`;
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

      <figure class="case-visual"><img src="${item.image}" alt="${item.title} case study artwork"></figure>

      <div class="case-body">
        <div class="case-shell">
          <section class="case-grid"><h2>Context</h2><div class="case-copy"><p>${study.context}</p></div></section>
          <section class="case-grid"><h2>The challenge</h2><div class="case-copy"><p>${study.challenge}</p></div></section>
          <section class="case-grid"><h2>Strategic insight</h2><div class="case-copy"><p>${study.insight}</p></div></section>
          <section class="case-grid"><h2>My contribution</h2><div class="case-copy">${list(study.contribution)}</div></section>
          <section class="case-grid"><h2>Key decisions</h2><div class="case-copy">${list(study.decisions)}</div></section>
          <section class="case-grid"><h2>Outcome</h2><div class="case-copy"><p>${study.outcome}</p></div></section>
          <aside class="case-quote"><span>What I learned</span><blockquote>${study.learning}</blockquote></aside>
          <nav class="case-actions" aria-label="Case study navigation">
            ${item.sourceUrl ? `<a class="button primary" href="${item.sourceUrl}" target="_blank" rel="noreferrer">View public evidence <span>↗</span></a>` : '<a href="index.html#explore">← Back to selected work</a>'}
            <a class="next-case" href="case-study.html?case=${next.slug}"><span>Next case study</span><strong>${next.title} →</strong></a>
          </nav>
        </div>
      </div>
    </article>`;
}
