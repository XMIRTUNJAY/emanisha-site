// Builds src/data/games/chain.json from the authoritative vocab snapshot.
// Filters keep the word chain playable and honest:
//   - Devanagari only
//   - not conjunct-final (शब्द ends in the rendered conjunct ब्द — confusing)
//   - final base letter has ≥1 continuation word in the dictionary
// Re-run after `npm run sync`: node --experimental-strip-types tools/build-chain-dict.mts
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitGraphemes, normalizeMr, baseLetter, isMarathi } from '../src/lib/games/graphemes.ts';
import { isConjunctFinal } from '../src/lib/games/validate.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vocab = JSON.parse(readFileSync(join(root, 'src/data/learn/vocab.json'), 'utf8'));

const usable = vocab.filter((w) => isMarathi(w.marathi) && !isConjunctFinal(w.marathi));

const firstLetters = new Set(usable.map((w) => {
	const u = splitGraphemes(normalizeMr(w.marathi));
	return u.length ? baseLetter(u[0]) : '';
}));

const dictionary = usable
	.filter((w) => {
		const u = splitGraphemes(normalizeMr(w.marathi));
		const last = u.length ? baseLetter(u[u.length - 1]) : '';
		return !!last && firstLetters.has(last);
	})
	.map((w) => w.id);

const rule =
	'The next word must begin with the same base letter as the final akshara of the previous word ' +
	'(matras, nukta and anusvara are ignored — the sound matches: घर → रंग, बाई → ईश). ' +
	'Words come from the Bol Marathi curriculum vocabulary — not every Marathi word.';

const out = { rule, dictionary };
writeFileSync(join(root, 'src/data/games/chain.json'), JSON.stringify(out, null, '\t') + '\n');
console.log(`chain.json: ${dictionary.length} words (from ${vocab.length} vocab entries)`);
