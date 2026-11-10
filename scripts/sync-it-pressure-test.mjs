// Copy the IT Pressure Test runtime from the sibling ai-positioning-qa repository into the portfolio,
// then apply the portfolio adaptation (fonts, brand layer, footer, shared header).
import {copyFile, mkdir, readFile, writeFile, readdir, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const source = '../ai-positioning-qa';
const target = 'it-pressure-test';
const BRAND = '20261110-mob';
const sha = async path => createHash('sha256').update(await readFile(path)).digest('hex');

const scripts = (await readdir(`${source}/docs/assets/js`)).filter(f => f.endsWith('.js'));
const files = ['tool.html', 'manual-review.html', 'favicon.svg', 'assets/styles.css', 'assets/it-buyer.css', ...scripts.map(f => `assets/js/${f}`)];

// Remove runtime scripts that no longer exist in the source.
for (const file of await readdir(`${target}/assets/js`)) {
  if (file.endsWith('.js') && !scripts.includes(file)) await rm(`${target}/assets/js/${file}`);
}

const manifest = {sourceRepository: 'https://github.com/shaunaleebrennan/ai-positioning-qa', sourceCommit: execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(), files: []};
for (const file of files) {
  const dest = file === 'tool.html' ? 'index.html' : file;
  await mkdir(`${target}/${dest.split('/').slice(0, -1).join('/')}`, {recursive: true});
  await copyFile(`${source}/docs/${file}`, `${target}/${dest}`);
  manifest.files.push({source: file, path: dest, sha256: await sha(`${target}/${dest}`), sourceSha256: await sha(`${source}/docs/${file}`)});
}

// Portfolio adaptation: self-hosted brand fonts, the brand layer and the portfolio footer.
const footer = tool => `<footer class="bp-footer"><div class="bp-footer-wrap"><p class="bp-footer-tool">${tool}</p><p class="bp-footer-line">I build with AI, but I market for <span>humans.</span></p><div class="bp-footer-meta"><span><strong>Shauna Azevedo-Brennan</strong> · Product Marketing Leader</span><span class="bp-footer-links"><a href="https://www.linkedin.com/in/shaunalee/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="../assets/Shauna-Azevedo-Brennan-CV.pdf" target="_blank" rel="noreferrer">CV ↓</a><a href="#top">Back to top ↑</a></span></div></div></footer>`;
const tools = {
  'index.html': '<strong>IT Pressure Test</strong> · <a href="https://github.com/shaunaleebrennan/ai-positioning-qa">Source and method ↗</a> · <a href="./manual-review.html">Eight-dimension manual review</a>',
  'manual-review.html': '<strong>AI Positioning QA</strong> · Open-source, evidence-led positioning quality assurance. No accounts, no tracking, no hidden model calls. <a href="./index.html">IT Pressure Test</a>',
};
for (const [page, tool] of Object.entries(tools)) {
  const path = `${target}/${page}`;
  let html = await readFile(path, 'utf8');
  const footers = html.match(/<footer\b[\s\S]*?<\/footer>/g) || [];
  if (footers.length !== 1) throw new Error(`Expected one footer in ${page}`);
  html = html.replace(footers[0], () => footer(tool));
  html = html.replace('</head>', `<link rel="preload" href="../assets/fonts/inter-tight-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="../assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="../fonts.css?v=20261108"><link rel="stylesheet" href="../brand-pages.css?v=${BRAND}"></head>`);
  html = html.replace(/<body([^>]*)>/, (match, attrs) => {
    let next = attrs.includes('class="') ? attrs.replace(/class="([^"]*)"/, 'class="$1 bp bp-it"') : `${attrs} class="bp bp-it"`;
    if (!/\bid="/.test(next)) next = ` id="top"${next}`;
    return `<body${next}>`;
  });
  html = html.replace('</body>', `<script src="../brand-pages.js?v=${BRAND}" defer></script></body>`);
  await writeFile(path, html);
}

await writeFile(`${target}/source-manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
const { syncSiteHeaders } = await import('./sync-site-header.mjs');
await syncSiteHeaders();
console.log(`Synced ${files.length} public runtime files with the portfolio adaptation. No research or private source files copied.`);
