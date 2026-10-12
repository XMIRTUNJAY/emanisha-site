// Complete matrix for all 26 images covering both .webp and .png
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

function ogFile(route) {
  return route === '' ? 'og-home' : `og-${route.replace(/\//g, '-')}`;
}

// Build expected pages
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

for (const p of staticPages) expectedPages.set(p.route, { ogBase: ogFile(p.route), title: p.title, family: p.family, route: p.route });
for (const [slug, title] of clusters) { const route = `vocabulary/${slug}`; expectedPages.set(route, { ogBase: ogFile(route), title, family: 'vocabulary', route }); }
for (const [slug, title] of phraseSets) { const route = `phrases/${slug}`; expectedPages.set(route, { ogBase: ogFile(route), title, family: 'phrases', route }); }
for (const [slug, title] of grammarTopics) { const route = `grammar/${slug}`; expectedPages.set(route, { ogBase: ogFile(route), title, family: 'grammar', route }); }
for (const u of units) { const route = `lessons/${u.unit}`; expectedPages.set(route, { ogBase: ogFile(route), title: `Unit ${u.unit}: ${u.titleEn}`, family: 'lessons', route }); }
for (const [slug, title] of clusters) { const route = `quiz/${slug}`; expectedPages.set(route, { ogBase: ogFile(route), title: `Quiz: ${title}`, family: 'quiz', route }); }
for (const p of blogPages) { expectedPages.set(p.route, { ogBase: ogFile(p.route), title: p.title, family: 'blog', route: p.route }); }

const seoFamilies = [
  [vocabTopics, 'vocabulary'],
  [phrasePages, 'phrases'],
  [grammarPages, 'grammar'],
  [hindiBridges, 'hindi-to-marathi'],
  [englishPaths, 'english-to-marathi'],
];

for (const [list, basePath] of seoFamilies) {
  for (const p of list) if (p.status === 'published') expectedPages.set(`${basePath}/${p.slug}`, { ogBase: ogFile(`${basePath}/${p.slug}`), title: p.title, family: basePath, route: `${basePath}/${p.slug}` });
}

const extraPages = [
  { route: 'hindi-to-marathi/words', title: 'Hindi to Marathi Words', family: 'hindi-to-marathi' },
  { route: 'hindi-to-marathi/phrases', title: 'Hindi to Marathi Phrases', family: 'hindi-to-marathi' },
  { route: 'english-to-marathi/words', title: 'English to Marathi Words', family: 'english-to-marathi' },
  { route: 'english-to-marathi/phrases', title: 'English to Marathi Phrases', family: 'english-to-marathi' },
];

for (const p of extraPages) expectedPages.set(p.route, { ogBase: ogFile(p.route), title: p.title, family: p.family, route: p.route });

// Actual files
const actualFiles = fs.readdirSync(path.join(root, 'public/og')).filter(f => f.endsWith('.webp') || f.endsWith('.png'));
const actualFileMap = new Map();
for (const f of actualFiles) {
  const base = f.replace(/\.(png|webp)$/, '');
  actualFileMap.set(base, f);
}

// ============================================================
// COMPLETE MATRIX FOR ALL 26 IMAGES
// ============================================================

const matrix = [
  // 22 RENAME
  {
    id: 1,
    category: 'RENAME',
    currentPng: 'og-blog.png',
    currentWebp: 'og-blog.webp',
    currentBase: 'og-blog',
    actualContent: 'blog index (situational guide)',
    proposedNewBase: 'og-blog-situational-guide',
    conflictCheck: false,
    impactedPage: 'blog',
    impactedPageTitle: 'Real-Life Marathi Guides',
    impactedPageFamily: 'blog',
    replacementCandidates: ['og-blog-index', 'og-blog-festival-greetings'],
    notes: 'Rename to match actual content. Blog index needs new hero.'
  },
  {
    id: 2,
    category: 'RENAME',
    currentPng: 'og-english-to-marathi-words.png',
    currentWebp: 'og-english-to-marathi-words.webp',
    currentBase: 'og-english-to-marathi-words',
    actualContent: 'workplace and career',
    proposedNewBase: 'og-english-to-marathi-workplace',
    conflictCheck: true, // og-english-to-marathi-workplace already exists
    impactedPage: 'english-to-marathi/words',
    impactedPageTitle: 'English to Marathi Words',
    impactedPageFamily: 'english-to-marathi',
    replacementCandidates: ['og-blog-pune-newcomer-words', 'og-english-to-marathi-asking-questions'],
    notes: 'CONFLICT: og-english-to-marathi-workplace.png already exists. Need different name or replace existing.'
  },
  {
    id: 3,
    category: 'RENAME',
    currentPng: 'og-grammar-commands-polite.png',
    currentWebp: 'og-grammar-commands-polite.webp',
    currentBase: 'og-grammar-commands-polite',
    actualContent: 'hindi to marathi sov,particles,tense',
    proposedNewBase: 'og-hindi-to-marathi-sentence-patterns',
    conflictCheck: true, // og-hindi-to-marathi-sentence-patterns already exists
    impactedPage: 'grammar/commands-polite',
    impactedPageTitle: 'Marathi Commands & Polite Requests',
    impactedPageFamily: 'grammar',
    replacementCandidates: ['og-blog-polite-marathi', 'og-grammar-ability-obligation'],
    notes: 'CONFLICT: og-hindi-to-marathi-sentence-patterns.png already exists.'
  },
  {
    id: 4,
    category: 'RENAME',
    currentPng: 'og-hindi-to-marathi-advanced-structures.png',
    currentWebp: 'og-hindi-to-marathi-advanced-structures.webp',
    currentBase: 'og-hindi-to-marathi-advanced-structures',
    actualContent: 'hindi to marathi time & season',
    proposedNewBase: 'og-hindi-to-marathi-time-seasons',
    conflictCheck: true, // og-hindi-to-marathi-time-seasons already exists
    impactedPage: 'hindi-to-marathi/advanced-structures',
    impactedPageTitle: 'Hindi to Marathi Advanced: Passive, Causative',
    impactedPageFamily: 'hindi-to-marathi',
    replacementCandidates: ['og-hindi-to-marathi-advanced-conversation', 'og-hindi-to-marathi-business'],
    notes: 'CONFLICT: og-hindi-to-marathi-time-seasons.png already exists.'
  },
  {
    id: 5,
    category: 'RENAME',
    currentPng: 'og-hindi-to-marathi-daily-conversation.png',
    currentWebp: 'og-hindi-to-marathi-daily-conversation.webp',
    currentBase: 'og-hindi-to-marathi-daily-conversation',
    actualContent: 'hindi to marathi time & season : clock & calendar',
    proposedNewBase: 'og-hindi-to-marathi-time-seasons-clock',
    conflictCheck: false,
    impactedPage: 'hindi-to-marathi/daily-conversation',
    impactedPageTitle: 'Hindi to Marathi Daily Conversation: Survival Sentences',
    impactedPageFamily: 'hindi-to-marathi',
    replacementCandidates: ['og-english-to-marathi-daily-needs', 'og-hindi-to-marathi-advanced-conversation'],
    notes: 'Unique new name. Daily conversation page needs new hero.'
  },
  {
    id: 6,
    category: 'RENAME',
    currentPng: 'og-hindi-to-marathi-festivals.png',
    currentWebp: 'og-hindi-to-marathi-festivals.webp',
    currentBase: 'og-hindi-to-marathi-festivals',
    actualContent: 'hindi to marathi travel words',
    proposedNewBase: 'og-hindi-to-marathi-travel',
    conflictCheck: true, // og-hindi-to-marathi-travel already exists
    impactedPage: 'hindi-to-marathi/festivals',
    impactedPageTitle: 'Hindi to Marathi Festivals: Diwali, Ganpati & More',
    impactedPageFamily: 'hindi-to-marathi',
    replacementCandidates: ['og-hindi-to-marathi-advanced-conversation', 'og-hindi-to-marathi-business'],
    notes: 'CONFLICT: og-hindi-to-marathi-travel.png already exists.'
  },
  {
    id: 7,
    category: 'RENAME',
    currentPng: 'og-hindi-to-marathi-greetings.png',
    currentWebp: 'og-hindi-to-marathi-greetings.webp',
    currentBase: 'og-hindi-to-marathi-greetings',
    actualContent: 'hindi-to-marathi travel words train ticket and stays',
    proposedNewBase: 'og-hindi-to-marathi-travel-train',
    conflictCheck: false,
    impactedPage: 'hindi-to-marathi/greetings',
    impactedPageTitle: 'Hindi to Marathi Greetings & First Sentences',
    impactedPageFamily: 'hindi-to-marathi',
    replacementCandidates: ['og-english-to-marathi-greetings', 'og-blog-festival-greetings'],
    notes: 'Unique new name. Greetings page needs new hero.'
  },
  {
    id: 8,
    category: 'RENAME',
    currentPng: 'og-hindi-to-marathi-time-seasons.png',
    currentWebp: 'og-hindi-to-marathi-time-seasons.webp',
    currentBase: 'og-hindi-to-marathi-time-seasons',
    actualContent: 'hindi to marathi shopping',
    proposedNewBase: 'og-hindi-to-marathi-shopping',
    conflictCheck: true, // og-hindi-to-marathi-shopping already exists
    impactedPage: 'hindi-to-marathi/time-seasons',
    impactedPageTitle: 'Hindi to Marathi Time & Seasons: Clock, Calendar, Weather',
    impactedPageFamily: 'hindi-to-marathi',
    replacementCandidates: ['og-blog-how-to-tell-time-in-marathi', 'og-english-to-marathi-time-seasons'],
    notes: 'CONFLICT: og-hindi-to-marathi-shopping.png already exists.'
  },
  {
    id: 9,
    category: 'RENAME',
    currentPng: 'og-hindi-to-marathi-travel.png',
    currentWebp: 'og-hindi-to-marathi-travel.webp',
    currentBase: 'og-hindi-to-marathi-travel',
    actualContent: 'hindi to marathi shopping',
    proposedNewBase: 'og-hindi-to-marathi-shopping-2',
    conflictCheck: false,
    impactedPage: 'hindi-to-marathi/travel',
    impactedPageTitle: 'Hindi to Marathi Travel Words: Trains, Tickets & Stays',
    impactedPageFamily: 'hindi-to-marathi',
    replacementCandidates: ['og-english-to-marathi-transport-travel', 'og-hindi-to-marathi-advanced-conversation'],
    notes: 'Unique new name. Travel page needs new hero.'
  },
  {
    id: 10,
    category: 'RENAME',
    currentPng: 'og-phrases-making-plans.png',
    currentWebp: 'og-phrases-making-plans.webp',
    currentBase: 'og-phrases-making-plans',
    actualContent: 'marathi phrases -asking direction',
    proposedNewBase: 'og-phrases-asking-directions',
    conflictCheck: true, // og-phrases-asking-directions already exists
    impactedPage: 'phrases/making-plans',
    impactedPageTitle: 'Marathi Phrases for Making Plans & Future Talk',
    impactedPageFamily: 'phrases',
    replacementCandidates: ['og-phrases-business-meetings'],
    notes: 'CONFLICT: og-phrases-asking-directions.png already exists.'
  },
  {
    id: 11,
    category: 'RENAME',
    currentPng: 'og-phrases-office-work.png',
    currentWebp: 'og-phrases-office-work.webp',
    currentBase: 'og-phrases-office-work',
    actualContent: 'marathi phrases -shopping & bargaining',
    proposedNewBase: 'og-phrases-shopping',
    conflictCheck: true, // og-phrases-shopping already exists
    impactedPage: 'phrases/office-work',
    impactedPageTitle: 'Marathi Office Phrases for Work & Daily Use',
    impactedPageFamily: 'phrases',
    replacementCandidates: ['og-english-to-marathi-workplace', 'og-hindi-to-marathi-work-career'],
    notes: 'CONFLICT: og-phrases-shopping.png already exists.'
  },
  {
    id: 12,
    category: 'RENAME',
    currentPng: 'og-phrases-phone-and-messaging.png',
    currentWebp: 'og-phrases-phone-and-messaging.webp',
    currentBase: 'og-phrases-phone-and-messaging',
    actualContent: 'marathi phrases asking direction',
    proposedNewBase: 'og-phrases-asking-directions-2',
    conflictCheck: false,
    impactedPage: 'phrases/phone-and-messaging',
    impactedPageTitle: 'Marathi Phrases for Phone Calls & Messaging',
    impactedPageFamily: 'phrases',
    replacementCandidates: ['og-english-to-marathi-technology-phone'],
    notes: 'Unique new name. Phone page needs new hero.'
  },
  {
    id: 13,
    category: 'RENAME',
    currentPng: 'og-phrases-presentations-interviews.png',
    currentWebp: 'og-phrases-presentations-interviews.webp',
    currentBase: 'og-phrases-presentations-interviews',
    actualContent: 'marathi phrases thanking & apologizing',
    proposedNewBase: 'og-phrases-thanking-apologizing',
    conflictCheck: true, // og-phrases-thanking-apologizing already exists
    impactedPage: 'phrases/presentations-interviews',
    impactedPageTitle: 'Marathi Phrases for Presentations & Interviews',
    impactedPageFamily: 'phrases',
    replacementCandidates: ['og-phrases-business-meetings'],
    notes: 'CONFLICT: og-phrases-thanking-apologizing.png already exists.'
  },
  {
    id: 14,
    category: 'RENAME',
    currentPng: 'og-phrases-shopping.png',
    currentWebp: 'og-phrases-shopping.webp',
    currentBase: 'og-phrases-shopping',
    actualContent: 'marathi phrases:business meetings',
    proposedNewBase: 'og-phrases-business-meetings',
    conflictCheck: true, // og-phrases-business-meetings already exists
    impactedPage: 'phrases/shopping',
    impactedPageTitle: 'Marathi Shopping Phrases',
    impactedPageFamily: 'phrases',
    replacementCandidates: ['og-hindi-to-marathi-shopping', 'og-english-to-marathi-shopping-market'],
    notes: 'CONFLICT: og-phrases-business-meetings.png already exists.'
  },
  {
    id: 15,
    category: 'RENAME',
    currentPng: 'og-phrases-thanking-apologizing.png',
    currentWebp: 'og-phrases-thanking-apologizing.webp',
    currentBase: 'og-phrases-thanking-apologizing',
    actualContent: 'marathi phrases :phone & messaging',
    proposedNewBase: 'og-phrases-phone-and-messaging',
    conflictCheck: true, // og-phrases-phone-and-messaging already exists
    impactedPage: 'phrases/thanking-apologizing',
    impactedPageTitle: 'Marathi Phrases for Thanking & Apologizing',
    impactedPageFamily: 'phrases',
    replacementCandidates: ['og-phrases-asking-directions'],
    notes: 'CONFLICT: og-phrases-phone-and-messaging.png already exists.'
  },
  {
    id: 16,
    category: 'RENAME',
    currentPng: 'og-phrases-travel.png',
    currentWebp: 'og-phrases-travel.webp',
    currentBase: 'og-phrases-travel',
    actualContent: 'marathi phrase -asking directions',
    proposedNewBase: 'og-phrases-asking-directions-3',
    conflictCheck: false,
    impactedPage: 'phrases/travel',
    impactedPageTitle: 'Marathi Travel Phrases',
    impactedPageFamily: 'phrases',
    replacementCandidates: ['og-english-to-marathi-transport-travel', 'og-hindi-to-marathi-travel'],
    notes: 'Unique new name. Travel page needs new hero.'
  },
  {
    id: 17,
    category: 'RENAME',
    currentPng: 'og-vocabulary-adjectives.png',
    currentWebp: 'og-vocabulary-adjectives.webp',
    currentBase: 'og-vocabulary-adjectives',
    actualContent: 'marathi office & work words',
    proposedNewBase: 'og-vocabulary-work-office',
    conflictCheck: true, // og-vocabulary-work-office already exists
    impactedPage: 'vocabulary/adjectives',
    impactedPageTitle: 'Marathi Adjectives: 68 Describing Words',
    impactedPageFamily: 'vocabulary',
    replacementCandidates: ['og-vocabulary-adjectives (from animals)'],
    notes: 'CONFLICT: og-vocabulary-work-office.png already exists.'
  },
  {
    id: 18,
    category: 'RENAME',
    currentPng: 'og-vocabulary-animals.png',
    currentWebp: 'og-vocabulary-animals.webp',
    currentBase: 'og-vocabulary-animals',
    actualContent: 'marathi adjectives',
    proposedNewBase: 'og-vocabulary-adjectives',
    conflictCheck: true, // og-vocabulary-adjectives already exists (will be renamed)
    impactedPage: 'vocabulary/animals',
    impactedPageTitle: 'Marathi Animal Names: 40 Animals with Hindi & English',
    impactedPageFamily: 'vocabulary',
    replacementCandidates: ['og-vocabulary-adjectives (after rename)'],
    notes: 'CHAIN: This becomes the new og-vocabulary-adjectives after current one renamed.'
  },
  {
    id: 19,
    category: 'RENAME',
    currentPng: 'og-vocabulary-body-parts.png',
    currentWebp: 'og-vocabulary-body-parts.webp',
    currentBase: 'og-vocabulary-body-parts',
    actualContent: 'marathi abstract words',
    proposedNewBase: 'og-vocabulary-abstract-concepts',
    conflictCheck: true, // og-vocabulary-abstract-concepts already exists
    impactedPage: 'vocabulary/body-parts',
    impactedPageTitle: 'Marathi Body Parts: 43 Words from Head to Toe',
    impactedPageFamily: 'vocabulary',
    replacementCandidates: ['og-hindi-to-marathi-health-body'],
    notes: 'CONFLICT: og-vocabulary-abstract-concepts.png already exists.'
  },
  {
    id: 20,
    category: 'RENAME',
    currentPng: 'og-vocabulary-clothing.png',
    currentWebp: 'og-vocabulary-clothing.webp',
    currentBase: 'og-vocabulary-clothing',
    actualContent: 'marathi transport words',
    proposedNewBase: 'og-vocabulary-transport',
    conflictCheck: true, // og-vocabulary-transport already exists
    impactedPage: 'vocabulary/clothing',
    impactedPageTitle: 'Marathi Clothes Vocabulary: Clothing & Jewellery Words',
    impactedPageFamily: 'vocabulary',
    replacementCandidates: ['og-vocabulary-adjectives'],
    notes: 'CONFLICT: og-vocabulary-transport.png already exists.'
  },
  {
    id: 21,
    category: 'RENAME',
    currentPng: 'og-vocabulary-food.png',
    currentWebp: 'og-vocabulary-food.webp',
    currentBase: 'og-vocabulary-food',
    actualContent: 'marathi adjective 68 describing words',
    proposedNewBase: 'og-vocabulary-adjectives-2',
    conflictCheck: false,
    impactedPage: 'vocabulary/food',
    impactedPageTitle: 'Marathi Food Words',
    impactedPageFamily: 'vocabulary',
    replacementCandidates: ['og-blog-ordering-food', 'og-quiz-food'],
    notes: 'Unique new name. Food page needs new hero.'
  },
  {
    id: 22,
    category: 'RENAME',
    currentPng: 'og-vocabulary-shopping.png',
    currentWebp: 'og-vocabulary-shopping.webp',
    currentBase: 'og-vocabulary-shopping',
    actualContent: 'marathi abstract words',
    proposedNewBase: 'og-vocabulary-abstract-concepts-2',
    conflictCheck: false,
    impactedPage: 'vocabulary/shopping',
    impactedPageTitle: 'Marathi Shopping & Market Words',
    impactedPageFamily: 'vocabulary',
    replacementCandidates: ['og-hindi-to-marathi-shopping', 'og-english-to-marathi-shopping-market'],
    notes: 'Unique new name. Shopping page needs new hero.'
  },

  // 3 KEEP BUT NEED NEW CONTENT
  {
    id: 23,
    category: 'KEEP_NEW_CONTENT',
    currentPng: 'og-hindi-to-marathi-school-and-study.png',
    currentWebp: 'og-hindi-to-marathi-school-and-study.webp',
    currentBase: 'og-hindi-to-marathi-school-and-study',
    actualContent: 'don\'t use if possible - needs new image for school/study',
    proposedNewBase: 'og-hindi-to-marathi-school-and-study',
    conflictCheck: false,
    impactedPage: 'hindi-to-marathi/school-and-study',
    impactedPageTitle: 'Hindi to Marathi School & Study: Classroom, Subjects, Exams',
    impactedPageFamily: 'hindi-to-marathi',
    replacementCandidates: ['N/A - needs brand new image'],
    notes: 'Keep filename, regenerate content.'
  },
  {
    id: 24,
    category: 'KEEP_NEW_CONTENT',
    currentPng: 'og-hindi-to-marathi-technology.png',
    currentWebp: 'og-hindi-to-marathi-technology.webp',
    currentBase: 'og-hindi-to-marathi-technology',
    actualContent: 'don\'t use if possible - needs new image for technology',
    proposedNewBase: 'og-hindi-to-marathi-technology',
    conflictCheck: false,
    impactedPage: 'hindi-to-marathi/technology',
    impactedPageTitle: 'Hindi to Marathi Technology: Phone, Internet, Apps',
    impactedPageFamily: 'hindi-to-marathi',
    replacementCandidates: ['N/A - needs brand new image'],
    notes: 'Keep filename, regenerate content.'
  },
  {
    id: 25,
    category: 'KEEP_NEW_CONTENT',
    currentPng: 'og-hindi-to-marathi-work-career.png',
    currentWebp: 'og-hindi-to-marathi-work-career.webp',
    currentBase: 'og-hindi-to-marathi-work-career',
    actualContent: 'don\'t use if possible - needs new image for work/career',
    proposedNewBase: 'og-hindi-to-marathi-work-career',
    conflictCheck: false,
    impactedPage: 'hindi-to-marathi/work-career',
    impactedPageTitle: 'Hindi to Marathi Work & Career: Jobs, Office, Professions',
    impactedPageFamily: 'hindi-to-marathi',
    replacementCandidates: ['N/A - needs brand new image'],
    notes: 'Keep filename, regenerate content.'
  },

  // 1 DELETE
  {
    id: 26,
    category: 'DELETE',
    currentPng: 'og-english-to-marathi-travel.png',
    currentWebp: 'N/A (no webp)',
    currentBase: 'og-english-to-marathi-travel',
    actualContent: 'orphan - no page uses this',
    proposedNewBase: 'DELETE',
    conflictCheck: false,
    impactedPage: 'NONE',
    impactedPageTitle: 'N/A',
    impactedPageFamily: 'N/A',
    replacementCandidates: ['N/A'],
    notes: 'No page uses this file. Correct travel page is english-to-marathi/transport-travel -> og-english-to-marathi-transport-travel'
  }
];

console.log('=== COMPLETE MATRIX FOR 26 IMAGES ===\n');

for (const m of matrix) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`ID: ${m.id} | CATEGORY: ${m.category}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Current PNG:     ${m.currentPng}`);
  console.log(`Current WebP:    ${m.currentWebp}`);
  console.log(`Current Base:    ${m.currentBase}`);
  console.log(`Actual Content:  ${m.actualContent}`);
  console.log(`Proposed New:    ${m.proposedNewBase}`);
  console.log(`Conflict:        ${m.conflictCheck ? 'YES - name already exists' : 'NO'}`);
  console.log(`Impacted Page:   ${m.impactedPage}`);
  console.log(`Page Title:      ${m.impactedPageTitle}`);
  console.log(`Page Family:     ${m.impactedPageFamily}`);
  console.log(`Replacement:     ${m.replacementCandidates.join(' | ')}`);
  console.log(`Notes:           ${m.notes}`);
}

// Summary
const renameCount = matrix.filter(m => m.category === 'RENAME').length;
const keepCount = matrix.filter(m => m.category === 'KEEP_NEW_CONTENT').length;
const deleteCount = matrix.filter(m => m.category === 'DELETE').length;
const conflictCount = matrix.filter(m => m.conflictCheck).length;

console.log(`\n${'='.repeat(80)}`);
console.log('SUMMARY');
console.log(`${'='.repeat(80)}`);
console.log(`Total images: ${matrix.length}`);
console.log(`  RENAME: ${renameCount}`);
console.log(`  KEEP_NEW_CONTENT: ${keepCount}`);
console.log(`  DELETE: ${deleteCount}`);
console.log(`Naming conflicts: ${conflictCount} out of ${renameCount} renames`);