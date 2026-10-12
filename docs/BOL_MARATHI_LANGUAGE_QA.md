# Bol Marathi Language QA

Method: automated scan (`tools/qa-scan.mjs`, read-only) over the synced
snapshots (`src/data/learn/*.json`, synced from `bol_marathi/`) + manual
review of high-visibility strings (all 15 Greetings, Unit 01 speaking +
bridges, transliteration sample). LLM Marathi is NOT treated as
authoritative — uncertain items are flagged, not rewritten.

## Scan result (2026-09-19)

1002 words + 26 units → 3 findings → 1 confirmed error (fixed), 2
legitimate polysemes (kept).

## Findings

### LM-0001 — gender mismatch (CONFIRMED, FIXED)

- **ID:** `v-an2-11` (Animals)
- **Was:** `marathi: घोडा` (masc.) + `hindi: घोड़ी` + `english: mare
  (female horse)` + `transliteration: ghoḍī` + example `घोडी वेगाने
  धावते.` (fem. verb)
- **Problem:** headword masculine, everything else feminine.
- **Fix:** `marathi → घोडी` in
  `bol_marathi/lib/content/generated_vocab.dart:11128`, re-ran
  `npm run sync`. Same `id`, so lesson vocab rotation is unaffected.
- **Follow-up (app repo):** re-run `dart tool/gen_unit_content.dart`
  and the app test-suite; Flutter was not available in this session.
- **Status:** FIXED (website), PENDING VERIFICATION (app tests)

### LM-0002 — duplicate headword उत्तर (TRIAGED, KEEP)

- `v-dir-04` उत्तर = "north" (Directions) vs `v-edu-06` उत्तर =
  "answer" (Education). Genuine polysemy; Hindi/English/examples
  differ correctly. No action.

### LM-0003 — duplicate headword बोट (TRIAGED, KEEP)

- `v-tr2-11` बोट = "boat" (Travel) vs `v-med-10` बोट = "finger"
  (Body). Genuine polysemy; translations differ correctly. No action.

### LM-0004 — transliteration style drift (STYLE REVIEW)

- 870 entries use scholarly diacritics (`namaskār`, `śubh sakāḷ`);
  132 use plain ASCII. Most plain ones are legitimately short
  (`ek`, `ghar`, `bil`), but long vowels are sometimes unmarked
  (`दोन → don` should strictly be `dōn`; `तो → to` should be `tō`).
- **Status:** REQUIRES NATIVE REVIEW. Cosmetic only (guide column);
  do NOT mass-rewrite — needs a linguist pass in the app repo.

## Manual sample verdicts

- **Greetings (15/15):** natural, correct Hindi counterparts
  (`माफ करा → माफ कीजिए`), consistent diacritics. PASS.
- **Unit 01 speaking (6/6):** natural sentences, correct Hindi/English
  (`मला पाणी पाहिजे → मुझे पानी चाहिए`). PASS.
- **Unit 01 bridges (sampled):** correct word maps
  (`मेरा→माझं`, `नाम→नाव`). PASS.

## Quality gate for new pages

No page ships with curriculum text edited by hand. Website chrome
(English/Hindi UI copy) may be fixed directly; curriculum fixes go
to `bol_marathi/` + `npm run sync` + this report updated.
