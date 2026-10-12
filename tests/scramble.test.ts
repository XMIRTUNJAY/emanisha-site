import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAccepted } from '../src/lib/games/scramble.ts';

test('canonical order accepted', () => {
	assert.equal(isAccepted({ answer: ['मी', 'राहुल', 'आहे'] }, ['मी', 'राहुल', 'आहे']), true);
});

test('curated alternates accepted', () => {
	const item = { answer: ['मी', 'राहुल', 'आहे'], alternates: [['राहुल', 'मी', 'आहे']] };
	assert.equal(isAccepted(item, ['राहुल', 'मी', 'आहे']), true);
});

test('unlisted orders rejected', () => {
	assert.equal(isAccepted({ answer: ['मी', 'राहुल', 'आहे'] }, ['आहे', 'राहुल', 'मी']), false);
	assert.equal(isAccepted({ answer: ['मी', 'राहुल', 'आहे'] }, ['मी', 'राहुल']), false);
});

test('empty selection rejected', () => {
	assert.equal(isAccepted({ answer: ['मी'] }, []), false);
});
