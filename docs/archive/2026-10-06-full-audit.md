# Learn Marathi — Full Site Audit (2026-10-06)

Scope: Astro 7 static site in C:\Users\kumar\blog\learn-marathi
Method: clean production build + static analysis of dist/ (201 HTML files),
internal-link crawl, meta/SEO extraction, CSS-variable analysis, git hygiene,
and a live fetch of the deployed GitHub Pages site.

Verdict: technically healthy and content-rich. The meaningful problems are
(a) the redesign is not deployed, (b) deploy/social image weight, (c) a set of
SEO keyword/alerts, and (d) repo hygiene. No broken links, no undefined CSS
variables, no committed secrets.

=====================================================================
BUILD / BASELINE (measured)
=====================================================================
- npm run build: PASS, 200 routes + 404 + offline = 201 HTML, ~9.6s.
- Prebuild content QA: PASS (83 dataset pages, 0 draft) with 24 keyword WARNs.
- Internal links: 0 broken targets across 201 files (tools/check-links.mjs).
- dist size: 200 MB (162 MB of that is PNG social cards in dist/og/).
- Every page: exactly one <h1>, has <meta description> + og:image + canonical.
- CSS: 94 custom properties used, all defined. No undefined tokens.
- lang: 197 pages en, 4 pages hi. 404 noindex. No secrets in git.

=====================================================================
HIGH PRIORITY
=====================================================================

H1. The premium redesign is NOT live.
    Current branch is `premium-redesign`, 9 commits AHEAD of origin/main.
    Live site last-modified 2026-09-28; HEAD commit 2026-09-29 (1d5ad0c).
    .github/workflows/deploy.yml only deploys on push to `main`, and the
    workflow runs `npm run qa` (not build/link checks). Action: merge to main
    (or add a branch preview/staging deploy), then re-verify.

H2. Social/OG images are enormous and shipped as PNG.
    src/components/BaseHead.astro:30 resolves og:image via pageArtPng() ->
    /og/*.png. 221 PNGs, 1.3-1.6 MB each, 162 MB total. WebP twins already
    exist (15 MB total) and are what the on-page heroes use (art.ts pageArt).
    Every share crawl pulls a ~1.4 MB image; the Pages artifact carries 162 MB
    of largely unreferenced PNGs. Fix: point og:image at og/*.webp (or a
    1200x630 optimized JPEG), stop shipping the PNG set, and add
    og:image:width/height (1200/630).

H3. Missing OG/Twitter completeness.
    No og:image:width, og:image:height, og:image:type; no twitter:site /
    twitter:creator; no <meta name="theme-color"> (only in the manifest);
    no apple-touch-icon. Cheap wins for link previews and mobile chrome.

H4. 24 SEO pages have a keyword the page never targets.
    Prebuild reports e.g. vocabulary/money-shopping "marathi money words",
    phrases/asking-directions "marathi directions phrases",
    hindi-bridge/* and english-path/* many. primaryKeyword is absent from
    title, H1 and description on those pages. Either align the copy or drop
    the keyword. src/data/seo/*.json + tools/validate-content.mjs.

=====================================================================
MEDIUM PRIORITY
=====================================================================

M1. Sitemap has no <lastmod>. dist/sitemap-0.xml: 0 occurrences. @astrojs/sitemap
    omits it (README acknowledges). Freshness signal lost; consider
    serialize() to emit lastmod from content/commit date.

M2. robots.txt at the project subpath is inert. https://.../learn-marathi/robots.txt
    is served but crawlers read the host root (xmirtunjay.github.io/robots.txt).
    The GPTBot/ClaudeBot/PerplexityBot/Google-Extended allow rules and the
    Sitemap directive here therefore do nothing. Fix only via a custom domain
    (drop `base`) or by moving to a user/org site.

M3. Title/description length overruns.
    20 titles > 60 chars, worst blog/how-to-say-i-love-you-in-marathi (78),
    vocabulary/people-occupations (68), vocabulary/shapes (66).
    2 descriptions > 160: same love-you page (196), how-to-say-help (166).
    These get truncated in SERPs. Trim to ~55/155.

M4. No RSS/Atom feed. Blog exists (26 posts) and @astrojs/rss is a declared
    dependency but is imported nowhere -> dead dependency and a missing
    distribution channel. Add src/pages/rss.xml.ts and
    <link rel="alternate" type="application/rss+xml"> in BaseHead.

M5. Broken CSS rule. src/styles/global.css:1537
    `.visually-hidden { @extend .sr-only; }` uses SCSS @extend in a plain CSS
    file; lightningcss drops it with a build warning, so the global
    .visually-hidden class has no styles. SiteFooter re-defines its own copy,
    so impact is limited, but the rule is dead. Replace with a real
    `composes`-free duplicate of the .sr-only declarations, or delete it.

M6. Thin pages. Quiz pages carry only ~270 visible words (interactive-only);
   contact/search/404 are also thin (expected). Quizzes have no crawlable
   explanatory text — consider adding a short intro + "what this quiz covers"
   block for indexability.

M7. hreflang coverage is thin and likely non-reciprocal.
    Only 8 pages emit hreflang (home, app, blog index, 4 hi pages, and the
    hindi-to-marathi words/phrases hubs). The Hindi mirror is 4 pages; the
    100s of English pages don't reciprocate. Google wants reciprocal pairs —
    either complete it for the hi/fr set or scope it deliberately.

M8. Images are not responsive. Only src/layouts/Learn.astro uses
    srcset/<picture>; elsewhere fixed 1200x630 webp with no sizes, and no
    fetchpriority="high" on the LCP hero. Add responsive srcset + preload/
    fetchpriority for hero art on the homepage and hub pages.

M9. Font loading. BaseHead loads Google Fonts (Mukta 5 weights + Noto Sans
    Devanagari 4 weights) via a render-blocking external stylesheet.
    Self-host the two families (subset to Devanagari + Latin) to remove a
    third-party render dependency and cut weight.

M10. Homepage ships 15 <script> tags; Base.DMqR_2pl.css is 61 KB. Acceptable
     for Astro but worth an audit pass: confirm none block first paint and
     that review/preferences/search clients are deferred.

M11. "Audio on every word" over-promise. public/audio/ is empty and
     src/data/audio-manifest.json is `{"_note":"empty — no TTS credentials",
     "files":{}}`. The homepage feature chip claims "Audio on every word" but
     ships only a silent data-URI + device TTS (SayScript). Either generate
     clips or soften the claim.

=====================================================================
LOW / REPO HYGIENE
=====================================================================

L1. Repo-root clutter: 25 tracked one-off scripts/data files at the repo root
    (add-*.mjs, add-entry.cjs/js, copy-images*.py/ps1, merge-*.ps1,
    new-*.json, vocab-new-entries.mjs, fix-entries.mjs, add-vocab.mjs). These
    are migration scripts, not product. Delete or move to tools/ (and note
    they are currently ROT stale duplicates of each other).

L2. Tracked scratch/audit artifacts (not in .gitignore): og-validation/ (203
    files), playwright-screenshots/ (10), test-results/ (6),
    temp_new_images/ (9), design-audit/ (7). Add to .gitignore and git rm.

L3. .git is 199 MB; the largest blobs are the 1.3-1.6 MB OG PNGs, permanently
    in history. Fixing H2 alone won't shrink history. Consider Git LFS for
    public/og or a history rewrite if clone size matters.

L4. Audit-doc sprawl at root: AUDIT_REPORT.md, AUDIT_REPORT_FINAL.md,
    PREMIUM_REDESIGN.md, PROMPT_NEXT_BATCH.md, TODO-REMAINING.md, REPORT.md,
    pr-body.md. Consolidate into docs/ with dates.

L5. offline.html (dist) has no canonical/og tags. Harmless for a SW fallback
    but consider noindex for consistency.

L6. Dead dependency: @astrojs/rss (see M4). Also review `idb` (used) and
    devDependency playwright (used only by ad-hoc tools, not in CI).

=====================================================================
STRENGTHS (keep)
=====================================================================
- Clean 200-route build in <10s; prebuild content validation gate in CI.
- 0 broken internal links; base-path handling via siteUrl() is correct.
- Consistent head: title/description/canonical/og on essentially every page.
- Design tokens coherent (no undefined vars); reduced-motion, skip link,
  focus-visible, ARIA, role=dialog prefs panel done properly.
- PWA: manifest + service worker (network-first nav, SWR images, offline
  fallback).
- SEO surface: JSON-LD, FAQPage, breadcrumbs, llms.txt, AI-crawler allows.
- Content richness: every dataset page has FAQ + sections + practice +
  mistakes; 1002-word vocabulary synced from a single curriculum source.

=====================================================================
SUGGESTED ORDER OF WORK
=====================================================================
1. Merge premium-redesign -> main and confirm the live site updates (H1).
2. Switch og:image to webp + add og:image:width/height; stop shipping PNGs (H2,H3).
3. Fix the 24 keyword WARNs (H4) and trim over-length titles/descriptions (M3).
4. Add RSS (M4) and lastmod (M1).
5. Fix the @extend rule (M5); add responsive hero images (M8).
6. Repo hygiene: delete root scripts, gitignore scratch dirs (L1,L2,L4).

=====================================================================
POST-AUDIT CORRECTIONS (verified during the fix pass, 2026-10-07)
=====================================================================
- M3 (over-length titles/descriptions): the original "20 titles > 60 chars"
  was inflated by HTML entity counting (&amp; = 5 chars). After decoding
  entities, only ONE page genuinely exceeded limits:
  /blog/how-to-say-i-love-you-in-marathi (title 68, description 182). Fixed.
  Dataset-page titles are already constrained to <=60 by validate-content.mjs.
- H2: PNG social cards were 160.9 MB; the JPEG set is 15.6 MB. dist/ dropped
  from ~200 MB to 54 MB.
- H4: the 24 keyword warnings were real; all fixed by weaving the exact
  primaryKeyword phrase into each description (validate-content: 0 warnings).
- All og:image URLs verified to resolve to a real file (0 of 201 pages 404).
- Internal links: 0 broken of 201 pages.
- H1 (redesign not deployed): resolved upstream — premium-redesign was merged
  to origin/main as PR #14 during the audit.

