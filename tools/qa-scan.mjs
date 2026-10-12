// Content QA scan over synced snapshots (read-only — never edits data).
// Run: node ./tools/qa-scan.mjs
// Findings go to docs/BOL_MARATHI_LANGUAGE_QA.md (triage by a human;
// curriculum fixes belong in bol_marathi/, then `npm run sync`).
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'learn');
const units = JSON.parse(readFileSync(join(dir, 'units.json'), 'utf8'));
const vocab = JSON.parse(readFileSync(join(dir, 'vocab.json'), 'utf8'));

const findings = [];
const add = (id, location, issue, detail) => findings.push({ id, location, issue, detail });

// 1. Empty required vocab fields
for (const w of vocab) {
  for (const k of ['marathi', 'hindi', 'english', 'transliteration', 'category', 'exampleMarathi', 'exampleEnglish']) {
    if (!w[k] || !String(w[k]).trim()) add(`VQ-EMPTY-${w.id}`, `vocab ${w.id}`, `empty ${k}`, JSON.stringify(w).slice(0, 160));
  }
}

// 2. Duplicate Marathi headwords (same script form, different ids)
const seenMr = new Map();
for (const w of vocab) {
  const key = w.marathi.trim();
  if (seenMr.has(key)) add(`VQ-DUP-${w.id}`, `vocab ${w.id}`, 'duplicate marathi headword', `"${key}" also in ${seenMr.get(key)}`);
  else seenMr.set(key, w.id);
}

// 3. Non-Devanagari/Latin characters inside Marathi fields (allows digits, danda, common punctuation)
const mrOk = /^[\u0900-\u097F0-9\s।॥?!.,;:'"“”‘’()\-–—/·•→]+$/;
for (const w of vocab) {
  for (const k of ['marathi', 'exampleMarathi']) {
    const v = String(w[k] ?? '');
    if (v && !mrOk.test(v)) {
      const bad = [...v].filter((c) => !mrOk.test(c));
      add(`VQ-SCRIPT-${w.id}`, `vocab ${w.id}.${k}`, 'unexpected character in Marathi field', `${JSON.stringify([...new Set(bad)])} in ${JSON.stringify(v.slice(0, 80))}`);
    }
  }
}

// 4. Latin script inside Hindi fields (Hindi should be Devanagari; English loans in Latin are flagged for review, not errors)
const hiOk = /^[\u0900-\u097FA-Za-z0-9\s।॥?!.,;:'"“”‘’()\-–—/·•→]+$/;
for (const w of vocab) {
  for (const k of ['hindi', 'exampleHindi']) {
    const v = String(w[k] ?? '');
    if (v && !hiOk.test(v)) add(`VQ-HI-${w.id}`, `vocab ${w.id}.${k}`, 'unexpected character in Hindi field', JSON.stringify(v.slice(0, 80)));
  }
}

// 5. Unit structural checks
for (const u of units) {
  for (const s of ['grammar', 'cultural', 'speaking', 'listening', 'bridge', 'sentenceBuilder']) {
    if (!Array.isArray(u[s]) || u[s].length !== 6) add(`UQ-STRUCT-${u.unit}`, `unit ${u.unit}.${s}`, 'expected 6 rows', String(u[s]?.length));
  }
  if (!u.goals?.length || !u.goalsEn?.length) add(`UQ-GOALS-${u.unit}`, `unit ${u.unit}`, 'missing goals', '');
}

// 6. Duplicate speaking sentences across the whole course
const seenSp = new Map();
for (const u of units) {
  for (const s of u.speaking) {
    const key = s.sentence.trim();
    if (seenSp.has(key)) add('UQ-SPEAK-DUP', `unit ${u.unit} lesson ${s.lesson}`, 'repeated speaking sentence', `"${key}" also in ${seenSp.get(key)}`);
    else seenSp.set(key, `unit ${u.unit} lesson ${s.lesson}`);
  }
}

// 7. Speaking/listening rows missing Hindi or English
for (const u of units) {
  for (const s of [...u.speaking, ...u.listening]) {
    const h = s.hindi ?? s.marathi; // listening uses marathi/hindi keys
    if (!s.english) add('UQ-TRILINGUAL', `unit ${u.unit}`, 'practice row missing english', JSON.stringify(s).slice(0, 120));
  }
}

console.log(`qa-scan: ${vocab.length} words, ${units.length} units → ${findings.length} findings`);
for (const f of findings) console.log(`- [${f.id}] ${f.location}: ${f.issue} ${f.detail}`);
