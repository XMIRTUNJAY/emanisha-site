# Bol Marathi Premium Website Redesign — Iteration 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 5 highest-impact UX/visual problems found in `design-audit/AUDIT.md` without touching routes or content.

**Architecture:** Astro 7 static (101 pages), single global stylesheet with app-mirrored tokens, component-scoped styles. All changes are additive CSS/markup; zero new runtime dependencies (one webfont stylesheet).

**Tech Stack:** Astro 7, vanilla CSS tokens, device-TTS pattern (VocabTable).

**Spec:** `design-audit/AUDIT.md` (audit + redesign direction this plan implements)

## Global Constraints

- Do not modify `main` directly — work on `design/premium-website-redesign`
- Preserve all 101 routes, 1002 words, 26 units, CTA engine states, waitlist form
- No new npm dependencies; no JS UI libraries; no dark mode (app is light-only)
- Zero `mailto:` anywhere; keep `window.__sayInit` single-bind guard
- Keep titles ≤60 chars, descriptions ≤155 chars (QA tool enforces)
- Keep `data-funnel` attributes on CTAs

---

### Task 1: Load the intended webfonts (Noto Sans Devanagari)

**Files:**
- Modify: `src/components/BaseHead.astro`

**Interfaces:**
- Produces: `<link rel="preconnect">` + font stylesheet with `display=swap` in every page head

- [x] **Step 1: Add preconnect + stylesheet to BaseHead** — two `<link>` tags before the style import:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" />
```

- [x] **Step 2: Verify** — build, grep `dist/index.html` for `Noto+Sans+Devanagari`.

### Task 2: Skip-to-content link

**Files:**
- Modify: `src/layouts/Base.astro` (add `id="main"` on `<main>`, skip link before header)
- Modify: `src/styles/global.css` (skip-link style)

- [x] **Step 1:** Add skip link + id. Step 2: style `.skip-link` (visually hidden until focus). Step 3: verify present in built HTML.

### Task 3: Extract shared say-script + global `.say` style

**Files:**
- Create: `src/components/SayScript.astro` (move inline script + `.say` styles from VocabTable)
- Modify: `src/components/VocabTable.astro` (import SayScript, drop local copy)
- Modify: `src/styles/global.css` (global `.say` button style)

**Interfaces:**
- Produces: `SayScript.astro` (no props, self-guarding `window.__sayInit`), global `.say` style usable by any component

- [x] **Step 1:** Create SayScript.astro with the exact script from VocabTable (device TTS, mr→hi voice fallback, data-audio clips, visibilitychange cancel). Step 2: VocabTable imports it; remove inline script + scoped `.say` styles. Step 3: global `.say` style in global.css. Step 4: verify buttons still render + script present once.

### Task 4: Unit page — sentence audio + lesson rail

**Files:**
- Modify: `src/pages/lessons/[unit].astro`

**Interfaces:**
- Consumes: `SayScript.astro` (Task 3), global `.say` style
- Produces: `.say` buttons on every speaking row; `.lesson-rail` with 6 anchor pills → `#lesson-<n>` row groups

- [x] **Step 1:** Group speaking rows by lesson (`unit.speaking` rows carry `s.lesson` 1–6); wrap each lesson's rows in `<tbody id="lesson-<n>">`. Step 2: add 🔊 button per sentence (data-say). Step 3: lesson rail above table — 6 pills `Lesson 1..6` linking to anchors, current-lesson highlight not needed (static). Step 4: import SayScript. Step 5: rail + tbody styles. Step 6: verify in built HTML + audio script present.

### Task 5: Homepage — hero stat strip, method loop, Popular dedupe

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css` (`.stat-strip`, `.loop` styles)

**Interfaces:**
- Produces: `.stat-strip` (4 stats), `.loop` (3-step Learn→Practice→Remember) — reusable

- [x] **Step 1:** Hero: secondary CTA "Join the Android Waitlist" → `Explore 156 Lessons` → `/lessons/`. Step 2: stat strip under CTAs: `26 units · 156 lessons · 1,002 words · free` (computed from data). Step 3: method loop section after paths: Learn (vocabulary/phrases) → Practice (quiz) → Remember (app) with one link each. Step 4: trim `popular` to unique search-intent pages: Numbers 1–20, Days & months, Pronunciation (removes 6 duplicate cards vs vocabulary section). Step 5: styles — responsive strip, loop cards. Step 6: verify build + QA (titles/descs unchanged).

### Task 6: Mobile hero-figure cap on learn pages

**Files:**
- Modify: `src/styles/global.css` (`.hero-figure` media query)

- [x] **Step 1:** `@media (max-width: 640px) { .hero-figure img { max-height: 220px; object-fit: cover; } }`. Step 2: verify on 390px viewport screenshot.

### Task 7: Build + QA + visual QA

- [x] **Step 1:** `npm run build` (101 pages, 0 errors) + `npm run qa` (PASS).
- [x] **Step 2:** Playwright screenshots vs baseline: home desktop 1440 / mobile 390, unit page, vocab, app. Check spacing, overflow, CTA hierarchy, console errors.
- [x] **Step 3:** Fix regressions if any.

### Task 8: Commit, push, PR (no merge)

- [x] **Step 1:** `git add` intended files; commit `feat: premium redesign iteration 1 — webfonts, hero, unit learning UX`.
- [x] **Step 2:** `git push -u origin design/premium-website-redesign`; open PR to `main` with summary/UX/design/technical/SEO/a11y/testing/visual-QA/risks/future-work.
