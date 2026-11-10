import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	partialThreshold,
	completeThreshold,
	earnsPartialCredit,
	isComplete,
} from '../apps/dhyaana/src/content/thresholds.ts';

/*
 * The library is short-form: 81 of 89 clips are exactly 10 seconds and the
 * longest is 31. These rules replaced a flat "5 seconds watched" floor, which
 * meant half of a typical clip and left short clips uncredited.
 */

test('thresholds: a 10 second clip credits at 4 seconds', () => {
	assert.equal(partialThreshold(10), 4);
	assert.equal(completeThreshold(10), 9);
});

test('thresholds: a 30 second clip scales with its length', () => {
	assert.equal(partialThreshold(30), 12);
	assert.equal(completeThreshold(30), 27);
});

test('thresholds: a 15 second clip sits between the two', () => {
	assert.equal(partialThreshold(15), 6);
	assert.equal(completeThreshold(15), 14);
});

test('thresholds: a very short clip still gets a usable floor', () => {
	// A 4s clip would otherwise credit at 2s, which is too eager.
	assert.ok(partialThreshold(4) >= 3, `got ${partialThreshold(4)}`);
	assert.equal(partialThreshold(4), 3);
});

test('thresholds: an unknown length falls back rather than dividing by zero', () => {
	assert.equal(partialThreshold(0), 3);
	assert.equal(completeThreshold(0), 3);
	assert.equal(isComplete(10, 0), false);
});

test('thresholds: partial credit is granted once the threshold is passed', () => {
	assert.equal(earnsPartialCredit(3, 10), false);
	assert.equal(earnsPartialCredit(4, 10), true);
	assert.equal(earnsPartialCredit(9, 10), true);
});

test('thresholds: watching a full 10 second clip counts as complete', () => {
	assert.equal(isComplete(9, 10), true);
	assert.equal(isComplete(10, 10), true);
	assert.equal(isComplete(8, 10), false);
});

test('thresholds: a clip is never credited for more than it contains', () => {
	// The threshold must stay below the clip length.
	for (const d of [4, 10, 15, 28, 30, 31]) {
		assert.ok(partialThreshold(d) < d, `partial(${d}) = ${partialThreshold(d)}`);
		assert.ok(completeThreshold(d) <= d, `complete(${d}) = ${completeThreshold(d)}`);
	}
});

test('thresholds: the old flat 5 second floor is gone', () => {
	// Under the old rule a 10s clip needed 5s; now it needs 4s.
	assert.notEqual(partialThreshold(10), 5);
	assert.equal(earnsPartialCredit(4, 10), true);
});
