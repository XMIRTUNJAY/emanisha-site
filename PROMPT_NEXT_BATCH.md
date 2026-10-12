# Handoff Prompt — Next Content Batch for Learn Marathi

## Repo & Branch
- **Path:** `C:\Users\kumar\blog\learn-marathi`
- **Branch:** `feature/final-batches` (off `main`, all prior PRs merged)
- **Deploy:** GitHub Pages at `/learn-marathi` (Astro 7, static)

## Hard Rules (Non-Negotiable)
1. **Every Marathi string must resolve from `src/data/learn/vocab.json` (1,002 words) or `units.json` (26 units).** Resolvers in `src/lib/seo.ts` throw at build time on bad refs — never invent Marathi.
2. **Validator thresholds (enforced by `node tools/validate-content.mjs`):**
   - Vocab: ≥10 words, Phrases: ≥8 rows, Bridges: ≥5 rows, Grammar: ≥1 note
   - Every page: ≥3 practice items, ≥2 mistakes, ≥1 unit link, unique title/desc/keyword
3. **Astro 7, static, minimal JS.** Render via `Learn` layout (`src/layouts/Learn.astro`).
4. **PowerShell console Devanagari mojibake is harmless** — read `dist/` with `-Encoding UTF8`.
5. **Git mutations only on explicit user request.**

## Current State (All Checks Pass)
- `content-validate: PASS` (76 dataset pages, 0 failures)
- `npm run build` — 192 pages built
- `npm run qa` — PASS (1002 words, 26 units)
- `make-og-pages --regen` — 189 OG cards generated
- Sitemap includes all new routes

## Just Completed (This Session)
| Family | Added | Unit |
|--------|-------|------|
| Hindi→Marathi bridges | pronunciation-sounds, school-and-study, technology, festivals | 06, 11, 12, 13 |
| Word-guide blog posts | how-to-say-please-in-marathi, how-to-say-water-in-marathi, how-to-say-help-in-marathi | 02, 08, 11, 13 |

All 7 have OG images in `dist/og/` and are in sitemap.

---

## Next Batch Targets (from CONTENT_PLAN.md)

### Priority 1: Hindi→Marathi Bridges (15 READY — curriculum-backed, authoring only)
| # | Slug | Units | Notes |
|---|------|-------|-------|
| 1 | family-home | 03 | Relations, rooms, household |
| 2 | sentence-patterns | 04 | SOV, particles, tense |
| 3 | pronouns-people | 05 | Pronouns, honorifics, case |
| 4 | postpositions | 08 | Postpositions, cases |
| 5 | shopping | 09 | Market, prices, bargaining |
| 6 | health-body | 10 | Body parts, symptoms, doctor |
| 7 | time-and-seasons | 16 | Clock, calendar, weather |
| 8 | emotions | 17 | Feelings, moods, inner states |
| 9 | hobbies | 18 | Hobbies, freetime |
| 10 | work-career | 19 | Jobs, office, professions |
| 11 | review-essentials | 20 | Fused forms, sound shifts recap |
| 12 | advanced-structures | 21 | Passive, causative |
| 13 | literature-words | 22 | Low priority, niche |
| 14 | business | 23 | Trade, banking, contracts |
| 15 | media-news | 24 | Politics, formal register |

**Each bridge page MUST include:** sound-shift notes, false friends, "Hindi log, careful" mistakes block — never word-for-word equivalence claims.

### Priority 2: English→Marathi Paths (10 READY)
| # | Slug | Units |
|---|------|-------|
| 1 | introductions | U01 L1-3 + U05 L5 |
| 2 | daily-needs | U02 speaking |
| 3 | directions | U08 speaking |
| 4 | shopping-market | U09 speaking |
| 5 | technology-phone | U12 speaking |
| 6 | nature-landscapes | U14 speaking |
| 7 | transport-travel | U15 speaking |
| 8 | time-seasons | U16 speaking |
| 9 | hobbies-freetime | U18 speaking |
| 10 | workplace | U19 speaking |

### Priority 3: Grammar Pages (6 READY)
| # | Slug | Verified Picks |
|---|------|----------------|
| 1 | ability-obligation | U04 L5-6 |
| 2 | compound-verbs | U04 L3-4 |
| 3 | counting-quantifiers | U03 L4-5 |
| 4 | passive-causative | U21 L5-6 |
| 5 | frequency-adverbs | U18 L5 + Adverbs vocab |
| 6 | demonstratives | U05 L2 (thin — strong sections required) |

### Priority 4: Phrase Pages (7 READY)
| # | Slug | Data Backing |
|---|------|--------------|
| 1 | making-plans | U16 + U18 speaking (12) |
| 2 | phone-and-messaging | U12 + U24 speaking (12) |
| 3 | business-meetings | U23 + U25 L4-6 (9+) |
| 4 | asking-directions | U08 + U14 L6 + U15 L6 = 8 |
| 5 | presentations-interviews | U25 L1-3,6 + U20 L2 (5-7) — confirm ≥8 |

### Priority 5: Word Guide (1 AUTHOR)
- `how-to-say-i-love-you-in-marathi` — needs native review per REPORT.md note

---

## How to Add a Page (Dataset Pages)

### 1. Edit the correct JSON in `src/data/seo/`
| Family | JSON File |
|--------|-----------|
| Hindi→Marathi | `hindi-bridges.json` |
| English→Marathi | `english-paths.json` |
| Grammar | `grammar-pages.json` |
| Phrases | `phrase-pages.json` |
| Vocabulary | `vocab-topics.json` |

### 2. Schema (`src/lib/seo.ts:SeoPage`)
```ts
{
  family: 'hindi-bridge' | 'english-path' | 'grammar' | 'phrases' | 'vocabulary',
  slug: 'kebab-case',
  title: 'Page Title ≤60 chars',
  description: 'Meta description ≤160 chars',
  h1?: 'Optional H1 override',
  searchIntent: 'learn' | 'translate' | 'practice' | 'grammar' | 'conversation' | 'vocabulary' | 'comparison' | 'pronunciation',
  level: 'beginner' | 'intermediate' | 'advanced',
  languagePaths: ('hindi' | 'english')[],
  topics: string[],                    // for cross-linking
  primaryKeyword: 'unique target keyword',
  secondaryKeywords: string[],
  intro: string[],                     // 2+ paragraphs
  tip?: string,
  // Data hooks — MUST resolve against vocab.json / units.json
  categories?: string[],               // vocab categories
  wordIds?: string[],                  // specific word IDs
  speakingUnits?: string[],            // full unit speaking rows
  speakingPicks?: { unit: string; lessons: number[] }[],
  grammarPicks?: { unit: string; lessons: number[] }[],
  bridgeUnits?: string[],              // for hindi-bridge
  units?: string[],                    // curriculum unit links
  // Authored content (validated)
  sections?: { heading: string; paragraphs: string[] }[],
  mistakes?: { wrong: string; right: string; why: string }[],
  practice?: {
    mcq?: { question: string; options: string[]; answer: number; explanation?: string }[],
    fill?: { sentence: string; answer: string; hint?: string }[],
    translate?: { source: string; sourceLang?: 'en' | 'hi'; answer: string; note?: string }[]
  },
  relatedPages?: string[],             // absolute paths from site root
  faq?: { question: string; answer: string }[],
  appCtaVariant?: 'vocabulary' | 'phrase' | 'grammar' | 'lesson' | 'general',
  status: 'draft' | 'published'
}
```

### 3. Validation Loop
```bash
# 1. Add entry with "status": "draft"
node tools/validate-content.mjs        # must PASS (0 FAIL)
# 2. Fix warnings (keyword in title/H1/desc, duplicate options, etc.)
# 3. Change to "status": "published"
npm run build                          # must succeed
# 4. Verify page in dist/
node tools/make-og-pages.mjs --regen   # generates OG card
npm run build                          # final build with OG
npm run qa                             # must PASS
```

### 4. Marathi String Sourcing
- **Vocab:** Use `wordsFor(page)` resolver — pulls from `vocab.json` by `categories` or `wordIds`
- **Speaking:** Use `speakingFor(page)` — pulls `units.json` speaking rows by unit/lesson
- **Grammar:** Use `grammarNotesFor(page)` — pulls grammar rows
- **Bridges:** Use `bridgesForPage(page)` — pulls bridge rows (Hindi↔Marathi maps)
- **In blog posts:** Use `wordsByMarathi(['पाणी', 'मदत'])` from `src/lib/learn.ts` — throws if missing

**Never hardcode Devanagari.** If a word isn't in `vocab.json`, it doesn't exist.

---

## Key Files Reference
| File | Purpose |
|------|---------|
| `src/lib/seo.ts` | Loaders, resolvers, `relatedFor()` auto-links |
| `src/lib/learn.ts` | Canonical curriculum access (`vocab`, `units`, `wordsByMarathi`, `getUnit`) |
| `src/layouts/Learn.astro` | Page layout (SEO, JSON-LD, breadcrumbs, hero art) |
| `tools/validate-content.mjs` | Pre-build QA gate |
| `tools/lib/content-lib.mjs` | Validation logic |
| `tools/make-og-pages.mjs` | OG card generator (covers all published routes) |
| `docs/CONTENT_PLAN.md` | Roadmap & status registry |
| `TODO-REMAINING.md` | Checklist for remaining batches |

---

## Example: Adding a Hindi Bridge Page
```bash
# 1. Read current data
cat src/data/seo/hindi-bridges.json | jq 'length'  # should be 21

# 2. Append new entry (see new-hindi-bridges.json for format)
#    - slug: unique, kebab-case
#    - bridgeUnits: ["XX"] — MUST exist in units.json
#    - units: ["XX"] — for curriculum link
#    - mistakes: include sound-shift + false-friend entries
#    - practice: ≥3 mcq, ≥1 translate
#    - relatedPages: absolute paths like "/hindi-to-marathi/greetings/"

# 3. Validate
node tools/validate-content.mjs

# 4. Publish
#    - Change status to "published"
#    - npm run build
#    - node tools/make-og-pages.mjs --regen
#    - npm run build && npm run qa
```

---

## Common Validation Failures & Fixes
| Failure | Fix |
|---------|-----|
| `title over 60 chars` | Shorten title |
| `primaryKeyword absent from title/H1/description` | Include keyword verbatim in title, h1, or description |
| `duplicate options in mcq` | Make all 4 options unique |
| `relatedPage does not resolve` | Use exact path from sitemap (check `dist/sitemap-0.xml`) |
| `duplicate slug/title/description` | Ensure unique slug; don't copy-paste without changes |
| `grammar pick resolved N rows, expected M` | Check `units.json` lesson numbers match |

---

## PowerShell Helpers
```powershell
# Remove BOM if JSON parse fails
$bytes = [System.IO.File]::ReadAllBytes('src/data/seo/hindi-bridges.json')
if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    $bytes = $bytes[3..($bytes.Length-1)]
    [System.IO.File]::WriteAllBytes('src/data/seo/hindi-bridges.json', $bytes)
}

# Verify no duplicate slugs
node -e "const d=JSON.parse(require('fs').readFileSync('./src/data/seo/hindi-bridges.json','utf8')); console.log('Total:',d.length); const s={}; d.forEach(x=>{if(s[x.slug]) console.log('DUP:',x.slug); s[x.slug]=1});"

# List all pages in sitemap
Select-String "/hindi-to-marathi/" dist/sitemap-0.xml
```

---

## Acceptance Criteria for Each Page
- [ ] Entry in correct `src/data/seo/*.json` with `status: published`
- [ ] `node tools/validate-content.mjs` → PASS (0 FAIL)
- [ ] `npm run build` → succeeds, page appears in `dist/`
- [ ] `node tools/make-og-pages.mjs --regen` → OG card in `dist/og/`
- [ ] `npm run qa` → PASS
- [ ] Page renders correctly: hero image, tables, practice blocks, FAQ, related links
- [ ] All Marathi strings trace to `vocab.json` / `units.json` (no invented text)

---

## Suggested Work Order
1. **Batch A (Hindi bridges — 5 pages):** family-home, sentence-patterns, pronouns-people, postpositions, shopping
2. **Batch B (Hindi bridges — 5 pages):** health-body, time-and-seasons, emotions, hobbies, work-career
3. **Batch C (Hindi bridges — 5 pages):** review-essentials, advanced-structures, literature-words, business, media-news
4. **Batch D (English paths — 5 pages):** introductions, daily-needs, directions, shopping-market, technology-phone
5. **Batch E (English paths — 5 pages):** nature-landscapes, transport-travel, time-seasons, hobbies-freetime, workplace
6. **Batch F (Grammar — 6 pages):** ability-obligation, compound-verbs, counting-quantifiers, passive-causative, frequency-adverbs, demonstratives
7. **Batch G (Phrases — 5 pages):** making-plans, phone-and-messaging, business-meetings, asking-directions, presentations-interviews

Run validation + build + OG + QA after each batch.

---

## Questions for Human Review
- Any native-speaker review needed for AUTHOR items (tense pages, emergency phrases, i-love-you)?
- Should literature-words (bridge #13) be deferred?
- Any priority shifts before starting Batch A?

---

**Start Command:**
```bash
cd C:\Users\kumar\blog\learn-marathi
git status  # confirm on feature/final-batches
node tools/validate-content.mjs  # baseline
```