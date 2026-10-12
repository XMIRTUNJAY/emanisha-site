// Browser-storage wrapper for game progress — keys prefixed `bol-game-`.
// Every access is guarded: quota errors and privacy-mode failures fall back
// to an in-memory store for the session. Never throws.

export type GameStorage = { get(key: string): string | null; set(key: string, value: string): void };

function memoryStore(): { getItem(key: string): string | null; setItem(key: string, value: string): void } {
	const m = new Map<string, string>();
	return {
		getItem: (k) => (m.has(k) ? (m.get(k) as string) : null),
		setItem: (k, v) => {
			m.set(k, v);
		},
	};
}

export function makeStorage(
	prefix = 'bol-game-',
	backend?: { getItem(key: string): string | null; setItem(key: string, value: string): void }
): GameStorage {
	let store =
		backend ?? (typeof localStorage !== 'undefined' ? localStorage : memoryStore());
	return {
		get(key) {
			try {
				return store.getItem(prefix + key);
			} catch {
				store = memoryStore();
				return null;
			}
		},
		set(key, value) {
			try {
				store.setItem(prefix + key, value);
			} catch {
				store = memoryStore();
			}
		},
	};
}
