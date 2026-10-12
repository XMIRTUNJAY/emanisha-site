import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGrid, validatePuzzle, type Puzzle } from '../src/lib/games/crossword.ts';

const valid: Puzzle = {
	id: 't1',
	title: 'Test',
	rows: 3,
	cols: 3,
	words: [
		{ id: 'w1', row: 0, col: 0, dir: 'across', answer: 'कर', clue: 'to do' },
		{ id: 'w2', row: 0, col: 0, dir: 'down', answer: 'कल', clue: 'yesterday / tomorrow' },
	],
};

test('valid puzzle has no errors', () => {
	assert.deepEqual(validatePuzzle(valid), []);
});

test('buildGrid places aksharas at cells', () => {
	const grid = buildGrid(valid);
	assert.deepEqual(grid, [
		['क', 'र', null],
		['ल', null, null],
		[null, null, null],
	]);
});

test('conflicting intersection is rejected', () => {
	const bad: Puzzle = {
		...valid,
		words: [valid.words[0] as Puzzle['words'][number], { ...valid.words[1]!, answer: 'घर' }],
	};
	const errors = validatePuzzle(bad);
	assert.ok(errors.some((e) => e.includes('conflicting')), errors.join('; '));
});

test('same-direction overlap is rejected', () => {
	const bad: Puzzle = {
		...valid,
		words: [
			valid.words[0] as Puzzle['words'][number],
			{ id: 'w3', row: 0, col: 1, dir: 'across', answer: 'रात', clue: 'night' },
		],
	};
	const errors = validatePuzzle(bad);
	assert.ok(errors.some((e) => e.includes('overlap')), errors.join('; '));
});

test('disconnected word is rejected', () => {
	const bad: Puzzle = {
		...valid,
		words: [
			valid.words[0] as Puzzle['words'][number],
			{ id: 'w4', row: 2, col: 0, dir: 'across', answer: 'घर', clue: 'house' },
		],
	};
	const errors = validatePuzzle(bad);
	assert.ok(errors.some((e) => e.includes('disconnected')), errors.join('; '));
});

test('out-of-bounds word is rejected', () => {
	const bad: Puzzle = {
		...valid,
		words: [
			valid.words[0] as Puzzle['words'][number],
			{ id: 'w5', row: 0, col: 2, dir: 'across', answer: 'घर', clue: 'house' },
		],
	};
	const errors = validatePuzzle(bad);
	assert.ok(errors.some((e) => e.includes('bounds')), errors.join('; '));
});

test('single-akshara word is rejected', () => {
	const bad: Puzzle = {
		...valid,
		words: [{ id: 'w6', row: 2, col: 0, dir: 'across', answer: 'र', clue: 'r' }],
	};
	const errors = validatePuzzle(bad);
	assert.ok(errors.some((e) => e.includes('short')), errors.join('; '));
});
