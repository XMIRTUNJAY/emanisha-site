# Learn Marathi — Content Architecture

Standalone Astro site (`blog/learn-marathi/`). Reference architecture:
`blog/engineering-notebook/` (static Astro, `BaseHead` SEO, sitemap,
minimal JS). The Notebook is untouched — this repo has its own
`astro.config.mjs` (`site: https://xmirtunjay.github.io`,
`base: /learn-marathi` for the GitHub Pages project site),
layouts, styles and deployment.

## 1. Reference (Engineering Notebook)

Astro 7.3.1 + `@astrojs/mdx` + `@astrojs/sitemap` + `@astrojs/rss` +
`sharp`; file-based `src/pages/`; data-driven `getStaticPaths`;
`Base`/`Learn` layouts; `BaseHead` (canonical, OG, Twitter);
`JsonLd` (`LearningResource`, `BreadcrumbList`, `FAQPage`);
base-aware `siteUrl()` helper; `public/robots.txt` + auto sitemap.

Visual identity mirrors the app
(`bol_marathi/lib/core/design_system/`): terracotta `#A43716`,
parchment `#FDFBF7`, outline `#DFC0B7` borders, 16px card/button
radius, pill chips, label-style uppercase kickers, 17px body with
roomy Devanagari line-height. Light-only like the app (no dark
mode). App screenshots on `/app/` are copied frames from
`bol_marathi/frame_*.png` into `public/screenshots/`.

## 2. Bol Marathi source (verified)

- `bol_marathi/content/units/unit_01…26.json` — per unit: titles,
  intro, goals, `vocabGroups`, and 6 rows each of `grammar`,
  `cultural`, `speaking`, `listening`, `bridge`, `sentenceBuilder`.
  26 × 6 = **156 lessons**.
- `bol_marathi/lib/content/generated_vocab.dart` —
  `extendedVocabulary`, **1002 entries** (`id v-<group>-NN`,
  `marathi/hindi/english/transliteration/category/examples`).
- Runtime join: `lib/content/unit_json.dart` (7 vocab/lesson by
  rotation). Regenerated via `dart tool/gen_unit_content.dart`,
  guarded by `test/unit_json_test.dart`.
- Real app capabilities: vocab, listening (mp3 + TTS), speaking
  (`speech_to_text`), sentence builder, Hindi bridge, SRS
  (`mastery_engine`), quiz, placement, search. No live store
  listing — CTAs are config-gated (`src/data/app.ts`).

## 3. Canonical model

```text
bol_marathi/content/units/*.json + generated_vocab.dart
  (canonical, stays in Flutter repo)
          ↓  npm run sync (tools/sync-learn-marathi.mjs)
src/data/learn/*.json (committed snapshot, reviewable diff)
          ↓  getStaticPaths + components
static pages (/vocabulary/… /phrases/… /lessons/… /app/)
```

Website schema (`src/lib/learn.ts`): `Word`, `Unit`
(`GrammarRow/CultureRow/SpeakingRow/ListeningRow/BridgeRow/
BuilderRow`), `Cluster`, `PhraseSet`, `GrammarTopic` — strict
subsets of app fields. No invented translations.

## 4. Routes (site root — no namespace needed)

```text
/                              hub
/vocabulary/                   cluster index
/vocabulary/<cluster>/         8 curated clusters
/phrases/                      phrases index
/phrases/<set>/                greetings, daily, travel
/hindi-to-marathi/             bridge index (Hindi-first)
/hindi-to-marathi/words/
/hindi-to-marathi/phrases/
/english-to-marathi/           bridge index (English-first)
/english-to-marathi/words/
/english-to-marathi/phrases/
/grammar/                      grammar index
/grammar/<topic>/              pronouns, verbs, sentence-structure
/lessons/                      26-unit index
/lessons/<unit>/               per-unit lesson page
/app/                          conversion landing page (screenshots + mailto waitlist)
```

No per-word pages (thin-content rule). 156 lessons merged into
26 unit pages. Hindi mirror (`/hi/` hub, `/hi/shabd/`, `/hi/vakya/`,
`/hi/app/`) reuses the same data with Hindi chrome + `hreflang`
both ways; footer also offers Google Translate (hi/mr) for the rest.

## 5. SEO

One intent per page; clusters only where counts justify
(Food 84, Travel 50+16, Verbs 105…); Shopping (12)/Colors (13)/
People (10)/Pronouns (8) merged, never standalone. `BaseHead`
canonical + OG + Twitter; `JsonLd` `LearningResource` +
`BreadcrumbList` everywhere, `FAQPage` only on `/app/`.
Sitemap auto-included; `robots.txt` allows `/`.
Internal chain: hub → cluster → related → unit → app; every
page has a related block; no orphans.

## 6. Funnel

Soft CTA mid-page → strong CTA end-page → lesson CTA on units
→ `/app/` landing. All from `src/data/app.ts`
(`comingSoon: true` → coming-soon copy; set `playStoreUrl` +
`comingSoon: false` on launch). Conceptual events:
`page_view`, `content_engagement`, `app_cta_click`,
`download_click` (no vendor in V1).

## 7. Generation

`npm run sync` — zero-dep Node: validates required keys + 6
rows/section, parses vocab Dart via regex, writes
`units/vocab/meta.json`. Re-run on content updates; pages pick
it up with no code change.

## 8. Linking

Beginner hub → vocabulary → phrases → grammar → unit → app.
Food → daily conversation; Hindi words → Hindi phrases →
Units 01–02. `related` arrays in `src/lib/learn.ts`.

## 9. Scale

New unit JSON → sync → new `/lessons/<unit>/` appears; counts
update. New category → add `Cluster` only above ~15 entries.
Future: shared content package consumed by both Flutter and
Astro; web audio via CDN (no binaries in V1).

## 10. Risks

Drift if sync forgotten (`meta.json` logs counts); thin
content if clusters proliferate (size gate); fake store links
(config-gated, default coming-soon).

## 11. Migration

V1 (here): read-only sync. V2: shared content location for
both consumers. V3 (optional): audio + search index, static.

## 12. SEO content engine (added 2026-09 — feature/seo-content-engine)

A data-driven layer for scaling to 100+ learning pages without
thin or duplicated content. Full docs: `docs/CONTENT_GENERATION.md`,
`docs/CONTENT_PLAN.md`, `docs/SEO_STRATEGY.md`, `docs/INTERNAL_LINKING.md`.

```text
src/data/seo/*.json          page datasets (5 families, status: draft|published)
src/lib/seo.ts               typed loader + resolvers + auto related links
src/components/              VocabTopicPage / PhraseTopicPage / GrammarTopicPage /
                             QuickPractice / MistakeTable / PhraseTable / SeoCards
tools/validate-content.mjs   prebuild QA gate (npm run content:qa)
tools/content-manifest.mjs   → content-manifest.json (all pages, all statuses)
tools/content-report.mjs     → docs/CONTENT_QA.md (links, orphans, stats)
tools/make-og-pages.mjs      extended to render OG cards for dataset pages
tools/build-search-index.mjs extended to index published dataset pages
```

Route mapping (existing section routes extended, no URL changes):

```text
/vocabulary/<slug>/          clusters (learn.ts) + vocab-topics.json pages
/phrases/<slug>/             phraseSets (learn.ts) + phrase-pages.json pages
/grammar/<slug>/             grammarTopics (learn.ts) + grammar-pages.json pages
/hindi-to-marathi/<slug>/    hindi-bridges.json (bridge-row pages)
/english-to-marathi/<slug>/  english-paths.json (English-first pages)
```

Hard rule: rendered words/phrases/notes resolve from
`vocab.json`/`units.json` at build time and **throw** on bad references.
Published pages require ≥10 words / ≥8 phrases / ≥5 bridges / ≥1 grammar
note, ≥3 practice items and ≥2 mistakes — enforced by the validator.

Header navigation groups into Learn / Practice / Explore dropdowns
(zero-JS `<details>` + close-on-outside-click enhancement); Hindi pages
keep the flat `HI_NAV` strip.
