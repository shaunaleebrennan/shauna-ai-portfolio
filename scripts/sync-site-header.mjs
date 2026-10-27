import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const template = await readFile(path.join(root, 'partials/site-header.html'), 'utf8');
export const siteHeader = (prefix = '', homepage = false) => template.replaceAll('{{home}}', homepage ? '' : `${prefix}index.html`).replaceAll('{{prefix}}', prefix);

export async function syncSiteHeaders() {
  const docs = JSON.parse(await readFile(path.join(root, 'content/library.json'), 'utf8'));
  const pages = ['index.html', 'case-study.html', 'playbook.html', 'launch-playbook.html', 'playbooks.html', 'narrative-design-guide.html', 'library.html', ...docs.map(doc => `documents/${doc.id}.html`), 'it-pressure-test/index.html', 'it-pressure-test/manual-review.html'];
  for (const file of pages) {
    const location = path.join(root, file);
    const prefix = file.includes('/') ? '../' : '';
    let html = await readFile(location, 'utf8');
    let header = siteHeader(prefix, file === 'index.html').replace('{{playbooksCurrent}}', '');
    const playbookPages = ['playbooks.html', 'playbook.html', 'launch-playbook.html', 'narrative-design-guide.html'];
    if (playbookPages.includes(file)) {
      const links = file === 'playbooks.html'
        ? '<a href="index.html">← Back to portfolio</a>'
        : '<a href="playbooks.html">← All playbooks</a><a href="index.html">Back to portfolio ↗</a>';
      header = header.replace(/<nav class="portfolio-navigation"[\s\S]*?<\/nav>/, `<nav class="portfolio-navigation" aria-label="Primary navigation">${links}</nav>`)
        .replace(/\s*<a class="portfolio-linkedin"[\s\S]*?<\/a>/, '')
        .replace('class="portfolio-header"', 'class="portfolio-header portfolio-header-focused"');
    }
    const existing = /<div class="portfolio-header-band">[\s\S]*?<\/header>\s*<\/div>/;
    const legacy = /<header class="(?:nav[^"\n]*|topbar|site-header)">[\s\S]*?<\/header>/;
    if (!existing.test(html) && !legacy.test(html)) throw new Error(`Missing site header: ${file}`);
    html = html.replace(existing.test(html) ? existing : legacy, () => header);
    html = html.replace(/<link\b[^>]*href="(?:\.\.\/)?site-header\.css[^"\n]*"[^>]*>\s*/g, '');
    html = html.replace('</head>', `<link rel="stylesheet" href="${prefix}site-header.css?v=20261027-nav-final"></head>`);
    if (file === 'it-pressure-test/manual-review.html') html = html.replace('<p class="shell"><a href="./index.html">← IT buyer review</a></p>', '').replace('<main id="main-content">', '<main id="main-content"><p class="shell"><a href="./index.html">← IT buyer review</a></p>');
    await writeFile(location, html);
  }
  // Preserve the imported tool's source hashes and record its portfolio header adaptation.
  const manifestPath = path.join(root, 'it-pressure-test/source-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const entry of manifest.files.filter(entry => ['index.html', 'manual-review.html'].includes(entry.path))) {
    entry.sourceSha256 ??= entry.sha256;
    entry.sha256 = createHash('sha256').update(await readFile(path.join(root, 'it-pressure-test', entry.path))).digest('hex');
    entry.portfolioAdaptation = 'Shared portfolio header and navigation';
  }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Synchronized homepage navigation across ${pages.length} pages.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await syncSiteHeaders();
