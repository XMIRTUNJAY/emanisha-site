import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyIndex, todayISO } from '../src/lib/games/daily.ts';

test('dailyIndex is deterministic for the same date+version', () => {
	assert.equal(dailyIndex('2026-10-10', 1, 60), dailyIndex('2026-10-10', 1, 60));
});

test('dailyIndex stays within bounds for many dates', () => {
	for (let d = 0; d < 60; d++) {
		const iso = new Date(Date.UTC(2026, 0, 1) + d * 86400000).toISOString().slice(0, 10);
		const i = dailyIndex(iso, 1, 60);
		assert.ok(i >= 0 && i < 60, `out of bounds ${i} for ${iso}`);
	}
});

test('dailyIndex spreads across the list (variety)', () => {
	const picks = new Set<number>();
	for (let d = 0; d < 30; d++) {
		const iso = new Date(Date.UTC(2026, 0, 1) + d * 86400000).toISOString().slice(0, 10);
		picks.add(dailyIndex(iso, 1, 60));
	}
	assert.ok(picks.size >= 15, `only ${picks.size} distinct picks in 30 days`);
});

test('dailyIndex changes when the version changes', () => {
	const diffs = [1, 2, 3, 4, 5].filter((d) => {
		const iso = new Date(Date.UTC(2026, 0, d)).toISOString().slice(0, 10);
		return dailyIndex(iso, 1, 60) !== dailyIndex(iso, 2, 60);
	});
	assert.ok(diffs.length >= 3, `version bump reshuffled only ${diffs.length}/5 sample dates`);
});

test('dailyIndex handles empty lists', () => {
	assert.equal(dailyIndex('2026-10-10', 1, 0), 0);
});

test('todayISO returns YYYY-MM-DD', () => {
	assert.equal(todayISO(new Date('2026-10-10T15:30:00Z')), '2026-10-10');
	assert.match(todayISO(new Date()), /^\d{4}-\d{2}-\d{2}$/);
});
