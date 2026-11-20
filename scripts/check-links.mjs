// Checks that every relative link in the repository's pages and Markdown
// points at a file that exists. External links are skipped: they change
// outside this repository and would make the check flaky.
import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const files = execFileSync('git', ['ls-files', '*.html', '*.md'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  // Partials are templates copied into root pages, so their links are checked there.
  .filter(file => !file.startsWith('scripts/') && !file.startsWith('partials/'));

const patterns = [
  /(?:href|src)="([^"]+)"/g,
  /url\(['"]?([^'")]+)['"]?\)/g,
  /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
];
const skip = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/|\$\{|data:)/i;

const broken = [];
let checked = 0;
for (const file of files) {
  let text = await readFile(file, 'utf8');
  // Code samples in Markdown show usage; they are not links on this page.
  if (file.endsWith('.md')) text = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  for (const pattern of patterns) {
    for (const [, raw] of text.matchAll(pattern)) {
      const link = raw.replaceAll('&amp;', '&').trim();
      if (!link || skip.test(link) || link.includes('${')) continue;
      const target = decodeURIComponent(link.split(/[?#]/)[0]);
      if (!target) continue;
      const resolved = path.normalize(path.join(path.dirname(file), target));
      try {
        await access(resolved);
        checked++;
      } catch {
        broken.push(`${file}: ${link}`);
      }
    }
  }
}

if (broken.length) {
  console.error(`${broken.length} broken relative links:\n${broken.join('\n')}`);
  process.exit(1);
}
console.log(`${checked} relative links resolve across ${files.length} pages and Markdown files.`);
