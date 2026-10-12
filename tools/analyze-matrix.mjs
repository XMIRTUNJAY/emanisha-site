// Analyze the matrix to determine which pages need new images
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// Load all SEO data
const vocabTopics = JSON.parse(fs.readFileSync(path.join(root, 'src/data/seo/vocab-topics.json'), 'utf8'));
const phrasePages = JSON.parse(fs.readFileSync(path.join(root, 'src/data/seo/phrase-pages.json'), 'utf8'));
const grammarPages = JSON.parse(fs.readFileSync(path.join(root, 'src/data/seo/grammar-pages.json'), 'utf8'));
const hindiBridges = JSON.parse(fs.readFileSync(path.join(root, 'src/data/seo/hindi-bridges.json'), 'utf8'));
const englishPaths = JSON.parse(fs.readFileSync(path.join(root, 'src/data/seo/english-paths.json'), 'utf8'));

// Load learn.ts data
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

// Blog pages
const blogDir = path.join(root, 'src/pages/blog');
const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.astro'));
const blogPages = blogFiles.map(f => {
  const src = fs.readFileSync(path.join(blogDir, f), 'utf8');
  const t = src.match(/^\ttitle="([^"]+)"|^title="([^"]+)"/m) ?? src.match(/const title = '([^']+)'/);
  if (t) {
    const route = `blog/${f.replace(/\.astro$/, '')}`;
    return { route, title: t[1] ?? t[2] };
  }
  return null;
}).filter(Boolean);

function ogFile(route) {
  return route === '' ? 'og-home.png' : `og-${route.replace(/\//g, '-')}.png`;
}

// Build expected pages map
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

for (const p of staticPages) expectedPages.set(p.route, { ogFile: ogFile(p.route), title: p.title, family: p.family, route: p.route });
for (const [slug, title] of clusters) { const route = `vocabulary/${slug}`; expectedPages.set(route, { ogFile: ogFile(route), title, family: 'vocabulary', route }); }
for (const [slug, title] of phraseSets) { const route = `phrases/${slug}`; expectedPages.set(route, { ogFile: ogFile(route), title, family: 'phrases', route }); }
for (const [slug, title] of grammarTopics) { const route = `grammar/${slug}`; expectedPages.set(route, { ogFile: ogFile(route), title, family: 'grammar', route }); }
for (const u of units) { const route = `lessons/${u.unit}`; expectedPages.set(route, { ogFile: ogFile(route), title: `Unit ${u.unit}: ${u.titleEn}`, family: 'lessons', route }); }
for (const [slug, title] of clusters) { const route = `quiz/${slug}`; expectedPages.set(route, { ogFile: ogFile(route), title: `Quiz: ${title}`, family: 'quiz', route }); }
for (const p of blogPages) { expectedPages.set(p.route, { ogFile: ogFile(p.route), title: p.title, family: 'blog', route: p.route }); }

const seoFamilies = [
  [vocabTopics, 'vocabulary'],
  [phrasePages, 'phrases'],
  [grammarPages, 'grammar'],
  [hindiBridges, 'hindi-to-marathi'],
  [englishPaths, 'english-to-marathi'],
];

for (const [list, basePath] of seoFamilies) {
  for (const p of list) {
    if (p.status === 'published') {
      const route = `${basePath}/${p.slug}`;
      expectedPages.set(route, { ogFile: ogFile(route), title: p.title, family: basePath, route });
    }
  }
}

const extraPages = [
  { route: 'hindi-to-marathi/words', title: 'Hindi to Marathi Words', family: 'hindi-to-marathi' },
  { route: 'hindi-to-marathi/phrases', title: 'Hindi to Marathi Phrases', family: 'hindi-to-marathi' },
  { route: 'english-to-marathi/words', title: 'English to Marathi Words', family: 'english-to-marathi' },
  { route: 'english-to-marathi/phrases', title: 'English to Marathi Phrases', family: 'english-to-marathi' },
];

for (const p of extraPages) expectedPages.set(p.route, { ogFile: ogFile(p.route), title: p.title, family: p.family, route: p.route });

// Actual files
const actualFiles = fs.readdirSync(path.join(root, 'public/og')).filter(f => f.endsWith('.webp') || f.endsWith('.png'));
const actualFileMap = new Set(actualFiles);

// Problematic images analysis
const analysis = [
  { 
    currentFile: 'og-blog.png', 
    currentPage: 'blog', 
    userNote: 'situational guide - wrong marathi spelled if possible exclude',
    // The image shows a situational guide but blog index should show general blog overview
    // The correct image should be og-blog.png (already correct filename) but content is wrong
    correctImageForPage: 'og-blog.png',
    action: 'REPLACE_CONTENT - Image filename correct but content wrong (shows situational guide instead of blog index)'
  },
  { 
    currentFile: 'og-english-to-marathi-travel.png', 
    currentPage: null, 
    userNote: 'don\'t use if possible',
    // No page expects this exact filename. The correct travel page is english-to-marathi/transport-travel
    correctImageForPage: 'N/A',
    action: 'DELETE - No page uses this filename. Correct travel page uses og-english-to-marathi-transport-travel.png'
  },
  { 
    currentFile: 'og-english-to-marathi-words.png', 
    currentPage: 'english-to-marathi/words', 
    userNote: 'use for workplace and career',
    // The page is "English to Marathi Words" but image shows workplace content
    // The page needs general words image, not workplace-specific
    correctImageForPage: 'og-english-to-marathi-words.png',
    action: 'REPLACE_CONTENT - Filename correct but content shows workplace instead of general words'
  },
  { 
    currentFile: 'og-grammar-commands-polite.png', 
    currentPage: 'grammar/commands-polite', 
    userNote: 'hindi to marathi sov,particles,tense',
    // Page is "Marathi Commands & Polite Requests" but image shows Hindi→Marathi SOV/particles/tense
    // That content belongs to hindi-to-marathi/sentence-patterns
    correctImageForPage: 'og-grammar-commands-polite.png',
    action: 'REPLACE_CONTENT - Content shows Hindi→Marathi grammar instead of Marathi commands/polite requests'
  },
  { 
    currentFile: 'og-hindi-to-marathi-advanced-structures.png', 
    currentPage: 'hindi-to-marathi/advanced-structures', 
    userNote: 'hindi to marathi time & season',
    // Page is "Hindi to Marathi Advanced: Passive, Causative" but image shows time & season
    correctImageForPage: 'og-hindi-to-marathi-advanced-structures.png',
    action: 'REPLACE_CONTENT - Content shows time/season instead of passive/causative grammar'
  },
  { 
    currentFile: 'og-hindi-to-marathi-daily-conversation.png', 
    currentPage: 'hindi-to-marathi/daily-conversation', 
    userNote: 'hindi to marathi time & season : clock & calendar',
    // Page is "Hindi to Marathi Daily Conversation: Survival Sentences" but image shows time/season
    correctImageForPage: 'og-hindi-to-marathi-daily-conversation.png',
    action: 'REPLACE_CONTENT - Content shows time/season instead of daily conversation survival sentences'
  },
  { 
    currentFile: 'og-hindi-to-marathi-festivals.png', 
    currentPage: 'hindi-to-marathi/festivals', 
    userNote: 'hindi to marathi travel words',
    // Page is "Hindi to Marathi Festivals: Diwali, Ganpati & More" but image shows travel words
    correctImageForPage: 'og-hindi-to-marathi-festivals.png',
    action: 'REPLACE_CONTENT - Content shows travel words instead of festivals'
  },
  { 
    currentFile: 'og-hindi-to-marathi-greetings.png', 
    currentPage: 'hindi-to-marathi/greetings', 
    userNote: 'hindi-to-marathi travel words train ticket and stays',
    // Page is "Hindi to Marathi Greetings & First Sentences" but image shows travel/train content
    correctImageForPage: 'og-hindi-to-marathi-greetings.png',
    action: 'REPLACE_CONTENT - Content shows travel/train instead of greetings'
  },
  { 
    currentFile: 'og-hindi-to-marathi-school-and-study.png', 
    currentPage: 'hindi-to-marathi/school-and-study', 
    userNote: 'don\'t use if possible',
    // Page is "Hindi to Marathi School & Study" - if we don't use this image, page loses hero
    correctImageForPage: 'og-hindi-to-marathi-school-and-study.png',
    action: 'NEED_NEW_IMAGE - Page will lose hero if removed. Need new image for school/study topic'
  },
  { 
    currentFile: 'og-hindi-to-marathi-technology.png', 
    currentPage: 'hindi-to-marathi/technology', 
    userNote: 'don\'t use if possible',
    // Page is "Hindi to Marathi Technology: Phone, Internet, Apps" - if removed, page loses hero
    correctImageForPage: 'og-hindi-to-marathi-technology.png',
    action: 'NEED_NEW_IMAGE - Page will lose hero if removed. Need new image for technology topic'
  },
  { 
    currentFile: 'og-hindi-to-marathi-time-seasons.png', 
    currentPage: 'hindi-to-marathi/time-seasons', 
    userNote: 'hindi to marathi shopping',
    // Page is "Hindi to Marathi Time & Seasons: Clock, Calendar, Weather" but image shows shopping
    correctImageForPage: 'og-hindi-to-marathi-time-seasons.png',
    action: 'REPLACE_CONTENT - Content shows shopping instead of time/seasons'
  },
  { 
    currentFile: 'og-hindi-to-marathi-travel.png', 
    currentPage: 'hindi-to-marathi/travel', 
    userNote: 'hindi to marathi shopping',
    // Page is "Hindi to Marathi Travel Words: Trains, Tickets & Stays" but image shows shopping
    correctImageForPage: 'og-hindi-to-marathi-travel.png',
    action: 'REPLACE_CONTENT - Content shows shopping instead of travel'
  },
  { 
    currentFile: 'og-hindi-to-marathi-work-career.png', 
    currentPage: 'hindi-to-marathi/work-career', 
    userNote: 'don\'t use if possible',
    // Page is "Hindi to Marathi Work & Career: Jobs, Office, Professions" - if removed, page loses hero
    correctImageForPage: 'og-hindi-to-marathi-work-career.png',
    action: 'NEED_NEW_IMAGE - Page will lose hero if removed. Need new image for work/career topic'
  },
  { 
    currentFile: 'og-phrases-making-plans.png', 
    currentPage: 'phrases/making-plans', 
    userNote: 'marathi phrases -asking direction',
    // Page is "Marathi Phrases for Making Plans & Future Talk" but image shows asking directions
    correctImageForPage: 'og-phrases-making-plans.png',
    action: 'REPLACE_CONTENT - Content shows directions instead of making plans'
  },
  { 
    currentFile: 'og-phrases-office-work.png', 
    currentPage: 'phrases/office-work', 
    userNote: 'marathi phrases -shopping & bargaining',
    // Page is "Marathi Office Phrases for Work & Daily Use" but image shows shopping/bargaining
    correctImageForPage: 'og-phrases-office-work.png',
    action: 'REPLACE_CONTENT - Content shows shopping instead of office/work phrases'
  },
  { 
    currentFile: 'og-phrases-phone-and-messaging.png', 
    currentPage: 'phrases/phone-and-messaging', 
    userNote: 'marathi phrases asking direction',
    // Page is "Marathi Phrases for Phone Calls & Messaging" but image shows asking directions
    correctImageForPage: 'og-phrases-phone-and-messaging.png',
    action: 'REPLACE_CONTENT - Content shows directions instead of phone/messaging'
  },
  { 
    currentFile: 'og-phrases-presentations-interviews.png', 
    currentPage: 'phrases/presentations-interviews', 
    userNote: 'marathi phrases thanking & apologizing',
    // Page is "Marathi Phrases for Presentations & Interviews" but image shows thanking/apologizing
    correctImageForPage: 'og-phrases-presentations-interviews.png',
    action: 'REPLACE_CONTENT - Content shows thanking/apologizing instead of presentations/interviews'
  },
  { 
    currentFile: 'og-phrases-shopping.png', 
    currentPage: 'phrases/shopping', 
    userNote: 'marathi phrases:business meetings',
    // Page is "Marathi Shopping Phrases" but image shows business meetings
    correctImageForPage: 'og-phrases-shopping.png',
    action: 'REPLACE_CONTENT - Content shows business meetings instead of shopping'
  },
  { 
    currentFile: 'og-phrases-thanking-apologizing.png', 
    currentPage: 'phrases/thanking-apologizing', 
    userNote: 'marathi phrases :phone & messaging',
    // Page is "Marathi Phrases for Thanking & Apologizing" but image shows phone/messaging
    correctImageForPage: 'og-phrases-thanking-apologizing.png',
    action: 'REPLACE_CONTENT - Content shows phone/messaging instead of thanking/apologizing'
  },
  { 
    currentFile: 'og-phrases-travel.png', 
    currentPage: 'phrases/travel', 
    userNote: 'marathi phrase -asking directions',
    // Page is "Marathi Travel Phrases" but image shows asking directions
    correctImageForPage: 'og-phrases-travel.png',
    action: 'REPLACE_CONTENT - Content shows directions instead of travel phrases'
  },
  { 
    currentFile: 'og-vocabulary-adjectives.png', 
    currentPage: 'vocabulary/adjectives', 
    userNote: 'marathi office & work words',
    // Page is "Marathi Adjectives: 68 Describing Words" but image shows office/work
    correctImageForPage: 'og-vocabulary-adjectives.png',
    action: 'REPLACE_CONTENT - Content shows office/work instead of adjectives'
  },
  { 
    currentFile: 'og-vocabulary-animals.png', 
    currentPage: 'vocabulary/animals', 
    userNote: 'marathi adjectives',
    // Page is "Marathi Animal Names: 40 Animals with Hindi & English" but image shows adjectives
    correctImageForPage: 'og-vocabulary-animals.png',
    action: 'REPLACE_CONTENT - Content shows adjectives instead of animals'
  },
  { 
    currentFile: 'og-vocabulary-body-parts.png', 
    currentPage: 'vocabulary/body-parts', 
    userNote: 'marathi abstract words',
    // Page is "Marathi Body Parts: 43 Words from Head to Toe" but image shows abstract words
    correctImageForPage: 'og-vocabulary-body-parts.png',
    action: 'REPLACE_CONTENT - Content shows abstract words instead of body parts'
  },
  { 
    currentFile: 'og-vocabulary-clothing.png', 
    currentPage: 'vocabulary/clothing', 
    userNote: 'marathi transport words',
    // Page is "Marathi Clothes Vocabulary: Clothing & Jewellery Words" but image shows transport
    correctImageForPage: 'og-vocabulary-clothing.png',
    action: 'REPLACE_CONTENT - Content shows transport instead of clothing'
  },
  { 
    currentFile: 'og-vocabulary-food.png', 
    currentPage: 'vocabulary/food', 
    userNote: 'marathi adjective 68 describing words',
    // Page is "Marathi Food Words" but image shows adjectives
    correctImageForPage: 'og-vocabulary-food.png',
    action: 'REPLACE_CONTENT - Content shows adjectives instead of food'
  },
  { 
    currentFile: 'og-vocabulary-shopping.png', 
    currentPage: 'vocabulary/shopping', 
    userNote: 'marathi abstract words',
    // Page is "Marathi Shopping & Market Words" but image shows abstract words
    correctImageForPage: 'og-vocabulary-shopping.png',
    action: 'REPLACE_CONTENT - Content shows abstract words instead of shopping'
  },
];

console.log('=== DETAILED ANALYSIS OF 26 PROBLEMATIC IMAGES ===\n');

let replaceContent = 0;
let needNewImage = 0;
let deleteImage = 0;

for (const a of analysis) {
  console.log(`\n--- ${a.currentFile} ---`);
  console.log(`  Current Page: ${a.currentPage || 'NONE (orphan image)'}`);
  console.log(`  User Note: ${a.userNote}`);
  console.log(`  Correct Image for Page: ${a.correctImageForPage}`);
  
  // Check if the correct image file exists in public/og
  const exists = actualFileMap.has(a.correctImageForPage);
  console.log(`  Correct Image Exists: ${exists ? 'YES' : 'NO'}`);
  
  if (a.action.startsWith('REPLACE_CONTENT')) {
    replaceContent++;
    console.log(`  ACTION: ${a.action}`);
  } else if (a.action.startsWith('NEED_NEW_IMAGE')) {
    needNewImage++;
    console.log(`  ACTION: ${a.action}`);
  } else if (a.action.startsWith('DELETE')) {
    deleteImage++;
    console.log(`  ACTION: ${a.action}`);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Total problematic images: ${analysis.length}`);
console.log(`  REPLACE_CONTENT (wrong content, correct filename): ${replaceContent}`);
console.log(`  NEED_NEW_IMAGE (remove + create new): ${needNewImage}`);
console.log(`  DELETE (orphan, no page uses): ${deleteImage}`);

// Pages that will lose hero if we act on "don't use" images
console.log('\n=== PAGES NEEDING NEW IMAGES (if we remove "don\'t use" images) ===');
const needNewPages = [
  'hindi-to-marathi/school-and-study',
  'hindi-to-marathi/technology',
  'hindi-to-marathi/work-career',
];
for (const route of needNewPages) {
  const info = expectedPages.get(route);
  if (info) console.log(`  ${route} (${info.family}) - ${info.title}`);
}

// Check if correct images exist for cross-mapped content
console.log('\n=== CROSS-MAPPING: Where the "wrong" content actually belongs ===');
const crossMap = [
  { wrongContent: 'hindi to marathi sov,particles,tense', belongsTo: 'hindi-to-marathi/sentence-patterns', hasImage: actualFileMap.has('og-hindi-to-marathi-sentence-patterns.png') },
  { wrongContent: 'hindi to marathi time & season', belongsTo: 'hindi-to-marathi/time-seasons', hasImage: actualFileMap.has('og-hindi-to-marathi-time-seasons.png') },
  { wrongContent: 'hindi to marathi time & season : clock & calendar', belongsTo: 'hindi-to-marathi/time-seasons', hasImage: actualFileMap.has('og-hindi-to-marathi-time-seasons.png') },
  { wrongContent: 'hindi to marathi travel words', belongsTo: 'hindi-to-marathi/travel', hasImage: actualFileMap.has('og-hindi-to-marathi-travel.png') },
  { wrongContent: 'hindi-to-marathi travel words train ticket and stays', belongsTo: 'hindi-to-marathi/travel', hasImage: actualFileMap.has('og-hindi-to-marathi-travel.png') },
  { wrongContent: 'hindi to marathi shopping', belongsTo: 'hindi-to-marathi/shopping', hasImage: actualFileMap.has('og-hindi-to-marathi-shopping.png') },
  { wrongContent: 'marathi phrases -asking direction', belongsTo: 'phrases/asking-directions', hasImage: actualFileMap.has('og-phrases-asking-directions.png') },
  { wrongContent: 'marathi phrases -shopping & bargaining', belongsTo: 'phrases/shopping', hasImage: actualFileMap.has('og-phrases-shopping.png') },
  { wrongContent: 'marathi phrases asking direction', belongsTo: 'phrases/asking-directions', hasImage: actualFileMap.has('og-phrases-asking-directions.png') },
  { wrongContent: 'marathi phrases thanking & apologizing', belongsTo: 'phrases/thanking-apologizing', hasImage: actualFileMap.has('og-phrases-thanking-apologizing.png') },
  { wrongContent: 'marathi phrases:business meetings', belongsTo: 'phrases/business-meetings', hasImage: actualFileMap.has('og-phrases-business-meetings.png') },
  { wrongContent: 'marathi phrases :phone & messaging', belongsTo: 'phrases/phone-and-messaging', hasImage: actualFileMap.has('og-phrases-phone-and-messaging.png') },
  { wrongContent: 'marathi phrase -asking directions', belongsTo: 'phrases/asking-directions', hasImage: actualFileMap.has('og-phrases-asking-directions.png') },
  { wrongContent: 'marathi office & work words', belongsTo: 'vocabulary/work-office', hasImage: actualFileMap.has('og-vocabulary-work-office.png') },
  { wrongContent: 'marathi adjectives', belongsTo: 'vocabulary/adjectives', hasImage: actualFileMap.has('og-vocabulary-adjectives.png') },
  { wrongContent: 'marathi abstract words', belongsTo: 'vocabulary/abstract-concepts', hasImage: actualFileMap.has('og-vocabulary-abstract-concepts.png') },
  { wrongContent: 'marathi transport words', belongsTo: 'vocabulary/transport', hasImage: actualFileMap.has('og-vocabulary-transport.png') },
  { wrongContent: 'marathi adjective 68 describing words', belongsTo: 'vocabulary/adjectives', hasImage: actualFileMap.has('og-vocabulary-adjectives.png') },
];

for (const cm of crossMap) {
  console.log(`  "${cm.wrongContent}" belongs to ${cm.belongsTo} - Correct image exists: ${cm.hasImage ? 'YES' : 'NO'}`);
}