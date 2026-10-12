import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	validateWordleData,
	validatePictureData,
	validateChainData,
	validateScrambleData,
	validateCrosswordData,
	type VocabLike,
} from '../src/lib/games/validate.ts';

const vocab: VocabLike[] = [
	{
		id: 'v-food-01', marathi: 'पाणी', hindi: 'पानी', english: 'water', transliteration: 'pāṇī',
		category: 'Food', exampleMarathi: 'मला पाणी पाहिजे.', exampleHindi: 'मुझे पानी चाहिए।', exampleEnglish: 'I want water.',
	},
	{
		id: 'v-ani-01', marathi: 'कुत्रा', hindi: 'कुत्ता', english: 'dog', transliteration: 'kutrā',
		category: 'Animals', exampleMarathi: 'कुत्रा शांत आहे.', exampleHindi: 'कुत्ता शांत है।', exampleEnglish: 'The dog is calm.',
	},
	{
		id: 'v-home-01', marathi: 'घर', hindi: 'घर', english: 'house', transliteration: 'ghar',
		category: 'Home', exampleMarathi: 'घर मोठं आहे.', exampleHindi: 'घर बड़ा है।', exampleEnglish: 'The house is big.',
	},
	{
		id: 'v-greet-01', marathi: 'नमस्कार', hindi: 'नमस्कार', english: 'hello (respectful greeting)', transliteration: 'namaskār',
		category: 'Greetings', exampleMarathi: 'नमस्कार, तुम्ही कसे आहात?', exampleHindi: 'नमस्कार, आप कैसे हैं?', exampleEnglish: 'Hello, how are you?',
	},
];

test('wordle: rejects unknown ids, wrong lengths, duplicates', () => {
	const errors = validateWordleData(vocab, { version: 1, answers: ['v-nope', 'v-food-01', 'v-food-01'], practicePool: ['v-greet-01'] });
	assert.ok(errors.some((e) => e.includes('unknown vocab id "v-nope"')));
	assert.ok(errors.some((e) => e.includes('duplicate')));
	assert.ok(!errors.some((e) => e.includes('aksharas') && e.includes('v-greet-01')));
});

test('wordle: rejects words outside 3-5 aksharas', () => {
	const errors = validateWordleData(vocab, { version: 1, answers: ['v-home-01'], practicePool: [] });
	assert.ok(errors.some((e) => e.includes('has 2 aksharas')), errors.join('; '));
});

test('picture: rejects unknown ids, bad level, bad filename, duplicates', () => {
	const errors = validatePictureData(vocab, {
		items: [
			{ id: 'v-food-01', level: 'easy', svg: 'pani.svg' },
			{ id: 'v-food-01', level: 'hard', svg: 'pani.svg' },
			{ id: 'v-ani-01', level: 'easy', svg: 'KUTRA.svg' },
		],
	});
	assert.ok(errors.some((e) => e.includes('ambiguous English gloss')));
	assert.ok(errors.some((e) => e.includes('bad level "hard"')));
	assert.ok(errors.some((e) => e.includes('bad svg filename "KUTRA.svg"')));
});

test('chain: rejects dead ends, thin dictionaries and conjunct finals', () => {
	const errors = validateChainData(vocab, { dictionary: ['v-food-01', 'v-ani-01', 'v-home-01'] });
	assert.ok(errors.some((e) => e.includes('dead end')), errors.join('; '));
	// शब्द ends in the rendered conjunct ब्द — excluded from the chain dictionary
	const withShabda: VocabLike[] = [
		{ ...vocab[0]!, id: 'v-sh', marathi: 'शब्द' },
		{ ...vocab[0]!, id: 'v-शb', marathi: 'बाई' },
		{ ...vocab[0]!, id: 'v-ई', marathi: 'ईश' },
	];
	const errors2 = validateChainData(withShabda, { dictionary: ['v-sh', 'v-शb', 'v-ई'] });
	assert.ok(errors2.some((e) => e.includes('conjunct-final')), errors2.join('; '));
});

test('chain: accepts a covered dictionary', () => {
	// घर→र, रक→क, कल→ल, लत→त, तल→ल — every final base letter has a continuation.
	const cover: VocabLike[] = [
		{ ...vocab[0]!, id: 'v-a', marathi: 'घर' },
		{ ...vocab[0]!, id: 'v-b', marathi: 'रक' },
		{ ...vocab[0]!, id: 'v-c', marathi: 'कल' },
		{ ...vocab[0]!, id: 'v-d', marathi: 'लत' },
		{ ...vocab[0]!, id: 'v-e', marathi: 'तल' },
	];
	const errors = validateChainData(cover, { dictionary: ['v-a', 'v-b', 'v-c', 'v-d', 'v-e'] });
	assert.deepEqual(errors, []);
});

test('scramble: rejects unknown rows, bad alternates, thin list', () => {
	const units = [{ unit: '01', sentenceBuilder: [{ lesson: 1, promptEn: 'Build: I am Rahul', tokens: ['मी', 'राहुल', 'आहे'], answer: ['मी', 'राहुल', 'आहे'], hindi: 'मैं राहुल हूँ।', hindiEn: 'I am Rahul.' }] }];
	const errors = validateScrambleData(units as never, {
		items: [
			{ unit: '01', lesson: 1, promptEn: 'Build: I am Rahul', alternates: [] },
			{ unit: '01', lesson: 1, promptEn: 'Build: I am Rahul', alternates: [['आहे', 'राहुल', 'मी']] },
			{ unit: '01', lesson: 1, promptEn: 'Build: I am Rahul', alternates: [['मी', 'राहुल', 'आहे']] },
			{ unit: '01', lesson: 1, promptEn: 'Build: I am Rahul', alternates: [['मी', 'आहे']] },
			{ unit: '99', lesson: 1, promptEn: 'Nope', alternates: [] },
		],
	});
	assert.ok(errors.some((e) => e.includes('alternate is not a permutation')));
	assert.ok(errors.some((e) => e.includes('alternate equals canonical')));
	assert.ok(errors.some((e) => e.includes('no sentenceBuilder row')));
});

test('crossword: rejects non-vocab answers and missing clues', () => {
	const errors = validateCrosswordData(vocab, {
		puzzles: [
			{
				id: 'p', title: 'P', rows: 3, cols: 3,
				words: [
					{ id: 'w1', row: 0, col: 0, dir: 'across', answer: 'पाणी', clue: 'water', vocabId: 'v-food-01' },
					{ id: 'w2', row: 0, col: 0, dir: 'down', answer: 'पाळी', clue: '', vocabId: undefined },
				],
			},
		],
	});
	// पाणी = प, णी (2 aksharas); पाळी = प, ळी (2 aksharas); intersection at 0:0 = प = प ✓,
	// but णी vs ळी never meet; w2 has an empty clue and पाळी is not a vocab word.
	assert.ok(errors.some((e) => e.includes('not a vocab word')), errors.join('; '));
	assert.ok(errors.some((e) => e.includes('missing clue')), errors.join('; '));
});
