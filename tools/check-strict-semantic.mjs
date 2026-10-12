// STRICT TOPIC-LEVEL SEMANTIC MATCH FOR 22 ORPHANED PAGES
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

// Build expected pages with TOPIC
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
  { base: 'og-hindi-to-marathi-school-and-study', route: 'hindi-to-marathi/school-and-study', topic: 'school-and-study' },
  { base: 'og-hindi-to-marathi-technology', route: 'hindi-to-marathi/technology', topic: 'technology' },
  { base: 'og-hindi-to-marathi-work-career', route: 'hindi-to-marathi/work-career', topic: 'work-career' },
];

const deleteFiles = ['og-english-to-marathi-travel'];

// Build post-rename available bases with TOPICS
function getTopic(base) {
  const parts = base.replace('og-', '').split('-');
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

// Map post-rename bases to their topics
const baseToTopic = new Map();
for (const base of postRenameBases) {
  const parts = base.replace('og-', '').split('-');
  const familyPrefixes = ['hindi-to-marathi', 'english-to-marathi', 'vocabulary', 'phrases', 'grammar', 'blog'];
  let remaining = parts;
  for (const fp of familyPrefixes) {
    const fpParts = fp.split('-');
    if (parts.slice(0, fpParts.length).join('-') === fp) {
      remaining = parts.slice(fpParts.length);
      break;
    }
  }
  baseToTopic.set(base, remaining.join('-'));
}

// 22 ORPHANED PAGES
const orphanedPages = [
  { route: 'blog', family: 'blog', topic: 'blog-index', title: 'Real-Life Marathi Guides' },
  { route: 'english-to-marathi/words', family: 'english-to-marathi', topic: 'words', title: 'English to Marathi Words' },
  { route: 'grammar/commands-polite', family: 'grammar', topic: 'commands-polite', title: 'Marathi Commands & Polite Requests' },
  { route: 'hindi-to-marathi/advanced-structures', family: 'hindi-to-marathi', topic: 'advanced-structures', title: 'Hindi to Marathi Advanced: Passive, Causative' },
  { route: 'hindi-to-marathi/daily-conversation', family: 'hindi-to-marathi', topic: 'daily-conversation', title: 'Hindi to Marathi Daily Conversation: Survival Sentences' },
  { route: 'hindi-to-marathi/festivals', family: 'hindi-to-marathi', topic: 'festivals', title: 'Hindi to Marathi Festivals: Diwali, Ganpati & More' },
  { route: 'hindi-to-marathi/greetings', family: 'hindi-to-marathi', topic: 'greetings', title: 'Hindi to Marathi Greetings & First Sentences' },
  { route: 'hindi-to-marathi/time-seasons', family: 'hindi-to-marathi', topic: 'time-seasons', title: 'Hindi to Marathi Time & Seasons: Clock, Calendar, Weather' },
  { route: 'hindi-to-marathi/travel', family: 'hindi-to-marathi', topic: 'travel', title: 'Hindi to Marathi Travel Words: Trains, Tickets & Stays' },
  { route: 'phrases/making-plans', family: 'phrases', topic: 'making-plans', title: 'Marathi Phrases for Making Plans & Future Talk' },
  { route: 'phrases/office-work', family: 'phrases', topic: 'office-work', title: 'Marathi Office Phrases for Work & Daily Use' },
  { route: 'phrases/phone-and-messaging', family: 'phrases', topic: 'phone-and-messaging', title: 'Marathi Phrases for Phone Calls & Messaging' },
  { route: 'phrases/presentations-interviews', family: 'phrases', topic: 'presentations-interviews', title: 'Marathi Phrases for Presentations & Interviews' },
  { route: 'phrases/shopping', family: 'phrases', topic: 'shopping', title: 'Marathi Shopping Phrases' },
  { route: 'phrases/thanking-apologizing', family: 'phrases', topic: 'thanking-apologizing', title: 'Marathi Phrases for Thanking & Apologizing' },
  { route: 'phrases/travel', family: 'phrases', topic: 'travel', title: 'Marathi Travel Phrases' },
  { route: 'vocabulary/adjectives', family: 'vocabulary', topic: 'adjectives', title: 'Marathi Adjectives: 68 Describing Words' },
  { route: 'vocabulary/animals', family: 'vocabulary', topic: 'animals', title: 'Marathi Animal Names: 40 Animals with Hindi & English' },
  { route: 'vocabulary/body-parts', family: 'vocabulary', topic: 'body-parts', title: 'Marathi Body Parts: 43 Words from Head to Toe' },
  { route: 'vocabulary/clothing', family: 'vocabulary', topic: 'clothing', title: 'Marathi Clothes Vocabulary: Clothing & Jewellery Words' },
  { route: 'vocabulary/food', family: 'vocabulary', topic: 'food', title: 'Marathi Food Words' },
  { route: 'vocabulary/shopping', family: 'vocabulary', topic: 'shopping', title: 'Marathi Shopping & Market Words' },
];

// Synonyms
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

// STRICT MATCH: page topic (or synonym) must match image topic EXACTLY
function findStrictMatch(page) {
  const pageSynonyms = getSynonyms(page.topic);
  
  for (const base of postRenameBases) {
    const parts = base.replace('og-', '').split('-');
    const familyPrefixes = ['hindi-to-marathi', 'english-to-marathi', 'vocabulary', 'phrases', 'grammar', 'blog'];
    let imgTopicParts = parts;
    for (const fp of familyPrefixes) {
      const fpParts = fp.split('-');
      if (parts.slice(0, fpParts.length).join('-') === fp) {
        imgTopicParts = parts.slice(fpParts.length);
        break;
      }
    }
    const imgTopic = imgTopicParts.join('-');
    
    // Exact topic match
    if (pageSynonyms.includes(imgTopic)) {
      return { matched: true, matchedBase: base, imgTopic, matchType: 'exact-topic' };
    }
    // Synonym exact match
    for (const syn of pageSynonyms) {
      if (syn === imgTopic) {
        return { matched: true, matchedBase: base, imgTopic, matchType: 'synonym-exact' };
      }
    }
  }
  return { matched: false };
}

// WEAK MATCH: family prefix only
function findWeakMatch(page) {
  const family = page.family;
  for (const base of postRenameBases) {
    if (base.startsWith(`og-${family}`)) {
      const parts = base.replace('og-', '').split('-');
      const familyPrefixes = ['hindi-to-marathi', 'english-to-marathi', 'vocabulary', 'phrases', 'grammar', 'blog'];
      let imgTopicParts = parts;
      for (const fp of familyPrefixes) {
        const fpParts = fp.split('-');
        if (parts.slice(0, fpParts.length).join('-') === fp) {
          imgTopicParts = parts.slice(fpParts.length);
          break;
        }
      }
      const imgTopic = imgTopicParts.join('-');
      return { matched: true, matchedBase: base, imgTopic, matchType: 'family-only' };
    }
  }
  return { matched: false };
}

console.log('=== STRICT TOPIC-LEVEL SEMANTIC MATCH FOR 22 ORPHANED PAGES ===\n');

let strictMatch = 0;
let weakOnly = 0;
let none = 0;

for (const page of orphanedPages) {
  const strict = findStrictMatch(page);
  const weak = findWeakMatch(page);
  
  if (strict.matched) {
    strictMatch++;
    console.log(`✅ STRICT MATCH | ${page.route} (${page.family})`);
    console.log(`  Topic: ${page.topic}`);
    console.log(`  Match: ${strict.matchedBase} (topic: ${strict.imgTopic})`);
    console.log(`  Type: ${strict.matchType}`);
  } else if (weak.matched) {
    console.log(`⚠️  WEAK ONLY (family) | ${page.route} (${page.family})`);
    console.log(`  Topic: ${page.topic}`);
    console.log(`  Match: ${weak.matchedBase} (topic: ${weak.imgTopic})`);
    console.log(`  Type: ${weak.matchType}`);
  } else {
    console.log(`❌ NO MATCH | ${page.route} (${page.family})`);
    console.log(`  Topic: ${page.topic}`);
  }
  console.log('');
}

console.log(`${'='.repeat(60)}`);
console.log(`SUMMARY:`);
console.log(`  Total orphaned pages: ${orphanedPages.length}`);
console.log(`  Strict topic match: ${orphanedPages.filter(p => findStrictMatch(p).matched).length}`);
console.log(`  Weak (family only): ${orphanedPages.filter(p => !findStrictMatch(p).matched && findWeakMatch(p).matched).length}`);
console.log(`  No match at all: ${orphanedPages.filter(p => !findStrictMatch(p).matched && !findWeakMatch(p).matched).length}`);
console.log(`\nPages with NO strict topic match:`);

for (const page of orphanedPages) {
  const strict = findStrictMatch(page);
  if (!strict.matched) {
    console.log(`  ${page.route} (${page.family}) - Topic: ${page.topic}`);
  }
}