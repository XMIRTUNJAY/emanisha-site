// Crawl the built site in dist/ and report every internal link that does not
// resolve to a real file. Catches base-path bugs (links missing the
// /learn-marathi/ prefix) and links to routes that don't exist.
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const BASE = '/learn-marathi';

const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

const exists = new Set();
for (const f of htmlFiles) exists.add('/' + path.relative(DIST, f).replace(/\\/g, '/'));

const assetExists = (urlPath) => {
  const rel = urlPath.replace(BASE, '') || '/';
  const p = path.join(DIST, rel);
  return fs.existsSync(p) || fs.existsSync(path.join(DIST, rel, 'index.html'));
};

const resolvePage = (urlPath) => {
  let p = urlPath;
  if (!p.startsWith('/')) return { ok: true, why: 'externalish' };
  // strip hash/query
  p = p.split('#')[0].split('?')[0];
  if (p === '' ) return { ok: true };
  const withBase = p.startsWith(BASE) ? p : null;
  if (!withBase) return { ok: false, why: 'missing base prefix' + BASE };
  if (exists.has(p) || assetExists(p)) return { ok: true };
  return { ok: false, why: 'no file for ' + p };
};

const bad = new Map();
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const re = /href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    let href = m[1];
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') || href.startsWith('data:')) continue;
    if (!href.startsWith('/')) continue;
    const r = resolvePage(href);
    if (!r.ok) {
      const page = '/' + path.relative(DIST, f).replace(/\\/g, '/');
      const key = href + ' :: ' + r.why;
      if (!bad.has(key)) bad.set(key, new Set());
      bad.get(key).add(page);
    }
  }
}

console.log('scanned', htmlFiles.length, 'html files');
console.log('broken link targets:', bad.size);
for (const [k, pages] of [...bad.entries()].sort()) {
  console.log('\n  ' + k);
  console.log('    on: ' + [...pages].slice(0, 6).join(', ') + (pages.size > 6 ? ` (+${pages.size - 6} more)` : ''));
}
