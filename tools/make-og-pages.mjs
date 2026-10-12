// Per-page OG images (1200×630) generated at build-prep time.
// Run: node ./tools/make-og-pages.mjs  (also runs inside `npm run sync`)
// Sources (no drift): units.json (unit titles), learn.ts slug+title
// pairs (parsed, stable format), literal title="..." in root pages.
// Text is Latin-only (Devanagari stripped — system fonts vary);
// sharp falls back to og-default.png when a title is missing.
// Writes: public/og/<route-dashes>.png + src/data/og-manifest.json
import sharp from 'sharp';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const outDir = join(root, 'public', 'og');
mkdirSync(outDir, { recursive: true });

const latin = (s) => String(s ?? '').replace(/[^\x00-\x7F]/g, '').replace(/\s{2,}/g, ' ').trim();

/** slug, title pairs inside `const X = [...]` in learn.ts */
function pairsIn(src, constName) {
  const block = src.match(new RegExp(`export const ${constName}[^=]*=\\s*\\[([\\s\\S]*?)\\];\\s*\\nexport`))?.[1]
    ?? src.match(new RegExp(`export const ${constName}[^=]*=\\s*\\[([\\s\\S]*)`))?.[1] ?? '';
  const out = [];
  const re = /slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(block))) out.push(m.slice(1));
  return out;
}

const learn = readFileSync(join(root, 'src', 'lib', 'learn.ts'), 'utf8');
const units = JSON.parse(readFileSync(join(root, 'src', 'data', 'learn', 'units.json'), 'utf8'));

/** route-path (no leading slash) -> card title */
const pages = new Map();
pages.set('', 'Learn Marathi from Hindi or English');
pages.set('vocabulary', 'Marathi Vocabulary by Topic');
pages.set('phrases', 'Marathi Phrases for Real Life');
pages.set('grammar', 'Marathi Grammar');
pages.set('lessons', 'Marathi Lessons: Full Curriculum');
pages.set('quiz', 'Marathi Quizzes by Topic');
pages.set('hindi-to-marathi', 'Hindi to Marathi');
pages.set('english-to-marathi', 'English to Marathi');
pages.set('app', 'Bol Marathi App');
pages.set('start', 'Start Learning Marathi');
pages.set('downloads', 'Free Marathi Anki Decks');
pages.set('review', 'Spaced Repetition Review');
pages.set('search', 'Search Marathi Lessons');
pages.set('blog', 'Real-Life Marathi Guides');
pages.set('hi', 'Hindi se Marathi');
pages.set('hi/shabd', 'Hindi se Marathi Shabd');
pages.set('hi/vakya', 'Hindi se Marathi Vakya');
pages.set('hi/app', 'Bol Marathi App');
for (const [slug, title] of pairsIn(learn, 'clusters')) pages.set(`vocabulary/${slug}`, title);
for (const [slug, title] of pairsIn(learn, 'phraseSets')) pages.set(`phrases/${slug}`, title);
for (const [slug, title] of pairsIn(learn, 'grammarTopics')) pages.set(`grammar/${slug}`, title);
for (const u of units) pages.set(`lessons/${u.unit}`, `Unit ${u.unit}: ${u.titleEn}`);
for (const c of pairsIn(learn, 'clusters')) pages.set(`quiz/${c[0]}`, `Quiz: ${c[1]}`);
for (const f of readdirSync(join(root, 'src', 'pages')).filter((f) => f.endsWith('.astro'))) {
  const src = readFileSync(join(root, 'src', 'pages', f), 'utf8');
  const t = src.match(/^\ttitle="([^"]+)"|^title="([^"]+)"/m) ?? src.match(/const title = '([^']+)'/);
  if (t) {
    const route = f.replace(/\.astro$/, '').replace(/\[(\w+)\]/, '$1');
    if (!pages.has(route)) pages.set(route, t[1] ?? t[2]);
  }
}
for (const f of readdirSync(join(root, 'src', 'pages', 'blog')).filter((f) => f.endsWith('.astro'))) {
  const src = readFileSync(join(root, 'src', 'pages', 'blog', f), 'utf8');
  const t = src.match(/^\ttitle="([^"]+)"|^title="([^"]+)"/m) ?? src.match(/const title = '([^']+)'/);
  if (t) {
    const route = `blog/${f.replace(/\.astro$/, '')}`;
    if (!pages.has(route)) pages.set(route, t[1] ?? t[2]);
  }
}
// Data-driven blog guides (src/data/blog/guides.json) — same cards as static posts.
const blogGuides = JSON.parse(readFileSync(join(root, 'src', 'data', 'blog', 'guides.json'), 'utf8'));
for (const g of blogGuides) {
  pages.set(`blog/${g.slug}`, latin(g.title) || 'Marathi Guide');
}
// Subdirectory pages with dynamic titles (verified literals).
pages.set('hindi-to-marathi/words', 'Hindi to Marathi Words');
pages.set('hindi-to-marathi/phrases', 'Hindi to Marathi Phrases');
pages.set('english-to-marathi/words', 'English to Marathi Words');
pages.set('english-to-marathi/phrases', 'English to Marathi Phrases');

// SEO content-engine pages (src/data/seo/*.json) — published only.
const seoFamilies = [
  ['vocab-topics.json', 'vocabulary'],
  ['phrase-pages.json', 'phrases'],
  ['grammar-pages.json', 'grammar'],
  ['hindi-bridges.json', 'hindi-to-marathi'],
  ['english-paths.json', 'english-to-marathi'],
];
for (const [file, basePath] of seoFamilies) {
  const list = JSON.parse(readFileSync(join(root, 'src', 'data', 'seo', file), 'utf8'));
  for (const p of list) {
    if (p.status === 'published') pages.set(`${basePath}/${p.slug}`, p.title);
  }
}

const card = (label) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="#8E2D12"/>
<rect x="80" y="232" width="100" height="100" rx="22" fill="#FDFBF7"/>
<text x="130" y="304" font-size="58" text-anchor="middle" fill="#8E2D12" font-family="sans-serif" font-weight="bold">BM</text>
<text x="600" y="282" font-size="56" fill="#FDFBF7" font-family="sans-serif" font-weight="bold" text-anchor="middle" style="max-width: 1000px;">${label}</text>
<text x="600" y="342" font-size="32" fill="#FFDBD1" font-family="sans-serif" text-anchor="middle">Learn Marathi · Bol Marathi</text>
</svg>`;

const manifest = [];
const regen = process.argv.includes('--regen');
for (const [route, title] of pages) {
  const label = latin(title).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  if (!label) continue;
  const file = `og-${route === '' ? 'home' : route.replace(/\//g, '-')}.png`;
  // Never overwrite human-made art: skip existing files unless --regen.
  if (!regen && existsSync(join(outDir, file))) {
    manifest.push(route);
    continue;
  }
  await sharp(Buffer.from(card(label))).png().toFile(join(outDir, file));
  // pageArt() references the .webp variant — emit it alongside
  await sharp(Buffer.from(card(label))).webp({ quality: 80 }).toFile(join(outDir, file.replace(/\.png$/, '.webp')));
  manifest.push(route);
}
writeFileSync(join(root, 'src', 'data', 'og-manifest.json'), JSON.stringify({ routes: manifest }, null, 2) + '\n');
console.log(`og-pages: ${manifest.length} cards → public/og/`);
if (!existsSync(join(outDir, 'og-home.png'))) throw new Error('og home card missing');
