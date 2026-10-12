// Create validation mapping for og-validation folder
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

// Build lookup map
const lookup = {};

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
  const key = p.route === '' ? 'home' : p.route.replace(/\//g, '-');
  lookup[key] = { title: p.title, family: p.family, route: p.route };
}

// Cluster vocab pages
for (const [slug, title] of clusters) {
  const route = `vocabulary/${slug}`;
  const key = route.replace(/\//g, '-');
  lookup[key] = { title, family: 'vocabulary', route };
}

// Phrase set pages
for (const [slug, title] of phraseSets) {
  const route = `phrases/${slug}`;
  const key = route.replace(/\//g, '-');
  lookup[key] = { title, family: 'phrases', route };
}

// Grammar topic pages
for (const [slug, title] of grammarTopics) {
  const route = `grammar/${slug}`;
  const key = route.replace(/\//g, '-');
  lookup[key] = { title, family: 'grammar', route };
}

// Lesson pages
for (const u of units) {
  const route = `lessons/${u.unit}`;
  const key = route.replace(/\//g, '-');
  lookup[key] = { title: `Unit ${u.unit}: ${u.titleEn}`, family: 'lessons', route };
}

// Quiz pages
for (const [slug, title] of clusters) {
  const route = `quiz/${slug}`;
  const key = route.replace(/\//g, '-');
  lookup[key] = { title: `Quiz: ${title}`, family: 'quiz', route };
}

// Blog pages
for (const p of blogPages) {
  const key = p.route.replace(/\//g, '-');
  lookup[key] = { title: p.title, family: 'blog', route: p.route };
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
      const key = route.replace(/\//g, '-');
      lookup[key] = { title: p.title, family: basePath, route };
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
  const key = p.route.replace(/\//g, '-');
  lookup[key] = { title: p.title, family: p.family, route: p.route };
}

// Write CSV
const lines = ['filename,route,title,family'];
const webpFiles = fs.readdirSync(path.join(root, 'public/og')).filter(f => f.endsWith('.webp'));
for (const f of webpFiles) {
  const key = f.replace('.webp', '');
  const info = lookup[key] || { title: 'UNKNOWN', family: 'unknown', route: key };
  lines.push(`${f},${info.route},${info.title.replace(/,/g, ';')},${info.family}`);
}
fs.writeFileSync(path.join(root, 'og-validation/mapping.csv'), lines.join('\n'));

// Write JSON for programmatic use
const jsonData = {};
for (const f of webpFiles) {
  const key = f.replace('.webp', '');
  const info = lookup[key] || { title: 'UNKNOWN', family: 'unknown', route: key };
  jsonData[key] = info;
}
fs.writeFileSync(path.join(root, 'og-validation/mapping.json'), JSON.stringify(jsonData, null, 2));

console.log('Created mapping.csv and mapping.json with', Object.keys(lookup).length, 'entries');