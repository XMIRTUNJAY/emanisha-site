// OG Image Semantic Audit Script
// Verifies that every page's OG image filename matches its semantic topic

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd());

// Load all SEO data
const vocabTopics = JSON.parse(readFileSync(join(root, 'src', 'data', 'seo', 'vocab-topics.json'), 'utf8'));
const phrasePages = JSON.parse(readFileSync(join(root, 'src', 'data', 'seo', 'phrase-pages.json'), 'utf8'));
const grammarPages = JSON.parse(readFileSync(join(root, 'src', 'data', 'seo', 'grammar-pages.json'), 'utf8'));
const hindiBridges = JSON.parse(readFileSync(join(root, 'src', 'data', 'seo', 'hindi-bridges.json'), 'utf8'));
const englishPaths = JSON.parse(readFileSync(join(root, 'src', 'data', 'seo', 'english-paths.json'), 'utf8'));

// Load learn.ts data for clusters, phraseSets, grammarTopics
const learnSrc = readFileSync(join(root, 'src', 'lib', 'learn.ts'), 'utf8');
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
const units = JSON.parse(readFileSync(join(root, 'src', 'data', 'learn', 'units.json'), 'utf8'));

// Load blog pages
const blogDir = join(root, 'src', 'pages', 'blog');
const blogFiles = readdirSync(blogDir).filter(f => f.endsWith('.astro'));
const blogPages = blogFiles.map(f => {
  const src = readFileSync(join(blogDir, f), 'utf8');
  const t = src.match(/^\ttitle="([^"]+)"|^title="([^"]+)"/m) ?? src.match(/const title = '([^']+)'/);
  if (t) {
    const route = `blog/${f.replace(/\.astro$/, '')}`;
    return { route, title: t[1] ?? t[2] };
  }
  return null;
}).filter(Boolean);

// Build expected pages map: route -> { title, family, expectedImageFile }
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
  const file = `og-${p.route === '' ? 'home' : p.route.replace(/\//g, '-')}.png`;
  expectedPages.set(p.route, { title: p.title, family: p.family, expectedFile: file });
}

// Cluster vocab pages
for (const [slug, title] of clusters) {
  const route = `vocabulary/${slug}`;
  const file = `og-${route.replace(/\//g, '-')}.png`;
  expectedPages.set(route, { title, family: 'vocabulary', expectedFile: file });
}

// Phrase set pages
for (const [slug, title] of phraseSets) {
  const route = `phrases/${slug}`;
  const file = `og-${route.replace(/\//g, '-')}.png`;
  expectedPages.set(route, { title, family: 'phrases', expectedFile: file });
}

// Grammar topic pages
for (const [slug, title] of grammarTopics) {
  const route = `grammar/${slug}`;
  const file = `og-${route.replace(/\//g, '-')}.png`;
  expectedPages.set(route, { title, family: 'grammar', expectedFile: file });
}

// Lesson pages
for (const u of units) {
  const route = `lessons/${u.unit}`;
  const title = `Unit ${u.unit}: ${u.titleEn}`;
  const file = `og-${route.replace(/\//g, '-')}.png`;
  expectedPages.set(route, { title, family: 'lessons', expectedFile: file });
}

// Quiz pages
for (const [slug, clusterTitle] of clusters) {
  const route = `quiz/${slug}`;
  const title = `Quiz: ${clusterTitle}`;
  const file = `og-${route.replace(/\//g, '-')}.png`;
  expectedPages.set(route, { title, family: 'quiz', expectedFile: file });
}

// Blog pages
for (const p of blogPages) {
  const file = `og-${p.route.replace(/\//g, '-')}.png`;
  expectedPages.set(p.route, { title: p.title, family: 'blog', expectedFile: file });
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
      const file = `og-${route.replace(/\//g, '-')}.png`;
      expectedPages.set(route, { title: p.title, family: basePath, expectedFile: file });
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
  const file = `og-${p.route.replace(/\//g, '-')}.png`;
  expectedPages.set(p.route, { title: p.title, family: p.family, expectedFile: file });
}

// Load actual OG images
const ogDir = join(root, 'public', 'og');
const actualImages = readdirSync(ogDir).filter(f => f.endsWith('.png') && !f.endsWith('.webp'));

// Build actual image map: route -> actual file
// Image filenames use dashes for the entire route path: og-vocabulary-body-parts.png -> vocabulary/body-parts
const actualImageMap = new Map();
for (const img of actualImages) {
  // Remove og- prefix and .png suffix, keep internal dashes as-is
  const route = img.replace(/^og-/, '').replace(/\.png$/, '');
  actualImageMap.set(route, img);
}

// Normalize route to dashed format for comparison (matching make-og-pages.mjs)
function normalizeRoute(route) {
  if (route === '') return 'home';
  return route.replace(/\//g, '-');
}

// Audit
console.log('=== OG IMAGE SEMANTIC AUDIT ===\n');
console.log(`Total expected pages: ${expectedPages.size}`);
console.log(`Total actual PNG images: ${actualImages.length}\n`);

const results = {
  correct: [],
  missing: [],
  extra: [],
  mismatched: [], // image exists but for wrong route
};

for (const [route, expected] of expectedPages) {
  const dashedRoute = normalizeRoute(route);
  const actualFile = actualImageMap.get(dashedRoute);
  if (!actualFile) {
    results.missing.push({ route, expectedFile: expected.expectedFile, title: expected.title });
  } else if (actualFile !== expected.expectedFile) {
    results.mismatched.push({
      route,
      expectedFile: expected.expectedFile,
      actualFile,
      title: expected.title,
    });
  } else {
    results.correct.push({ route, file: actualFile });
  }
}

// Check for extra images (images not mapped to any expected page)
for (const [dashedRoute, file] of actualImageMap) {
  // Find if any expected page matches this dashed route
  let found = false;
  for (const [route] of expectedPages) {
    if (normalizeRoute(route) === dashedRoute) {
      found = true;
      break;
    }
  }
  if (!found) {
    results.extra.push({ route: dashedRoute, file });
  }
}

// Report
console.log(`✅ CORRECT: ${results.correct.length}`);
console.log(`❌ MISSING: ${results.missing.length}`);
console.log(`⚠️  MISMATCHED: ${results.mismatched.length}`);
console.log(`📦 EXTRA: ${results.extra.length}\n`);

if (results.missing.length > 0) {
  console.log('--- MISSING IMAGES ---');
  for (const m of results.missing) {
    console.log(`  ${m.route} → expected: ${m.expectedFile}`);
    console.log(`    Title: ${m.title}`);
  }
  console.log('');
}

if (results.mismatched.length > 0) {
  console.log('--- MISMATCHED IMAGES (filename doesn\'t match route) ---');
  for (const m of results.mismatched) {
    console.log(`  Route: ${m.route}`);
    console.log(`    Expected: ${m.expectedFile}`);
    console.log(`    Actual:   ${m.actualFile}`);
    console.log(`    Title:    ${m.title}`);
    console.log('');
  }
}

if (results.extra.length > 0) {
  console.log('--- EXTRA IMAGES (not mapped to any page) ---');
  for (const e of results.extra) {
    console.log(`  ${e.route} → ${e.file}`);
  }
  console.log('');
}

// Semantic topic audit: group by family/topic
console.log('=== SEMANTIC TOPIC AUDIT ===\n');
const topicGroups = new Map();
for (const [route, expected] of expectedPages) {
  const topic = expected.expectedFile.replace(/^og-/, '').replace(/\.png$/, '');
  const family = expected.family;
  if (!topicGroups.has(family)) topicGroups.set(family, []);
  topicGroups.get(family).push({ route, topic, title: expected.title });
}

for (const [family, pages] of topicGroups) {
  console.log(`--- ${family.toUpperCase()} (${pages.length} pages) ---`);
  for (const p of pages) {
    const dashedRoute = normalizeRoute(p.route);
    const actualFile = actualImageMap.get(dashedRoute);
    const status = actualFile === `og-${p.topic}.png` ? '✅' : actualFile ? '⚠️' : '❌';
    console.log(`  ${status} ${p.route} → ${actualFile || 'MISSING'}`);
  }
  console.log('');
}

// Exit code for CI
if (results.missing.length > 0 || results.mismatched.length > 0) {
  console.log('\n❌ AUDIT FAILED: There are missing or mismatched OG images.');
  process.exit(1);
} else {
  console.log('\n✅ AUDIT PASSED: All OG images correctly mapped.');
  process.exit(0);
}