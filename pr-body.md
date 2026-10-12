## Summary

This PR completes the SEO/content engine for 200+ Marathi learning pages and optimizes all OG images.

### Content Added
- **7 Hindi→Marathi bridges**: pronunciation-sounds, school-and-study, technology, festivals, postpositions, hobbies, literature-words
- **3 Vocabulary pages**: technology, birds, shapes (+ 39 vocab entries in vocab.json)
- **4 Word-guide blogs**: please, water, help, i-love-you (with custom SVG→PNG OG cards)
- **1 English→Marathi path**: emergency-phrases

### Image Optimization
- All 201 OG images converted to **WebP** (60-95% size reduction)
- **PNG fallback** via `<picture>` element for compatibility
- **LQIP blur-up placeholders** for all images (WebP base64 in lqip.json)
- Total OG payload reduced from **~300 MB → ~30 MB**
- OG meta tags still use PNG (required for social sharing)

### Validation
- `npm run build` — 200 pages ✅
- `npm run qa` — PASS (1041 words, 26 units) ✅
- `content-validate` — PASS (83 dataset pages) ✅
- All 199 sitemap routes have matching OG images ✅

### Data Integrity
- All Marathi strings resolve from `vocab.json` (1,041 words) and `units.json` (26 units)
- Validators throw on bad refs — no invented Marathi
- Resolvers enforce: vocab ≥10, phrases ≥8, bridges ≥5, grammar ≥1, practice ≥3, mistakes ≥2, unit links ≥1

### Files Changed
- `src/data/seo/hindi-bridges.json` (24 entries)
- `src/data/seo/vocab-topics.json` (28 entries)
- `src/data/seo/english-paths.json` (13 entries)
- `src/data/learn/vocab.json` (1,041 words)
- `src/pages/blog/how-to-say-*.astro` (4 new)
- `src/lib/art.ts` — WebP/PNG logic
- `src/layouts/Learn.astro` — `<picture>` element
- `src/data/lqip.json` — 201 WebP base64 entries
- `public/og/` — 201 PNG + 201 WebP images

Closes the content plan in `docs/CONTENT_PLAN.md`