# CONTENT_PLAN — Bol Marathi SEO expansion

Date: 2026-09-24 · Branch: `feature/seo-content-engine` · Source of truth for WHAT gets built.

**Rule zero: a page only ships when it teaches something better than a generic AI article.**
Pages are generated from `src/data/seo/*.json` and validated by `tools/validate-content.mjs`.
Drafts live in this plan until their data backing + copy exist.

Status legend: **LIVE** = published & building · **READY** = fully backable from existing
curriculum data (vocab.json / units.json), needs authoring only · **AUTHOR** = needs new
phrase/word content — must pass native-speaker review before publish · **MERGED** =
intent already covered by an existing page → link, don't duplicate.

Quality thresholds (enforced by the validator): vocab ≥10 words · phrases ≥8 rows ·
bridge ≥5 rows · grammar ≥1 verified note + explanation · every page: ≥3 practice items,
≥2 common mistakes, ≥1 curriculum unit link, unique title/description/keyword.

---

## 0. Dedupe registry — brief slugs that map to EXISTING pages

Do not create these as new pages; strengthen the existing target and interlink.

| Brief slug | Existing page |
|---|---|
| marathi-greetings | `/phrases/greetings/` |
| marathi-food-words | `/vocabulary/food/` |
| marathi-family-words | `/vocabulary/family/` |
| marathi-colors | `/vocabulary/colors/` |
| marathi-days-months | `/marathi-days-months/` |
| marathi-numbers | `/marathi-numbers/` |
| marathi-common-verbs / action-verbs | `/vocabulary/verbs/` |
| marathi-pronouns / personal-pronouns | `/grammar/pronouns/` |
| marathi-question-formation | `/grammar/questions/` |
| marathi-postpositions | `/grammar/postpositions/` |
| marathi-word-order / sentence-structure | `/grammar/sentence-structure/` |
| marathi-at-market / shopping phrases | `/phrases/shopping/` + `/blog/grocery-shopping/` |
| marathi-in-auto-rickshaw | `/blog/autorickshaw-taxi/` |
| marathi-at-restaurant (words) | `/blog/ordering-food/` (phrase page = AUTHOR below) |
| marathi-at-school | `/blog/school-talk/` |
| marathi-small-talk / self-introduction | `/blog/small-talk-intro/` |
| marathi-festival-greetings | `/blog/festival-greetings/` |
| marathi-emergency-phrases (doctor) | `/blog/at-the-doctor/` |
| marathi-weather-talk | `/blog/weather-talk/` |
| marathi-money-prices | `/blog/money-prices/` |
| marathi-polite-phrases | `/blog/polite-marathi/` |
| marathi-positions/time | `/vocabulary/numbers-time/` |
| marathi-daily-routine | `/vocabulary/daily-life/` (Routine has only 7 words — sub-threshold) |
| marathi-fruit-names / vegetable-names | merged → `vocabulary/fruits-vegetables` (only 6 fruits + 3 veg exist) |
| marathi-home/household | `/vocabulary/daily-life/` + planned household/kitchen splits |

---

## 1. Vocabulary pages (~30)

| # | Slug `/vocabulary/<slug>/` | Primary keyword | Level | Data backing | Status |
|---|---|---|---|---|---|
| 1 | animals | marathi animal names | beg | category Animals (40) | **LIVE** |
| 2 | weather | marathi weather words | beg | category Weather (16) | **LIVE** |
| 3 | clothing | marathi clothes vocabulary | beg | category Clothing (38) | **LIVE** |
| 4 | emotions | marathi emotion words | beg | category Emotions (20) | **LIVE** |
| 5 | body-parts | marathi body parts | beg | category Body (43) | **LIVE** |
| 6 | nature | marathi nature words | beg | category Nature (47) | READY |
| 7 | education | marathi school words | beg | category Education (38) | READY |
| 8 | work-office | marathi office vocabulary | int | category Work (42) | READY |
| 9 | culture-festivals | marathi festival words | int | category Culture (32) | READY |
| 10 | adjectives | marathi adjectives | beg | category Adjectives (68) | READY |
| 11 | adverbs | marathi adverbs | int | category Adverbs (30) | READY |
| 12 | connectors | marathi conjunctions and connectors | int | category Grammar (32) | READY |
| 13 | transport | marathi transport words | beg | wordIds v-tr2-01…25 (25) | READY |
| 14 | fruits-vegetables | marathi fruits and vegetables names | beg | wordIds Food subset (10) | READY |
| 15 | household-items | marathi household items | beg | wordIds v-home-* (25) | READY |
| 16 | kitchen-items | marathi kitchen items | beg | wordIds v-kit-* (40) | READY |
| 17 | health-symptoms | marathi symptoms words | int | wordIds v-body-08…13 + v-med-21…30 (16) | READY |
| 18 | city-places | marathi places in the city | beg | wordIds v-tr2-02…08 + stays (10+) | READY |
| 19 | personality-words | marathi personality adjectives | int | selected Adjectives/Abstract wordIds | READY (selection) |
| 20 | directions-locations | marathi direction words | beg | category Directions (16) | READY |
| 21 | money-shopping | marathi money words | beg | category Shopping (12) + price rows | READY |
| 22 | technology-words | marathi technology words | int | U12 tech set | AUTHOR (word list) |
| 23 | birds | marathi bird names | beg | 7 known → needs 3+ more | AUTHOR |
| 24 | shapes | marathi shapes | beg | no source words | AUTHOR |
| 25 | time-expressions | marathi time vocabulary | int | category Time (34) — must differentiate from numbers-time | READY (reframe: clock/duration) |
| 26 | feelings-adverbs phrases | marathi daily expressions | int | category Phrases (46) | READY |
| 27 | people-occupations | marathi occupations | int | wordIds Work v-occ-* (30) | READY |
| 28 | abstract-concepts | marathi abstract words | adv | category Abstract (36) | READY |
| 29 | vegetables-deep | — | — | — | MERGED into #14 |
| 30 | routine | — | — | 7 words, sub-threshold | MERGED into daily-life |

## 2. Hindi → Marathi bridge pages (~24)

All backable from unit `bridge[]` rows (word-mapped Hindi↔Marathi + grammar note).

| # | Slug `/hindi-to-marathi/<slug>/` | Units | Status |
|---|---|---|---|
| 1 | greetings | 01 | **LIVE** |
| 2 | daily-conversation | 02 | **LIVE** |
| 3 | questions | 07 | **LIVE** |
| 4 | travel | 14, 15 | **LIVE** |
| 5 | family-home | 03 | READY |
| 6 | sentence-patterns | 04 | READY |
| 7 | pronouns-people | 05 | READY |
| 8 | pronunciation-sounds | 06 | READY |
| 9 | postpositions | 08 | READY |
| 10 | shopping | 09 | READY |
| 11 | health-body | 10 | READY |
| 12 | school-and-study | 11 (education half) | READY |
| 13 | technology | 12 | READY |
| 14 | festivals | 13 | READY |
| 15 | time-and-seasons | 16 | READY |
| 16 | emotions | 17 | READY |
| 17 | hobbies | 18 | READY |
| 18 | work-career | 19 | READY |
| 19 | review-essentials | 20 | READY |
| 20 | advanced-structures | 21 | READY |
| 21 | literature-words | 22 | READY (niche — low priority) |
| 22 | business | 23 | READY |
| 23 | media-news | 24 | READY |
| 24 | advanced-conversation | 25 | READY |

Every bridge page must include: sound-shift notes, false friends, and a
"Hindi log, careful" mistakes block — never word-for-word equivalence claims.

## 3. English → Marathi pages (~12)

| # | Slug `/english-to-marathi/<slug>/` | Units/data | Status |
|---|---|---|---|
| 1 | greetings | U01 speaking | **LIVE** |
| 2 | asking-questions | U07 speaking | **LIVE** |
| 3 | introductions | U01 L1-3 + U05 L5 picks | READY |
| 4 | daily-needs | U02 speaking | READY |
| 5 | directions | U08 speaking | READY |
| 6 | shopping-market | U09 speaking | READY |
| 7 | technology-phone | U12 speaking | READY |
| 8 | nature-landscapes | U14 speaking | READY |
| 9 | transport-travel | U15 speaking | READY |
| 10 | time-seasons | U16 speaking | READY |
| 11 | hobbies-freetime | U18 speaking | READY |
| 12 | workplace | U19 speaking | READY |
| — | numbers | existing `/marathi-numbers/` | MERGED |
| — | at-the-doctor / feelings / festivals / small-talk | existing blog guides | MERGED |
| — | emergency-phrases | 2 curriculum rows only | AUTHOR (+review) |

## 4. Grammar pages (~15)

| # | Slug `/grammar/<slug>/` | Verified picks | Status |
|---|---|---|---|
| 1 | negation | U02 L1-2 | **LIVE** |
| 2 | commands-polite | U02 L5-6, U13 L6 | **LIVE** |
| 3 | possessives | U02 L3, U03 L6 | **LIVE** |
| 4 | ability-obligation | U04 L5-6 | READY |
| 5 | compound-verbs | U04 L3-4 | READY |
| 6 | counting-quantifiers | U03 L4-5 | READY |
| 7 | passive-causative | U21 L5-6 | READY |
| 8 | frequency-adverbs | U18 L5 + Adverbs vocab | READY (sections carry weight) |
| 9 | demonstratives | U05 L2 | READY (thin — strong sections required) |
| 10 | present-tense | — | AUTHOR + native review |
| 11 | past-tense | — | AUTHOR + native review |
| 12 | future-tense | — | AUTHOR + native review |
| 13 | case-markers | — | AUTHOR + native review |
| 14 | adjective-agreement | U03 L6 — overlaps possessives | MERGED into possessives |
| 15 | honorifics | U05 L5 — overlaps commands-polite | MERGED |

## 5. Situational phrase pages (~18)

| # | Slug `/phrases/<slug>/` | Data backing | Status |
|---|---|---|---|
| 1 | family-talk | U03 + U05 speaking (12) | **LIVE** |
| 2 | office-work | U19 + U11 L2-4 (9) | **LIVE** |
| 3 | making-plans | U16 + U18 speaking (12) | READY |
| 4 | phone-and-messaging | U12 + U24 speaking (12) | READY |
| 5 | business-meetings | U23 speaking + U25 L4-6 (9+) | READY |
| 6 | asking-directions | U08 speaking + U14 L6 (7→ combine U15 L6 = 8) | READY |
| 7 | presentations-interviews | U25 L1-3,6 + U20 L2 (5-7) | READY (confirm ≥8; else add U19 picks) |
| 8 | at-restaurant | no restaurant unit | AUTHOR + review |
| 9 | making-invitations | — | AUTHOR + review |
| 10 | thanking-and-apologizing | — | AUTHOR + review |
| 11 | at-hotel-checkin | U15 L5 only | MERGED into phrases/travel |
| 12 | on-train | U15 L1-3 | MERGED into phrases/travel |
| 13 | at-market | — | MERGED (phrases/shopping + blog) |
| 14 | at-the-doctor | — | MERGED (blog) |
| 15 | at-school | — | MERGED (blog) |
| 16 | small-talk | — | MERGED (blog) |
| 17 | festivals-wishes | — | MERGED (blog) |
| 18 | emergency | 2 rows | AUTHOR + review |

## 6. Word guides (existing pattern `/how-to-say-*-in-marathi/`)

| # | Slug | Status |
|---|---|---|
| 1 | how-to-say-please-in-marathi (कृपया) | READY |
| 2 | how-to-say-water-in-marathi (पाणी) | READY |
| 3 | how-to-say-help-in-marathi (मदत) | READY |
| 4 | how-to-say-i-love-you-in-marathi | AUTHOR + native review (per REPORT.md note) |
| — | hello / sorry / thank-you / good-morning | already LIVE |

---

## Totals

- **LIVE now:** 16 engine pages (+90 pre-existing pages).
- **READY (curriculum-backed, authoring only):** ~55.
- **AUTHOR (new linguistic content — needs native review):** ~18.
- **MERGED (intent covered — interlink instead):** ~22.

Plan size: **~110 tracked intents**. Publish order: READY pages in
validation-first batches of ~10 (`npm run content:qa` gate, then build +
`content:report`), AUTHOR pages only after review sign-off.

---

## Question-blog batch (2026-09-25) — 10 LIVE (blog format, custom OG cards)

How-to / word-meaning / rescue-line posts under `/blog/` (not dataset pages) —
question-style format for featured snippets / People Also Ask. Every Marathi
string resolves from vocab.json / units.json; images are bespoke vector
cards (public/og/og-blog-*.png) generated via `tools/make-og-blog-art.mjs`.

| Slug | Intent |
|---|---|
| how-to-shop-in-marathi | Bargaining script (Unit 09) |
| train-station-marathi | Station sentences (Unit 15) |
| how-to-tell-time-in-marathi | वाजले + time words |
| how-are-you-in-marathi | कसा/कसे आहात |
| bhet-meaning-in-marathi | भेटने / भेटूया |
| thamba-meaning-in-marathi | थांबणे / थांबा |
| yes-no-in-marathi | हो / नको |
| this-in-marathi | हा / ही / हे |
| i-like-in-marathi | आवडतं frame (Unit 18) |
| i-dont-understand-in-marathi | Rescue lines |

## Per-page checklist (all new pages)

1. Entry added to the right `src/data/seo/*.json` with `status: draft`.
2. `npm run content:qa` — zero FAIL, keyword warning resolved.
3. Intro/reference rows verified against `vocab.json` / `units.json` (never invented).
4. `status: published` → `npm run build` → page inspected in dist.
5. `node tools/make-og-pages.mjs` (OG card) → `npm run content:manifest` → `npm run content:report`.
