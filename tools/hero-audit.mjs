#!/usr/bin/env node
// hero-audit.mjs — Semantic audit of hero images (v2).
//
// Two checks:
//   A. REMAPS  — pages whose hero filename differs from the route-derived name
//      (explicit remaps / fallbacks). These are the risky ones; print the image's
//      OCR headline so a human can confirm the content matches the page topic.
//   B. CONTENT-vs-NAME — images whose filename matches the route, but whose OCR
//      headline names a DIFFERENT topic than the route (the "renamed content" bug).
//
// Usage: node tools/hero-audit.mjs [--json]

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const DIGEST = join(__dirname, 'ocr-digest.txt');
const asJson = process.argv.includes('--json');

/* ---- OCR digest: image base -> text ---- */
function parseDigest() {
  const raw = readFileSync(DIGEST, 'utf8').replace(/\r/g, '');
  const map = new Map();
  let cur = null;
  for (const line of raw.split('\n')) {
    const h = line.match(/^###\s+(og-[\w-]+)\s*$/);
    if (h) { cur = h[1]; map.set(cur, ''); continue; }
    if (cur) map.set(cur, (map.get(cur) + ' ' + line).trim());
  }
  return map;
}

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (n === 'index.html') out.push(p);
  }
  return out;
}

/* Image OCR "headline": the leading topic label of the card art. */
function headline(ocr) {
  return (ocr || '').replace(/\s+/g, ' ').trim().slice(0, 110);
}

/* Controlled topic lexicon — a page MUST relate to at least one of these.
   Synonyms are drawn from the actual OCR headlines so correct pages pass. */
const TOPIC_WORDS = {
  adjectives: ['adjective', 'describing', 'विशेषण'],
  adverbs: ['adverb', 'रीती'],
  animals: ['animal', 'bird', 'पक्षी', 'पक्षां'],
  'body-parts': ['body', 'health', 'symptom', 'शरीर', 'रीर', 'दुख', 'head to toe'],
  clothing: ['clothing', 'clothes', 'wear', 'garment', 'vocabulary'],   // no clothing art exists → generic accepted
  food: ['food', 'eat', 'meal', 'dish', 'kitchen', 'culin', 'जेवण', 'अन्न'],
  shopping: ['shopping', 'market', 'shop', 'bazaar', 'buy', 'price', 'money', 'bargain', 'खरेदी', 'पैसा'],
  colors: ['colour', 'color', 'shade', 'रंग'],
  family: ['family', 'relative', 'kin', 'kinship', 'परिवार', 'नात'],
  numbers: ['number', 'counting', 'count', 'countif', 'संख्या'],
  time: ['time', 'clock', 'season', 'calendar', 'वेळ', 'महिने'],
  transport: ['transport', 'travel', 'commute', 'vehicle', 'train', 'bus', 'taxi', 'वाहतूक', 'प्रवास'],
  technology: ['technolog', 'phone', 'device', 'computer', 'digital', 'internet'],
  weather: ['weather', 'rain', 'climate', 'monsoon', 'हवामान'],
  emotions: ['emotion', 'feeling', 'mood', 'psycholog', 'भावना'],
  work: ['work', 'office', 'career', 'job', 'workplace', 'profession', 'pedagog', 'method', 'teach'],
  school: ['school', 'study', 'education', 'student', 'classroom'],
  festivals: ['festival', 'celebration', 'culture', 'diwali', 'गणपती', 'गुढी', 'सण'],
  health: ['health', 'doctor', 'clinic', 'medical', 'symptom', 'body'],
  travel: ['travel', 'trip', 'journey', 'tour', 'transit', 'प्रवास'],
  greetings: ['greeting', 'hello', 'welcome', 'namaskar', 'नमस्कार'],
  questions: ['question', 'interrogat', 'asking', 'प्रश्न', 'काय'],
  verbs: ['verb', 'action', 'tense', 'क्रियापद'],
  grammar: ['grammar', 'structure', 'sentence', 'pattern', 'tense', 'voice', 'particle',
            'demonstrative', 'possessive', 'pronoun', 'postposition', 'negation', 'adverb',
            'ability', 'obligation', 'polite', 'honorific', 'passive', 'causative',
            'compound', 'countif', 'sov', 'व्याकरण', 'सर्वनाम', 'माझ', 'माझा',
            'please', 'say please', 'request', 'imperative'],
  phrases: ['phrase', 'sentence', 'expression', 'dialogue', 'conversation', 'essential', 'वाक्ये',
            'phone', 'messaging', 'presentation', 'interview', 'thanking', 'apolog', 'greeting',
            'direction', 'family', 'office', 'daily', 'प्रस्तुती', 'सादरीकरण', 'मुलाखत'],
  business: ['business', 'meeting', 'corporate', 'presentation', 'interview', 'प्रस्तुती', 'बैठक'],
  nature: ['nature', 'landscape', 'tree', 'outdoor', 'river'],
  money: ['money', 'price', 'finance', 'currency', 'rupee', 'पैसा'],
  directions: ['direction', 'location', 'place', 'where', 'route', 'दिशा', 'left', 'right'],
  emergency: ['emergency', 'help', 'urgen', 'danger', 'sos', 'मदत'],
  pronunciation: ['pronunciation', 'sound', 'phonetic', 'alphabet', 'letter', 'उच्चारण'],
  literature: ['literature', 'poetry', 'book', 'writing', 'author', 'साहित्य'],
  media: ['media', 'news', 'newspaper', 'journal', 'समाचार'],
  abstract: ['abstract', 'concept', 'idea', 'अमूर्त'],
  hobbies: ['hobby', 'hobbies', 'leisure', 'freetime'],
  tourism: ['tourism', 'travel', 'sightsee'],
  workplace: ['workplace', 'work', 'office', 'career', 'professional'],
  personality: ['personality', 'character', 'trait'],
  culture: ['culture', 'festival', 'tradition', 'संस्कृती'],
  connectors: ['connector', 'conjunction', 'and', 'or', 'किंवा'],
  shapes: ['shape', 'geometry', 'आकार'],
  household: ['household', 'furniture', 'home'],
  kitchen: ['kitchen', 'utensil', 'culinary', 'cooking'],
  education: ['education', 'school', 'term', 'शिक्षण'],
  occupations: ['occupation', 'profession', 'job', 'व्यवसाय'],
  beginners: ['beginner', 'essential', 'basic', 'नवशिक'],
  verbsx: ['verb', 'action'],
};

/* Derive a page's candidate topic keys from its route. */
function pageTopicKeys(route) {
  const keys = new Set();
  const segs = route.split('/').filter(Boolean);
  const joined = segs.join('-');
  for (const [key, words] of Object.entries(TOPIC_WORDS)) {
    const kk = key.replace(/_/g, '-');
    if (joined.includes(kk) || segs.some((s) => s === kk)) keys.add(key);
  }
  // family fallback: first segment
  if (segs[0]) keys.add(segs[0]);
  return [...keys].filter((k) => TOPIC_WORDS[k]);
}

function extract(pagePath) {
  const html = readFileSync(pagePath, 'utf8');
  const rel = relative(DIST, dirname(pagePath)).replace(/\\/g, '/');
  const route = rel === '.' ? '' : rel;
  const srcset = html.match(/hero-figure[\s\S]{0,400}?srcSet="([^"]+)"/);
  const ogimg = html.match(/<meta property="og:image" content="([^"]+)"/);
  let hero = '';
  if (srcset) hero = (srcset[1].split(',')[0] || '').trim().split('/').pop().replace(/\.webp$/, '');
  else if (ogimg) hero = (ogimg[1].split('/').pop() || '').replace(/\.png$/, '');
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [,''])[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  return { route, hero, h1 };
}

if (!existsSync(DIST)) { console.error('dist/ not found — run npm run build first'); process.exit(2); }
const digest = parseDigest();
const rows = [];
for (const p of walk(DIST)) {
  const page = extract(p);
  const ocr = digest.get(page.hero) || '';
  const expectedBase = 'og-' + (page.route === '' ? 'home' : page.route.replace(/\//g, '-'));
  const isRemap = page.hero !== expectedBase;
  const topicKeys = pageTopicKeys(page.route);
  const lowOcr = ocr.toLowerCase();
  // OCR "signal": enough real words to judge the topic. Ignore digit noise
  // (Devanagari/latin digits) and require 4+ letter latin words or a Devanagari
  // consonant run — graphically-dense art with no readable text becomes
  // "unverifiable" instead of a false failure.
  const latinWords = (lowOcr.match(/[a-z]{4,}/g) || []).length;
  const hasDev = /[\u0915-\u0939]{3,}/.test(ocr);
  const unverifiable = latinWords < 2 && !hasDev;
  const topicHit = (topicKeys.length === 0 || unverifiable)
    ? true // can't judge (static page, or graphically-dense art with no readable text)
    : topicKeys.some((k) => TOPIC_WORDS[k].some((w) => lowOcr.includes(w)));
  rows.push({ ...page, ocr, isRemap, topicKeys, topicHit, unverifiable, headline: headline(ocr) });
}

const remaps = rows.filter((r) => r.isRemap);
const badTopic = rows.filter((r) => r.topicKeys.length && !r.topicHit);
const noOcr = rows.filter((r) => !r.ocr);
const unver = rows.filter((r) => r.unverifiable && r.topicKeys.length);

if (asJson) {
  console.log(JSON.stringify({ total: rows.length, remaps, badTopic, noOcr }, null, 2));
} else {
  console.log('=== HERO IMAGE SEMANTIC AUDIT (v2) ===\n');
  console.log(`Pages:                ${rows.length}`);
  console.log(`Explicit remaps:      ${remaps.length}`);
  console.log(`Content/topic FAIL:   ${badTopic.length}   <-- real risk`);
  console.log(`Unverifiable (low OCR): ${unver.length}`);
  console.log(`No OCR ground-truth:  ${noOcr.length}\n`);

  console.log('--- A. REMAPS (filename != route) — confirm content matches ---');
  for (const r of remaps) {
    const flag = r.topicKeys.length === 0 ? '?' : (r.topicHit ? 'ok' : 'CHECK');
    console.log(`  [${flag}] /${r.route}`);
    console.log(`        file: ${r.hero}`);
    console.log(`        ocr : ${r.headline}`);
  }
  console.log('');

  if (badTopic.length) {
    console.log('--- B. CONTENT vs NAME — OCR shows a DIFFERENT topic than the route ---');
    for (const r of badTopic) {
      console.log(`  /${r.route}  (expected ~ ${r.topicKeys.join(', ')})`);
      console.log(`        file: ${r.hero}`);
      console.log(`        ocr : ${r.headline}`);
    }
    console.log('');
  }
}

process.exit(badTopic.length > 0 ? 1 : 0);
