# Learn Marathi — Bol Marathi content & SEO site

Standalone Astro site that turns the **Bol Marathi** Flutter app's real
curriculum into indexable learning content and funnels readers toward
the app. Sibling of `engineering-notebook` (which is a separate
portfolio site — do not merge the two). Notebook architecture is the
reference: static Astro, content-driven routes, `BaseHead` SEO,
sitemap, minimal JS, Vercel-friendly.

## Source of truth

App curriculum lives in the Bol Marathi Flutter repo
(`BOL_MARATHI_ROOT`, default `../bol_marathi` next to `blog/`):

- `content/units/unit_*.json` — 26 units × 6 lessons (grammar,
  culture, speaking, listening, Hindi→Marathi bridge,
  sentence-builder)
- `lib/content/generated_vocab.dart` — 1002 trilingual words

Never hand-copy content. Sync it:

```bash
npm run sync
```

This regenerates the committed snapshots in `src/data/learn/`
(`units.json`, `vocab.json`, `meta.json`). Point at the app repo with:

```bash
BOL_MARATHI_ROOT=/path/to/bol_marathi npm run sync
```

Curriculum fixes belong upstream; website-only corrections go in
`src/data/overrides.json` (applied by the sync script, logged, and
listed in REPORT.md). Validate snapshots with `npm run qa`.

## App link config

The app is **not on the Play Store yet**. Store URLs live in
`src/data/app.ts` (`playStoreUrl: null`, `comingSoon: true`).
When hosted, set the URL + `comingSoon: false` — every CTA updates.

## Waitlist, beta and analytics

- **Waitlist = one shared form** (`src/components/WaitlistForm.astro`)
  posting to `waitlistFormAction` (Formspree). Empty endpoint prints a
  build warning and renders the form disabled — never a dead post.
- **Beta:** set `betaOptInUrl` (Play tester link) and primary CTAs read
  "Join the beta". **Launch:** set `playStoreUrl` + `comingSoon: false`.
- **Analytics (optional):** `PUBLIC_ANALYTICS_SRC` (+ optional
  `PUBLIC_ANALYTICS_DOMAIN` / `PUBLIC_ANALYTICS_ATTRS` JSON) enables a
  deferred Plausible/Umami tracker. Unset = nothing loads.
- Funnel hooks (`data-funnel`, `data-app-cta`, `data-cta-variant`,
  `data-cta-context`) are on every CTA for future measurement.

## Develop

```bash
npm install
npm run dev
npm run build
```

## Deploy

GitHub Pages project site: **https://xmirtunjay.github.io/learn-marathi/**
via `.github/workflows/deploy.yml` (runs `npm ci && npm run build` on
`main` with `withastro/action`, deploys the artifact).
For a custom domain / Vercel later: set `site` to the domain and drop
`base` in `astro.config.mjs`, and update `public/robots.txt`.

> Note: on a GitHub Pages **project** site, only the user-site root
> `robots.txt` is honored — `.../learn-marathi/robots.txt` is served
> but crawlers read `xmirtunjay.github.io/robots.txt`. Submit
> `.../learn-marathi/sitemap-index.xml` manually in Search Console
> (and Bing Webmaster Tools). `@astrojs/sitemap` does not emit
> `lastmod`; freshness is conveyed by content updates.

## Docs

- `docs/CONTENT_ARCHITECTURE.md` — architecture report
- `docs/CONTENT_INVENTORY.md` — what exists, what becomes pages
- `docs/FUNNEL.md` — SEO clusters → CTA → app map
