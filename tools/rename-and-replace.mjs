// Plan: Rename 22 files to match their ACTUAL visual content
// Then determine which pages lose hero images and find replacements

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

// ============================================================
// RENAMING PLAN: 22 files renamed to match their ACTUAL content
// ============================================================

const renamePlan = [
  // File currently named -> New name based on actual visual content
  { from: 'og-blog.png', to: 'og-blog-situational-guide.png', actualContent: 'blog index (situational guide)' },
  { from: 'og-english-to-marathi-words.png', to: 'og-english-to-marathi-workplace.png', actualContent: 'workplace and career' },
  { from: 'og-grammar-commands-polite.png', to: 'og-hindi-to-marathi-sentence-patterns.png', actualContent: 'hindi to marathi sov,particles,tense' },
  { from: 'og-hindi-to-marathi-advanced-structures.png', to: 'og-hindi-to-marathi-time-seasons.png', actualContent: 'hindi to marathi time & season' },
  { from: 'og-hindi-to-marathi-daily-conversation.png', to: 'og-hindi-to-marathi-time-seasons-clock.png', actualContent: 'hindi to marathi time & season : clock & calendar' },
  { from: 'og-hindi-to-marathi-festivals.png', to: 'og-hindi-to-marathi-travel.png', actualContent: 'hindi to marathi travel words' },
  { from: 'og-hindi-to-marathi-greetings.png', to: 'og-hindi-to-marathi-travel-train.png', actualContent: 'hindi-to-marathi travel words train ticket and stays' },
  { from: 'og-hindi-to-marathi-time-seasons.png', to: 'og-hindi-to-marathi-shopping.png', actualContent: 'hindi to marathi shopping' },
  { from: 'og-hindi-to-marathi-travel.png', to: 'og-hindi-to-marathi-shopping-2.png', actualContent: 'hindi to marathi shopping' },
  { from: 'og-phrases-making-plans.png', to: 'og-phrases-asking-directions.png', actualContent: 'marathi phrases -asking direction' },
  { from: 'og-phrases-office-work.png', to: 'og-phrases-shopping.png', actualContent: 'marathi phrases -shopping & bargaining' },
  { from: 'og-phrases-phone-and-messaging.png', to: 'og-phrases-asking-directions-2.png', actualContent: 'marathi phrases asking direction' },
  { from: 'og-phrases-presentations-interviews.png', to: 'og-phrases-thanking-apologizing.png', actualContent: 'marathi phrases thanking & apologizing' },
  { from: 'og-phrases-shopping.png', to: 'og-phrases-business-meetings.png', actualContent: 'marathi phrases:business meetings' },
  { from: 'og-phrases-thanking-apologizing.png', to: 'og-phrases-phone-and-messaging.png', actualContent: 'marathi phrases :phone & messaging' },
  { from: 'og-phrases-travel.png', to: 'og-phrases-asking-directions-3.png', actualContent: 'marathi phrase -asking directions' },
  { from: 'og-vocabulary-adjectives.png', to: 'og-vocabulary-work-office.png', actualContent: 'marathi office & work words' },
  { from: 'og-vocabulary-animals.png', to: 'og-vocabulary-adjectives.png', actualContent: 'marathi adjectives' },
  { from: 'og-vocabulary-body-parts.png', to: 'og-vocabulary-abstract-concepts.png', actualContent: 'marathi abstract words' },
  { from: 'og-vocabulary-clothing.png', to: 'og-vocabulary-transport.png', actualContent: 'marathi transport words' },
  { from: 'og-vocabulary-food.png', to: 'og-vocabulary-adjectives-2.png', actualContent: 'marathi adjective 68 describing words' },
  { from: 'og-vocabulary-shopping.png', to: 'og-vocabulary-abstract-concepts-2.png', actualContent: 'marathi abstract words' },
];

// Also the 3 "don't use" files that should be deleted (not renamed)
const deleteFiles = [
  { file: 'og-english-to-marathi-travel.png', reason: 'orphan - no page uses this' },
];

// And 3 "don't use" files that should be kept but need new content (will be renamed to placeholder)
const needNewContent = [
  { file: 'og-hindi-to-marathi-school-and-study.png', newName: 'og-hindi-to-marathi-school-and-study.png', reason: 'don\'t use if possible - needs new image for school/study' },
  { file: 'og-hindi-to-marathi-technology.png', newName: 'og-hindi-to-marathi-technology.png', reason: 'don\'t use if possible - needs new image for technology' },
  { file: 'og-hindi-to-marathi-work-career.png', newName: 'og-hindi-to-marathi-work-career.png', reason: 'don\'t use if possible - needs new image for work/career' },
];

console.log('=== RENAMING PLAN FOR 22 FILES ===\n');
for (const r of renamePlan) {
  console.log(`${r.from} -> ${r.to}`);
  console.log(`   Content: ${r.actualContent}`);
}

console.log('\n=== DELETE (1 file) ===');
for (const d of deleteFiles) {
  console.log(`${d.file} - ${d.reason}`);
}

console.log('\n=== KEEP BUT NEED NEW CONTENT (3 files) ===');
for (const n of needNewContent) {
  console.log(`${n.file} - ${n.reason}`);
}

// ============================================================
// IMPACT ANALYSIS: After renaming, which pages lose their hero?
// ============================================================

console.log('\n=== IMPACT ANALYSIS: Pages losing hero after rename ===\n');

const renamedFrom = new Set(renamePlan.map(r => r.from));
const renamedTo = new Map(renamePlan.map(r => [r.from, r.to]));

// Pages that originally used these 22 files
let orphanedPages = [];

for (const [route, info] of expectedPages) {
  if (renamedFrom.has(info.ogFile)) {
    const newFileName = renamedTo.get(info.ogFile);
    console.log(`ORPHANED: ${route} (${info.family})`);
    console.log(`  Was using: ${info.ogFile}`);
    console.log(`  That file now renamed to: ${newFileName}`);
    console.log(`  Page title: ${info.title}`);
    orphanedPages.push({ route, family: info.family, title: info.title, oldFile: info.ogFile, newFileName });
  }
}

console.log(`\nTotal orphaned pages: ${orphanedPages.length}`);

// ============================================================
// REPLACEMENT SOURCES: Find replacements from renamed pool + existing
// ============================================================

console.log('\n=== REPLACEMENT CANDIDATES FROM RENAMED POOL ===\n');

const allAvailableAfterRename = new Set([
  ...Array.from(actualFileMap).filter(f => !renamedFrom.has(f) && !deleteFiles.some(d => d.file === f)),
  ...renamePlan.map(r => r.to),
  ...needNewContent.map(n => n.newName),
]);

console.log('Available images after rename (excluding deleted):');
for (const f of Array.from(allAvailableAfterRename).sort()) {
  console.log(`  ${f}`);
}

console.log('\n=== MATCHING ORPHANED PAGES TO AVAILABLE IMAGES ===\n');

for (const orphan of orphanedPages) {
  const expectedFile = orphan.oldFile; // e.g., og-hindi-to-marathi-greetings.png
  const newName = renamedTo.get(expectedFile); // e.g., og-hindi-to-marathi-travel-train.png
  
  console.log(`\nPage: ${orphan.route} (${orphan.family})`);
  console.log(`  Title: ${orphan.title}`);
  console.log(`  Expected file: ${expectedFile}`);
  console.log(`  That file renamed to: ${newName}`);
  
  // Try to find a good replacement
  const routeKey = orphan.route.replace(/\//g, '-');
  
  // Strategy 1: Check if any renamed-to file matches this page's topic
  const topicKeywords = orphan.route.split('/').pop().split('-');
  const family = orphan.family;
  
  console.log(`  Looking for replacement...`);
  
  // Check renamed pool for semantic matches
  const matches = [];
  for (const avail of allAvailableAfterRename) {
    const availKey = avail.replace('og-', '').replace('.png', '');
    // Simple keyword matching
    for (const kw of topicKeywords) {
      if (availKey.includes(kw)) {
        matches.push(avail);
        break;
      }
    }
    // Also match by family
    if (availKey.startsWith(family.replace('hindi-to-marathi', 'hindi-to-marathi')
                                 .replace('english-to-marathi', 'english-to-marathi')
                                 .replace('vocabulary', 'vocabulary')
                                 .replace('phrases', 'phrases')
                                 .replace('grammar', 'grammar'))) {
      if (!matches.includes(avail)) matches.push(avail);
    }
  }
  
  if (matches.length > 0) {
    console.log(`  POTENTIAL REPLACEMENTS:`);
    for (const m of matches.slice(0, 5)) {
      console.log(`    ${m}`);
    }
  } else {
    console.log(`  NO OBVIOUS REPLACEMENT FOUND`);
  }
}