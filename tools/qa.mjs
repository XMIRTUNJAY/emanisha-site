// Content QA gate. Run: npm run qa (also runs in CI before build).
// Fails (exit 1) on: missing fields, duplicate headwords in the same
// category, Devanagari inside English glosses, pluralisation typos in
// templates. Cross-category polysemes and needsReview overrides are
// reported without failing — humans triage them (see REPORT.md).
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vocab = JSON.parse(readFileSync(join(root, 'src', 'data', 'learn', 'vocab.json'), 'utf8'));
const units = JSON.parse(readFileSync(join(root, 'src', 'data', 'learn', 'units.json'), 'utf8'));
const overrides = JSON.parse(readFileSync(join(root, 'src', 'data', 'overrides.json'), 'utf8'));

const fails = [];
const warns = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);

for (const w of vocab) {
  for (const k of ['marathi', 'hindi', 'english', 'transliteration', 'category', 'exampleMarathi', 'exampleHindi', 'exampleEnglish']) {
    if (!w[k] || !String(w[k]).trim()) fail(`missing ${k}: ${w.id}`);
  }
  if (/[\u0900-\u097F]/.test(w.english)) fail(`Devanagari in english gloss: ${w.id} (${w.english.slice(0, 40)})`);
  if (/[A-Za-z]/.test(w.hindi) && !/^[A-Za-z0-9\s.,!?'\-()]+$/.test(w.hindi)) warn(`Latin inside hindi gloss: ${w.id}`);
}

// Same headword + same category + different id = true duplicate.
const seen = new Map();
for (const w of vocab) {
  const key = w.category + '||' + w.marathi.trim();
  if (seen.has(key)) fail(`duplicate headword in ${w.category}: "${w.marathi}" (${seen.get(key)} vs ${w.id})`);
  else seen.set(key, w.id);
}

// Cross-category polysemes are legitimate (उत्तर, बोट) — list only.
const cross = new Map();
for (const w of vocab) {
  const k = w.marathi.trim();
  cross.set(k, [...(cross.get(k) ?? []), `${w.id}(${w.category})`]);
}
for (const [k, ids] of cross) {
  if (ids.length > 1 && new Set(ids.map((s) => s.match(/\((.*)\)/)[1])).size > 1) {
    warn(`cross-category polyseme (OK if meanings differ): "${k}" ${ids.join(', ')}`);
  }
}

// Pluralisation typos in templates ("Units 03", "Unit 01, 02" mishandling).
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = join(d, e.name);
  if (e.isDirectory()) return walk(p);
  return /\.(astro|ts)$/.test(p) ? [p] : [];
});
for (const f of [...walk(join(root, 'src/pages')), ...walk(join(root, 'src/components'))]) {
  const src = readFileSync(f, 'utf8');
  const m = src.match(/Units\s+0\d(?!\s*,)/);
  if (m) fail(`pluralisation typo in ${f}: "${m[0]}" (did you mean singular "Unit"?)`);
}

// Override targets must exist (sync already enforces; double-check here).
for (const id of Object.keys(overrides.vocab ?? {})) {
  if (!vocab.find((w) => w.id === id)) fail(`override target missing: ${id}`);
}
const needsReview = Object.entries(overrides.vocab ?? {}).filter(([, p]) => p.needsReview).map(([id]) => id);

console.log(`qa: ${vocab.length} words, ${units.length} units checked`);
for (const w of warns) console.log(`WARN: ${w}`);
if (needsReview.length) console.log(`needsReview overrides (human required): ${needsReview.join(', ')}`);
if (fails.length) {
  for (const f of fails) console.log(`FAIL: ${f}`);
  process.exit(1);
}
console.log('qa: PASS');
