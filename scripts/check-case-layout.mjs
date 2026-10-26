import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';

const data = JSON.parse(await readFile('content/portfolio.json', 'utf8'));
const code = await readFile('case-study.js', 'utf8');
const render = new Function('document', 'window', 'fetch', `return (async () => {${code}})()`);
const base = 'https://shaunaleebrennan.github.io/shauna-ai-portfolio/';
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
for (const slug of [...data.work.map(item => item.slug), 'shauna-decoded', 'unknown-case']) {
  const root = { innerHTML: '' }, meta = { content: '' };
  const document = { title: '', querySelector: selector => selector === '#case-study' ? root : meta };
  await render(document, { location: { search: `?case=${slug}`, href: `${base}case-study.html?case=${slug}` } }, async () => ({ ok: true, json: async () => data }));
  const item = data.work.find(item => item.slug === (slug === 'shauna-decoded' ? 'portfolio-voice-agent' : slug));
  if (!item) { assert.match(root.innerHTML, /Case study not found/); continue; }
  const html = root.innerHTML;
  assert.ok(!html.includes('undefined'), `Incomplete rendering: ${slug}`);
  assert.equal((html.match(/class="ds-section ds-section--/g) || []).length, item.caseStudy.story.length);
  for (const block of item.caseStudy.story) {
    assert.ok(html.includes(`href="#${block.id}"`) && html.includes(`id="${block.id}"`), `Broken section navigation: ${slug}`);
    assert.ok(html.includes(escape(block.title)), `Missing heading: ${slug}`);
  }
  assert.ok(html.includes(escape(item.caseStudy.overview.learning)), `Missing closing POV: ${slug}`);
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (value.startsWith('#') || value.startsWith('https:')) continue;
    const path = new URL(value, base).pathname.replace('/shauna-ai-portfolio/', '');
    await access(decodeURIComponent(path));
  }
}
const root = { innerHTML: '' };
await render({ querySelector: () => root }, { location: { search: '?case=brazil-in-red', href: base } }, async () => ({ ok: false }));
assert.match(root.innerHTML, /This story could not load/);
console.log(`Rendered ${data.work.length} layouts, section navigation, assets, closing POVs, alias, missing case, and loading failure.`);
