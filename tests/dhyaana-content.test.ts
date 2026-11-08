import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT = join(import.meta.dirname, '..', 'apps', 'dhyaana', 'src', 'content');
const db = JSON.parse(readFileSync(join(CONTENT, 'dhyaana.json'), 'utf8'));
const days = JSON.parse(readFileSync(join(CONTENT, 'journey-days.json'), 'utf8'));

const WORLD_IDS = ['dhyana', 'gyaan', 'nidra', 'prajna', 'pranayama', 'therapy'];

test('dhyaana content: every required world is present exactly once', () => {
	const ids = db.worlds.map((w: { id: string }) => w.id);
	assert.equal(ids.length, WORLD_IDS.length);
	for (const id of WORLD_IDS) {
		assert.ok(ids.includes(id), `missing world ${id}`);
		assert.equal(ids.filter((x: string) => x === id).length, 1, `duplicate world ${id}`);
	}
});

test('dhyaana content: worlds carry the fields the UI renders', () => {
	for (const w of db.worlds) {
		for (const field of ['id', 'name', 'devanagari', 'essence', 'description', 'cue', 'color']) {
			assert.ok(w[field], `world ${w.id} missing ${field}`);
		}
		assert.match(w.color, /^#[0-9A-Fa-f]{6}$/, `world ${w.id} colour format`);
	}
});

test('dhyaana content: journeys have day plans that match their declared length', () => {
	for (const j of db.journeys) {
		const plan = days.journeyDays[j.id];
		assert.ok(plan, `journey ${j.id} has no day plans`);
		assert.equal(plan.length, j.days, `journey ${j.id} day count mismatch`);
	}
});

test('dhyaana content: journey days reference only known worlds', () => {
	for (const [journeyId, plan] of Object.entries(days.journeyDays)) {
		for (const day of plan as { world?: string }[]) {
			if (!day.world) continue;
			assert.ok(WORLD_IDS.includes(day.world), `${journeyId} references unknown world ${day.world}`);
		}
	}
});

test('dhyaana content: no orphaned day plans', () => {
	const journeyIds = new Set(db.journeys.map((j: { id: string }) => j.id));
	for (const id of Object.keys(days.journeyDays)) {
		assert.ok(journeyIds.has(id), `orphan day plans for ${id}`);
	}
});

test('dhyaana content: knowledge ids are unique and kebab-case', () => {
	const ids = db.knowledge.map((k: { id: string }) => k.id);
	assert.equal(new Set(ids).size, ids.length, 'duplicate knowledge id');
	for (const id of ids) assert.match(id, /^[a-z0-9-]+$/, `bad knowledge id ${id}`);
});

test('dhyaana content: every concept carries Devanagari and a question', () => {
	for (const k of db.knowledge) {
		assert.match(k.devanagari, /[ऀ-ॿ]/, `concept ${k.id} has no Devanagari`);
		assert.ok(k.question.length >= 10, `concept ${k.id} question too short`);
		assert.ok(k.body.length >= 60, `concept ${k.id} body too thin`);
		assert.ok(['available', 'planned'].includes(k.status), `concept ${k.id} bad status`);
	}
});

test('dhyaana content: journey minutes are within a sittable range', () => {
	for (const [journeyId, plan] of Object.entries(days.journeyDays)) {
		for (const day of plan as { minutes: number }[]) {
			assert.ok(day.minutes >= 1 && day.minutes <= 60, `${journeyId} day minutes ${day.minutes}`);
		}
	}
});
