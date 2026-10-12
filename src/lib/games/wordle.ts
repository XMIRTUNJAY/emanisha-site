// Wordle comparison on akshara units — correct / present / absent with
// Wordle-standard duplicate handling, plus the share-grid renderer.
// Pure functions (no DOM) — unit-tested directly. Callers must ensure the
// guess and answer have the same akshara count before comparing.

import { splitGraphemes, normalizeMr } from './graphemes.ts';

export type TileState = 'correct' | 'present' | 'absent';

export function evaluateGuess(answer: string, guess: string): TileState[] {
	const a = splitGraphemes(normalizeMr(answer));
	const g = splitGraphemes(normalizeMr(guess));
	const states: TileState[] = new Array(g.length).fill('absent');
	const remaining = new Map<string, number>();
	for (let i = 0; i < g.length; i++) {
		const au = a[i] ?? '';
		if (au === g[i]) {
			states[i] = 'correct';
		} else {
			remaining.set(au, (remaining.get(au) ?? 0) + 1);
		}
	}
	for (let i = 0; i < g.length; i++) {
		if (states[i] !== 'absent') continue;
		const n = remaining.get(g[i] ?? '') ?? 0;
		if (n > 0) {
			states[i] = 'present';
			remaining.set(g[i] ?? '', n - 1);
		}
	}
	return states;
}

export function isWin(states: TileState[]): boolean {
	return states.length > 0 && states.every((s) => s === 'correct');
}

/** Emoji share grid (rows only — never the answer or the word). */
export function shareGrid(rows: TileState[][]): string {
	const glyph = { correct: '🟩', present: '🟨', absent: '⬜' };
	return rows.map((r) => r.map((s) => glyph[s]).join('')).join('\n');
}
