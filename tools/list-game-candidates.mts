// One-off candidate lister for game data curation (run: node --experimental-strip-types tools/list-game-candidates.mts).
// Prints candidates per game from the authoritative synced snapshots.
// Curation decisions happen by hand in src/data/games/*.json; this script
// exists for provenance + re-runs after `npm run sync`.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitGraphemes, normalizeMr, baseLetter } from '../src/lib/games/graphemes.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vocab = JSON.parse(readFileSync(join(root, 'src/data/learn/vocab.json'), 'utf8'));
const units = JSON.parse(readFileSync(join(root, 'src/data/learn/units.json'), 'utf8'));

const aksharas = (w) => splitGraphemes(normalizeMr(w.marathi)).length;

// --- Wordle: 3-5 akshara words from high-frequency categories ---
const WORDLE_CATS = ['Greetings', 'Phrases', 'Numbers', 'Food', 'Home', 'Verbs', 'Adjectives', 'Animals', 'Family', 'Colors', 'Time', 'Body', 'Weather', 'Clothing'];
const wordle = vocab.filter((w) => WORDLE_CATS.includes(w.category) && aksharas(w) >= 3 && aksharas(w) <= 5);
console.log('=== WORDLE candidates (3-5 aksharas): ' + wordle.length + ' ===');
const byLen = {};
for (const w of wordle) (byLen[aksharas(w)] ??= []).push(`${w.id} ${w.marathi} (${w.english})`);
for (const len of Object.keys(byLen)) console.log(`\n--- ${len} aksharas (${byLen[len].length}) ---\n` + byLen[len].join('\n'));

// --- Picture Guess: drawable categories ---
const DRAWABLE = ['Food', 'Animals', 'Home', 'Weather', 'Colors', 'Clothing', 'Nature', 'Body'];
const picture = vocab.filter((w) => DRAWABLE.includes(w.category));
console.log('\n\n=== PICTURE candidates: ' + picture.length + ' ===');
console.log(picture.map((w) => `${w.id} ${w.marathi} (${w.english}) [${w.category}]`).join('\n'));

// --- Word Chain: first/last base letters + coverage ---
console.log('\n\n=== CHAIN: first-letter distribution ===');
const firstLetters = new Map();
for (const w of vocab) {
	const u = splitGraphemes(normalizeMr(w.marathi));
	if (!u.length) continue;
	const b = baseLetter(u[0]);
	firstLetters.set(b, (firstLetters.get(b) ?? 0) + 1);
}
console.log([...firstLetters.entries()].sort((a, b) => b[1] - a[1]).map(([b, n]) => `${b}:${n}`).join(' '));
console.log('\n=== CHAIN: last-letter distribution ===');
const lastLetters = new Map();
for (const w of vocab) {
	const u = splitGraphemes(normalizeMr(w.marathi));
	if (!u.length) continue;
	const b = baseLetter(u[u.length - 1]);
	lastLetters.set(b, (lastLetters.get(b) ?? 0) + 1);
}
console.log([...lastLetters.entries()].sort((a, b) => b[1] - a[1]).map(([b, n]) => `${b}:${n}`).join(' '));

// --- Scramble: sentenceBuilder rows with token counts ---
console.log('\n\n=== SCRAMBLE rows (3-8 tokens) ===');
const rows = [];
for (const u of units) {
	u.sentenceBuilder.forEach((b, i) => {
		if (b.answer.length >= 3 && b.answer.length <= 8) rows.push(`${u.unit}:${b.lesson}:${i} (${b.answer.length} tok) ${b.promptEn} | ${b.answer.join(' ')}`);
	});
}
console.log('total: ' + rows.length);
console.log(rows.slice(0, 60).join('\n'));
