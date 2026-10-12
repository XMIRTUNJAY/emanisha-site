import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canFollow, findContinuations, baseOfFirst, baseOfLast } from '../src/lib/games/chain.ts';

test('base-letter rule: sound matching across vowel signs', () => {
	assert.equal(canFollow('घर', 'रंग'), true); // र → रं (base letter match)
	assert.equal(canFollow('घर', 'रात'), true); // र → रा
	assert.equal(canFollow('घर', 'काम'), false); // र → क, rejected
	assert.equal(canFollow('बाई', 'ईश'), true); // ई → ई
	assert.equal(canFollow('बाई', 'इश'), false); // ई → इ (different base vowels)
});

test('handles empty words', () => {
	assert.equal(canFollow('', 'घर'), false);
	assert.equal(canFollow('घर', ''), false);
});

test('baseOfFirst / baseOfLast', () => {
	assert.equal(baseOfFirst('रंग'), 'र');
	assert.equal(baseOfLast('घर'), 'र');
	assert.equal(baseOfFirst('बाई'), 'ब');
	assert.equal(baseOfLast('बाई'), 'ई');
	assert.equal(baseOfFirst('शब्द'), 'श'); // शब्द = श, ब्द
	assert.equal(baseOfLast('शब्द'), 'ब'); // last rendered akshara is the conjunct ब्द
});

test('findContinuations skips used words and the previous word', () => {
	const dict = ['रंग', 'काम', 'रात', 'घर', 'रोज'];
	const used = new Set(['रंग']);
	assert.deepEqual(findContinuations('घर', dict, used), ['रात', 'रोज']);
});
