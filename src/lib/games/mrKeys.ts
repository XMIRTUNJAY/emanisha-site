// Romanization hints for on-screen Devanagari keys — educational labels and
// keyboard ordering only; NEVER used for comparison logic (all comparisons
// use graphemes.ts akshara units).

const BASE_ROMAN: Record<string, string> = {
	'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
	'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
	'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
	'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
	'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
	'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va', 'श': 'sha',
	'ष': 'sha', 'स': 'sa', 'ह': 'ha', 'ळ': 'la',
	'क्ष': 'ksha', 'ज्ञ': 'dnya',
	'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u',
	'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
	'अं': 'an', 'अः': 'ah',
};

const MATRA_ROMAN: Record<string, string> = {
	'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ru',
	'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ः': 'h',
	'ॅ': 'e', 'ॉ': 'o', '़': '',
};

/** Approximate romanization of one akshara (e.g. का → "ka", स्का → "ska"). */
export function romanize(akshara: string): string {
	const full = BASE_ROMAN[akshara];
	if (full !== undefined) return full;
	let out = '';
	for (const ch of akshara) {
		if (ch === '्') continue; // virama — the conjunct reads via its letters
		const m = MATRA_ROMAN[ch];
		if (m !== undefined) {
			out += m;
			continue;
		}
		const b = BASE_ROMAN[ch];
		if (b !== undefined) {
			out += b.replace(/a$/, '');
			continue;
		}
		out += ch;
	}
	return out || akshara;
}

/** Matra display order within a base consonant (bare form first, then ा ि ी ु ू ृ े ै ो ौ ं ः). */
const MATRA_ORDER = ['', 'ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ', 'ं', 'ः', 'ॅ', 'ॉ'];

/**
 * Sort key that orders aksharas like the Devanagari varnamala: independent
 * vowels (अ-औ) first, then consonants (क-ह…), bare base before its matra
 * forms — the order Marathi readers expect on a keyboard.
 */
export function aksharaSortKey(akshara: string): number {
	const cp = akshara.codePointAt(0) ?? 0;
	let group: number;
	if (cp >= 0x0904 && cp <= 0x0914) group = 0; // independent vowels
	else if ((cp >= 0x0915 && cp <= 0x0939) || (cp >= 0x0958 && cp <= 0x095f) || (cp >= 0x0978 && cp <= 0x097f)) group = 1; // consonants
	else group = 2; // anything else, last
	// base position: first codepoint
	const baseCp = cp;
	// matra suffix order: strip the base char, map the remainder
	const rest = akshara.slice(String.fromCodePoint(cp).length);
	const matraIdx = MATRA_ORDER.indexOf(rest);
	return group * 1000000 + baseCp * 100 + (matraIdx >= 0 ? matraIdx : MATRA_ORDER.length);
}
