// Create comprehensive matrix for problematic images
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

// Build the expected OG file for each page
function ogFile(route) {
  return route === '' ? 'og-home.png' : `og-${route.replace(/\//g, '-')}.png`;
}

// Build expected pages map: route -> { ogFile, title, family }
const expectedPages = new Map();

// Static pages
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

for (const p of staticPages) {
  expectedPages.set(p.route, { ogFile: ogFile(p.route), title: p.title, family: p.family, route: p.route });
}

// Cluster vocab pages
for (const [slug, title] of clusters) {
  const route = `vocabulary/${slug}`;
  expectedPages.set(route, { ogFile: ogFile(route), title, family: 'vocabulary', route });
}

// Phrase set pages
for (const [slug, title] of phraseSets) {
  const route = `phrases/${slug}`;
  expectedPages.set(route, { ogFile: ogFile(route), title, family: 'phrases', route });
}

// Grammar topic pages
for (const [slug, title] of grammarTopics) {
  const route = `grammar/${slug}`;
  expectedPages.set(route, { ogFile: ogFile(route), title, family: 'grammar', route });
}

// Lesson pages
for (const u of units) {
  const route = `lessons/${u.unit}`;
  expectedPages.set(route, { ogFile: ogFile(route), title: `Unit ${u.unit}: ${u.titleEn}`, family: 'lessons', route });
}

// Quiz pages
for (const [slug, title] of clusters) {
  const route = `quiz/${slug}`;
  expectedPages.set(route, { ogFile: ogFile(route), title: `Quiz: ${title}`, family: 'quiz', route });
}

// Blog pages
for (const p of blogPages) {
  expectedPages.set(p.route, { ogFile: ogFile(p.route), title: p.title, family: 'blog', route: p.route });
}

// SEO content-engine pages
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

// Subdirectory pages with dynamic titles
const extraPages = [
  { route: 'hindi-to-marathi/words', title: 'Hindi to Marathi Words', family: 'hindi-to-marathi' },
  { route: 'hindi-to-marathi/phrases', title: 'Hindi to Marathi Phrases', family: 'hindi-to-marathi' },
  { route: 'english-to-marathi/words', title: 'English to Marathi Words', family: 'english-to-marathi' },
  { route: 'english-to-marathi/phrases', title: 'English to Marathi Phrases', family: 'english-to-marathi' },
];

for (const p of extraPages) {
  expectedPages.set(p.route, { ogFile: ogFile(p.route), title: p.title, family: p.family, route: p.route });
}

// Now load actual files
const actualFiles = fs.readdirSync(path.join(root, 'public/og')).filter(f => f.endsWith('.webp') || f.endsWith('.png'));

// Build actual file map: ogFile -> actual file
const actualFileMap = new Map();
for (const f of actualFiles) {
  actualFileMap.set(f, f);
}

// User's problematic images list (with their notes) - they provided names without "og-" prefix
// Using .png extension since expectedPages uses .png
const problematicNotes = [
  { file: 'og-blog.png', note: 'situational guide - wrong marathi speled if possible exclude' },
  { file: 'og-english-to-marathi-travel.png', note: 'don\'t use if possible' },
  { file: 'og-english-to-marathi-words.png', note: 'use for workplace and career' },
  { file: 'og-grammar-commands-polite.png', note: 'hindi to marathi sov,particles,tense' },
  { file: 'og-hindi-to-marathi-advanced-structures.png', note: 'hindi to marathi time & season' },
  { file: 'og-hindi-to-marathi-daily-conversation.png', note: 'hindi to marathi time & season : clock & calendar' },
  { file: 'og-hindi-to-marathi-festivals.png', note: 'hindi to marathi travel words' },
  { file: 'og-hindi-to-marathi-greetings.png', note: 'hindi-to-marathi travel words train ticket and stays' },
  { file: 'og-hindi-to-marathi-school-and-study.png', note: 'don\'t use if possible' },
  { file: 'og-hindi-to-marathi-technology.png', note: 'don\'t use if possible' },
  { file: 'og-hindi-to-marathi-time-seasons.png', note: 'hindi to marathi shopping' },
  { file: 'og-hindi-to-marathi-travel.png', note: 'hindi to marathi shopping' },
  { file: 'og-hindi-to-marathi-work-career.png', note: 'don\'t use if possible' },
  { file: 'og-phrases-making-plans.png', note: 'marathi phrases -asking direction' },
  { file: 'og-phrases-office-work.png', note: 'marathi phrases -shopping & bargaining' },
  { file: 'og-phrases-phone-and-messaging.png', note: 'marathi phrases asking direction' },
  { file: 'og-phrases-presentations-interviews.png', note: 'marathi phrases thanking & apologizing' },
  { file: 'og-phrases-shopping.png', note: 'marathi phrases:business meetings' },
  { file: 'og-phrases-thanking-apologizing.png', note: 'marathi phrases :phone & messaging' },
  { file: 'og-phrases-travel.png', note: 'marathi phrase -asking directions' },
  { file: 'og-vocabulary-adjectives.png', note: 'marathi office & work words' },
  { file: 'og-vocabulary-animals.png', note: 'marathi adjectives' },
  { file: 'og-vocabulary-body-parts.png', note: 'marathi abstract words' },
  { file: 'og-vocabulary-clothing.png', note: 'marathi transport words' },
  { file: 'og-vocabulary-food.png', note: 'marathi adjective 68 describing words' },
  { file: 'og-vocabulary-shopping.png', note: 'marathi abstract words' },
];

console.log('=== PROBLEMATIC IMAGES MATRIX ===\n');
console.log('Format: CURRENT_IMAGE | CURRENT_PAGE | USER_NOTE | CORRECT_IMAGE_FOR_PAGE | CORRECT_IMAGE_EXISTS | ACTION_NEEDED\n');

for (const p of problematicNotes) {
  // Find which page currently uses this image
  let currentPage = null;
  let currentPageInfo = null;
  
  // Search through expectedPages to find which one maps to this ogFile
  for (const [route, info] of expectedPages) {
    if (info.ogFile === p.file) {
      currentPage = route;
      currentPageInfo = info;
      break;
    }
  }
  
  if (!currentPage) {
    console.log(`${p.file} | NOT MAPPED TO ANY PAGE | ${p.note} | N/A | N/A | Image not used by any page`);
    continue;
  }
  
  // The correct image for this page IS p.file (since that's what the page expects)
  // But user says the content is wrong - so we need to find what the CORRECT image should be
  // based on the page's actual content
  
  const correctImageExists = actualFileMap.has(p.file);
  
  console.log(`${p.file} | ${currentPage} | ${p.note} | ${currentPageInfo.ogFile} | ${correctImageExists ? 'YES' : 'NO'} | `);
  
  // User's note suggests what the image ACTUALLY contains
  // We need to find which page that content belongs to
}

// Also check which pages would be orphaned (no image) if we remove these
console.log('\n=== PAGES THAT WOULD LOSE HERO IMAGE IF PROBLEMATIC IMAGES REMOVED ===\n');

const problematicFiles = new Set(problematicNotes.map(p => p.file));
let orphanedCount = 0;

for (const [route, info] of expectedPages) {
  if (problematicFiles.has(info.ogFile)) {
    // This page uses a problematic image
    // Check if there's an alternative correct image
    const altKey = info.route.replace(/\//g, '-');
    console.log(`${route} (${info.family}) - currently uses ${info.ogFile}`);
    orphanedCount++;
  }
}

console.log(`\nTotal pages that would lose hero image: ${orphanedCount}`);