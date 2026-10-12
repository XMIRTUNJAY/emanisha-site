// Prebuild gate for game data (docs/superpowers/specs/2026-10-10-marathi-games-design.md §3.2).
// Loads the authoritative snapshots + game datasets and runs the pure
// validators. A failing dataset blocks the build (same philosophy as
// tools/validate-content.mjs). Run: node --experimental-strip-types tools/validate-games.mts
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	validateWordleData,
	validatePictureData,
	validateChainData,
	validateScrambleData,
	validateCrosswordData,
	type VocabLike,
} from '../src/lib/games/validate.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p: string) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const vocab = load('src/data/learn/vocab.json') as VocabLike[];
const units = load('src/data/learn/units.json');

const errors: string[] = [
	...validateWordleData(vocab, load('src/data/games/wordle.json')),
	...validatePictureData(vocab, load('src/data/games/picture-guess.json')),
	...validateChainData(vocab, load('src/data/games/chain.json')),
	...validateScrambleData(units, load('src/data/games/scramble.json')),
	...validateCrosswordData(vocab, load('src/data/games/crossword.json')),
];

if (errors.length) {
	console.error('game data invalid:\n' + errors.map((e) => '  - ' + e).join('\n'));
	process.exit(1);
}
console.log('game data OK');
