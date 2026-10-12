// Word-chain rule (documented in the spec + game intro):
// the next word's FIRST BASE LETTER must equal the previous word's LAST BASE
// LETTER — the conventional Marathi शब्दसाखळी (word-chain) rule. Matching is
// on the base character of the akshara (matras, nukta and anusvara stripped),
// so घर → रंग and घर → रात both follow, while घर → काम does not.
// Pure functions (no DOM, no storage) — unit-tested directly.

import { splitGraphemes, normalizeMr, baseLetter } from './graphemes.ts';

export function baseOfFirst(word: string): string {
	const units = splitGraphemes(normalizeMr(word));
	return units.length ? baseLetter(units[0] as string) : '';
}

export function baseOfLast(word: string): string {
	const units = splitGraphemes(normalizeMr(word));
	return units.length ? baseLetter(units[units.length - 1] as string) : '';
}

export function canFollow(previous: string, candidate: string): boolean {
	if (!previous || !candidate) return false;
	return baseOfFirst(candidate) === baseOfLast(previous);
}

/** Dictionary words that may follow `previous`, excluding used words (normalized). */
export function findContinuations(
	previous: string,
	dictionary: string[],
	used: Set<string>
): string[] {
	const prevKey = normalizeMr(previous);
	return dictionary.filter((w) => {
		const key = normalizeMr(w);
		return key !== prevKey && !used.has(key) && canFollow(previous, w);
	});
}
