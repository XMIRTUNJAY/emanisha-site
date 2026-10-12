# INTERNAL_LINKING — the content graph

The site is a graph, not a pile of articles. Every page must answer
"where do I go next?" with concept links, not "10 random posts".

## Layers

1. **Declared links** — `relatedPages` in each dataset entry
   (site-relative, trailing slash, validated against the known-route set).
2. **Automatic links** — `relatedFor(page)` in `src/lib/seo.ts` computes:
   - declared links first
   - cross-family pages sharing a `topics` value
     (concept → related concept: `vocabulary/emotions` ↔
     `hindi-to-marathi/emotions` ↔ `phrases/family-talk`)
   - curriculum units (`units` field → `/lessons/<NN>/`)
   - one same-family sibling sharing a topic
   - quiz link for the original 9 curated clusters
   Capped at 7, deduped, deterministic.
3. **Hub links** — every family index renders `SeoCards` for its published
   engine pages, so no engine page is reachable only by search.
4. **Breadcrumbs** — every engine page: Home → family hub → page, rendered
   by `Learn.astro` + `BreadcrumbList` JSON-LD.

## Orphan control

`npm run content:report` (after build) strips `<header>`/`<footer>` chrome
and reports pages with zero *content-area* inbound links into
`docs/CONTENT_QA.md`. Chrome-linked utility pages (`/about/`, `/privacy/`,
`/search/`, `/review/`) are allowed; a content-engine page showing up there
is a defect — fix by linking from a sibling page or the family hub.

## Link-validity control

The same report resolves every internal `href` in `dist/` and fails on
broken links. `relatedPages` are additionally checked at validation time
against routes derived from `src/pages/**` + all datasets.

## The graph rule for authors

When adding a page, set `topics` thoughtfully — topics are the edges.
Good: `["emotions", "conversation"]`. Bad: `["misc"]`.
Add 2–3 explicit `relatedPages` that form a *learning path*:
word list → phrase set → grammar note → unit. The content should explain
why each link is next (see `RelatedContent` heading: "Keep learning").

## App funnel links

Each page renders one contextual `AppCTA` (variant per family) **after**
the content + practice: value first, ask second. CTA copy explains the
practice loop (listening, speaking, spaced review), never bare
"download the app".
