// Generates the service worker precache list from the built assets.
// Run after `vite build`:  node ./tools/build-sw.mjs
// Output: public/dhyaana/sw.js (served from the app's own scope)
//
// The cache name is derived from the asset list, so identical inputs produce
// an identical worker. A timestamp would churn the tracked sw.js on every
// build while the cached content had not actually changed.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const outDir = join(root, 'public', 'dhyaana');

const assets = [];
const walk = (dir, prefix = '/dhyaana/') => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = `${prefix}${entry}`;
    if (statSync(full).isDirectory()) walk(full, `${rel}/`);
    else assets.push(rel);
  }
};
walk(outDir);

// Never precache the worker itself, or repo-only files that are not app assets.
const precache = assets
  .filter((a) => !a.endsWith('/sw.js'))
  .filter((a) => !a.endsWith('/.gitattributes'))
  .filter((a) => !a.endsWith('/.gitignore'))
  .sort();

// Hash the asset names and their normalised contents. The names already carry
// a content hash, but normalising line endings keeps the result stable across
// platforms: git checks text out with CRLF on Windows and LF on CI, so a raw
// byte hash would differ for identical content.
const digest = createHash('sha256');
const TEXT = /\.(html|css|js|json|webmanifest|svg)$/;
for (const rel of precache) {
  const file = join(outDir, rel.replace('/dhyaana/', ''));
  digest.update(rel);
  const buf = readFileSync(file);
  if (TEXT.test(rel)) {
    // Collapse every line ending to LF, including mixed endings.
    digest.update(buf.toString('utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n'));
  } else {
    digest.update(buf);
  }
}
const version = digest.digest('hex').slice(0, 12);

const template = readFileSync(join(here, 'dhyaana-sw.template.js'), 'utf8');
const out = template
  .replace('__PRECACHE_MANIFEST__', JSON.stringify(precache, null, 2))
  .replace('__CACHE_VERSION__', version);

writeFileSync(join(outDir, 'sw.js'), out);
console.log(`sw.js written: version=${version}, ${precache.length} assets precached`);
for (const a of precache) console.log('  ' + a);
