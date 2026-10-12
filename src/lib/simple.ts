// Deterministic scholarly-diacritic → simple respelling.
// Ordered longest-first so multigraphs resolve before singles.
// Documented approximation for learners, NOT a pronunciation authority:
// needs native-speaker review (see REPORT.md, LM-0004). In particular
// syllable hyphens (e.g. "paa-nee") are NOT generated — syllabification
// cannot be derived deterministically, so output is unhyphenated.
const RULES: [RegExp, string][] = [
  [/kṣ/g, 'ksh'], [/jñ/g, 'gya'],
  [/ā/g, 'aa'], [/ī/g, 'ee'], [/ū/g, 'oo'],
  [/ṛ/g, 'ri'], [/ṝ/g, 'ree'], [/ḷ/g, 'l'], [/ḹ/g, 'l'],
  [/ṁ/g, 'm'], [/ṃ/g, 'm'], [/ḥ/g, 'h'],
  [/ñ/g, 'n'], [/ṅ/g, 'n'], [/ṇ/g, 'n'],
  [/ṭh/g, 'th'], [/ṭ/g, 't'], [/ḍh/g, 'dh'], [/ḍ/g, 'd'],
  [/ś/g, 'sh'], [/ṣ/g, 'sh'],
  [/ĕ/g, 'e'], [/ē/g, 'e'], [/ŏ/g, 'o'], [/ō/g, 'o'], [/ă/g, 'a'],
];

export function simpleRespelling(transliteration: string): string {
  let out = transliteration;
  for (const [re, rep] of RULES) out = out.replace(re, rep);
  return out;
}
