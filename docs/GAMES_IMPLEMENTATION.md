# Marathi Games — Implementation Summary

Date: 2026-10-10 · Branch: `games` (uncommitted, per working rules)
Spec: `docs/superpowers/specs/2026-10-10-marathi-games-design.md`
Plan: `docs/superpowers/plans/2026-10-10-marathi-games.md`

## What shipped

Five playable, static, SEO-indexed Marathi games on the existing Bol Marathi
site, built on its layout, design tokens, curriculum data and build pipeline:

| Route | Game | Content |
|---|---|---|
| `/games/` | Hub | 5 cards + SFX toggle |
| `/games/marathi-wordle/` | Daily Wordle | 60 daily answers + 94-word practice pool, akshara tiles, UTC-dated via versioned list (`version: 1`), share grid, daily persistence |
| `/games/picture-guess/` | Picture Guess | 40 words × 3 levels, 40 original SVGs, progressive hints, fallback cards |
| `/games/marathi-crossword/` | Crossword | 2 hand-curated puzzles (7 + 6 words), one akshara per cell |
| `/games/word-chain/` | शब्दसाखळी | 822-word curated dictionary, base-letter rule, pick + type modes |
| `/games/sentence-scramble/` | Sentence Scramble | 18 verified `sentenceBuilder` rows, 3 levels, pattern explanations |

## Verified results (all actually run)

- `npm test` — **54/54 pass** (node:test, zero new dependencies)
- `npx playwright test playwright-games.test.ts` — **18/18 pass** (6 routes ×
  desktop 1280×800 + mobile 390×844, console-error + failed-request checks,
  plus 6 interaction tests)
- `npm run qa` — **PASS** (content gate)
- `npm run build` — **205 pages**, sitemap includes all 6 game routes with
  base-path URLs + lastmod; canonical URLs verified in `dist/`
- `node tools/check-links.mjs` — **0 broken links** across 212 pages
- Browser-verified full rounds: Wordle win (Solved in 1/6, share, daily
  persistence), chain pick, scramble check + Hindi reveal, picture hints +
  wrong-answer reveal, crossword both puzzles solved via real UI clicks
- Screenshots: `playwright-screenshots/games-*.png` (desktop + mobile)

## File-by-file changes

**New — shared game system**
- `src/lib/games/graphemes.ts` — akshara segmentation (Intl.Segmenter + tested fallback + virama merge)
- `src/lib/games/daily.ts` — UTC-dated deterministic selection
- `src/lib/games/wordle.ts` — evaluateGuess / isWin / shareGrid
- `src/lib/games/chain.ts` — base-letter chain rule
- `src/lib/games/scramble.ts` — accepted-solutions check
- `src/lib/games/crossword.ts` — grid builder + puzzle validator
- `src/lib/games/validate.ts` — structural data validators
- `src/lib/games/storage.ts` — guarded localStorage (memory fallback)
- `src/lib/games/sfx.ts` — SFX player + persisted mute
- `src/lib/games/mrKeys.ts` — romanization hints for keyboards
- `src/components/games/GameShell.astro` — nav + SFX toggle (+ SayScript)
- `src/components/games/GameIntro.astro`, `GameResult.astro`, `SayBtn.astro`, `GameLinks.astro`
- `src/styles/games.css` — all game UI styles (global; JS-created elements)
- `src/data/games/*.json` — 5 validated datasets

**New — pages, assets, tests, tools**
- `src/pages/games/index.astro` + 5 game pages
- `public/games/picture-guess/*.svg` (40 originals) + `public/games/audio/**` (51 SFX + manifest + provenance README)
- `tests/*.test.ts` (9 suites, 54 tests)
- `tools/validate-games.mts` (prebuild gate), `build-chain-dict.mts` (regenerates chain.json after sync), `make-picture-svgs.mjs`, `games-svg-doc.mjs`, `list-game-candidates.mts`, `list-splits.mts`, `make_sfx.py` (owner's SFX source)
- `docs/GAMES_SVG_PROMPTS.md` — the SVG prompt/filename table
- `playwright-games.test.ts`

**Modified**
- `package.json` — `test` script; `prebuild` += game-data gate
- `.github/workflows/deploy.yml` — qa job += `npm test`
- `src/components/SiteHeader.astro` — Games link in Practice group
- `src/pages/index.astro` — games section (between How-it-works and Curriculum)
- `src/pages/vocabulary/[cluster].astro` — GameLinks (vocab variant)
- `src/pages/grammar/[topic].astro` — GameLinks (grammar variant)
- `src/pages/quiz/[cluster].astro` — Wordle link on completion
- `src/layouts/Base.astro` — space-shortcut now skips `.say` inside `[hidden]` panels
- NOTE: `src/data/learn/*.json` modifications pre-date this work (your `npm run sync`); untouched by the games.

## Commands

```bash
npm install          # once
npm run dev          # dev server
npm test             # 54 unit tests (node:test + strip-types)
npm run qa           # content QA gate
npm run build        # prebuild (content + games gates) → astro build
npm run preview      # serve dist at http://localhost:4321
npx playwright test playwright-games.test.ts   # needs preview running
node tools/build-chain-dict.mts   # regenerate chain.json after `npm run sync`
node tools/make-picture-svgs.mjs  # regenerate the 40 SVGs
node tools/games-svg-doc.mjs      # regenerate the SVG prompt table
```

## Remaining defects, limitations & human-review flags

1. **Not native-speaker audited.** Game content is curriculum-sourced and
   machine-validated; game copy claims only that. Needs a Marathi speaker's
   pass over: crossword clues (`clueHi`), scramble pattern explanations,
   word-chain suggestions.
2. **Sentence Scramble alternates are empty** — only the curriculum's
   canonical order is accepted. The alternates mechanism is built + tested;
   adding genuinely valid alternative orders needs a native speaker.
3. **Crossword convention gap:** two across words in a row may touch (no
   empty gap), e.g. नाक|लाल in `cw-01` row 3 — valid by our validator, but a
   purist would separate them with a blank cell.
4. **Word Chain rule is base-letter based** (घर → रंग ✓). Conjunct-final
   words (e.g. शब्द) are excluded from the dictionary by validation.
5. **Static-site spoiler:** like every client-side Wordle, the answer list is
   in the page source. The share text never reveals the word.
6. **Audio:** SFX are the owner's synthesized pack (51 files shipped of 74;
   timer/word_map/memory_match unused). Spoken Marathi stays device-TTS
   (`.say`), so no voice on browsers without Marathi/Hindi TTS voices.
   Missed-audio paths verified (SFX 404s tolerated, `.say` self-removes).
7. **Picture Guess art** is minimal flat SVG (original, generated by
   `tools/make-picture-svgs.mjs`); replace any via
   `docs/GAMES_SVG_PROMPTS.md` — missing files show a labeled fallback card.
8. **Sitemap submission:** per README, submit
   `.../learn-marathi/sitemap-index.xml` in Search Console (GitHub Pages
   project-site robots caveat unchanged).

## Deployment

Nothing committed, pushed, or deployed (per working rules). To ship: review
the diff on branch `games`, commit, push to `main` — CI runs `npm ci` →
`npm run qa` → `npm test` → build → deploy.
