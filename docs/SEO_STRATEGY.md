# SEO_STRATEGY — Bol Marathi

How the site earns search traffic without becoming an article farm.

## Positioning

Bol Marathi teaches Marathi **from Hindi and from English**. The durable
differentiator in search is the Hindi → Marathi bridge: thousands of Hindi
speakers need Marathi for Pune/Mumbai/Maharashtra life and almost no site
systematically maps "what you already know → what changes."

The funnel:

```text
Google → useful Marathi lesson → quick practice → related lesson →
structured course (26 units) → Bol Marathi app (SRS + speaking)
```

SEO pages are *entry points into the curriculum*, never dead-end articles.

## Search intent model

Every page declares `searchIntent`: `learn | translate | practice | grammar |
conversation | vocabulary | comparison | pronunciation`. One intent per
page. A keyword existing is not a reason for a page; an *unanswered
question* is. Duplicated intent across pages → merge, redirect, or
differentiate (see the dedupe registry in `CONTENT_PLAN.md` §0).

## Metadata contract (validated + rendered)

Per page, guaranteed by `validate-content.mjs` + the `Learn` layout:

- unique `<title>` (≤60 chars), unique meta description (60–155 chars)
- unique H1, canonical URL, sitemap inclusion, breadcrumbs (UI + JSON-LD
  `BreadcrumbList`), `LearningResource` + `FAQPage` structured data
- OG/Twitter card (per-route PNG from `tools/make-og-pages.mjs`)
- declared `primaryKeyword` present in title/H1/description; secondary
  keywords tracked in the datasets and `content-manifest.json`

## Page families and why they exist

| Family | Base | Intent served | Data backing |
|---|---|---|---|
| Vocabulary topics | `/vocabulary/<slug>/` | "X words in Marathi" | vocab.json categories/wordIds |
| Phrases by situation | `/phrases/<slug>/` | "what do I say when…" | unit speaking rows |
| Grammar | `/grammar/<slug>/` | "how does X work" | verified `{unit, lessons}` picks |
| Hindi → Marathi | `/hindi-to-marathi/<slug>/` | "I know Hindi word, Marathi?" | unit bridge rows |
| English → Marathi | `/english-to-marathi/<slug>/` | "how to say X in Marathi" | unit speaking rows |

## Anti-farm rules

1. **Traceability.** Every rendered word/phrase/note resolves from the
   curriculum snapshots at build time; unresolvable references throw.
2. **Thresholds.** Below min content counts, the page cannot publish.
3. **No near-duplicates.** Validator fails on duplicate
   slug/title/description/keyword; warns on topic overlap.
4. **Practice on every page** (≥3 items) — a page that can't be practised
   is a farm page.
5. **Curriculum link required** — every page points at ≥1 unit.
6. **Draft-first.** New pages start `status: draft`; publish only after QA.
7. **Native review honesty.** Pages needing new linguistic content stay
   AUTHOR-status in `CONTENT_PLAN.md` until reviewed. Grammar tenses are
   deliberately held back rather than guessed.

## What we deliberately do NOT do

- No keyword stuffing, no 500-word filler intros, no "whether you're a
  beginner or advanced learner" boilerplate.
- No per-word pages for the sake of count (word guides exist only where
  search demand is proven: hello, sorry, thank you, good morning…).
- No fake schema, no fake store links, no AI-generated Marathi outside the
  reviewed curriculum data.
