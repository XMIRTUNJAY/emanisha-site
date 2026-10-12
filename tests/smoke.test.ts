import { test } from 'node:test';
import assert from 'node:assert/strict';

test('toolchain: strip-types runs tests', () => {
	assert.equal(1 + 1, 2);
});
