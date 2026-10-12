import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSfx } from '../src/lib/games/sfx.ts';

test('sfx no-ops without Audio support (Node)', () => {
	const s = makeSfx({ click: '/x.mp3' });
	assert.doesNotThrow(() => s.play('click'));
	assert.equal(s.isMuted(), false);
});

test('sfx no-ops for unknown ids', () => {
	const s = makeSfx({});
	assert.doesNotThrow(() => s.play('missing'));
});

test('mute state persists to storage', () => {
	const m = new Map<string, string>();
	const store = {
		get: (k: string) => (m.has(k) ? (m.get(k) as string) : null),
		set: (k: string, v: string) => {
			m.set(k, v);
		},
	};
	const s = makeSfx({ click: '/x.mp3' }, { storage: store });
	s.setMuted(true);
	assert.equal(m.get('bol-game-muted'), 'on');
	assert.equal(s.isMuted(), true);
	s.setMuted(false);
	assert.equal(m.get('bol-game-muted'), 'off');
});

test('starts muted when storage says so', () => {
	const m = new Map<string, string>([['bol-game-muted', 'on']]);
	const store = {
		get: (k: string) => (m.has(k) ? (m.get(k) as string) : null),
		set: (k: string, v: string) => {
			m.set(k, v);
		},
	};
	const s = makeSfx({ click: '/x.mp3' }, { storage: store });
	assert.equal(s.isMuted(), true);
});
