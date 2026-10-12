// Deterministic daily selection — the same puzzle for every visitor on a
// given UTC date. Bumping `version` reshuffles the mapping for all dates.
// Pure functions (no DOM, no storage) — unit-tested directly.

/** Stable FNV-1a hash of `dateISO:version` modulo the list length. */
export function dailyIndex(dateISO: string, version: number, length: number): number {
	if (length <= 0) return 0;
	const key = dateISO + ':' + version;
	let h = 2166136261;
	for (let i = 0; i < key.length; i++) {
		h ^= key.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return (h >>> 0) % length;
}

/** Today's UTC date as YYYY-MM-DD — the daily-puzzle key. */
export function todayISO(now: Date = new Date()): string {
	return now.toISOString().slice(0, 10);
}
