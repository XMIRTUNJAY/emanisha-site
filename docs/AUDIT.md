# AUDIT — Bol Marathi Website (pre SEO Content Engine)

Date: 2026-09-24 · Branch: `feature/seo-content-engine` · Auditor: automated + manual review

This audit precedes the SEO content engine work. Rule applied: **reuse, don't rebuild.**

---

## 1. Architecture inventory

- **Framework:** Astro 7.3.1, fully static, GitHub Pages project site
  (`site: https://xmirtunjay.github.io`, `base: /learn-marathi`, `trailingSlash: 'always'`).
- **Integrations:** `@astrojs/mdx`, `@astrojs/sitemap` (emits `sitemap-0.xml` + `sitemap-index.xml`).
  `@astrojs/rss` is a dependency but **no RSS endpoint exists** (unused; keep for future blog feed or remove).
- **Content Collections:** NOT used. Content = JSON snapshots + curated TypeScript taxonomy.
- **Source of truth:** `src/data/learn/units.json` (26 units × 6 lessons = 156 lessons),
  `src/data/learn/vocab.json` (1,002 words, 29 categories), `src/data/learn/meta.json`.
- **Curated taxonomy:** `src/lib/learn.ts` — 9 vocabulary clusters, 4 phrase sets,
  5 grammar topics, per-unit SEO H1s (`unitSeo`). All cluster/phrase/grammar pages are
  **derived from the snapshots** — the site never invents vocabulary.
- **Correction layer:** `src/data/overrides.json` (5 website-only vocab fixes, applied by sync).
- **Layouts:** `Base.astro` (head, header, footer, site-wide JSON-LD WebSite+Organization,
  BreadcrumbList, service worker, analytics hook) → `Learn.astro` (content pages: breadcrumbs,
  hero art + LQIP, kicker/H1/lede, byline, `LearningResource`/`FAQPage`/`ItemList` JSON-LD).
- **URL helper:** `src/lib/site.ts` `siteUrl()` — every internal link goes through it. Preserve this.

## 2. Page inventory (50 source files → ~103 routes)

| Family | Route | Count | Data source |
|---|---|---|---|
| Hub / product | `/`, `/start/`, `/app/`, `/about/`, `/how-it-works/`, `/contact/`, `/privacy/`, `/downloads/`, `/review/`, `/search/` | 10 | static |
| Guides | `/marathi-alphabet/`, `/marathi-numbers/`, `/marathi-days-months/`, `/marathi-pronunciation/`, `/marathi-vs-hindi/`, 4 × `/how-to-say-*/` | 9 | static (+ vocab lookups) |
| Vocabulary | `/vocabulary/` + `/vocabulary/[cluster]/` | 10 | `clusters[]` → `wordsByCategory` |
| Phrases | `/phrases/` + `/phrases/[set]/` | 5 | `phraseSets[]` → `phrasesFor` (unit speaking rows) |
| Grammar | `/grammar/` + `/grammar/[topic]/` | 6 | `grammarTopics[]` → verified `{unit, lessons}` picks |
| Lessons | `/lessons/` + `/lessons/[unit]/` | 27 | `units.json` (full unit render) |
| Quiz | `/quiz/` + `/quiz/[cluster]/` | 10 | 10-question generated quizzes |
| Hindi path | `/hindi-to-marathi/` (+ `/words/`, `/phrases/`) | 3 | vocab filter + bridge rows |
| English path | `/english-to-marathi/` (+ `/words/`, `/phrases/`) | 3 | same |
| Hindi mirror | `/hi/` (4 pages, `lang="hi"`, hreflang) | 4 | mirrored paths |
| Blog | `/blog/` + 14 situational posts | 15 | hand-written, vocab-verified |

## 3. SEO implementation status (already strong — do not regress)

- Unique `<title>` + `<meta name="description">` required on every page (enforced via layout props); `tools/check-meta.cjs` audits length post-build.
- Canonical per page; `sitemap` link; robots meta only where `noindex` (404).
- Open Graph + Twitter cards; **101 per-route 1200×630 OG PNGs** (`public/og/`, `src/data/og-manifest.json`) with LQIP placeholders (`src/data/lqip.json`); section/default fallback in `src/lib/art.ts`.
- JSON-LD: `WebSite`, `Organization`, `BreadcrumbList` (Base), `LearningResource`, `FAQPage`, `ItemList` (Learn/JsonLd), `WebPage`+`FAQPage` (home).
- hreflang `x-default`/`en`/`hi` on the 4 mirrored page pairs.
- `robots.txt` (allows AI crawlers, sitemap line), `llms.txt`, PWA manifest, service worker, offline page.

## 4. Data assets usable for the content engine

### 4.1 vocab.json — 1,002 words / 29 categories
Greetings 15 · Pronouns 8 · Questions 7 · Family 15 · People 10 · Numbers 33 ·
Food 84 · Home 65 · Verbs 105 · Adjectives 68 · Travel 50 · Time 34 · Shopping 12 ·
Body 43 · Weather 16 · Colors 13 · Animals 40 · Clothing 38 · Emotions 20 ·
Education 38 · Work 42 · Grammar 32 · Culture 32 · Phrases 46 · Adverbs 30 ·
Nature 47 · Directions 16 · Abstract 36 · Routine 7.

**Categories NOT yet covered by any cluster page:** Weather, Animals, Clothing,
Emotions, Education, Work, Grammar, Culture, Nature, Abstract (~305 words) —
prime material for new topic pages without inventing a single word.

### 4.2 units.json — per unit: grammar[6], cultural[6], speaking[6], listening[6], bridge[6] (Hindi→Marathi word-mapped sentence comparisons), sentenceBuilder[6]
- `bridge[]` rows are the **Hindi→Marathi differentiator**, already structured
  (hindi/marathi/english + word map + grammar note). Currently only surfaced on
  unit pages and the two `/hindi-to-marathi/` pages.
- `speaking[]` rows (156 real sentences with Hindi/English/tip) power phrase pages.

## 5. Findings (defects / gaps)

| # | Severity | Finding |
|---|---|---|
| F1 | **High** | `public/search-index.json` committed copy is stale — 1,028 entries (26 lessons + 1,002 words); clusters/phraseSets/grammarTopics missing. Regenerated on `npm run build` (prebuild), but verify after next build. |
| F2 | Medium | Orphan page `/review/` (`review.astro`) — zero inbound links. |
| F3 | Medium | Orphan page `/search/` (`search.astro`) — zero inbound links. |
| F4 | Low | Unused components: `ProgressRing.astro`, `ReviewNote.astro`. |
| F5 | Low | `REPORT.md` claims "84 pages / 83 sitemap URLs" — actual build is ~103 routes. Doc drift. |
| F6 | Low | `@astrojs/rss` unused (no endpoint). |
| F7 | Low | Hindi nav has 7 links vs English 9 (no Quiz/Blog on `/hi/`). Intentional? Decide. |
| F8 | Info | Audio pipeline dormant (no TTS credentials) — device TTS fallback everywhere. By design. |
| F9 | Info | `how-to-say-good-morning-in-marathi` doesn't use shared `WordGuide.astro` (other 3 do). |
| F10 | Info | `REPORT.md` references never-shipped `/how-to-say-i-love-you-in-marathi/` page. Stale doc reference only. |

## 6. Opportunities (what the engine should build on)

1. **10 uncovered vocab categories** → 10+ new topic pages at zero vocabulary risk.
2. **156 bridge rows** → 15–25 Hindi→Marathi bridge pages (the differentiator), grouped by unit/theme.
3. **156 speaking rows** → situational phrase pages (doctor=U10, office=U11/U19, school=U11, travel stay=U15, emotions=U17…).
4. **156 grammar notes** → new grammar topics (tenses, gender, plurals, imperatives…) via verified picks.
5. **6 sentenceBuilder rows/unit** → practice material already interactive (`SentenceBuilder.astro`).
6. Internal linking: `RelatedContent.astro` exists; needs a metadata-driven auto-link layer.
7. Practice: zero-JS `<details>`-pattern already used for FAQs → reusable `QuickPractice` component.

## 7. Decisions locked for the rebuild

- **No Content Collections migration.** JSON datasets + `lib/*.ts` loaders match the existing architecture.
- **New page families plug into existing section routes** (`/phrases/`, `/grammar/`, `/vocabulary/`, `/hindi-to-marathi/`, `/english-to-marathi/`) — no URL breakage, no redirects needed.
- All new pages render with `Learn.astro` (breadcrumbs, JSON-LD, byline) + existing
  `VocabTable`, `RelatedContent`, `AppCTA`, `SentenceBuilder`; new shared components only
  for practice (`QuickPractice`) where nothing exists.
- Content datasets declare `status: draft|published`; build filters to published; QA tool enforces thresholds.
- Quality gate: every rendered word/phrase row must trace to `vocab.json`/`units.json`
  (by category, wordId, or unit pick) unless explicitly hand-authored with validation.
