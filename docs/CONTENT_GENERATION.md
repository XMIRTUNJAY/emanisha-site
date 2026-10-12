# CONTENT_GENERATION — how to add pages safely

Audience: developers and LLMs extending the site. Follow this exactly —
the pipeline is designed so that skipping a step fails loudly.

## The pipeline

```text
Topic from CONTENT_PLAN.md
  → pick dataset (src/data/seo/<family>.json) + slug
  → draft entry (status: "draft")
  → npm run content:qa          (schema, references, thresholds, dupes, links)
  → fill real content           (copy anchored to curriculum data)
  → npm run content:qa          (again — zero FAIL, resolve WARNs)
  → status: "published"
  → npm run content:og          (OG card)
  → npm run build               (prebuild re-validates + rebuilds search index)
  → npm run content:manifest    (content-manifest.json)
  → npm run content:report      (docs/CONTENT_QA.md — links + orphans)
```

## Choosing the family + dataset

| Content | Dataset | Fields that carry the data |
|---|---|---|
| Word-topic page | `vocab-topics.json` | `categories` (whole vocab categories) and/or `wordIds` |
| Situational phrases | `phrase-pages.json` | `speakingUnits`, `speakingPicks` |
| Grammar | `grammar-pages.json` | `grammarPicks` (verified `{unit, lessons}`) |
| Hindi → Marathi bridge | `hindi-bridges.json` | `bridgeUnits` |
| English → Marathi | `english-paths.json` | `speakingUnits` / `speakingPicks` |

**Never paste vocabulary into a dataset.** Reference the curriculum
(`categories`, `wordIds`, `speakingUnits`, `grammarPicks`, `bridgeUnits`).
If the content doesn't exist in `src/data/learn/*`, the page is an
**AUTHOR** item: add the Marathi to the Bol Marathi app source first
(or flag for native review), then `npm run sync`, then build the page.

## Entry schema (all optional [] default empty)

```jsonc
{
  "slug": "kebab-case",
  "title": "≤60 chars, unique site-wide",
  "description": "60–155 chars, unique",
  "h1": "optional override",
  "searchIntent": "vocabulary|phrases|grammar|comparison|conversation|translate|learn|practice|pronunciation",
  "level": "beginner|intermediate|advanced",
  "languagePaths": ["hindi", "english"],
  "topics": ["food", "daily-life"],          // internal-linking edges
  "primaryKeyword": "marathi food words",    // must appear in title/H1/description
  "secondaryKeywords": [],
  "intro": ["paragraph", "paragraph"],
  "tip": "one practical line",
  "categories": ["Food"],                    // → VocabTable
  "wordIds": ["v-food-01"],                  // → selective picks
  "speakingUnits": ["03"],                   // → PhraseTable rows
  "grammarPicks": [{ "unit": "02", "lessons": [1, 2] }],
  "bridgeUnits": ["07"],                     // → Hindi bridge table
  "units": ["02"],                           // curriculum connection (required)
  "sections": [{ "heading": "…", "paragraphs": ["…"] }],
  "mistakes": [{ "wrong": "…", "right": "…", "why": "…" }],  // ≥2 published
  "practice": {                              // ≥3 items published
    "mcq": [{ "question": "…", "options": ["…"], "answer": 1, "explanation": "…" }],
    "fill": [{ "sentence": "मी ___ जातो.", "answer": "शाळेत", "hint": "…" }],
    "translate": [{ "source": "…", "sourceLang": "hi", "answer": "…", "note": "…" }]
  },
  "relatedPages": ["/vocabulary/food/"],     // validated against known routes
  "faq": [{ "question": "…", "answer": "…" }],
  "appCtaVariant": "vocabulary",
  "status": "draft"
}
```

## Writing rules

- Intros: 2 short paragraphs. What the page teaches, who it serves,
  what the learner walks away with. No filler, no disclaimers.
- Marathi/Hindi strings in `mistakes`/`practice` must be real — either
  quoted from curriculum rows (preferred) or constructions a native
  speaker would accept. Devanagari checks are enforced on translate answers.
- Common mistakes: prefer *documented* divergence points
  (false friends, gender, dative patterns, loanword spellings).
- Practice answers must be checkable from the page's own tables.

## Verification checklist per page

`tools/validate-content.mjs` fails on: missing fields, duplicate
slug/title/description, slug collisions with curated pages or reserved
routes, unknown word/category/unit/pick references, broken related links,
thin content, <3 practice items, <2 mistakes, missing unit link (published),
bad scripts in answer fields.

Warnings (resolve before publish when possible): keyword absent from
title/H1/description, same keyword on two pages, high topic overlap
(near-duplicate signal), short intro paragraphs.

## Regenerating derived artifacts

| Artifact | Command | When |
|---|---|---|
| `public/og/og-*.png` + manifest | `npm run content:og` | new page or title change |
| `public/search-index.json` | automatic (prebuild) | every build |
| `content-manifest.json` | `npm run content:manifest` | dataset change |
| `docs/CONTENT_QA.md` | `npm run build && npm run content:report` | release |
