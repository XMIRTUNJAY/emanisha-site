import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * The reset control clears practice history but keeps the reader's own words:
 * their sankalpa and its history belong to them, not to the practice record.
 */
const source = readFileSync(
	new URL('../apps/dhyaana/src/storage.ts', import.meta.url),
	'utf8',
);

test('reset: keeps the sankalpa and its history', () => {
	assert.match(source, /sankalpa: current\.sankalpa/);
	assert.match(source, /sankalpaHistory: current\.sankalpaHistory/);
});

test('reset: starts from a clean state', () => {
	assert.match(source, /resetProgress[\s\S]{0,200}\.\.\.emptyState\(\)/);
});

test('reset: clears the stored record', () => {
	assert.match(source, /localStorage\.removeItem\(KEY\)/);
});

test('storage: exposes the key it writes under', () => {
	assert.match(source, /export const STORAGE_KEY = KEY;/);
});

test('playlists: the channel and watch links are reachable from the UI', () => {
	const shelf = readFileSync(
		new URL('../apps/dhyaana/src/components/PlaylistShelf.tsx', import.meta.url),
		'utf8',
	);
	const player = readFileSync(
		new URL('../apps/dhyaana/src/components/YoutubePlayer.tsx', import.meta.url),
		'utf8',
	);
	assert.match(shelf, /CHANNEL_URL/);
	assert.match(player, /watchUrl\(videoId\)/);
});
