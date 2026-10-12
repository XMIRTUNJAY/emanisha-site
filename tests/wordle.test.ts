import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateGuess, isWin, shareGrid } from '../src/lib/games/wordle.ts';
import { aksharaSortKey } from '../src/lib/games/mrKeys.ts';

test('all-correct guess wins', () => {
	assert.deepEqual(evaluateGuess('शब्द', 'शब्द'), ['correct', 'correct']);
	assert.deepEqual(evaluateGuess('बाई', 'बाई'), ['correct', 'correct']);
	assert.deepEqual(evaluateGuess('नमस्कार', 'नमस्कार'), ['correct', 'correct', 'correct', 'correct']);
});

test('swapped aksharas are both present', () => {
	assert.deepEqual(evaluateGuess('कर', 'रक'), ['present', 'present']);
});

test('duplicate aksharas are not over-marked', () => {
	assert.deepEqual(evaluateGuess('करर', 'ररर'), ['absent', 'correct', 'correct']);
	assert.deepEqual(evaluateGuess('बाबा', 'बारा'), ['correct', 'absent']);
	assert.deepEqual(evaluateGuess('बाबा', 'राबा'), ['absent', 'correct']);
});

test('comparison is joiner-insensitive (NFC)', () => {
	assert.deepEqual(evaluateGuess('नमस्\u200Cकार', 'नमस्कार'), ['correct', 'correct', 'correct', 'correct']);
});

test('isWin', () => {
	assert.equal(isWin(['correct', 'correct']), true);
	assert.equal(isWin(['correct', 'present']), false);
	assert.equal(isWin([]), false);
});

test('shareGrid renders emoji rows without revealing the answer', () => {
	assert.equal(shareGrid([['correct', 'present'], ['absent', 'absent']]), '🟩🟨\n⬜⬜');
	assert.equal(shareGrid([['correct', 'correct', 'correct']]), '🟩🟩🟩');
});

test('aksharaSortKey orders the keyboard like the varnamala', () => {
	// vowels before consonants, both in script order; bare base before matra forms
	const keys = ['का', 'क', 'अ', 'ख', 'आ', 'ग', 'की', 'इ'];
	const sorted = [...keys].sort((a, b) => aksharaSortKey(a) - aksharaSortKey(b));
	assert.deepEqual(sorted, ['अ', 'आ', 'इ', 'क', 'का', 'की', 'ख', 'ग']);
});
