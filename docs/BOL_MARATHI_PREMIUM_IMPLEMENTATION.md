# Premium Implementation Report (2026-09-19, 2nd pass)

## Completed

- **Audits:** `docs/BOL_MARATHI_PREMIUM_AUDIT.md` (strengths, P0–P2 gaps),
  `docs/BOL_MARATHI_LANGUAGE_QA.md` (scan + triage), `tools/qa-scan.mjs`
  (repeatable, read-only), `docs/BOL_MARATHI_SEARCH_INTENT_MAP.md`.
- **CTA honesty:** "Get Bol Marathi" removed pre-launch. Engine now has
  vocabulary / phrase / grammar / lesson / general / subtle variants with
  missing-capability copy; pre-launch label is "Join the Android
  Waitlist" → /app/; store labels appear only when `playStoreUrl` set.
  3-level placement (subtle → contextual → general) across all templates.
- **Homepage:** hero answers what/who/why; primary waitlist CTA +
  secondary "Start Learning Free" → /start/; path picker (beginner /
  Hindi / English / हिंदी); popular-topics grid; why-section; visible
  FAQ + FAQPage schema; WebSite schema; byline.
- **Start Here:** `/start/` 6-step beginner journey, all steps real.
- **Lessons:** data-driven SEO H1s for all 26 units (from verified
  README focus), URLs unchanged; practice-suggestions section;
  subtle + lesson + general CTAs; prev/next kept.
- **Search-intent pages (3):** /how-to-say-{hello,thank-you,sorry}-in-
  marathi/ via shared `WordGuide` template; each backed by a verified
  vocab entry + notes; unique titles/descriptions; cross-linked.
  Numbers 1–100 and days/months deliberately NOT shipped (data
  insufficient — documented).
- **Trust:** /about/, /how-it-works/, /contact/, /privacy/ (honest re:
  Translate cookies, no tracking); footer navs; "Curated by Bol
  Marathi" byline on all Learn pages.
- **Data:** sync extended with `note`/`noteEn` (all 1002 have notes);
  fixed LM-0001 at app source + re-synced.

## Pages created (8)

`/start/`, `/about/`, `/how-it-works/`, `/contact/`, `/privacy/`,
`/how-to-say-hello-in-marathi/`, `/how-to-say-thank-you-in-marathi/`,
`/how-to-say-sorry-in-marathi/` (+ audit/QA/intent docs, not indexed
as content — docs/ isn't under src/pages).

## Pages modified

All templates (CTA variants), index (hero/paths/FAQ/schema),
`[unit]` (H1/title/practice/CTAs), `[cluster]`/`[set]`/`[topic]`/
HI/EN words/phrases (3-level CTAs), footer (trust navs), BaseHead
(og default — prior pass), Learn (h1/byline).

## Content corrected

LM-0001 (`v-an2-11` घोडा→घोडी) at `bol_marathi` source + re-sync.
Three unverified claims removed from new pages before publish
(morning-greeting scope, बरं reply, सॉरी usage). Transliteration
drift flagged, not rewritten.

## Verification

`npm run build`: 65 pages, 0 errors. Internal links: OK (64 pages).
Duplicate titles: none. Duplicate descriptions: none. noindex: 404
only. Sitemap: 64 URLs. QA scan: 2 remaining findings, both
legitimate polysemy.

## Remaining / next phase

- App repo: re-run `dart tool/gen_unit_content.dart` + tests for
  LM-0001; native review of transliteration (LM-0004).
- P1 content: numbers data, days/months audit, pronunciation guide,
  Hindi cluster mirrors, Hindi CTA copy variants.
- Post-launch: flip `playStoreUrl`, add testimonials/ratings only
  when real, consider form-based waitlist + single analytics vendor.

---

# FINAL PASS (same day) — what changed after the above

- **Taxonomy fix:** grammar topics used keyword-regex over note bodies
  ("Word Order" leaked onto Pronouns). Replaced with explicit
  `{unit, lessons}` picks in `learn.ts` (U05-all + U01-L4 for
  pronouns; U04-L3–6 + U01-L5 + U21-L5–6 verbs; U01-L6 + U04-L1–2 +
  U08-L1–2 sentence-structure). Verified in output.
- **CTA discipline:** max 1 contextual + 1 final panel per page
  (subtle links removed everywhere). Spot-check: every page shows
  exactly the intended variants, exactly one H1.
- **Homepage:** "Who is it for" block (Hindi/English/beginners/
  travellers/Maharashtra) + trust/methodology block.
- **Method rewrite:** 8-step learning loop, why-bridges, progression,
  website-vs-app split. No superlative claims.
- **Related links:** all sets/topics now 3 links (added unit links).
- **"Get Bol Marathi"** heading removed pre-launch.
- **OG image:** regenerated with exact "1002 words · 156 lessons".
- **Performance:** dist 2MB total; zero blocking JS/CSS files
  (Astro inlines the tiny menu script; only deferred Translate widget
  is external). Largest assets: 4 WebP shots (81–90KB each).
- **A11y:** 1 H1/page verified; screenshot alts; labeled email input;
  focus-visible rings; accent-on-white contrast ~7:1; lang="hi" on
  Hindi pages; tables scroll in regions with labels.

---

# REVIEW-ROUND PASS (external review, minus monetization)

Reviewer claims checked against data first — two rejected with
evidence: no "गोडा मसाला" entry exists (only correct generic
मसाला = spice mix); भजी/कांदा भजी and ताट/थाळी are distinct
entries (fritters vs onion fritters; plate vs platter), not dupes.
Idli/dosa kept as Maharashtra foods, noted. No alphabet/barakhadi
page: Grammar category holds conjunctions, not the alphabet —
documented as gap, not invented.

- **Funnel:** /app/ beta framing ("closed testing — waitlist members
  get beta invites first"); footer stays the only form CTA, all else
  mailto (deliberate A/B: `waitlist_signup` vs `waitlist_click`).
- **Lead magnets:** /downloads/ with Anki-ready TSVs (top-100 +
  full-1002, `tools/make-anki.mjs`); /quiz/ + 9 cluster quizzes
  (vanilla JS, 10 Qs, embedded data, "continue in app" ending).
- **Audio:** speaker buttons on every vocab row via device
  speechSynthesis (mr-IN, no keys/network); self-removing if
  unsupported. Full TTS clips deferred (needs cloud keys + native
  check).
- **Tech:** trailing slashes centralized in `siteUrl()` (no redirect
  hops; `#`/`?` safe); homepage title now intent-led; 11 per-section
  OG cards auto-mapped in BaseHead; analytics loads only when
  `analyticsScript` is set (Plausible/Umami-ready).
- **i18n:** Hindi footer variant on /hi/* (band, headings, form);
  translate widget has fallback text; author byline links xmirtunjay.
- **Content:** cluster prose blocks (data-driven, unique per page);
  /vocabulary/colors/ page (13 verified words); numbers/days scope
  notes; "Units 03" singular/plural fixed.
- **Deferred honestly:** simple romanization respelling (needs native
  review with LM-0004); per-word pages; testimonials; monetization.
- **Drafts resolved:** alphabet + vs-Hindi finalized (only verified
  content kept; आपण section cut); "I love you" page DELETED (noun
  प्रेम verified but sentence unwarranted — rebuild when covered).
