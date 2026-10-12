# REPORT — seo-funnel-fixes (branch) → main

## Phase 0 — Deploy check
- `npm install && npm run build`: green, 80→84 pages by end of branch.
- `npm ci` FAILS on Windows (EPERM unlink — file locks); lockfile is
  committed and `npm install` is a no-op against it. CI runs Ubuntu
  where `npm ci` works. Environmental, not a code issue.
- `astro.config.mjs`: `site https://xmirtunjay.github.io`,
  `base /learn-marathi` match the Pages project URL. Added
  `trailingSlash: 'always'`. deploy.yml builds `main` — nothing blocks
  deployment.

## Phase 1 — Funnel and waitlist (before → after)
- 6+ scattered mailto links (app buttons, panels, contact, footer
  fallback, personal Gmail in source AND built HTML) → ONE shared
  `WaitlistForm` (Formspree, honeypot `_gotcha`, hidden page/language/
  referrer, `_next` → `/app/#joined`). Zero `mailto:`/Gmail in source
  or built HTML (verified by scan).
- Empty endpoint no longer renders a dead post: build-time warning +
  disabled form. (Endpoint is currently set, so this path is dormant.)
- Content pages: 2–3 CTA blocks → exactly ONE contextual panel
  (vocabulary/phrase/grammar/lesson). Index/hub/quiz pages: one.
- `betaOptInUrl: null` added: when set, primaries read "Join the beta";
  else waitlist form; store labels only when live.
- Hero: waitlist-primary → "Start Learning Free" primary, waitlist ghost.
- "The website teaches reading knowledge" → "Learn the words here.
  Practise listening and speaking in the app." (AppCTA + /app/ FAQ).
- Analytics: config fields removed; env-only
  (`PUBLIC_ANALYTICS_SRC`/`_DOMAIN`/`_ATTRS`), unset = nothing loads.
  Privacy page updated to match.

## Phase 2 — Technical SEO (before → after)
- Brand strings centralized in `src/data/brand.ts` (rename-safe);
  reviewer placeholder in `src/data/brand.ts` (`REVIEWER.name === ''`
  renders "pending native-speaker review" on Learn/About/Method).
- Titles/descriptions: 44 pages over 60/155 → **zero** (verified by
  `tools/check-meta.cjs`). Unit titles now `Unit NN: Title | Free
  Marathi Lesson`; H1s keep search intent.
- OG: 1 generic card → 83 per-page cards
  (`tools/make-og-pages.mjs`, manifest-driven lookup in BaseHead,
  Latin-only text, `og-default.png` fallback). Verified every page's
  file exists.
- JSON-LD: WebSite + Organization site-wide (Base); BreadcrumbList on
  all Learn pages + all Base-direct pages (new `crumbs` prop);
  LearningResource kept; ItemList on vocabulary + lessons indexes;
  MobileApplication renders only when live (dormant code path).
- i18n: reciprocal hreflang + `x-default` on all 4 mirrored pairs;
  `lang="hi"` on /hi/; full Hindi header nav (`src/i18n/hi.ts`);
  Hindi footer/CTA/form already localized; footer adds "Read in
  English" on /hi/ pages. Translate widget kept (explicit prior
  instruction) + fallback text so the line never renders empty.
- Links: all internal hrefs through base-aware trailing-slash
  `siteUrl()` (fixed favicon/sitemap root-relative strays + header
  template-string bypasses).
- README: no local paths (BOL_MARATHI_ROOT), robots/project-site
  caveat, sitemap submission note, waitlist/analytics/beta docs.
- Sitemap: `@astrojs/sitemap` has no `lastmod` option — documented,
  not faked.

## Phase 3 — Content quality
- Overrides (`src/data/overrides.json`, applied+logged by sync):
  1. `v-spi-02` exampleHindi/English — गोडा मसाला was glossed as
     "garam masala"; now "गोडा मसाला डालो। / Add goda masala
     (Maharashtrian sweet-spice blend)." **[needsReview]**
     Upstream fix: same change in generated_vocab.dart.
  2. `v-spi-28` / `v-snk-07` noteEn — usage notes differentiating
     भजी (general) vs कांदा भजी (onion). Upstream: same.
  3. `v-snk-09` / `v-snk-10` noteEn — loanword transparency
     ("South Indian dish name commonly used in Marathi").
     Upstream: same. (उत्तपा already had it.)
- Rejected reviewer claims (evidence in prior report): no गोडा-मसाला
  headword exists; भजी/ताट pairs are distinct entries; idli kept.
- `npm run qa` (runs in CI before build): missing fields, same-category
  duplicate headwords, Devanagari-in-English, template pluralisation
  typos → exit 1. Polysemes + needsReview listed, not failed.
- 15 category intros (100–150w, data-descriptive) + tips; every
  example claim cross-checked (तुझी→माझी fix, वर/खाली + मागे/पुढे
  verified, सफरचंद example verified).
- Respelling (`src/lib/simple.ts`, documented deterministic map,
  unhyphenated by design): EN path shows simple, HI path hides
  romanisation, elsewhere diacritic + CSS-only toggle.
  **[needsReview with LM-0004]**.
- Drafts (all bannered `needsReview`): `/marathi-alphabet/`
  (Unit-01 vowels/consonants + क-row pattern only),
  `/marathi-vs-hindi/` (verified काल/उद्या + हा/ही/हे; आपण paradigm
  flagged not taught), `/how-to-say-good-morning-in-marathi/`
  (verified शुभ सकाळ/रात्री), `/how-to-say-i-love-you-in-marathi/`
  (प्रेम verified; sentence pattern explicitly withheld).
  Birthday skipped as standalone (single example; needs curriculum).

## Phase 4 — Growth features
- `tools/gen-audio.mjs`: Azure Speech batch TTS (env creds), hash
  cache → `public/audio/`, `src/data/audio-manifest.json`;
  VocabTable prefers clips (lazy `Audio()` on tap), else device TTS.
  Ran without creds → empty manifest + setup instructions; site
  unaffected. **[needsReview: native check of all clips]**.
- Anki: `genanki` needs Python (absent here) — existing
  `tools/make-anki.mjs` TSVs already import into Anki and stay the
  mechanism; documented.
- Quiz per category already exists (prior pass) — kept, ends with
  contextual app CTA.
- Top 50–100 word pages: SKIPPED — conditions unmet (no audio, single
  examples). Documented, not built.

## Still requiring a human
1. Formspree endpoint — SET (`.../xqpaeejw`). Confirm target email +
   test-submit once.
2. Analytics domain/ID — NOT set (env vars documented in README).
3. Reviewer name — PLACEHOLDER ("pending native-speaker review").
4. Native review: v-spi-02 blend gloss, respelling map (LM-0004),
   transliteration drift, all 4 draft pages, any future TTS clips.
5. TTS credentials (Azure) — not provided; script ready.
6. Search Console + Bing sitemap submission (+ URL inspection for
   hub, /hi/, how-to pages).
7. Upstream (bol_marathi/): v-spi-02 example fix, 4 note
   differentiators, `dart tool/gen_unit_content.dart` + tests for
   LM-0001, transliteration pass.

## Validation results (this branch)
- `npm run build`: **84 pages, 0 errors**
- `npm run qa`: **PASS** (2 legitimate polyseme WARNs, 1 needsReview listed)
- Titles/descriptions: **0 over limits** (was 44)
- Internal links: **OK** (all pages)
- OG files: **all exist** (83 cards)
- Sitemap: **83 URLs**
