import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	splitGraphemes,
	countGraphemes,
	normalizeMr,
	isMarathi,
	baseLetter,
	mergeConjuncts,
	fallbackClusters,
} from '../src/lib/games/graphemes.ts';

test('splits conjuncts into rendered aksharas (never broken matras)', () => {
	assert.deepEqual(splitGraphemes('शब्द'), ['श', 'ब्द']);
	assert.deepEqual(splitGraphemes('कक्षा'), ['क', 'क्षा']);
	assert.deepEqual(splitGraphemes('बाई'), ['बा', 'ई']);
	assert.deepEqual(splitGraphemes('नमस्कार'), ['न', 'म', 'स्का', 'र']);
	assert.deepEqual(splitGraphemes('सत्कार'), ['स', 'त्का', 'र']);
	assert.deepEqual(splitGraphemes('घर'), ['घ', 'र']);
	assert.deepEqual(splitGraphemes('क्ष'), ['क्ष']);
});

test('never produces a matra-only or empty tile', () => {
	const extendRe = /^[\u0900-\u0903\u093A-\u094D\u0951-\u0957\u0962\u0963\u200C\u200D]/;
	for (const w of ['शब्द', 'कक्षा', 'बाई', 'नमस्कार', 'पावसाळा', 'सफरचंद', 'व्याकरण', 'ज्ञान']) {
		for (const u of splitGraphemes(w)) {
			assert.ok(u.length > 0, `empty tile in ${w}`);
			assert.ok(!extendRe.test(u), `matra-only tile in ${w}: "${u}"`);
		}
	}
});

test('countGraphemes counts aksharas', () => {
	assert.equal(countGraphemes('शब्द'), 2);
	assert.equal(countGraphemes('बाई'), 2);
	assert.equal(countGraphemes('नमस्कार'), 4);
	assert.equal(countGraphemes('कक्षा'), 2);
	assert.equal(countGraphemes('घर'), 2);
});

test('normalizeMr: NFC + joins ZWJ/ZWNJ variants', () => {
	assert.equal(normalizeMr('नमस्\u200Cकार'), normalizeMr('नमस्कार'));
	assert.equal(normalizeMr('नमस्कार'), 'नमस्कार'.normalize('NFC'));
	assert.equal(normalizeMr('नमस्कार'), normalizeMr(normalizeMr('नमस्कार')));
});

test('isMarathi detects Devanagari', () => {
	assert.equal(isMarathi('शब्द'), true);
	assert.equal(isMarathi('शब्द कसा आहे'), true);
	assert.equal(isMarathi('shabda'), false);
	assert.equal(isMarathi(''), false);
	assert.equal(isMarathi('शब्द?'), false);
});

test('baseLetter strips matras, nukta and anusvara', () => {
	assert.equal(baseLetter('रं'), 'र');
	assert.equal(baseLetter('बा'), 'ब');
	assert.equal(baseLetter('ई'), 'ई');
	assert.equal(baseLetter('क' + '\u093C'), 'क'); // nukta (decomposed) stripped
});

test('fallback clustering matches the segmenter path on common words', () => {
	for (const w of ['शब्द', 'बाई', 'नमस्कार', 'कक्षा', 'पावसाळा', 'सफरचंद', 'व्याकरण', 'ज्ञान', 'मांजर']) {
		assert.deepEqual(
			mergeConjuncts(fallbackClusters(w)),
			splitGraphemes(w),
			`fallback mismatch for ${w}`
		);
	}
});
