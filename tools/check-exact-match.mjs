// Exact filename matching - check if the EXACT expected ogBase exists post-rename
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// Load all data
const vocabTopics = JSON.parse(fs.readFileSync(path.join(root, 'src/data/seo/vocab-topics.json'), 'utf8'));
const phrasePages = JSON.parse(fs.readFileSync(path.join(root, 'src/data/seo/phrase-pages.json'), 'utf8'));
const grammarPages = JSON.parse(fs.readFileSync(path.join(root, 'src/data/seo/grammar-pages.json'), 'utf8'));
const hindiBridges = JSON.parse(fs.readFileSync(path.join(root, 'src/data/seo/hindi-bridges.json'), 'utf8'));
const englishPaths = JSON.parse(fs.readFileSync(path.join(root, 'src/data/seo/english-paths.json'), 'utf8'));

const learnSrc = fs.readFileSync(path.join(root, 'src/lib/learn.ts'), 'utf8');
function pairsIn(src, constName) {
  const block = src.match(new RegExp(`export const ${constName}[^=]*=\\s*\\[([\\s\\S]*?)\\];\\s*\\nexport`))?.[1]
    ?? src.match(new RegExp(`export const ${constName}[^=]*=\\s*\\[([\\s\\S]*)`))?.[1] ?? '';
  const out = [];
  const re = /slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(block))) out.push(m.slice(1));
  return out;
}
const clusters = pairsIn(learnSrc, 'clusters');
const phraseSets = pairsIn(learnSrc, 'phraseSets');
const grammarTopics = pairsIn(learnSrc, 'grammarTopics');
const units = JSON.parse(fs.readFileSync(path.join(root, 'src/data/learn/units.json'), 'utf8'));

const blogDir = path.join(root, 'src/pages/blog');
const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.astro'));
const blogPages = blogFiles.map(f => {
  const src = fs.readFileSync(path.join(blogDir, f), 'utf8');
  const t = src.match(/^\ttitle="([^"]+)"|^title="([^"]+)"/m) ?? src.match(/const title = '([^']+)'/);
  if (t) return { route: `blog/${f.replace(/\.astro$/, '')}`, title: t[1] ?? t[2] };
  return null;
}).filter(Boolean);

function ogBase(route) {
  return route === '' ? 'og-home' : `og-${route.replace(/\//g, '-')}`;
}

// Build expected pages with EXACT expected ogBase
const expectedPages = new Map();
const staticPages = [
  { route: '', title: 'Learn Marathi from Hindi or English', family: 'home' },
  { route: 'vocabulary', title: 'Marathi Vocabulary by Topic', family: 'vocabulary' },
  { route: 'phrases', title: 'Marathi Phrases for Real Life', family: 'phrases' },
  { route: 'grammar', title: 'Marathi Grammar', family: 'grammar' },
  { route: 'lessons', title: 'Marathi Lessons: Full Curriculum', family: 'lessons' },
  { route: 'quiz', title: 'Marathi Quizzes by Topic', family: 'quiz' },
  { route: 'hindi-to-marathi', title: 'Hindi to Marathi', family: 'hindi-to-marathi' },
  { route: 'english-to-marathi', title: 'English to Marathi', family: 'english-to-marathi' },
  { route: 'app', title: 'Bol Marathi App', family: 'app' },
  { route: 'start', title: 'Start Learning Marathi', family: 'start' },
  { route: 'downloads', title: 'Free Marathi Anki Decks', family: 'downloads' },
  { route: 'review', title: 'Spaced Repetition Review', family: 'review' },
  { route: 'search', title: 'Search Marathi Lessons', family: 'search' },
  { route: 'blog', title: 'Real-Life Marathi Guides', family: 'blog' },
  { route: 'hi', title: 'Hindi se Marathi', family: 'hi' },
  { route: 'hi/shabd', title: 'Hindi se Marathi Shabd', family: 'hi' },
  { route: 'hi/vakya', title: 'Hindi se Marathi Vakya', family: 'hi' },
  { route: 'hi/app', title: 'Bol Marathi App', family: 'hi' },
  { route: 'about', title: 'About Bol Marathi', family: 'about' },
  { route: 'contact', title: 'Contact', family: 'contact' },
  { route: 'privacy', title: 'Privacy Policy', family: 'privacy' },
  { route: 'how-it-works', title: 'How the Curriculum Works', family: 'how-it-works' },
  { route: 'how-to-say-hello-in-marathi', title: 'How to Say Hello in Marathi', family: 'blog' },
  { route: 'how-to-say-good-morning-in-marathi', title: 'How to Say Good Morning in Marathi', family: 'blog' },
  { route: 'how-to-say-thank-you-in-marathi', title: 'How to Say Thank You in Marathi', family: 'blog' },
  { route: 'how-to-say-sorry-in-marathi', title: 'How to Say Sorry in Marathi', family: 'blog' },
  { route: 'marathi-alphabet', title: 'Marathi Alphabet', family: 'lessons' },
  { route: 'marathi-numbers', title: 'Marathi Numbers', family: 'lessons' },
  { route: 'marathi-pronunciation', title: 'Marathi Pronunciation', family: 'lessons' },
  { route: 'marathi-days-months', title: 'Marathi Days & Months', family: 'lessons' },
  { route: 'marathi-vs-hindi', title: 'Marathi vs Hindi', family: 'lessons' },
];

for (const p of staticPages) expectedPages.set(p.route, { ogBase: ogBase(p.route), title: p.title, family: p.family, route: p.route });
for (const [slug, title] of clusters) { const route = `vocabulary/${slug}`; expectedPages.set(route, { ogBase: ogBase(route), title, family: 'vocabulary', route }); }
for (const [slug, title] of phraseSets) { const route = `phrases/${slug}`; expectedPages.set(route, { ogBase: ogBase(route), title, family: 'phrases', route }); }
for (const [slug, title] of grammarTopics) { const route = `grammar/${slug}`; expectedPages.set(route, { ogBase: ogBase(route), title, family: 'grammar', route }); }
for (const u of units) { const route = `lessons/${u.unit}`; expectedPages.set(route, { ogBase: ogBase(route), title: `Unit ${u.unit}: ${u.titleEn}`, family: 'lessons', route }); }
for (const [slug, title] of clusters) { const route = `quiz/${slug}`; expectedPages.set(route, { ogBase: ogBase(route), title: `Quiz: ${title}`, family: 'quiz', route }); }
for (const p of blogPages) { expectedPages.set(p.route, { ogBase: ogBase(p.route), title: p.title, family: 'blog', route: p.route }); }

const seoFamilies = [
  [vocabTopics, 'vocabulary'],
  [phrasePages, 'phrases'],
  [grammarPages, 'grammar'],
  [hindiBridges, 'hindi-to-marathi'],
  [englishPaths, 'english-to-marathi'],
];

for (const [list, basePath] of seoFamilies) {
  for (const p of list) if (p.status === 'published') expectedPages.set(`${basePath}/${p.slug}`, { ogBase: ogBase(`${basePath}/${p.slug}`), title: p.title, family: basePath, route: `${basePath}/${p.slug}` });
}

const extraPages = [
  { route: 'hindi-to-marathi/words', title: 'Hindi to Marathi Words', family: 'hindi-to-marathi' },
  { route: 'hindi-to-marathi/phrases', title: 'Hindi to Marathi Phrases', family: 'hindi-to-marathi' },
  { route: 'english-to-marathi/words', title: 'English to Marathi Words', family: 'english-to-marathi' },
  { route: 'english-to-marathi/phrases', title: 'English to Marathi Phrases', family: 'english-to-marathi' },
];

for (const p of extraPages) expectedPages.set(p.route, { ogBase: ogBase(p.route), title: p.title, family: p.family, route: p.route });

// Actual files
const actualFiles = fs.readdirSync(path.join(root, 'public/og')).filter(f => f.endsWith('.webp') || f.endsWith('.png'));
const actualFileMap = new Map();
for (const f of actualFiles) {
  const base = f.replace(/\.(png|webp)$/, '');
  actualFileMap.set(base, f);
}

// Rename plan
const renamePlan = [
  { fromBase: 'og-blog', toBase: 'og-blog-situational-guide', conflict: false },
  { fromBase: 'og-english-to-marathi-words', toBase: 'og-english-to-marathi-workplace_1', conflict: true },
  { fromBase: 'og-grammar-commands-polite', toBase: 'og-hindi-to-marathi-sentence-patterns_1', conflict: true },
  { fromBase: 'og-hindi-to-marathi-advanced-structures', toBase: 'og-hindi-to-marathi-time-seasons_1', conflict: true },
  { fromBase: 'og-hindi-to-marathi-daily-conversation', toBase: 'og-hindi-to-marathi-time-seasons-clock', conflict: false },
  { fromBase: 'og-hindi-to-marathi-festivals', toBase: 'og-hindi-to-marathi-travel_1', conflict: true },
  { fromBase: 'og-hindi-to-marathi-greetings', toBase: 'og-hindi-to-marathi-travel-train', conflict: false },
  { fromBase: 'og-hindi-to-marathi-time-seasons', toBase: 'og-hindi-to-marathi-shopping_1', conflict: true },
  { fromBase: 'og-hindi-to-marathi-travel', toBase: 'og-hindi-to-marathi-shopping-2', conflict: false },
  { fromBase: 'og-phrases-making-plans', toBase: 'og-phrases-asking-directions_1', conflict: true },
  { fromBase: 'og-phrases-office-work', toBase: 'og-phrases-shopping_1', conflict: true },
  { fromBase: 'og-phrases-phone-and-messaging', toBase: 'og-phrases-asking-directions-2', conflict: false },
  { fromBase: 'og-phrases-presentations-interviews', toBase: 'og-phrases-thanking-apologizing_1', conflict: true },
  { fromBase: 'og-phrases-shopping', toBase: 'og-phrases-business-meetings_1', conflict: true },
  { fromBase: 'og-phrases-thanking-apologizing', toBase: 'og-phrases-phone-and-messaging_1', conflict: true },
  { fromBase: 'og-phrases-travel', toBase: 'og-phrases-asking-directions-3', conflict: false },
  { fromBase: 'og-vocabulary-adjectives', toBase: 'og-vocabulary-work-office_1', conflict: true },
  { fromBase: 'og-vocabulary-animals', toBase: 'og-vocabulary-adjectives_1', conflict: true },
  { fromBase: 'og-vocabulary-body-parts', toBase: 'og-vocabulary-abstract-concepts_1', conflict: true },
  { fromBase: 'og-vocabulary-clothing', toBase: 'og-vocabulary-transport_1', conflict: true },
  { fromBase: 'og-vocabulary-food', toBase: 'og-vocabulary-adjectives-2', conflict: false },
  { fromBase: 'og-vocabulary-shopping', toBase: 'og-vocabulary-abstract-concepts-2', conflict: false },
];

const keepNewContent = [
  { base: 'og-hindi-to-marathi-school-and-study', route: 'hindi-to-marathi/school-and-study' },
  { base: 'og-hindi-to-marathi-technology', route: 'hindi-to-marathi/technology' },
  { base: 'og-hindi-to-marathi-work-career', route: 'hindi-to-marathi/work-career' },
];

const deleteFiles = ['og-english-to-marathi-travel'];

// Build post-rename available bases
const fromBases = new Set(renamePlan.map(r => r.fromBase));
const toBases = new Map(renamePlan.map(r => [r.fromBase, r.toBase]));
const keepBases = new Set(keepNewContent.map(k => k.base));
const deletedBases = new Set(deleteFiles);

const originalBases = new Set(Array.from(actualFileMap.keys()));
const postRenameBases = new Set(
  Array.from(originalBases)
    .filter(b => !deletedBases.has(b) && !fromBases.has(b))
    .concat(renamePlan.map(r => r.toBase))
    .concat(Array.from(keepBases))
);

console.log(`Post-rename available bases: ${postRenameBases.size}\n`);

// 25 IMPACTED PAGES - check EXACT match for their expected ogBase
const impactedPages = [
  { route: 'blog', expectedOgBase: 'og-blog', type: 'RENAME' },
  { route: 'english-to-marathi/words', expectedOgBase: 'og-english-to-marathi-words', type: 'RENAME' },
  { route: 'grammar/commands-polite', expectedOgBase: 'og-grammar-commands-polite', type: 'RENAME' },
  { route: 'hindi-to-marathi/advanced-structures', expectedOgBase: 'og-hindi-to-marathi-advanced-structures', type: 'RENAME' },
  { route: 'hindi-to-marathi/daily-conversation', expectedOgBase: 'og-hindi-to-marathi-daily-conversation', type: 'RENAME' },
  { route: 'hindi-to-marathi/festivals', expectedOgBase: 'og-hindi-to-marathi-festivals', type: 'RENAME' },
  { route: 'hindi-to-marathi/greetings', expectedOgBase: 'og-hindi-to-marathi-greetings', type: 'RENAME' },
  { route: 'hindi-to-marathi/time-seasons', expectedOgBase: 'og-hindi-to-marathi-time-seasons', type: 'RENAME' },
  { route: 'hindi-to-marathi/travel', expectedOgBase: 'og-hindi-to-marathi-travel', type: 'RENAME' },
  { route: 'phrases/making-plans', expectedOgBase: 'og-phrases-making-plans', type: 'RENAME' },
  { route: 'phrases/office-work', expectedOgBase: 'og-phrases-office-work', type: 'RENAME' },
  { route: 'phrases/phone-and-messaging', expectedOgBase: 'og-phrases-phone-and-messaging', type: 'RENAME' },
  { route: 'phrases/presentations-interviews', expectedOgBase: 'og-phrases-presentations-interviews', type: 'RENAME' },
  { route: 'phrases/shopping', expectedOgBase: 'og-phrases-shopping', type: 'RENAME' },
  { route: 'phrases/thanking-apologizing', expectedOgBase: 'og-phrases-thanking-apologizing', type: 'RENAME' },
  { route: 'phrases/travel', expectedOgBase: 'og-phrases-travel', type: 'RENAME' },
  { route: 'vocabulary/adjectives', expectedOgBase: 'og-vocabulary-adjectives', type: 'RENAME' },
  { route: 'vocabulary/animals', expectedOgBase: 'og-vocabulary-animals', type: 'RENAME' },
  { route: 'vocabulary/body-parts', expectedOgBase: 'og-vocabulary-body-parts', type: 'RENAME' },
  { route: 'vocabulary/clothing', expectedOgBase: 'og-vocabulary-clothing', type: 'RENAME' },
  { route: 'vocabulary/food', expectedOgBase: 'og-vocabulary-food', type: 'RENAME' },
  { route: 'vocabulary/shopping', expectedOgBase: 'og-vocabulary-shopping', type: 'RENAME' },
  { route: 'hindi-to-marathi/school-and-study', expectedOgBase: 'og-hindi-to-marathi-school-and-study', type: 'KEEP_NEW_CONTENT' },
  { route: 'hindi-to-marathi/technology', expectedOgBase: 'og-hindi-to-marathi-technology', type: 'KEEP_NEW_CONTENT' },
  { route: 'hindi-to-marathi/work-career', expectedOgBase: 'og-hindi-to-marathi-work-career', type: 'KEEP_NEW_CONTENT' },
];

console.log('=== EXACT FILENAME MATCH CHECK FOR 25 IMPACTED PAGES ===\n');

let exactMatch = 0;
let noExactMatch = 0;

for (const page of impactedPages) {
  const hasExact = postRenameBases.has(page.expectedOgBase);
  const status = hasExact ? '✅ EXACT MATCH' : '❌ NO EXACT MATCH';
  if (hasExact) exactMatch++; else noExactMatch++;
  
  console.log(`${status} | ${page.route}`);
  console.log(`  Expected: ${page.expectedOgBase}`);
  console.log(`  Type: ${page.type}`);
  console.log('');
}

console.log(`${'='.repeat(60)}`);
console.log(`SUMMARY:`);
console.log(`  Total impacted pages: ${impactedPages.length}`);
console.log(`  Has EXACT filename match: ${exactMatch}`);
console.log(`  NO exact filename match: ${noExactMatch}`);
console.log(`\nPages with NO exact match:`);

for (const page of impactedPages) {
  if (!postRenameBases.has(page.expectedOgBase)) {
    console.log(`  ${page.route} - Expected: ${page.expectedOgBase} (${page.type})`);
  }
}