// Generates the service worker precache list from the built assets.
// Run after `vite build`:  node ./tools/build-sw.mjs
// Output: public/dhyaana/sw.js (served from the app's own scope)
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
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

const template = readFileSync(join(here, 'dhyaana-sw.template.js'), 'utf8');
const version = Date.now().toString(36);
const out = template
  .replace('__PRECACHE_MANIFEST__', JSON.stringify(precache, null, 2))
  .replace('__CACHE_VERSION__', version);

writeFileSync(join(outDir, 'sw.js'), out);
console.log(`sw.js written: version=${version}, ${precache.length} assets precached`);
for (const a of precache) console.log('  ' + a);
