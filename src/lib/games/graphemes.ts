// Marathi (Devanagari) grapheme utilities — the single definition of a
// "letter" (akshara) shared by all games. Never use split("") or naive
// string indexing on Marathi text: combining matras, nukta, virama and
// ZWJ/ZWNJ would produce broken tiles.
//
// Unit definition (docs/superpowers/specs/2026-10-10-marathi-games-design.md):
//   1. A grapheme cluster: one base character + its combining marks
//      (matras, nukta, anusvara, visarga, stress marks, joiners).
//   2. Conjunct merge: a cluster ending in virama (a rendered half-consonant,
//      e.g. स्) joins the following cluster (का) — Devanagari renders स्का
//      as one akshara, so the tile matches what the reader sees.
//   Examples: शब्द → श, ब्द · कक्षा → क, क्षा · बाई → बा, ई ·
//   नमस्कार → न, म, स्का, र.

let segmenter: Intl.Segmenter | null | undefined;

function getSegmenter(): Intl.Segmenter | null {
	if (segmenter !== undefined) return segmenter;
	segmenter =
		typeof Intl !== 'undefined' && 'Segmenter' in Intl
			? new Intl.Segmenter('mr', { granularity: 'grapheme' })
			: null;
	return segmenter;
}

/** Manually cluster Devanagari code points (fallback when Intl.Segmenter is unavailable). */
export function fallbackClusters(word: string): string[] {
	const out: string[] = [];
	let cur = '';
	for (const ch of word) {
		const cp = ch.codePointAt(0) ?? 0;
		const isExtend =
			(cp >= 0x0900 && cp <= 0x0903) ||
			(cp >= 0x093a && cp <= 0x094d) ||
			(cp >= 0x0951 && cp <= 0x0957) ||
			(cp >= 0x0962 && cp <= 0x0963) ||
			cp === 0x200c ||
			cp === 0x200d;
		if (cur && !isExtend) {
			out.push(cur);
			cur = ch;
		} else {
			cur += ch;
		}
	}
	if (cur) out.push(cur);
	return out;
}

/** True when the unit starts with a Devanagari consonant letter. */
function startsWithConsonant(unit: string): boolean {
	const cp = unit.codePointAt(0) ?? 0;
	return (
		(cp >= 0x0915 && cp <= 0x0939) ||
		(cp >= 0x0958 && cp <= 0x095f) ||
		(cp >= 0x0978 && cp <= 0x097f)
	);
}

/** Merge virama-ending clusters with the following cluster (rendered aksharas). */
export function mergeConjuncts(clusters: string[]): string[] {
	const out: string[] = [];
	for (const c of clusters) {
		const prev = out.length ? (out[out.length - 1] as string) : '';
		if (prev && /[\u094D]$/.test(prev) && startsWithConsonant(c)) {
			out[out.length - 1] = prev + c;
		} else {
			out.push(c);
		}
	}
	return out;
}

/** Split a Marathi word into akshara units (tiles for the games). */
export function splitGraphemes(word: string): string[] {
	const seg = getSegmenter();
	const clusters: string[] = [];
	if (seg) {
		for (const s of seg.segment(word)) clusters.push(s.segment);
	} else {
		clusters.push(...fallbackClusters(word));
	}
	return mergeConjuncts(clusters);
}

/** Number of akshara units in a Marathi word. */
export function countGraphemes(word: string): number {
	return splitGraphemes(word).length;
}

/** NFC-normalize and strip ZWJ/ZWNJ — for comparison and segmentation input. */
export function normalizeMr(word: string): string {
	return word.normalize('NFC').replace(/[\u200C\u200D]/g, '');
}

/** True when the (normalized) string is non-empty Devanagari plus spaces/joiners. */
export function isMarathi(word: string): boolean {
	return /^[\u0900-\u097F][\u0900-\u097F\u200C\u200D\s]*$/.test(normalizeMr(word));
}

/** The base character of an akshara (matras/nukta/anusvara stripped) — the word-chain matching unit. */
export function baseLetter(unit: string): string {
	const cp = unit.codePointAt(0);
	return cp ? String.fromCodePoint(cp) : '';
}
