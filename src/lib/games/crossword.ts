// Crossword grid + clue validation for curated Marathi puzzles.
// One akshara (grapheme unit) per cell — the same unit definition as Wordle.
// Pure functions (no DOM) — unit-tested directly.

import { splitGraphemes, normalizeMr } from './graphemes.ts';

export type ClueDir = 'across' | 'down';

export type Clue = {
	id: string;
	row: number;
	col: number;
	dir: ClueDir;
	answer: string;
	clue: string;
	clueHi?: string;
	vocabId?: string;
};

export type Puzzle = {
	id: string;
	title: string;
	rows: number;
	cols: number;
	words: Clue[];
};

/** Cells (row/col) occupied by a word, in order. */
export function wordCells(w: Clue): { row: number; col: number }[] {
	const units = splitGraphemes(normalizeMr(w.answer));
	return units.map((_, i) => ({
		row: w.dir === 'across' ? w.row : w.row + i,
		col: w.dir === 'across' ? w.col + i : w.col,
	}));
}

/** The akshara grid for a puzzle (null = unused block). */
export function buildGrid(p: Puzzle): (string | null)[][] {
	const grid: (string | null)[][] = Array.from({ length: p.rows }, () =>
		Array<string | null>(p.cols).fill(null)
	);
	for (const w of p.words) {
		const units = splitGraphemes(normalizeMr(w.answer));
		wordCells(w).forEach((cell, i) => {
			if (cell.row >= 0 && cell.row < p.rows && cell.col >= 0 && cell.col < p.cols) {
				grid[cell.row]![cell.col] = units[i] ?? null;
			}
		});
	}
	return grid;
}

/** Structural validation — returns human-readable errors (empty = valid). */
export function validatePuzzle(p: Puzzle): string[] {
	const errors: string[] = [];

	// bounds + minimum length
	for (const w of p.words) {
		const len = splitGraphemes(normalizeMr(w.answer)).length;
		if (len < 2) errors.push(`${p.id}/${w.id}: word too short (${len} aksharas)`);
		for (const c of wordCells(w)) {
			if (c.row < 0 || c.row >= p.rows || c.col < 0 || c.col >= p.cols) {
				errors.push(`${p.id}/${w.id}: cell out of bounds (${c.row},${c.col})`);
			}
		}
	}

	// cell ownership: same char only across directions, never same-direction overlap
	type Cell = { ch: string; dirs: Set<ClueDir>; owners: Set<string> };
	const cells = new Map<string, Cell>();
	for (const w of p.words) {
		const units = splitGraphemes(normalizeMr(w.answer));
		wordCells(w).forEach((c, i) => {
			const key = c.row + ':' + c.col;
			const cur = cells.get(key);
			if (cur) {
				if (cur.ch !== units[i]) {
					errors.push(`${p.id}: conflicting intersection at ${key} (${cur.ch} vs ${units[i]})`);
				}
				if (cur.dirs.has(w.dir)) {
					errors.push(`${p.id}: same-direction overlap at ${key} (${w.id})`);
				}
				cur.dirs.add(w.dir);
				cur.owners.add(w.id);
			} else {
				cells.set(key, { ch: units[i] ?? '', dirs: new Set([w.dir]), owners: new Set([w.id]) });
			}
		});
	}

	// connectivity: every word must cross at least one perpendicular word
	for (const w of p.words) {
		const crosses = p.words.some(
			(o) =>
				o.id !== w.id &&
				o.dir !== w.dir &&
				wordCells(w).some((c) => cells.get(c.row + ':' + c.col)?.owners.has(o.id))
		);
		if (!crosses) errors.push(`${p.id}/${w.id}: disconnected (crosses no perpendicular word)`);
	}

	return errors;
}
