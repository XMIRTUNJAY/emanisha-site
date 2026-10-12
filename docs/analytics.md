# Analytics — Event Taxonomy (Privacy-First)

Provider-agnostic wrapper: `src/lib/analytics.ts` (`track`, `AnalyticsEvents`,
`initAnalytics`). Plugs into Plausible (`window.plausible`), Umami
(`window.umami`) or gtag when the tracker script is loaded via
`PUBLIC_ANALYTICS_SRC` (+ `PUBLIC_ANALYTICS_DOMAIN` /
`PUBLIC_ANALYTICS_ATTRS`) in `src/layouts/Base.astro`. Unset = no tracker,
no traffic.

Rules: respects Do Not Track, no cookies set by us, no PII. Free-text values
are truncated (query ≤100 chars, URLs ≤200 chars). Dev mode logs to console.

## Global (Base.astro bundled script → `initAnalytics` + delegation)

| Event | Props | Trigger |
|---|---|---|
| `page_view` | `path` | Initial load + every `astro:page-load` (view-transition nav) |
| `external_link` | `href`, `label` | Click on `a[href^="http"]` outside origin |
| `waitlist_submit` | `context` | Submit on any `.waitlist-form` |
| `cta_click` | `variant`, `context`, `href` | Click on any `[data-app-cta]` / `[data-funnel]` element |
| `milestone_reached` | `type`, `value` | `milestone-shown` CustomEvent from MilestoneToast |
| `progress_card_generate` | — | `progress-card` event (`generate`) from ProgressCard |
| `progress_card_download` | — | `progress-card` event (`download`) |
| `progress_card_share` | `method` | `progress-card` event (`share`: native/copy) |

## Quiz (`src/pages/quiz/[cluster].astro`)

| Event | Props | Trigger |
|---|---|---|
| `quiz_start` | `cluster`, `questionCount` | Quiz engine boots |
| `quiz_complete` | `cluster` (`slug:mode`), `score`, `total`, `percentage`, `timeMs` | `quiz-complete` CustomEvent from engine |

Wrong word answers additionally dispatch `srs-add` → `srs.addWord(wordId,
'again')` (local SRS, not an analytics event).

## Lessons (`src/pages/lessons/[unit].astro`)

| Event | Props | Trigger |
|---|---|---|
| `lesson_start` | `unit` | Unit page loads |
| `lesson_complete` | `unit`, `timeMs` | "Mark Complete" clicked |
| `unit_complete` | `unit`, `wordsLearned` | "Mark Complete" clicked |
| `vocab_audio_play` | `word` | Any `.say` button clicked on the page |

## Vocabulary (`src/pages/vocabulary/[cluster].astro`)

| Event | Props | Trigger |
|---|---|---|
| `vocab_view` | `cluster`, `wordCount` | Page loads + Cards tab opened |
| `vocab_flip` | `word` | (helper available; flip tracking optional) |

## Phrases (`src/pages/phrases/[set].astro` — helper available)

| Event | Props |
|---|---|
| `phrase_view` | `set`, `phraseCount` |

## Review / SRS (`src/pages/review.astro`)

| Event | Props | Trigger |
|---|---|---|
| `review_open` | `dueCount` | Review queue rendered |
| `review_grade` | `wordId`, `grade` | Again/Hard/Good/Easy pressed |

## Progress cards (`ProgressCard.astro` — helpers available)

`progress_card_generate`, `progress_card_download`,
`progress_card_share { method: native|download|copy }`.

## Preferences / connectivity (wired)

| Event | Props | Trigger |
|---|---|---|
| `prefs_change` | `fontSize`, `lineHeight`, `readingMode` | Any display-preference change (PreferencesClient) |
| `offline_detected` | — | Browser `offline` event (SiteHeader) |
| `online_restored` | `pendingSync` | Browser `online` event, with IndexedDB outbox count |

Helpers also available but intentionally unwired (no call site yet):
`reading_mode_toggle` (covered by `prefs_change`), `error` (no global error
hook by design — avoids noisy tracking).

## Adding a new event

1. Add a helper to `AnalyticsEvents` in `src/lib/analytics.ts`.
2. Call it from a bundled `<script>` (Vite-processed, can import) or via a
   `CustomEvent` dispatched from an `is:inline` script.
3. Document the row in this file.
