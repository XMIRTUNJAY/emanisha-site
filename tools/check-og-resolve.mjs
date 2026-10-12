import fs from 'node:fs';
import path from 'node:path';

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
});
const files = walk('dist').filter((f) => f.endsWith('.html'));
const missing = new Map();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const m = s.match(/property="og:image" content="([^"]+)"/);
  if (!m) continue;
  const url = m[1].replace('https://xmirtunjay.github.io', '');
  const rel = url.replace('/learn-marathi/', '');
  const exists = fs.existsSync(path.join('dist', rel));
  if (!exists) {
    if (!missing.has(url)) missing.set(url, []);
    missing.get(url).push('/' + path.relative('dist', f).split(path.sep).join('/'));
  }
}
console.log('OG images that 404:');
let total = 0;
for (const [u, pages] of [...missing.entries()].sort()) {
  total += pages.length;
  console.log('  ' + u + '   <- ' + pages.length + ' page(s), e.g. ' + pages[0]);
}
console.log('total pages with a 404 og:image:', total, 'of', files.length);
