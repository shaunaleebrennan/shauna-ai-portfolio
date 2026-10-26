import { readFile, access, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const docs = JSON.parse(await readFile('content/library.json', 'utf8'));
const { work } = JSON.parse(await readFile('content/portfolio.json', 'utf8'));
const files = ['index.html', 'library.html', 'case-study.html', 'playbook.html', 'narrative-design-guide.html', ...docs.map(d => `documents/${d.id}.html`)];
const library = await readFile('library.html', 'utf8');
const tracked = (await import('node:child_process')).execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n');
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; };
check(!(await readdir('.')).includes('workvivo-it-buyer-test'), 'Only the generic IT tool should be published');
check(new Set(docs.map(d => d.id)).size === docs.length, 'Document IDs must be unique');
check(new Set(work.map(d => d.slug)).size === work.length, 'Case slugs must be unique');
for (const doc of docs) {
  check(tracked.includes(doc.source), `Public source must already be tracked: ${doc.source}`);
  check(library.includes(`documents/${doc.id}.html`), `Missing library link: ${doc.id}`);
}
for (const item of work) {
  check(library.includes(`case-study.html?case=${item.slug}`), `Missing case: ${item.slug}`);
  check(item.evidence?.length > 0, `Missing evidence: ${item.slug}`);
}
const links = [];
for (const file of files) {
  const html = await readFile(file, 'utf8');
  check(!/agent-system-prompt|agent-evaluation-set|knowledge\/elevenlabs|private-role-prep/.test(html), `Private link in ${file}`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) links.push([file, match[1].replaceAll('&amp;', '&')]);
}
for (const item of work) for (const e of item.evidence) links.push(['case-study.html', e.url]);
for (const [file, href] of links) {
  check(!href.includes('workvivo-it-buyer-test'), `Company-specific tool link in ${file}`);
  if (/^(https?:|mailto:|data:)/.test(href)) continue;
  const url = new URL(href, `https://local.test/${file}`);
  const target = decodeURIComponent(url.pathname.slice(1));
  await access(target);
  checks++;
  if (target === 'case-study.html' && url.search) check(work.some(x => x.slug === url.searchParams.get('case')), `Unknown case in ${file}: ${href}`);
  if (url.hash) {
    const html = await readFile(target, 'utf8');
    check(html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Broken fragment in ${file}: ${href}`);
  }
}
const generated = await readdir('documents');
check(generated.filter(name => name.endsWith('.html')).length === docs.length, 'Unexpected document output; inspect for stale or private pages');
console.log(`${checks} checks passed: library coverage, local links, fragments, case routes, and public-source allowlist.`);

const manifest = JSON.parse(await readFile('it-pressure-test/source-manifest.json','utf8'));
const {createHash} = await import('node:crypto');
for (const entry of manifest.files) {
  check(createHash('sha256').update(await readFile(`it-pressure-test/${entry.path}`)).digest('hex')===entry.sha256, `Tool runtime differs from manifest: ${entry.path}`);
}
for(const item of work) await access(item.image);
console.log(`Verified ${manifest.files.length} nested tool files and ${work.length} case-study images.`);

// The JSON is canonical: prevent stale GitHub copies after a story edit.
for (const item of work) {
  const markdown = await readFile(`case-studies/${item.slug}.md`, 'utf8');
  for (const value of Object.values(item.caseStudy.overview)) {
    check(markdown.includes(value), `Stale Markdown: ${item.slug}`);
  }
  check(item.caseStudy.story?.length > 0, `Missing story: ${item.slug}`);
  check(new Set(item.caseStudy.story.map(block => block.id)).size === item.caseStudy.story.length, `Duplicate section IDs: ${item.slug}`);
  for (const block of item.caseStudy.story) {
    check(block.title && (block.paragraphs?.length || block.items?.length), `Empty section: ${item.slug}`);
    check(markdown.includes(`## ${block.title}`), `Stale section title: ${item.slug}`);
    for (const text of [...(block.paragraphs || []), ...(block.items || [])]) check(markdown.includes(text), `Stale section copy: ${item.slug}`);
  }
  for (const evidence of item.evidence) {
    check(markdown.includes(evidence.title), `Missing Markdown evidence: ${item.slug}`);
  }
}
const career = await readFile('knowledge/portfolio.md', 'utf8');
const register = await readFile('docs/EVIDENCE_REGISTER.md', 'utf8');
check(career.includes('Acting Head of Product Marketing'), 'Career progression must include approved Acting Head role');
check(!register.includes('do not use Head of Product Marketing'), 'Outdated title restriction');
check(!library.includes('${work.length}'), 'Library description must interpolate case count');
console.log('Case-study source parity and career reconciliation checks passed.');
