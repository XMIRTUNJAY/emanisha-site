# Funnel Map

**intent → landing → related → CTA → destination.**
Copy + store URLs render from `src/data/app.ts`
(`comingSoon: true` until the Play Store listing is live).

## Clusters

- **Beginner:** "learn marathi for beginners" → `/` →
  `/vocabulary/beginners/` → phrases, Unit 01 → soft + strong CTA
  → `/app/`
- **Hindi → Marathi:** "hindi to marathi words/sentences" →
  `/hindi-to-marathi/` → words → phrases → Units 01–02 →
  lesson CTA → `/app/`
- **English → Marathi:** "english to marathi words/sentences" →
  `/english-to-marathi/` → words → phrases → Units 01–02 →
  lesson CTA → `/app/` (uses `english`/`mapEn`/`grammarEn` fields;
  cross-linked both ways with the Hindi section)
- **Daily life:** "marathi family/food words" →
  `/vocabulary/<cluster>/` → related → unit → practice CTA →
  `/app/`
- **Travel + shopping:** "marathi travel/shopping phrases" →
  `/phrases/travel/` → `/vocabulary/travel/` → Units 14–15 →
  strong CTA → `/app/`
- **Grammar:** "marathi pronouns/sentence structure" →
  `/grammar/<topic>/` → related unit → lesson CTA → `/app/`
- **Lessons:** navigational → `/lessons/` →
  `/lessons/<unit>/` → next-unit + lesson CTA → `/app/`

## CTA variants (`src/components/AppCTA.astro`)

- `soft` — "Want to practice these words? Listen, speak, build
  sentences and review with spaced repetition in Bol Marathi."
  + `Practice in Bol Marathi`
- `strong` — "Learn Marathi beyond reading…" +
  `Download Bol Marathi`
- `lesson` — "Finished this lesson? Continue your Marathi
  practice in Bol Marathi." + `Continue Learning →`

Coming-soon mode links all CTAs to `/app/` with the
`comingSoonNote`. `/app/` shows real app screenshots
(`public/screenshots/`, copied from `bol_marathi/frame_*.png`)
plus a mailto waitlist (`contactEmail` + `waitlistSubject` in
`src/data/app.ts`) so demand is trackable by inbox. Set
`playStoreUrl` on launch — no template edits.

## Events (conceptual, no vendor V1)

`page_view`, `content_engagement`, `app_cta_click`,
`download_click`.

## Implemented declarative hooks (analytics-ready, no JS added)

Every measurable element carries `data-funnel` + context attributes,
so any future lightweight tracker can subscribe via one delegated
listener — no per-page code:

| Hook | Elements | Attributes |
|---|---|---|
| `app_cta_click` | all AppCTA panels/links, hub hero | `data-app-cta`, `data-cta-variant`, `data-cta-context` |
| `download_click` | store buttons on /app/ (render only when live) | `data-cta-variant="app-end"` |
| `waitlist_click` | waitlist mailto buttons | `data-cta-variant="*-waitlist"` |
| `related_click` | RelatedContent links | (href as target) |
| `path_click` / `path_step_click` | hub path cards, /start/ steps | (href as target) |

Funnel: SEO landing → `related_click`/`path_*` → `app_cta_click`
→ /app/ → `waitlist_click`/`download_click`. Add a vendor only
when traffic justifies it; never two trackers.
