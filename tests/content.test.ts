import { test } from 'node:test';
import assert from 'node:assert/strict';
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
const wordle = load('src/data/games/wordle.json');
const picture = load('src/data/games/picture-guess.json');
const chain = load('src/data/games/chain.json');
const scramble = load('src/data/games/scramble.json');
const crossword = load('src/data/games/crossword.json');

const allErrors = [
	...validateWordleData(vocab, wordle),
	...validatePictureData(vocab, picture),
	...validateChainData(vocab, chain),
	...validateScrambleData(units, scramble),
	...validateCrosswordData(vocab, crossword),
];

test('all game data passes the structural validators', () => {
	assert.deepEqual(allErrors, []);
});

test('wordle: 60 daily answers, 3-5 aksharas each', () => {
	assert.equal(wordle.answers.length, 60);
	for (const id of wordle.answers) {
		const w = vocab.find((v) => v.id === id) as VocabLike;
		assert.ok(w, `missing ${id}`);
	}
});

test('picture: 40 items across three levels', () => {
	assert.equal(picture.items.length, 40);
	const levels = new Set(picture.items.map((i) => i.level));
	assert.deepEqual([...levels].sort(), ['challenge', 'easy', 'medium']);
});

test('chain: 100+ dictionary words', () => {
	assert.ok(chain.dictionary.length >= 100, `only ${chain.dictionary.length}`);
});

test('scramble: 18 items referencing real curriculum rows', () => {
	assert.equal(scramble.items.length, 18);
	for (const it of scramble.items) {
		const u = units.find((x: { unit: string }) => x.unit === it.unit);
		assert.ok(u, `missing unit ${it.unit}`);
		const row = u.sentenceBuilder.find(
			(b: { lesson: number; promptEn: string }) => b.lesson === it.lesson && b.promptEn === it.promptEn
		);
		assert.ok(row, `missing row ${it.unit} lesson ${it.lesson}`);
	}
});
