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

// Hash the asset names together with their contents: the names carry the
// content hash already, but hashing sizes too keeps this robust if a name
// ever stops changing with content.
const digest = createHash('sha256');
for (const rel of precache) {
  digest.update(rel);
  digest.update(String(statSync(join(outDir, rel.replace('/dhyaana/', ''))).size));
}
const version = digest.digest('hex').slice(0, 12);

const template = readFileSync(join(here, 'dhyaana-sw.template.js'), 'utf8');
const out = template
  .replace('__PRECACHE_MANIFEST__', JSON.stringify(precache, null, 2))
  .replace('__CACHE_VERSION__', version);

writeFileSync(join(outDir, 'sw.js'), out);
console.log(`sw.js written: version=${version}, ${precache.length} assets precached`);
for (const a of precache) console.log('  ' + a);
