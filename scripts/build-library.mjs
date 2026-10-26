import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import { syncSiteHeaders } from './sync-site-header.mjs';
const work = JSON.parse(await readFile('content/portfolio.json', 'utf8')).work;
const docs = JSON.parse(await readFile('content/library.json', 'utf8'));
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const layout = (title, description, body, prefix = '') => `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escape(description)}"><title>${escape(title)} — Shauna Azevedo-Brennan</title><link rel="icon" href="${prefix}assets/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Manrope:wght@500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="${prefix}styles.css"><link rel="stylesheet" href="${prefix}library.css?v=20261024-1"><script src="${prefix}analytics.js" defer></script></head>
<body class="resource-page"><a class="skip-link" href="#main">Skip to content</a><header class="nav shell"><a class="brand" href="${prefix}index.html"><span>SB</span> Shauna Azevedo-Brennan</a><nav aria-label="Main navigation"><a href="${prefix}index.html#explore">Portfolio</a><a href="${prefix}library.html">Library</a><a href="${prefix}assets/Shauna-Azevedo-Brennan-CV.pdf">CV</a></nav></header><main id="main" class="shell">${body}</main><footer class="shell"><div><strong>Shauna Azevedo-Brennan</strong><span>Product Marketing Leader</span></div><a href="${prefix}library.html">Case studies & documents</a><a href="mailto:shaunaleebrennan@gmail.com">Get in touch</a></footer></body></html>\n`;
await mkdir('documents', { recursive: true });
for (const doc of docs) {
  // Explicit allowlist only: never discover or publish Markdown by globbing.
  if (!/^(knowledge|docs)\/[\w-]+\.md$/.test(doc.source)) throw Error(`Invalid public source: ${doc.source}`);
  const source = (await readFile(doc.source, 'utf8')).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const headings = [];
  const used = new Map();
  const renderer = new marked.Renderer();
  renderer.heading = function(token) {
    const base = slug(token.text), count = used.get(base) || 0;
    used.set(base, count + 1);
    const id = count ? `${base}-${count}` : base;
    if (token.depth === 2) headings.push({ id, text: token.text });
    return `<h${token.depth} id="${id}">${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
  };
  renderer.link = function(token) {
    let href = token.href;
    if (!/^(https?:|mailto:|#)/.test(href)) {
      const [file, fragment] = href.split('#');
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(doc.source), file));
      const entry = docs.find(d => d.source === target);
      if (target.startsWith('case-studies/') && target.endsWith('.md')) {
        href = '../case-study.html?case=' + path.posix.basename(target, '.md');
      } else if (target === 'LIBRARY.md') {
        href = '../library.html' + (fragment ? '#' + (fragment === 'supporting-documents' ? 'documents' : fragment) : '');
      } else href = entry ? `${entry.id}.html${fragment ? '#' + fragment : ''}` : '../' + target + (fragment ? '#' + fragment : '');
    }
    if (!/^(https?:|mailto:|#|\.\.\/|[\w-]+\.html)/.test(href)) throw Error(`Unsafe link: ${href}`);
    return `<a href="${escape(href)}">${this.parser.parseInline(token.tokens)}</a>`;
  };
  const rendered = marked.parse(source, { renderer });
  const heading = rendered.match(/<h1[^>]*>[\s\S]*?<\/h1>/)?.[0] || `<h1>${escape(doc.title)}</h1>`;
  const html = rendered.replace(heading, '');
  const toc = headings.map(h => `<a href="#${h.id}">${escape(h.text)}</a>`).join('');
  await writeFile(`documents/${doc.id}.html`, layout(doc.title, doc.summary, `<div class="document-intro"><a href="../library.html#documents">← All supporting documents</a><p class="eyebrow">${escape(doc.category)} · Supporting document</p>${heading}<p>${escape(doc.summary)}</p></div><div class="document-layout"><aside><details class="document-contents"><summary>On this page</summary><nav class="document-toc" aria-label="On this page">${toc}</nav></details><a class="source-link" href="https://github.com/shaunaleebrennan/shauna-ai-portfolio/blob/main/${doc.source}">Markdown source ↗</a></aside><article class="document-copy">${html}<p class="document-end"><a href="../library.html">← Return to the library</a></p></article></div>`, '../'));
}
const caseLink = item => `case-study.html?case=${encodeURIComponent(item.slug)}`;
const card = (item, index) => `<article class="resource-card case-card"><a class="case-card-art" href="${caseLink(item)}" tabindex="-1" aria-hidden="true"><img src="${escape(item.image)}" alt="" loading="lazy" width="800" height="1000"></a><div class="case-card-body"><p class="eyebrow"><span>${String(index + 1).padStart(2, '0')}</span> ${escape(item.tag)}</p><h3><a href="${caseLink(item)}">${escape(item.title)} <span aria-hidden="true">↗</span></a></h3><p>${escape(item.summary)}</p><small>${escape(item.demonstrates)}</small></div></article>`;
const featured = work.find(w => w.slug === 'hq-agent');
const groups = [
  { title: 'Career & strategy', note: 'The experience and thinking behind the work.', categories: ['Career', 'Strategy'] },
  { title: 'Systems & implementation', note: 'Architecture, workflows, and the choices behind the builds.', categories: ['Technical'] },
  { title: 'Evidence & sources', note: 'What is supported, where it comes from, and what remains to add.', categories: ['Evidence'] }
];
await writeFile('library.html', layout('Portfolio library', `Explore ${work.length} case studies and ${docs.length} supporting documents on product marketing, enterprise AI, and leadership.`, `
<header class="library-hero"><div><p class="eyebrow">Portfolio / The work, and what supports it</p><h1>Strategy that ships.<br><em>Evidence you can explore.</em></h1><p>Positioning. Intelligence. AI innovation. Explore the decisions, contributions, and evidence behind my work.</p><nav class="jump-links" aria-label="Library sections"><a href="#case-studies">Case studies ↓</a><a href="#documents">Supporting documents ↓</a><a href="assets/Shauna-Azevedo-Brennan-CV.pdf">View CV ↗</a></nav></div><aside class="library-index"><span>Inside the portfolio</span><p><strong>${String(work.length).padStart(2,'0')}</strong> case studies</p><p><strong>${String(docs.length).padStart(2,'0')}</strong> supporting documents</p><a href="index.html#ask">Ask the portfolio agent ↗</a></aside></header>
<section class="library-feature" aria-labelledby="featured-title"><div class="feature-copy"><p class="eyebrow">Featured work / Enterprise AI</p><h2 id="featured-title">${escape(featured.title)}</h2><p>${escape(featured.caseStudy.overview.eyebrow)}</p><p class="feature-detail">${escape(featured.summary)}</p><a class="button primary" href="${caseLink(featured)}">Explore the case study ↗</a></div><a class="feature-art" href="${caseLink(featured)}" tabindex="-1" aria-hidden="true"><img src="${escape(featured.image)}" alt="" width="800" height="1000"></a></section>
<section class="reading-paths" aria-labelledby="start"><p class="eyebrow">A few ways in</p><h2 id="start">Follow the question that interests you.</h2><div class="path-grid"><article><span>01 / Strategy</span><h3>How do I shape the story?</h3><p>Start with <a href="case-study.html?case=workvivo-hq">Workvivo HQ</a>, then explore <a href="case-study.html?case=meta-migration">the Meta migration</a> and <a href="documents/career.html">career and leadership</a>.</p></article><article><span>02 / Systems</span><h3>How do I make it scale?</h3><p>Explore <a href="case-study.html?case=messaging-as-code">Messaging as Code</a> and <a href="case-study.html?case=market-leadership">analyst relations</a>: turning individual work into reusable programs.</p></article><article><span>03 / Applied AI</span><h3>What have I built?</h3><p>Try the <a href="case-study.html?case=portfolio-voice-agent">Portfolio Voice Agent</a> and explore <a href="case-study.html?case=brazil-in-red">Brazil in Red</a>, then inspect the <a href="documents/voice-agent.html">system overview</a>.</p></article></div></section>
<section id="case-studies" class="library-section"><div class="library-section-head"><div><p class="eyebrow">01 / Selected work</p><h2>Decisions. Delivery. Learning.</h2></div><p>Each story separates the challenge, my contribution, outcomes, and supporting sources.</p></div><div class="resource-grid case-collection">${work.map(card).join('')}</div></section>
<section id="documents" class="library-section"><div class="library-section-head"><div><p class="eyebrow">02 / Go deeper</p><h2>Behind the case studies.</h2></div><p>Career context, strategic frameworks, implementation choices, and source records.</p></div>${groups.map(group => `<div class="document-group"><div><h3>${group.title}</h3><p>${group.note}</p></div><div class="document-list">${docs.filter(d => group.categories.includes(d.category)).map(d => `<article><p class="eyebrow">${escape(d.category)}</p><h3><a href="documents/${d.id}.html">${escape(d.title)} <span aria-hidden="true">↗</span></a></h3><p>${escape(d.summary)}</p></article>`).join('')}</div></div>`).join('')}</section>
<aside class="evidence-note"><p class="eyebrow">Read with context</p><h2>Clear claims. Clear attribution.</h2><p>My role and contribution are professional self-report unless a linked source independently confirms them. Product pages provide company context; company growth and awards are shared outcomes. Supplied decks and research reports are identified where relevant, but are not all available as public downloads.</p><p><a href="documents/evidence-register.html">See claims and sources →</a> · <a href="https://github.com/shaunaleebrennan/shauna-ai-portfolio/blob/main/LIBRARY.md">Browse on GitHub ↗</a></p></aside>`));
console.log(`Built library and ${docs.length} public document pages.`);

// GitHub readers get Markdown; the website keeps its existing HTML routes.
const site = 'https://shaunaleebrennan.github.io/shauna-ai-portfolio/';
const githubTarget = href => {
  const document = docs.find(d => href === `documents/${d.id}.html`);
  if (document) return '../' + document.source;
  if (href.startsWith('case-study.html?case=')) return href.split('=')[1] + '.md';
  if (/^https?:/.test(href)) return href;
  if (href.startsWith('index.html') || href.startsWith('it-pressure-test/')) return site + href;
  return '../' + href;
};
await mkdir('case-studies', { recursive: true });
const visualMarkdown = visual => {
  if (!visual) return '';
  const parts = [`### ${visual.title}`];
  if (visual.steps) parts.push(visual.steps.join(' → '));
  if (visual.type === 'compare') parts.push(`**${visual.beforeLabel}:** ${visual.before}\n\n**${visual.afterLabel}:** ${visual.after}`);
  if (visual.src) parts.push(`![${visual.alt}](${githubTarget(visual.src)})`);
  if (visual.images) parts.push(visual.images.map(image => `![${image.alt}](${githubTarget(image.src)})\n\n${image.caption}`).join('\n\n'));
  if (visual.scope) parts.push(`Project coverage: ${visual.scope.map(entry => `${entry.value} ${entry.label.toLowerCase()}`).join(' · ')}.`);
  if (visual.links) parts.push(visual.links.map(link => `- [${link.title}](${githubTarget(link.url)}) — ${link.note}`).join('\n'));
  if (visual.caption) parts.push(visual.caption);
  if (visual.href) parts.push(`[${visual.linkLabel || 'Explore the project'}](${githubTarget(visual.href)})`);
  return '\n\n' + parts.join('\n\n');
};
for (const item of work) {
  const story = item.caseStudy.overview;
  const body = item.caseStudy.story.map(block => `## ${block.title}\n\n${(block.paragraphs || []).join('\n\n')}${block.aside ? `\n\n**${block.aside.label}:** ${block.aside.text}` : ''}${block.items?.length ? '\n\n' + block.items.map(text => '- ' + text).join('\n') : ''}${visualMarkdown(block.visual)}`).join('\n\n');
  await writeFile(`case-studies/${item.slug}.md`, `# ${item.title}\n\n[← All selected work](../README.md#selected-work)\n\n**${story.eyebrow}**\n\n${story.lead}\n\n${body}${story.learning ? `\n\n> ${story.learning}` : ''}\n\n## Supporting evidence\n\n${item.evidence.map(e => `- **[${e.title}](${githubTarget(e.url)})** — ${e.kind}. ${e.note}`).join('\n')}\n`);
}
await writeFile('LIBRARY.md', `# Case studies and knowledge\n\n[Portfolio overview](README.md) · [View the portfolio website](${site}) · [CV](assets/Shauna-Azevedo-Brennan-CV.pdf)\n\nRead every case study and supporting document here on GitHub. The links below open formatted Markdown. For the designed website experience, visit the [online library](${site}library.html).\n\n## Case studies\n\n${work.map(w => `### [${w.title}](case-studies/${w.slug}.md)\n\n${w.summary}`).join('\n\n')}\n\n## Supporting documents\n\n${docs.map(d => `- **[${d.title}](${d.source})** — ${d.summary}`).join('\n')}\n\n## Reading the evidence\n\nIndividual contributions are professional self-report unless a source independently confirms them. Company awards and growth remain company outcomes. The [evidence inventory](docs/EVIDENCE_INVENTORY.md) distinguishes public artifacts from supplied materials that are not hosted here.\n`);
await writeFile('case-studies/README.md', `# Case studies\n\nRead the complete stories directly on GitHub.\n\n${work.map(w => `- [${w.title}](${w.slug}.md) — ${w.caseStudy.overview.eyebrow}.`).join('\n')}\n\n[All supporting documents](../LIBRARY.md#supporting-documents) · [Portfolio overview](../README.md)\n`);
await writeFile('documents/README.md', `# Looking for the supporting documents?\n\n**[Read the formatted documents on GitHub →](../LIBRARY.md#supporting-documents)**\n\nThe HTML files in this folder power the portfolio website. GitHub displays them as source code. Use the Markdown library above, or [open the styled website pages](${site}library.html#documents).\n`);
console.log(`Built GitHub library and ${work.length} Markdown case studies.`);
await syncSiteHeaders();
