import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
const work = JSON.parse(await readFile('content/portfolio.json', 'utf8')).work;
const docs = JSON.parse(await readFile('content/library.json', 'utf8'));
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const layout = (title, description, body, prefix = '') => `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escape(description)}"><title>${escape(title)} — Shauna Brennan</title><link rel="icon" href="${prefix}assets/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Manrope:wght@500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="${prefix}styles.css"><link rel="stylesheet" href="${prefix}library.css"><script src="${prefix}analytics.js" defer></script></head>
<body class="resource-page"><a class="skip-link" href="#main">Skip to content</a><header class="nav shell"><a class="brand" href="${prefix}index.html"><span>SB</span> Shauna Brennan</a><nav aria-label="Main navigation"><a href="${prefix}index.html#explore">Portfolio</a><a href="${prefix}library.html">Library</a><a href="${prefix}assets/Shauna-Azevedo-Brennan-CV.pdf">CV</a></nav></header><main id="main" class="shell">${body}</main><footer class="shell"><div><strong>Shauna Brennan</strong><span>Technical Product Marketing Leader</span></div><a href="${prefix}library.html">Case studies & documents</a><a href="mailto:shaunaleebrennan@gmail.com">Get in touch</a></footer></body></html>\n`;
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
      href = entry ? `${entry.id}.html${fragment ? '#' + fragment : ''}` : '../' + target + (fragment ? '#' + fragment : '');
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
const card = item => `<article class="resource-card"><p class="eyebrow">${escape(item.tag)}</p><h3><a href="case-study.html?case=${item.slug}">${escape(item.title)} <span aria-hidden="true">↗</span></a></h3><p>${escape(item.summary)}</p><small>${escape(item.demonstrates)}</small></article>`;
await writeFile('library.html', layout('Case studies & knowledge', 'All seven case studies, public knowledge notes, technical documents, and supporting evidence in one place.', `<header class="library-hero"><p class="eyebrow">The work, and what supports it</p><h1>Case studies<br>& knowledge.</h1><p>Explore the decisions, contributions, and evidence behind my work in product marketing, enterprise AI, and team leadership.</p><nav class="jump-links" aria-label="Library sections"><a href="#case-studies">7 case studies ↓</a><a href="#documents">9 supporting documents ↓</a><a href="assets/Shauna-Azevedo-Brennan-CV.pdf">View CV ↗</a></nav></header><section class="reading-paths" aria-labelledby="start"><h2 id="start">Choose your starting point</h2><div class="resource-grid"><div><h3>Leadership & commercial strategy</h3><p>Start with <a href="documents/career.html">career and leadership</a>, then explore <a href="case-study.html?case=workvivo-hq">Workvivo HQ</a> and <a href="case-study.html?case=meta-migration">the Meta migration</a>.</p></div><div><h3>Technical AI & hands-on building</h3><p>Start with the <a href="case-study.html?case=portfolio-voice-agent">Portfolio Voice Agent</a>, then inspect <a href="https://github.com/shaunaleebrennan/ai-positioning-qa">AI Positioning QA</a> and the <a href="documents/voice-agent.html">system overview</a>.</p></div></div></section><section id="case-studies" class="library-section"><h2>Selected case studies</h2><p>Each story separates the challenge, my contribution, decisions, outcomes, and supporting sources.</p><div class="resource-grid">${work.map(card).join('')}</div></section><section id="documents" class="library-section"><h2>Supporting documents</h2><p>Read the career context, strategic frameworks, implementation choices, and source records behind the case studies.</p><div class="resource-grid">${docs.map(d => `<article class="resource-card"><p class="eyebrow">${escape(d.category)}</p><h3><a href="documents/${d.id}.html">${escape(d.title)} <span aria-hidden="true">↗</span></a></h3><p>${escape(d.summary)}</p></article>`).join('')}</div></section><aside class="evidence-note"><h2>How to read the evidence</h2><p>My role and contribution are professional self-report unless a linked source independently confirms them. Product pages provide company context; company growth and awards are shared outcomes. Supplied decks and research reports are identified where relevant, but are not all available as public downloads.</p><p><a href="documents/evidence-register.html">See claims and sources →</a></p></aside>`));
console.log(`Built library and ${docs.length} public document pages.`);
