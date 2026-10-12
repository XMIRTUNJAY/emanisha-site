// Spaced Repetition System — SM-2 algorithm, IndexedDB persistence
// Uses `idb` package (3kb) for cross-tab persistence
// With offline queue via sync.ts
import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import { queueMutation } from './sync';

export interface WeakWord {
	id: string;
	difficulty: 'hard' | 'good' | 'easy';
	dueDate: number;
	repetitions: number;
	easeFactor: number;
	interval: number;
}

interface SRSDB extends DBSchema {
	weakWords: {
		key: string;
		value: WeakWord;
	};
}

const DB_NAME = 'bol-marathi-srs';
const DB_VERSION = 1;
const STORE = 'weakWords';

async function getDB() {
	return openDB<SRSDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE);
			}
		},
	});
}

function sm2NextInterval(reps: number, easeFactor: number): number {
	if (reps === 0) return 1;
	if (reps === 1) return 6;
	if (reps === 2) return 15;
	return Math.round(Math.min(easeFactor * Math.pow(2.5, reps - 3), 365));
}

function sm2NextEaseFactor(easeFactor: number, difficulty: 'hard' | 'good' | 'easy'): number {
	if (difficulty === 'hard') return Math.max(1.3, easeFactor - 0.15);
	if (difficulty === 'good') return easeFactor;
	return Math.min(2.5, easeFactor + 0.15);
}

export async function addWord(wordId: string, grade: 'again' | 'hard' | 'good' | 'easy' = 'good') {
	const db = await getDB();
	const existing: WeakWord | undefined = await db.get(STORE, wordId);
	const now = Date.now();

	let reps = 0, easeFactor = 2.5, interval = 0;
	if (existing) {
		reps = existing.repetitions;
		easeFactor = existing.easeFactor;
	}

	if (grade === 'again') {
		reps = 0;
		interval = 1;
		easeFactor = Math.max(1.3, easeFactor - 0.2);
	} else {
		reps++;
		easeFactor = sm2NextEaseFactor(easeFactor, grade as 'hard' | 'good' | 'easy');
		interval = sm2NextInterval(reps, easeFactor);
	}

	await db.put(STORE, {
		id: wordId,
		difficulty: grade === 'easy' ? 'easy' : grade === 'good' ? 'good' : 'hard',
		dueDate: now + interval * 24 * 60 * 60 * 1000,
		repetitions: reps,
		easeFactor,
		interval,
	}, wordId);

	// Queue for offline sync
	try {
		await queueMutation('srs', { wordId, grade });
	} catch { /* ignore if sync unavailable */ }
}

export async function getDueWords(): Promise<WeakWord[]> {
	const db = await getDB();
	const all = await db.getAll(STORE);
	const now = Date.now();
	return all.filter((w) => w.dueDate <= now).sort((a, b) => a.dueDate - b.dueDate);
}

export async function recordReview(wordId: string, grade: 'again' | 'hard' | 'good' | 'easy') {
	await addWord(wordId, grade);
}

export async function getReviewCount(): Promise<number> {
	return (await getDueWords()).length;
}
