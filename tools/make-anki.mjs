// Builds free Anki-ready TSV decks from synced snapshots (read-only).
// Run: node ./tools/make-anki.mjs
// Output: public/downloads/marathi-top-100.tsv (starter set) and
// public/downloads/marathi-full-1002.tsv (everything).
// Import: Anki → File → Import → tab-separated, fields:
// Marathi | Pronunciation | Hindi | English | Example (Marathi) | Example (English)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vocab = JSON.parse(readFileSync(join(root, 'src', 'data', 'learn', 'vocab.json'), 'utf8'));

const row = (w) => [w.marathi, w.transliteration, w.hindi, w.english, w.exampleMarathi, w.exampleEnglish]
  .map((c) => String(c ?? '').replace(/\t|\n/g, ' ').trim()).join('\t');

const header = '#separator:tab\n#html:false\n#columns: Marathi\tPronunciation\tHindi\tEnglish\tExampleMarathi\tExampleEnglish';

// Starter set: greetings + phrases + numbers first (94), then family to 100.
const starterCats = ['Greetings', 'Phrases', 'Numbers'];
const starter = [
  ...vocab.filter((w) => starterCats.includes(w.category)),
  ...vocab.filter((w) => w.category === 'Family'),
].slice(0, 100);

const outDir = join(root, 'public', 'downloads');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'marathi-top-100.tsv'), header + '\n' + starter.map(row).join('\n') + '\n');
writeFileSync(join(outDir, 'marathi-full-1002.tsv'), header + '\n' + vocab.map(row).join('\n') + '\n');
console.log(`anki: top-100 (${starter.length}) + full (${vocab.length}) → public/downloads/`);
