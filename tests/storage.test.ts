import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeStorage } from '../src/lib/games/storage.ts';

test('prefixes keys and round-trips values', () => {
	const fake = new Map<string, string>();
	const s = makeStorage('bol-game-', {
		getItem: (k) => (fake.has(k) ? (fake.get(k) as string) : null),
		setItem: (k, v) => {
			fake.set(k, v);
		},
	});
	s.set('x', '1');
	assert.equal(s.get('x'), '1');
	assert.equal(fake.get('bol-game-x'), '1');
});

test('falls back to memory when the backend throws', () => {
	const throwing = {
		getItem: () => {
			throw new Error('quota');
		},
		setItem: () => {
			throw new Error('quota');
		},
	};
	const s = makeStorage('p-', throwing);
	assert.doesNotThrow(() => s.set('a', 'b'));
	assert.equal(s.get('a'), null);
	// after fallback, values work in-memory for the session
	assert.doesNotThrow(() => s.set('b', 'c'));
	assert.equal(s.get('b'), 'c');
});

test('defaults to a memory store without a backend (Node)', () => {
	const s = makeStorage('t-');
	s.set('k', 'v');
	assert.equal(s.get('k'), 'v');
});
