# Bol Marathi Premium Audit (2026-09-19)

Scope: `C:\Users\kumar\blog\learn-marathi` (Astro site) +
`C:\Users\kumar\bol_marathi` (Flutter source). Engineering Notebook
is out of scope and untouched.

## Strengths (preserve)

Clean static Astro; 57 pages from real curriculum (26u/156l/1002w);
both directions (HI→MR + EN→MR) + Hindi mirror with hreflang;
26 unit pages with prev/next; /app/ with real screenshots, memory
story, waitlist; base-path-safe links; sitemap 56 URLs; WebP; OG
defaults; breadcrumbs + LearningResource/BreadcrumbList/FAQPage.

## Gaps → fixes (this pass)

### P0 — conversion honesty + funnel
- CTA said "Get Bol Marathi" though nothing can be gotten → reword
  to **"Join the Android Waitlist"** / "Download" only when
  `playStoreUrl` is set (config-driven). Secondary CTA becomes
  **"Start Learning Free"** → free content first.
- CTA variants were generic → contextual engine: vocabulary /
  phrase / grammar / lesson / general copy + 3-level placement
  (subtle mid → contextual → strong end). No popups, no urgency.

### P0 — homepage doesn't answer what/who/why
- Rebuild hero (what: Marathi-learning resource + app; who:
  Hindi/English learners; why: vocab→review loop), learning-path
  picker, popular resources, curriculum preview, FAQ, app CTA.

### P0 — no beginner on-ramp
- New `/start/` journey: words → greetings → sentences → bridges →
  Unit 01 → app. All steps link to real pages.

### P1 — lesson/vocab templates
- Unit pages get search-oriented H1s (data-driven map, URLs
  unchanged) + objectives/bridge/sentences/grammar/culture/practice
  structure; vocab pages keep the 5-column table + examples.

### P1 — search-intent pages (only where data supports)
- Candidates verified against vocab: hello/thank-you/sorry
  (Greetings has all three) → three "How to say X in Marathi" pages.
  Numbers 1–100: NOT supported (Numbers=33, spot-check needed) →
  deferred, documented in intent map, no thin page shipped.

### P1 — trust layer
- New `/about/`, `/how-it-works/` (methodology), `/contact/`
  (mailto), `/privacy/` (honest: no tracking; Google Translate
  widget loads Google JS). Independent-product voice, no fake
  authority. `Written/curated by Bol Marathi` byline on Learn pages
  + WebSite schema on hub.

### P1 — analytics-ready funnel
- Declarative `data-funnel` hooks (`app_cta_view/click`,
  `related_click`, `waitlist_click`, `path_step_click`) + docs;
  no vendor added.

### P2 — deferred (documented, not built)
- Full Hindi vocab-cluster mirrors (only hub/shabd/vakya/app exist)
- Testimonials/ratings (no users yet — product proof used instead)
- Comments, accounts, backend (explicitly rejected)

## Linguistic QA

Separate report: `docs/BOL_MARATHI_LANGUAGE_QA.md`. One real error
found and fixed (LM-0001 gender mismatch); two polysemes triaged;
transliteration style flagged for native review. No curriculum text
rewritten by hand.
