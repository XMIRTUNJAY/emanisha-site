# Premium Features Complete — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Bol Marathi website from a premium static site into a premium learning product with interactive features, progress tracking, PWA support, and delightful polish.

**Architecture:** Vanilla JS modules + Astro islands + localStorage/IndexedDB for persistence. Zero external runtime deps. All features respect `prefers-reduced-motion` and work offline-first where applicable.

**Tech Stack:** Astro 7.3, vanilla ES modules, CSS custom properties, IntersectionObserver, View Transitions API, Service Worker (Workbox via `astro-pwa` or manual), IndexedDB via `idb` (small) or raw API.

**Spec:** This plan implements the 20 premium improvements discussed.

## Global Constraints

- No new npm dependencies >50kb gzipped (except `idb` ~3kb if needed)
- Preserve all 101 routes, 1002 words, 26 units, CTA engine, waitlist
- Zero `mailto:` anywhere
- All animations respect `prefers-reduced-motion: reduce`
- Mobile-first, 52px tap targets, WCAG 2.1 AA
- GitHub Pages deployment (static + SW)
- `window.__sayInit` single-bind guard preserved

---

### Task 1: PWA Manifest + Service Worker

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `public/sw.js` (or use `astro-pwa` integration)
- Modify: `astro.config.mjs` (add PWA integration or manual SW registration)
- Modify: `src/layouts/Base.astro` (register SW)

**Interfaces:**
- Produces: `navigator.serviceWorker` registration, `manifest.webmanifest` served

- [ ] **Step 1: Add manifest.webmanifest**
```json
{
  "name": "Bol Marathi — Learn Marathi",
  "short_name": "Bol Marathi",
  "description": "Learn Marathi from Hindi or English. 156 free lessons, 1000+ words.",
  "start_url": "/learn-marathi/",
  "scope": "/learn-marathi/",
  "display": "standalone",
  "background_color": "#fdfbf7",
  "theme_color": "#8e2d12",
  "icons": [
    { "src": "/learn-marathi/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/learn-marathi/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "categories": ["education", "books"],
  "lang": "en",
  "dir": "ltr"
}
```

- [ ] **Step 2: Create icons** (generate from existing favicon.svg at 192/512)

- [ ] **Step 3: Service Worker** — cache-first for static assets, network-first for HTML, stale-while-revalidate for OG images
```js
// public/sw.js
const CACHE_STATIC = 'bol-static-v1';
const CACHE_IMAGES = 'bol-images-v1';
const CACHE_PAGES = 'bol-pages-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_STATIC).then(c => c.addAll([
    '/learn-marathi/',
    '/learn-marathi/_astro/Base.*.css',
    '/learn-marathi/_astro/Base.*.js',
    '/learn-marathi/og/og-default.png',
    '/learn-marathi/favicon.svg',
  ])));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => 
    Promise.all(keys.filter(k => ![CACHE_STATIC, CACHE_IMAGES, CACHE_PAGES].includes(k)).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/learn-marathi/_astro/') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE_STATIC).then(c => c.put(e.request, copy));
      return res;
    })));
    return;
  }
  if (url.pathname.startsWith('/learn-marathi/og/')) {
    e.respondWith(caches.open(CACHE_IMAGES).then(async c => {
      const cached = await c.match(e.request);
      const fetchPromise = fetch(e.request).then(res => {
        if (res.ok) c.put(e.request, res.clone());
        return res;
      });
      return cached || fetchPromise;
    }));
    return;
  }
  if (url.pathname.startsWith('/learn-marathi/') && e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE_PAGES).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
});
```

- [ ] **Step 4: Register SW in Base.astro**
```astro
<script is:inline>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/learn-marathi/sw.js', { scope: '/learn-marathi/' })
        .catch(() => {}); // fail silently
    });
  }
</script>
```

- [ ] **Step 5: Build + verify** `npm run build` → check `dist/manifest.webmanifest`, `dist/sw.js` exist; Lighthouse PWA audit passes

---

### Task 2: Blur-up LQIP for OG Images

**Files:**
- Create: `tools/gen-lqip.mjs` (generate 20px blurred base64 placeholders)
- Modify: `src/lib/art.ts` (add `pageLQIP(route)` function)
- Modify: `src/layouts/Learn.astro` (inline LQIP as background-image)
- Modify: `src/components/Card.astro` (if exists) or inline in card grids
- Modify: `src/styles/global.css` (LQIP transition)

**Interfaces:**
- Produces: `data-lqip` attribute on images, CSS `--lqip` custom property

- [ ] **Step 1: Generate LQIPs**
```js
// tools/gen-lqip.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = 'public/og';
const output = {};

for (const file of fs.readdirSync(inputDir)) {
  if (!file.endsWith('.png')) continue;
  const buf = await sharp(path.join(inputDir, file))
    .resize(20, 10, { fit: 'inside' })
    .blur(10)
    .jpeg({ quality: 30 })
    .toBuffer();
  output[file] = `data:image/jpeg;base64,${buf.toString('base64')}`;
}

fs.writeFileSync('src/data/lqip.json', JSON.stringify(output, null, 2));
```

- [ ] **Step 2: Add `pageLQIP` to art.ts**
```ts
import lqipManifest from '../data/lqip.json';
export function pageLQIP(route: string): string {
  const file = route === '' ? 'og-home.png' : `og-${route.replace(/\//g, '-')}.png`;
  return (lqipManifest as Record<string, string>)[file] ?? '';
}
```

- [ ] **Step 3: Apply in Learn.astro + card grids**
```astro
<img src={pageArt(...)} 
     style="background-image: url('{pageLQIP(...)}'); background-size: cover;"
     onload="this.style.backgroundImage=''" 
     loading="lazy" ... />
```
CSS: `img[loading="lazy"] { opacity: 0; transition: opacity 0.3s; } img.loaded { opacity: 1; }`

- [ ] **Step 6: Build + verify** `npm run build` → check LQIPs in HTML, no layout shift

---

### Task 3: Vocab Card Flip (Tap to Reveal)

**Files:**
- Create: `src/components/VocabCard.astro` (reusable flip card)
- Modify: `src/pages/vocabulary/[slug].astro` (use VocabCard instead of table row)
- Modify: `src/styles/global.css` (flip animation, 3D transform)
- Modify: `src/components/VocabTable.astro` (add flip mode toggle)

**Interfaces:**
- Consumes: `Word` type from `lib/learn`
- Produces: Interactive flip card with front (Marathi) / back (meaning + audio)

- [ ] **Step 1: VocabCard component**
```astro
---
import { Word } from '../lib/learn';
import { simpleRespelling } from '../lib/simple';
import audioManifest from '../data/audio-manifest.json';
import { siteUrl } from '../lib/site';
import SayScript from './SayScript.astro';

interface Props { word: Word; roman?: 'diacritic' | 'simple' | 'none'; }
const { word, roman = 'diacritic' } = Astro.props;
const files = (audioManifest as { files?: Record<string, { word?: string }> }).files ?? {};
const audioSrc = files[word.id]?.word ? siteUrl(`/audio/${files[word.id].word}`) : null;
---
<article class="vocab-card" tabindex="0" role="button" aria-label={`Flip to see meaning of ${word.marathi}`}>
  <div class="vocab-card-inner">
    <div class="vocab-card-front">
      <span class="vocab-mr" lang="mr">{word.marathi}</span>
      <span class="vocab-hint">Tap to reveal</span>
      {audioSrc && <button class="say" data-audio={audioSrc} aria-label={`Listen: ${word.marathi}`}>🔊</button>}
    </div>
    <div class="vocab-card-back">
      <span class="vocab-mr" lang="mr">{word.marathi}</span>
      {roman !== 'none' && <span class="vocab-tr">{roman === 'simple' ? simpleRespelling(word.transliteration) : word.transliteration}</span>}
      <span class="vocab-hi" lang="hi">{word.hindi}</span>
      <span class="vocab-en">{word.english}</span>
      <div class="vocab-ex">
        <span lang="mr">{word.exampleMarathi}</span>
        <small>{word.exampleEnglish}</small>
      </div>
      {audioSrc && <button class="say" data-audio={audioSrc} aria-label={`Listen: ${word.marathi}`}>🔊</button>}
    </div>
  </div>
</article>
<SayScript />
```

- [ ] **Step 2: Flip CSS**
```css
.vocab-card { perspective: 1000px; width: 100%; aspect-ratio: 1/1; min-height: 140px; cursor: pointer; }
.vocab-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.5s cubic-bezier(0.25,0.8,0.25,1); transform-style: preserve-3d; }
.vocab-card.flipped .vocab-card-inner { transform: rotateY(180deg); }
.vocab-card-front, .vocab-card-back { position: absolute; inset: 0; backface-visibility: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 0.5em; padding: 1em; border: var(--border); border-radius: var(--radius); background: var(--card); }
.vocab-card-back { transform: rotateY(180deg); }
.vocab-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .vocab-card-inner { transition: none; } }
```

- [ ] **Step 3: Toggle script** (inline in component)
```js
document.querySelectorAll('.vocab-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('flipped'); } });
});
```

- [ ] **Step 4: Integrate in vocabulary pages** — replace table rows with grid of VocabCards (responsive grid)

- [ ] **Step 5: Build + QA** — verify flip works, audio works on both sides, keyboard accessible

---

### Task 4: LocalStorage Progress + Streak Ring

**Files:**
- Create: `src/lib/progress.ts` (progress API: get/set unit completion, streak, weak words)
- Create: `src/components/ProgressRing.astro` (SVG ring component)
- Modify: `src/components/SiteHeader.astro` (add streak ring)
- Modify: `src/pages/lessons/[unit].astro` (mark unit complete on scroll to bottom + button)
- Modify: `src/components/AppCTA.astro` (show streak-aware copy)
- Modify: `src/styles/global.css` (streak ring styles)

**Interfaces:**
- `progress.getUnitProgress(unit: string): { completed: boolean; completedAt?: number }`
- `progress.setUnitComplete(unit: string): void`
- `progress.getStreak(): number`
- `progress.getWeakWords(): string[]`

- [ ] **Step 1: progress.ts API**
```ts
// src/lib/progress.ts
const STORAGE_KEY = 'bol-marathi-progress';
const STREAK_KEY = 'bol-marathi-streak';
const WEAK_KEY = 'bol-marathi-weak';

export function getProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
export function setUnitComplete(unit: string) {
  const p = getProgress();
  if (!p[unit]) {
    p[unit] = { completed: true, completedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    updateStreak();
  }
}
export function getUnitProgress(unit: string) { return getProgress()[unit] ?? { completed: false }; }
export function getAllProgress() { return getProgress(); }

function updateStreak() {
  const today = new Date().toDateString();
  const last = localStorage.getItem(STREAK_KEY);
  let streak = parseInt(localStorage.getItem('bol-streak-count') || '0', 10);
  if (last !== today) {
    const yesterday = new Date(Date.now() - 864e5).toDateString();
    streak = last === yesterday ? streak + 1 : 1;
    localStorage.setItem(STREAK_KEY, today);
    localStorage.setItem('bol-streak-count', String(streak));
  }
  return streak;
}
export function getStreak() { return parseInt(localStorage.getItem('bol-streak-count') || '0', 10); }
export function addWeakWord(wordId: string) { const w = new Set(JSON.parse(localStorage.getItem(WEAK_KEY) || '[]')); w.add(wordId); localStorage.setItem(WEAK_KEY, JSON.stringify([...w])); }
export function getWeakWords() { return JSON.parse(localStorage.getItem(WEAK_KEY) || '[]'); }
```

- [ ] **Step 2: ProgressRing component**
```astro
---
interface Props { streak: number; size?: number; stroke?: number; }
const { streak, size = 44, stroke = 4 } = Astro.props;
const circumference = 2 * Math.PI * (size / 2 - stroke);
const pct = Math.min(streak / 7, 1); // 7-day target
const offset = circumference * (1 - pct);
---
<div class="progress-ring" title={`Streak: ${streak} day${streak !== 1 ? 's' : ''}`}>
  <svg width={size} height={size} style="transform: rotate(-90deg)">
    <circle class="bg" cx={size/2} cy={size/2} r={size/2 - stroke} fill="none" stroke="var(--container)" stroke-width={stroke} />
    <circle class="fg" cx={size/2} cy={size/2} r={size/2 - stroke} fill="none" stroke="var(--accent)" stroke-width={stroke} stroke-dasharray={circumference} stroke-dashoffset={offset} stroke-linecap="round" style="transition: stroke-dashoffset 0.5s ease" />
  </svg>
  <span class="streak-count">{streak}</span>
</div>
<style>
  .progress-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
  .streak-count { position: absolute; font-size: 0.75rem; font-weight: 700; color: var(--accent); line-height: 1; }
</style>
```

- [ ] **Step 3: SiteHeader integration** — import ProgressRing, show streak next to brand

- [ ] **Step 4: Unit completion trigger** — in `[unit].astro`, add "Mark Complete" button + IntersectionObserver at bottom of page

- [ ] **Step 5: Build + verify** — streak persists, ring animates, unit completion works

---

### Task 5: Sentence Builder on Vocab Pages

**Files:**
- Create: `src/components/SentenceBuilder.astro` (reusable arrange-sentence component)
- Modify: `src/pages/vocabulary/[slug].astro` (add builder section per cluster)
- Modify: `src/styles/global.css` (builder styles — reuse quiz `.abuild`/`.abank`/`.tok`)

**Interfaces:**
- Consumes: `cluster.unitRefs` → `getUnit().sentenceBuilder`
- Produces: Interactive sentence builder per vocabulary cluster

- [ ] **Step 1: SentenceBuilder component** (adapt quiz `[cluster].astro` arrange logic)
```astro
---
import { getUnit, clusters } from '../lib/learn';
interface Props { clusterSlug: string; }
const { clusterSlug } = Astro.props;
const cluster = clusters.find(c => c.slug === clusterSlug);
const builders = cluster?.unitRefs.flatMap(no => getUnit(no).sentenceBuilder.map(b => ({ tokens: b.tokens, answer: b.answer, prompt: b.promptEn || b.prompt, hindi: b.hindi }))) || [];
const data = JSON.stringify(builders.slice(0, 5));
---
<section class="sentence-builder" aria-label="Sentence practice">
  <h3>Build sentences with these words</h3>
  <div id="sb-arrange" data-builders={data}>
    <div class="progress"><span id="sb-bar"></span></div>
    <p class="qmeta"><span id="sb-pos">Sentence 1/5</span></p>
    <p class="aprompt" id="sb-prompt">…</p>
    <div class="abuild" id="sb-answer" aria-label="Your sentence"></div>
    <div class="abank" id="sb-bank" aria-label="Available words"></div>
    <p class="qfb" id="sb-fb" aria-live="polite"></p>
    <p><button class="btn" id="sb-check" type="button">Check</button><button class="btn ghost" id="sb-next" type="button" hidden>Next →</button></p>
  </div>
</section>
<script>/* adapt quiz arrange logic */</script>
```

- [ ] **Step 2: Reuse quiz builder styles** (`.abuild`, `.abank`, `.tok`, `.tok.in-answer`)

- [ ] **Step 3: Build + verify** — sentences load, tokens draggable/tappable, check works

---

### Task 6: Pronunciation Visualizer (Waveform + Pitch)

**Files:**
- Create: `src/components/PronunciationViz.astro` (Canvas waveform + pitch)
- Modify: `src/pages/marathi-pronunciation.astro` (integrate viz per sound)
- Modify: `src/styles/global.css` (canvas sizing)

**Interfaces:**
- Consumes: Pre-generated waveform JSON (from `tools/gen-audio.mjs` output) or compute via Web Audio API on-demand
- Produces: Interactive waveform with playhead, pitch contour overlay

- [ ] **Step 1: Extend `tools/gen-audio.mjs`** to output waveform data (peaks + pitch) per word
- [ ] **Step 2: PronunciationViz component** — Canvas draw, playhead sync with audio
- [ ] **Step 3: Integrate in pronunciation page** — one viz per sound group
- [ ] **Step 4: Build + verify** — waveforms render, playhead syncs

---

### Task 7: Weak-Words Review Queue (Web Spaced Repetition)

**Files:**
- Create: `src/lib/srs.ts` (SM-2 algorithm, IndexedDB via `idb` or localStorage fallback)
- Create: `src/pages/review.astro` (review queue page)
- Modify: `src/components/AppCTA.astro` (link to review when weak words exist)
- Modify: `src/pages/quiz/[cluster].astro` (feed wrong answers into SRS)
- Modify: `src/pages/vocabulary/[slug].astro` (feed flip-card "didn't know" into SRS)

**Interfaces:**
- `srs.add(wordId: string, difficulty: 'again'|'hard'|'good'|'easy'): void`
- `srs.getDue(): Word[]`
- `srs.recordReview(wordId: string, grade: number): void`

- [ ] **Step 1: SRS engine** (SM-2, 3kb logic, localStorage fallback)
- [ ] **Step 2: Review page** — shows due words, 4-button grading, schedules next
- [ ] **Step 3: Integration** — quiz wrong answers → `srs.add(word, 'again')`; vocab flip "didn't know" → same
- [ ] **Step 4: Build + verify** — review queue populates, scheduling works

---

### Task 8: Per-Element View Transitions

**Files:**
- Modify: `src/layouts/Learn.astro` (hero-figure `transition:name`, header `transition:name`)
- Modify: `src/components/SiteHeader.astro` (brand `transition:name`)
- Modify: `src/styles/global.css` (transition classes)

**Interfaces:**
- Produces: Named view transitions for hero image, header, main content

- [ ] **Step 1: Add transition names**
```astro
<!-- Learn.astro -->
<figure class="hero-figure" transition:name="hero-img" transition:persist>
  <img ... />
</figure>
<!-- SiteHeader.astro -->
<a class="brand" transition:name="brand" transition:persist>...</a>
<nav transition:name="nav" transition:persist>...</nav>
```
- [ ] **Step 2: CSS for cross-fade**
```css
::view-transition-old(hero-img), ::view-transition-new(hero-img) { animation-duration: 0.4s; }
@media (prefers-reduced-motion: reduce) { ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; } }
```

- [ ] **Step 3: Build + verify** — hero cross-fades on nav, header persists

---

### Task 9: Search with Autocomplete

**Files:**
- Create: `src/lib/search.ts` (Fuse.js or custom trie — build-time index)
- Create: `src/components/Search.astro` (input + dropdown)
- Create: `src/pages/search.astro` (results page)
- Modify: `src/components/SiteHeader.astro` (add search trigger)
- Modify: `src/styles/global.css` (search dropdown styles)

**Interfaces:**
- `search.index: { id, title, url, type, excerpt }[]` (built at build time)
- `search.query(q: string): Result[]` (client-side, <5ms)

- [ ] **Step 1: Build-time index** — `tools/build-search-index.mjs` reads all content, writes `public/search-index.json`
- [ ] **Step 2: Search component** — debounced input, keyboard nav, ARIA
- [ ] **Step 3: Results page** — grouped by type (lessons, vocab, phrases, blog)
- [ ] **Step 4: Build + verify** — instant results, keyboard accessible

---

### Task 10: Mascot/Illustration System

**Files:**
- Create: `public/mascot/` (SVG variants: idle, happy, thinking, celebrating, confused)
- Create: `src/components/Mascot.astro` (stateful component)
- Modify: `src/pages/*.astro` (use mascot in empty states, errors, celebrations)
- Modify: `src/styles/global.css` (mascot sizing, animation)

**Interfaces:**
- `<Mascot state="idle|happy|thinking|celebrate|confused" size="sm|md|lg" />`

- [ ] **Step 1: Design/create SVGs** (consistent style with terracotta palette)
- [ ] **Step 2: Mascot component** — accepts state, applies class, optional bounce animation
- [ ] **Step 3: Integrate** — 404 page, quiz completion, review streak milestones, empty vocab
- [ ] **Step 4: Build + verify** — mascot appears in context

---

### Task 11: Milestone Celebrations

**Files:**
- Create: `src/components/MilestoneToast.astro` (toast + confetti)
- Modify: `src/lib/progress.ts` (milestone detection: 5, 10, 25, 50 units)
- Modify: `src/layouts/Base.astro` (toast container)
- Modify: `src/styles/global.css` (toast animation, confetti)

**Interfaces:**
- `progress.checkMilestones(): Milestone[]` — called after unit completion

- [ ] **Step 1: Milestone logic** — detect 5/10/25/50 unit thresholds
- [ ] **Step 2: Toast component** — slides in, shows badge, confetti burst, share button
- [ ] **Step 3: Trigger** — in unit completion handler, call `checkMilestones()`, show toast
- [ ] **Step 4: Build + verify** — milestone fires at correct thresholds

---

### Task 12: Audio Speed Control

**Files:**
- Modify: `src/components/SayScript.astro` (add speed selector, apply to SpeechSynthesisUtterance + Audio)
- Modify: `src/components/VocabTable.astro` (speed control UI)
- Modify: `src/pages/quiz/[cluster].astro` (speed control in quiz)
- Modify: `src/styles/global.css` (speed selector styles)

**Interfaces:**
- Global `window.__saySpeed = 1` (0.75, 1, 1.25), persisted in localStorage

- [ ] **Step 1: Speed state** — `localStorage.setItem('bol-say-speed', '1')`, default 1
- [ ] **Step 2: UI** — dropdown/button group (0.75x, 1x, 1.25x) near first 🔊 button
- [ ] **Step 3: Apply** — `utterance.rate = speed * 0.85`; `audio.playbackRate = speed`
- [ ] **Step 4: Build + verify** — speed persists, applies to all audio

---

### Task 13: Keyboard Shortcuts

**Files:**
- Create: `src/components/KeyboardShortcuts.astro` (global listener)
- Modify: `src/layouts/Base.astro` (include component)
- Modify: `src/styles/global.css` (shortcut hint styles)

**Interfaces:**
- `←/→` prev/next unit, `Space` play audio, `/` focus search, `?` show help modal

- [ ] **Step 1: Global listener** — `keydown` on document, check `e.target` not input/textarea
- [ ] **Step 2: Actions** — navigate, play, focus search, toggle help
- [ ] **Step 3: Help modal** — `?` shows overlay with all shortcuts
- [ ] **Step 4: Build + verify** — shortcuts work, don't interfere with forms

---

### Task 14: Font Size / Density Preferences

**Files:**
- Create: `src/components/DisplayPrefs.astro` (settings panel)
- Modify: `src/layouts/Base.astro` (include in footer or header menu)
- Modify: `src/styles/global.css` (CSS custom properties for scale/density)
- Modify: `src/styles/global.css` (respect `prefers-contrast`)

**Interfaces:**
- `localStorage: bol-font-scale` (0.875, 1, 1.125), `bol-density` (compact/comfortable)
- CSS: `--font-scale`, `--space-scale`

- [ ] **Step 1: CSS variables** — `--font-scale: 1`, `--space-scale: 1` on `:root`
- [ ] **Step 2: Apply** — `font-size: calc(1rem * var(--font-scale))`, `padding: calc(var(--space-4) * var(--space-scale))`
- [ ] **Step 3: Panel** — 3 size buttons, 2 density buttons, persist to localStorage
- [ ] **Step 4: Build + verify** — changes apply instantly, persist across sessions

---

### Task 15: Vocab Page → Table/Flip Toggle

**Files:**
- Modify: `src/pages/vocabulary/[slug].astro` (add view toggle)
- Modify: `src/components/VocabTable.astro` (export as component)
- Create: `src/components/VocabGrid.astro` (flip card grid)
- Modify: `src/styles/global.css` (toggle styles)

**Interfaces:**
- `localStorage: bol-vocab-view` ('table'|'flip')

- [ ] **Step 1: View toggle** — segmented control (Table / Cards)
- [ ] **Step 2: Conditional render** — show table or grid based on pref
- [ ] **Step 3: Persist** — localStorage, default 'table' on desktop, 'flip' on mobile
- [ ] **Step 4: Build + verify** — toggle works, preference persists

---

### Task 16: Unit Page → "Practice This Unit" CTA (App Deep Link Ready)

**Files:**
- Modify: `src/pages/lessons/[unit].astro` (enhanced CTA with unit context)
- Modify: `src/components/AppCTA.astro` (variant="unit-practice", deep link param)
- Modify: `src/data/app.ts` (add `deepLinkBase` for future app)

**Interfaces:**
- `AppCTA` variant="unit-practice" → `href="bolmarathi://practice/unit/01"` (when app live)

- [ ] **Step 1: CTA variant** — "Practice Unit 01" with unit-specific deep link
- [ ] **Step 2: Deep link format** — `bolmarathi://practice/unit/{unit}` (placeholder)
- [ ] **Step 3: Fallback** — waitlist when app not live
- [ ] **Step 5: Build + verify** — CTA renders, deep link format correct

---

### Task 17: Offline-First Vocab/Quiz (SW + IndexedDB)

**Files:**
- Modify: `public/sw.js` (cache vocab/quiz pages + data)
- Create: `src/lib/offline.ts` (IndexedDB sync queue for progress)
- Modify: `src/lib/progress.ts` (queue mutations when offline)

**Interfaces:**
- `offline.queue(action: () => Promise<void>): void` — runs when online

- [ ] **Step 1: SW caches all lesson/vocab/quiz pages**
- [ ] **Step 2: Offline queue** — mutations stored in IndexedDB, flushed on `online` event
- [ ] **Step 3: Build + verify** — works offline (progress saved, synced on reconnect)

---

### Task 18: Shareable Progress Card

**Files:**
- Create: `src/pages/share/[id].astro` (static OG card for progress)
- Modify: `src/lib/progress.ts` (generate share token)
- Modify: `src/components/MilestoneToast.astro` (add share button)
- Create: `tools/gen-share-card.mjs` (generates static HTML for each milestone)

**Interfaces:**
- `share.createCard(milestone: string, streak: number): string` (URL)

- [ ] **Step 1: Generate static share cards** at build time (one per milestone type)
- [ ] **Step 2: Share button** — copies link, falls back to Web Share API
- [ ] **Step 3: Build + verify** — card renders with correct OG tags

---

### Task 19: Reading Mode (Distraction-Free)

**Files:**
- Create: `src/components/ReadingMode.astro` (toggle + styles)
- Modify: `src/layouts/Learn.astro` (add reading mode class to main)
- Modify: `src/styles/global.css` (reading mode: max-width, line-height, hide sidebar/header)

**Interfaces:**
- `localStorage: bol-reading-mode` (boolean)
- CSS: `html.reading-mode` overrides

- [ ] **Step 1: CSS** — `.reading-mode main { max-width: 65ch; margin: auto; } .reading-mode header, .reading-mode footer { display: none; } .reading-mode .hero-figure { display: none; }`
- [ ] **Step 2: Toggle** — button in header/footer, keyboard shortcut `R`
- [ ] **Step 3: Build + verify** — mode toggles, persists, prints cleanly

---

### Task 20: Analytics Events (Privacy-First)

**Files:**
- Create: `src/lib/analytics.ts` (tiny wrapper: `track(event, props)`)
- Modify: All existing `data-funnel` usages → `track('funnel_click', { variant, context })`
- Modify: `src/layouts/Base.astro` (init analytics from env)
- Modify: `src/pages/quiz/[cluster].astro` (track quiz_start, answer_correct, complete)
- Modify: `src/pages/lessons/[unit].astro` (track unit_complete, audio_play)

**Interfaces:**
- `track(name: string, props: Record<string, string|number>): void`
- Respects `PUBLIC_ANALYTICS_SRC`, `doNotTrack`, no cookies

- [ ] **Step 1: Analytics wrapper** — plugs into Plausible/Umami/GA via env
- [ ] **Step 2: Replace `data-funnel`** — actual `track()` calls with rich props
- [ ] **Step 3: Event taxonomy** — documented in `docs/analytics.md`
- [ ] **Step 4: Build + verify** — events fire in dev console, no PII

---

## Execution Order (Dependency-Aware)

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| 1 | 1 (PWA), 2 (LQIP) | None |
| 2 | 3 (Vocab Flip), 4 (Progress), 5 (Sentence Builder) | 1 |
| 3 | 6 (Pronunciation), 7 (SRS), 8 (View Transitions) | 2 |
| 4 | 9 (Search), 10 (Mascot), 11 (Milestones) | 2 |
| 5 | 12 (Audio Speed), 13 (Shortcuts), 14 (Prefs) | 1 |
| 6 | 15 (View Toggle), 16 (Deep Link), 17 (Offline), 18 (Share), 19 (Reading), 20 (Analytics) | 1-5 |

---

## Verification Checklist (Per Task)

- [ ] `npm run build` — 101 pages, 0 errors
- [ ] `npm run qa` — PASS
- [ ] Lighthouse: Performance ≥90, Accessibility ≥95, Best Practices ≥90, SEO ≥90, PWA ✅
- [ ] `prefers-reduced-motion` — all animations disabled
- [ ] Mobile 390px — no horizontal overflow, 52px targets
- [ ] Offline — core pages load, progress queues
- [ ] Console — no errors, no warnings

---

## Commit Strategy

One commit per task (or per logical group), conventional commits:
```
feat(pwa): add manifest + service worker
feat(lqip): blur-up placeholders for OG images
feat(vocab): flip cards with audio
feat(progress): localStorage streak + ring
feat(builder): sentence builder on vocab pages
feat(pronunciation): waveform visualizer
feat(srs): weak-words spaced repetition
feat(transitions): per-element view transitions
feat(search): autocomplete search
feat(mascot): illustration system
feat(milestones): celebration toasts
feat(audio): speed control
feat(shortcuts): keyboard navigation
feat(prefs): font size / density settings
feat(vocab): table/flip view toggle
feat(app): unit practice deep link
feat(offline): IndexedDB sync queue
feat(share): milestone share cards
feat(reading): distraction-free mode
feat(analytics): privacy-first event tracking
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| SW caching breaks deploy updates | Versioned cache names, `skipWaiting` + `clients.claim` |
| IndexedDB unavailable (private mode) | Graceful fallback to localStorage |
| LQIP increases build time | Parallelize sharp, cache output |
| View transitions flicker | `transition:persist` on header/hero, test cross-browser |
| SRS algorithm complexity | Start simple (SM-2), upgrade later |
| Bundle size growth | Code-split heavy features (search, SRS) via dynamic import |

---

## Future Work (Post-MVP)

- Server-side progress sync (when backend exists)
- Multi-device sync via account
- Teacher dashboard / classroom mode
- Audio recording + pronunciation scoring
- Community sentences / corrections