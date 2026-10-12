// Structural validators for game data (docs/superpowers/specs/2026-10-10-marathi-games-design.md §3.2).
// Pure functions — take the resolved vocab + one game dataset, return
// human-readable errors (empty array = valid). Real-data minimums (list
// sizes) are asserted in tests/content.test.ts; these validators stay
// structural so they can be unit-tested with small fixtures.

import { countGraphemes, normalizeMr, splitGraphemes, baseLetter } from './graphemes.ts';
import { validatePuzzle, type Puzzle } from './crossword.ts';

export type VocabLike = {
	id: string;
	marathi: string;
	hindi: string;
	english: string;
	transliteration: string;
	category: string;
	exampleMarathi: string;
	exampleHindi: string;
	exampleEnglish: string;
};

/** True when a word's final rendered akshara is a conjunct (e.g. शब्द → ब्द). */
export function isConjunctFinal(word: string): boolean {
	const units = splitGraphemes(normalizeMr(word));
	const last = units[units.length - 1];
	return !!last && /[\u094D]/.test(last);
}

export function validateWordleData(
	vocab: VocabLike[],
	data: { version: number; answers: string[]; practicePool: string[] }
): string[] {
	const errors: string[] = [];
	if (!Number.isInteger(data.version) || data.version < 1) {
		errors.push('wordle: version must be a positive integer');
	}
	const byId = new Map(vocab.map((v) => [v.id, v]));
	for (const id of [...data.answers, ...data.practicePool]) {
		const w = byId.get(id);
		if (!w) {
			errors.push(`wordle: unknown vocab id "${id}"`);
			continue;
		}
		const n = countGraphemes(w.marathi);
		if (n < 3 || n > 5) {
			errors.push(`wordle: "${id}" has ${n} aksharas (need 3-5): ${w.marathi}`);
		}
	}
	if (new Set(data.answers).size !== data.answers.length) {
		errors.push('wordle: duplicate ids in answers');
	}
	return errors;
}

export function validatePictureData(
	vocab: VocabLike[],
	data: { items: { id: string; level: string; svg: string }[] }
): string[] {
	const errors: string[] = [];
	const byId = new Map(vocab.map((v) => [v.id, v]));
	const LEVELS = ['easy', 'medium', 'challenge'];
	for (const it of data.items) {
		if (!byId.has(it.id)) errors.push(`picture: unknown vocab id "${it.id}"`);
		if (!LEVELS.includes(it.level)) errors.push(`picture: bad level "${it.level}" (${it.id})`);
		if (!/^[a-z0-9-]+\.svg$/.test(it.svg)) errors.push(`picture: bad svg filename "${it.svg}" (${it.id})`);
	}
	// Ambiguity guard: a picture must point at exactly one vocab entry — the
	// same English gloss twice means the drawing could match either answer.
	const seenEn = new Map<string, number>();
	for (const it of data.items) {
		const w = byId.get(it.id);
		if (!w) continue;
		seenEn.set(w.english, (seenEn.get(w.english) ?? 0) + 1);
	}
	for (const [en, n] of seenEn) {
		if (n > 1) errors.push(`picture: ambiguous English gloss "${en}" appears in ${n} items`);
	}
	return errors;
}

export function validateChainData(
	vocab: VocabLike[],
	data: { dictionary: string[] }
): string[] {
	const errors: string[] = [];
	const byId = new Map(vocab.map((v) => [v.id, v]));
	const words = data.dictionary
		.map((id) => {
			const w = byId.get(id);
			if (!w) errors.push(`chain: unknown vocab id "${id}"`);
			return w;
		})
		.filter(Boolean) as VocabLike[];

	// first base letters available in the dictionary
	const firstLetters = new Set<string>();
	for (const w of words) {
		const units = splitGraphemes(normalizeMr(w.marathi));
		if (units.length) firstLetters.add(baseLetter(units[0] as string));
	}
	// coverage: every word's final base letter must have ≥1 continuation
	for (const w of words) {
		const units = splitGraphemes(normalizeMr(w.marathi));
		const last = units.length ? baseLetter(units[units.length - 1] as string) : '';
		if (last && !firstLetters.has(last)) {
			errors.push(`chain: dead end — no dictionary word starts with "${last}" (needed by ${w.id} ${w.marathi})`);
		}
	}
	// conjunct-final words (e.g. शब्द ends in the rendered conjunct ब्द) would
	// make the base-letter rule confusing for learners — keep them out.
	for (const w of words) {
		if (isConjunctFinal(w.marathi)) {
			errors.push(`chain: conjunct-final word should not be in the dictionary: ${w.id} ${w.marathi}`);
		}
	}
	if (new Set(data.dictionary).size !== data.dictionary.length) {
		errors.push('chain: duplicate ids');
	}
	return errors;
}

type UnitLike = {
	unit: string;
	sentenceBuilder: { lesson: number; promptEn: string; tokens: string[]; answer: string[]; hindi: string; hindiEn: string }[];
};

export function validateScrambleData(
	units: UnitLike[],
	data: { items: { unit: string; lesson: number; promptEn: string; alternates: string[][] }[] }
): string[] {
	const errors: string[] = [];
	const rows = new Map<string, { tokens: string[]; answer: string[] }>();
	for (const u of units) {
		for (const b of u.sentenceBuilder) {
			rows.set(`${u.unit}:${b.lesson}:${b.promptEn}`, b);
		}
	}
	const sortKey = (x: string[]) => [...x].sort().join('|');
	for (const it of data.items) {
		const row = rows.get(`${it.unit}:${it.lesson}:${it.promptEn}`);
		if (!row) {
			errors.push(`scramble: no sentenceBuilder row for unit ${it.unit} lesson ${it.lesson} "${it.promptEn.slice(0, 40)}"`);
			continue;
		}
		if (row.answer.length < 3) {
			errors.push(`scramble: too few tokens (${row.answer.length}) for unit ${it.unit} lesson ${it.lesson}`);
		}
		for (const alt of it.alternates) {
			if (sortKey(alt) !== sortKey(row.answer)) {
				errors.push(`scramble: alternate is not a permutation of the answer (unit ${it.unit} lesson ${it.lesson})`);
			} else if (alt.join('|') === row.answer.join('|')) {
				errors.push(`scramble: alternate equals canonical answer (unit ${it.unit} lesson ${it.lesson})`);
			}
		}
	}
	return errors;
}

export function validateCrosswordData(vocab: VocabLike[], data: { puzzles: Puzzle[] }): string[] {
	const errors: string[] = [];
	const byMr = new Map(vocab.map((v) => [normalizeMr(v.marathi), v]));
	for (const p of data.puzzles) {
		for (const e of validatePuzzle(p)) errors.push(e);
		for (const w of p.words) {
			if (!byMr.has(normalizeMr(w.answer))) {
				errors.push(`crossword: "${w.answer}" (${p.id}/${w.id}) is not a vocab word`);
			}
			if (!w.clue || !w.clue.trim()) {
				errors.push(`crossword: missing clue for ${p.id}/${w.id}`);
			}
		}
	}
	return errors;
}
