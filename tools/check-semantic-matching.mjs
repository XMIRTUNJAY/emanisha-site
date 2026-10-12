// Check semantic matching - page slug/topic must match image content
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

// Build expected pages with SEMANTIC TOPIC
const expectedPages = new Map();
const staticPages = [
  { route: '', title: 'Learn Marathi from Hindi or English', family: 'home', topic: 'home' },
  { route: 'vocabulary', title: 'Marathi Vocabulary by Topic', family: 'vocabulary', topic: 'vocabulary' },
  { route: 'phrases', title: 'Marathi Phrases for Real Life', family: 'phrases', topic: 'phrases' },
  { route: 'grammar', title: 'Marathi Grammar', family: 'grammar', topic: 'grammar' },
  { route: 'lessons', title: 'Marathi Lessons: Full Curriculum', family: 'lessons', topic: 'lessons' },
  { route: 'quiz', title: 'Marathi Quizzes by Topic', family: 'quiz', topic: 'quiz' },
  { route: 'hindi-to-marathi', title: 'Hindi to Marathi', family: 'hindi-to-marathi', topic: 'hindi-to-marathi' },
  { route: 'english-to-marathi', title: 'English to Marathi', family: 'english-to-marathi', topic: 'english-to-marathi' },
  { route: 'app', title: 'Bol Marathi App', family: 'app', topic: 'app' },
  { route: 'start', title: 'Start Learning Marathi', family: 'start', topic: 'start' },
  { route: 'downloads', title: 'Free Marathi Anki Decks', family: 'downloads', topic: 'downloads' },
  { route: 'review', title: 'Spaced Repetition Review', family: 'review', topic: 'review' },
  { route: 'search', title: 'Search Marathi Lessons', family: 'search', topic: 'search' },
  { route: 'blog', title: 'Real-Life Marathi Guides', family: 'blog', topic: 'blog-index' },
  { route: 'hi', title: 'Hindi se Marathi', family: 'hi', topic: 'hi' },
  { route: 'hi/shabd', title: 'Hindi se Marathi Shabd', family: 'hi', topic: 'shabd' },
  { route: 'hi/vakya', title: 'Hindi se Marathi Vakya', family: 'hi', topic: 'vakya' },
  { route: 'hi/app', title: 'Bol Marathi App', family: 'hi', topic: 'app' },
  { route: 'about', title: 'About Bol Marathi', family: 'about', topic: 'about' },
  { route: 'contact', title: 'Contact', family: 'contact', topic: 'contact' },
  { route: 'privacy', title: 'Privacy Policy', family: 'privacy', topic: 'privacy' },
  { route: 'how-it-works', title: 'How the Curriculum Works', family: 'how-it-works', topic: 'how-it-works' },
  { route: 'how-to-say-hello-in-marathi', title: 'How to Say Hello in Marathi', family: 'blog', topic: 'hello' },
  { route: 'how-to-say-good-morning-in-marathi', title: 'How to Say Good Morning in Marathi', family: 'blog', topic: 'good-morning' },
  { route: 'how-to-say-thank-you-in-marathi', title: 'How to Say Thank You in Marathi', family: 'blog', topic: 'thank-you' },
  { route: 'how-to-say-sorry-in-marathi', title: 'How to Say Sorry in Marathi', family: 'blog', topic: 'sorry' },
  { route: 'marathi-alphabet', title: 'Marathi Alphabet', family: 'lessons', topic: 'alphabet' },
  { route: 'marathi-numbers', title: 'Marathi Numbers', family: 'lessons', topic: 'numbers' },
  { route: 'marathi-pronunciation', title: 'Marathi Pronunciation', family: 'lessons', topic: 'pronunciation' },
  { route: 'marathi-days-months', title: 'Marathi Days & Months', family: 'lessons', topic: 'days-months' },
  { route: 'marathi-vs-hindi', title: 'Marathi vs Hindi', family: 'lessons', topic: 'vs-hindi' },
];

for (const p of staticPages) expectedPages.set(p.route, { ogBase: ogBase(p.route), title: p.title, family: p.family, route: p.route, topic: p.topic });
for (const [slug, title] of clusters) { const route = `vocabulary/${slug}`; expectedPages.set(route, { ogBase: ogBase(route), title, family: 'vocabulary', route, topic: slug }); }
for (const [slug, title] of phraseSets) { const route = `phrases/${slug}`; expectedPages.set(route, { ogBase: ogBase(route), title, family: 'phrases', route, topic: slug }); }
for (const [slug, title] of grammarTopics) { const route = `grammar/${slug}`; expectedPages.set(route, { ogBase: ogBase(route), title, family: 'grammar', route, topic: slug }); }
for (const u of units) { const route = `lessons/${u.unit}`; expectedPages.set(route, { ogBase: ogBase(route), title: `Unit ${u.unit}: ${u.titleEn}`, family: 'lessons', route, topic: `unit-${u.unit}` }); }
for (const [slug, title] of clusters) { const route = `quiz/${slug}`; expectedPages.set(route, { ogBase: ogBase(route), title: `Quiz: ${title}`, family: 'quiz', route, topic: slug }); }
for (const p of blogPages) { expectedPages.set(p.route, { ogBase: ogBase(p.route), title: p.title, family: 'blog', route: p.route, topic: p.route.replace('blog/', '') }); }

const seoFamilies = [
  [vocabTopics, 'vocabulary'],
  [phrasePages, 'phrases'],
  [grammarPages, 'grammar'],
  [hindiBridges, 'hindi-to-marathi'],
  [englishPaths, 'english-to-marathi'],
];

for (const [list, basePath] of seoFamilies) {
  for (const p of list) if (p.status === 'published') expectedPages.set(`${basePath}/${p.slug}`, { ogBase: ogBase(`${basePath}/${p.slug}`), title: p.title, family: basePath, route: `${basePath}/${p.slug}`, topic: p.slug });
}

const extraPages = [
  { route: 'hindi-to-marathi/words', title: 'Hindi to Marathi Words', family: 'hindi-to-marathi', topic: 'words' },
  { route: 'hindi-to-marathi/phrases', title: 'Hindi to Marathi Phrases', family: 'hindi-to-marathi', topic: 'phrases' },
  { route: 'english-to-marathi/words', title: 'English to Marathi Words', family: 'english-to-marathi', topic: 'words' },
  { route: 'english-to-marathi/phrases', title: 'English to Marathi Phrases', family: 'english-to-marathi', topic: 'phrases' },
];

for (const p of extraPages) expectedPages.set(p.route, { ogBase: ogBase(p.route), title: p.title, family: p.family, route: p.route, topic: p.topic });

// Actual files
const actualFiles = fs.readdirSync(path.join(root, 'public/og')).filter(f => f.endsWith('.webp') || f.endsWith('.png'));
const actualFileMap = new Map();
for (const f of actualFiles) {
  const base = f.replace(/\.(png|webp)$/, '');
  actualFileMap.set(base, f);
}

// ============================================================
// RENAME PLAN (with _1 suffix for conflicts)
// ============================================================

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
  { base: 'og-hindi-to-marathi-school-and-study', route: 'hindi-to-marathi/school-and-study', topic: 'school-and-study' },
  { base: 'og-hindi-to-marathi-technology', route: 'hindi-to-marathi/technology', topic: 'technology' },
  { base: 'og-hindi-to-marathi-work-career', route: 'hindi-to-marathi/work-career', topic: 'work-career' },
];

const deleteFiles = ['og-english-to-marathi-travel'];

// Build post-rename available image bases with their SEMANTIC TOPICS
function extractTopicFromBase(base) {
  // og-hindi-to-marathi-greetings -> greetings
  // og-vocabulary-animals -> animals
  // og-phrases-asking-directions -> asking-directions
  const parts = base.replace('og-', '').split('-');
  // Remove family prefix
  const familyPrefixes = ['hindi-to-marathi', 'english-to-marathi', 'vocabulary', 'phrases', 'grammar', 'blog'];
  let remaining = parts;
  for (const fp of familyPrefixes) {
    const fpParts = fp.split('-');
    if (parts.slice(0, fpParts.length).join('-') === fp) {
      remaining = parts.slice(fpParts.length);
      break;
    }
  }
  return remaining.join('-');
}

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

// Map each post-rename base to its semantic topic
const baseToTopic = new Map();
for (const base of postRenameBases) {
  baseToTopic.set(base, extractTopicFromBase(base));
}

console.log(`Post-rename available image bases: ${postRenameBases.size}\n`);

// ============================================================
// 25 IMPACTED PAGES WITH SEMANTIC TOPICS
// ============================================================

const impactedPages = [
  { route: 'blog', family: 'blog', title: 'Real-Life Marathi Guides', type: 'RENAME', topic: 'blog-index' },
  { route: 'english-to-marathi/words', family: 'english-to-marathi', title: 'English to Marathi Words', type: 'RENAME', topic: 'words' },
  { route: 'grammar/commands-polite', family: 'grammar', title: 'Marathi Commands & Polite Requests', type: 'RENAME', topic: 'commands-polite' },
  { route: 'hindi-to-marathi/advanced-structures', family: 'hindi-to-marathi', title: 'Hindi to Marathi Advanced: Passive, Causative', type: 'RENAME', topic: 'advanced-structures' },
  { route: 'hindi-to-marathi/daily-conversation', family: 'hindi-to-marathi', title: 'Hindi to Marathi Daily Conversation: Survival Sentences', type: 'RENAME', topic: 'daily-conversation' },
  { route: 'hindi-to-marathi/festivals', family: 'hindi-to-marathi', title: 'Hindi to Marathi Festivals: Diwali, Ganpati & More', type: 'RENAME', topic: 'festivals' },
  { route: 'hindi-to-marathi/greetings', family: 'hindi-to-marathi', title: 'Hindi to Marathi Greetings & First Sentences', type: 'RENAME', topic: 'greetings' },
  { route: 'hindi-to-marathi/time-seasons', family: 'hindi-to-marathi', title: 'Hindi to Marathi Time & Seasons: Clock, Calendar, Weather', type: 'RENAME', topic: 'time-seasons' },
  { route: 'hindi-to-marathi/travel', family: 'hindi-to-marathi', title: 'Hindi to Marathi Travel Words: Trains, Tickets & Stays', type: 'RENAME', topic: 'travel' },
  { route: 'phrases/making-plans', family: 'phrases', title: 'Marathi Phrases for Making Plans & Future Talk', type: 'RENAME', topic: 'making-plans' },
  { route: 'phrases/office-work', family: 'phrases', title: 'Marathi Office Phrases for Work & Daily Use', type: 'RENAME', topic: 'office-work' },
  { route: 'phrases/phone-and-messaging', family: 'phrases', title: 'Marathi Phrases for Phone Calls & Messaging', type: 'RENAME', topic: 'phone-and-messaging' },
  { route: 'phrases/presentations-interviews', family: 'phrases', title: 'Marathi Phrases for Presentations & Interviews', type: 'RENAME', topic: 'presentations-interviews' },
  { route: 'phrases/shopping', family: 'phrases', title: 'Marathi Shopping Phrases', type: 'RENAME', topic: 'shopping' },
  { route: 'phrases/thanking-apologizing', family: 'phrases', title: 'Marathi Phrases for Thanking & Apologizing', type: 'RENAME', topic: 'thanking-apologizing' },
  { route: 'phrases/travel', family: 'phrases', title: 'Marathi Travel Phrases', type: 'RENAME', topic: 'travel' },
  { route: 'vocabulary/adjectives', family: 'vocabulary', title: 'Marathi Adjectives: 68 Describing Words', type: 'RENAME', topic: 'adjectives' },
  { route: 'vocabulary/animals', family: 'vocabulary', title: 'Marathi Animal Names: 40 Animals with Hindi & English', type: 'RENAME', topic: 'animals' },
  { route: 'vocabulary/body-parts', family: 'vocabulary', title: 'Marathi Body Parts: 43 Words from Head to Toe', type: 'RENAME', topic: 'body-parts' },
  { route: 'vocabulary/clothing', family: 'vocabulary', title: 'Marathi Clothes Vocabulary: Clothing & Jewellery Words', type: 'RENAME', topic: 'clothing' },
  { route: 'vocabulary/food', family: 'vocabulary', title: 'Marathi Food Words', type: 'RENAME', topic: 'food' },
  { route: 'vocabulary/shopping', family: 'vocabulary', title: 'Marathi Shopping & Market Words', type: 'RENAME', topic: 'shopping' },
  { route: 'hindi-to-marathi/school-and-study', family: 'hindi-to-marathi', title: 'Hindi to Marathi School & Study: Classroom, Subjects, Exams', type: 'KEEP_NEW_CONTENT', topic: 'school-and-study' },
  { route: 'hindi-to-marathi/technology', family: 'hindi-to-marathi', title: 'Hindi to Marathi Technology: Phone, Internet, Apps', type: 'KEEP_NEW_CONTENT', topic: 'technology' },
  { route: 'hindi-to-marathi/work-career', family: 'hindi-to-marathi', title: 'Hindi to Marathi Work & Career: Jobs, Office, Professions', type: 'KEEP_NEW_CONTENT', topic: 'work-career' },
];

// Semantic matching: page topic must match image topic EXACTLY or be close synonym
const synonyms = {
  'blog-index': ['blog', 'index'],
  'words': ['words', 'vocabulary'],
  'commands-polite': ['commands', 'polite', 'imperative'],
  'advanced-structures': ['advanced-structures', 'passive', 'causative'],
  'daily-conversation': ['daily-conversation', 'conversation', 'survival'],
  'festivals': ['festivals', 'diwali', 'ganpati', 'culture'],
  'greetings': ['greetings', 'namaskar', 'hello'],
  'time-seasons': ['time-seasons', 'time', 'seasons', 'clock', 'calendar'],
  'travel': ['travel', 'trains', 'tickets', 'transport'],
  'making-plans': ['making-plans', 'plans', 'future'],
  'office-work': ['office-work', 'office', 'work', 'workplace'],
  'phone-and-messaging': ['phone-and-messaging', 'phone', 'messaging', 'whatsapp'],
  'presentations-interviews': ['presentations-interviews', 'presentations', 'interviews', 'business'],
  'shopping': ['shopping', 'market', 'bargaining'],
  'thanking-apologizing': ['thanking-apologizing', 'thanking', 'apologizing', 'sorry', 'thank-you'],
  'adjectives': ['adjectives', 'describing'],
  'animals': ['animals', 'birds', 'pets'],
  'body-parts': ['body-parts', 'body', 'health'],
  'clothing': ['clothing', 'clothes', 'dress'],
  'food': ['food', 'eat', 'restaurant'],
  'school-and-study': ['school-and-study', 'school', 'study', 'education', 'classroom'],
  'technology': ['technology', 'phone', 'internet', 'apps', 'digital'],
  'work-career': ['work-career', 'work', 'career', 'jobs', 'office'],
};

function getSynonyms(topic) {
  return synonyms[topic] || [topic];
}

function hasSemanticMatch(page) {
  const pageSynonyms = getSynonyms(page.topic);
  
  for (const base of postRenameBases) {
    const imgTopic = baseToTopic.get(base);
    if (!imgTopic) continue;
    
    // Exact match
    if (pageSynonyms.includes(imgTopic)) {
      return { matched: true, matchedBase: base, imgTopic, matchType: 'exact' };
    }
    // Check if any synonym matches
    for (const syn of pageSynonyms) {
      if (imgTopic.includes(syn) || syn.includes(imgTopic)) {
        return { matched: true, matchedBase: base, imgTopic, matchType: 'synonym' };
      }
    }
  }
  return { matched: false };
}

console.log('=== SEMANTIC MATCHING ANALYSIS FOR 25 IMPACTED PAGES ===\n');

let noMatch = 0;
let hasMatch = 0;

for (const page of impactedPages) {
  const result = hasSemanticMatch(page);
  const status = result.matched ? '✅ HAS SEMANTIC MATCH' : '❌ NO SEMANTIC MATCH';
  if (result.matched) hasMatch++; else noMatch++;
  
  console.log(`${status} | ${page.route} (${page.family})`);
  console.log(`  Page Topic: ${page.topic}`);
  console.log(`  Type: ${page.type}`);
  if (result.matched) {
    console.log(`  Matched Image: ${result.matchedBase}`);
    console.log(`  Image Topic: ${result.imgTopic}`);
    console.log(`  Match Type: ${result.matchType}`);
  }
  console.log('');
}

console.log(`${'='.repeat(60)}`);
console.log(`SUMMARY:`);
console.log(`  Total impacted pages: ${impactedPages.length}`);
console.log(`  Has semantic matching image: ${hasMatch}`);
console.log(`  NO semantic matching image: ${noMatch}`);
console.log(`\nPages with NO semantic match:`);

for (const page of impactedPages) {
  const result = hasSemanticMatch(page);
  if (!result.matched) {
    console.log(`  ${page.route} (${page.family}) - Topic: ${page.topic}`);
  }
}