// COMPLETE MATRIX FOR ALL 26 IMAGES
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// Load data
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

// Build expected pages
const expectedPages = new Map();
// ... (abbreviated - same as before)

// Complete matrix for all 26
const matrix = [
  // ============================================================
  // 22 RENAME
  // ============================================================
  {
    id: 1,
    action: 'RENAME_AND_REPLACE',
    currentFile: 'og-blog.png',
    currentWebp: 'og-blog.webp',
    currentBase: 'og-blog',
    renamedTo: 'og-blog-situational-guide',
    impactedPage: 'blog',
    impactedTitle: 'Real-Life Marathi Guides',
    topic: 'blog-index',
    stitchSource: 'N/A (exclude - wrong content)',
    newHeroSource: 'og-blog-index.png (exists)',
    decision: 'RENAME current to situational-guide; REPLACE hero on blog/ with og-blog-index.png',
    comment: 'Current shows situational guide. Rename to situational-guide. Blog index gets og-blog-index.png (exists).'
  },
  {
    id: 2,
    action: 'RENAME_AND_REPLACE',
    currentFile: 'og-english-to-marathi-words.png',
    currentWebp: 'og-english-to-marathi-words.webp',
    currentBase: 'og-english-to-marathi-words',
    renamedTo: 'og-english-to-marathi-workplace_1',
    impactedPage: 'english-to-marathi/words',
    impactedTitle: 'English to Marathi Words',
    topic: 'words',
    stitchSource: 'N/A (content shows workplace)',
    newHeroSource: 'og-blog-pune-newcomer-words.png (exists)',
    decision: 'RENAME current to workplace_1; REPLACE hero with og-blog-pune-newcomer-words.png',
    comment: 'Current shows workplace. Rename to workplace_1. Words page gets pune-newcomer-words (topic: words).'
  },
  {
    id: 3,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-grammar-commands-polite.png',
    currentWebp: 'og-grammar-commands-polite.webp',
    currentBase: 'og-grammar-commands-polite',
    renamedTo: 'og-hindi-to-marathi-sentence-patterns_1',
    impactedPage: 'grammar/commands-polite',
    impactedTitle: 'Marathi Commands & Polite Requests',
    topic: 'commands-polite',
    stitchSource: 'clean_high_resolution_educational_banner_graphic_for_marathi_commands_polite',
    newHeroSource: 'Stitch → og-grammar-commands-polite.png',
    decision: 'RENAME current to sentence-patterns_1; COPY Stitch → og-grammar-commands-polite.png; REPLACE hero',
    comment: 'Stitch has exact "commands_polite" image. Rename current. Copy Stitch to correct filename. Hero matches: या, जा, द्या, कृपया.'
  },
  {
    id: 4,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-hindi-to-marathi-advanced-structures.png',
    currentWebp: 'og-hindi-to-marathi-advanced-structures.webp',
    currentBase: 'og-hindi-to-marathi-advanced-structures',
    renamedTo: 'og-hindi-to-marathi-time-seasons_1',
    impactedPage: 'hindi-to-marathi/advanced-structures',
    impactedTitle: 'Hindi to Marathi Advanced: Passive, Causative',
    topic: 'advanced-structures',
    stitchSource: 'clean_educational_banner_graphic_for_hindi_to_marathi_advanced_structures',
    newHeroSource: 'Stitch → og-hindi-to-marathi-advanced-structures.png',
    decision: 'RENAME current to time-seasons_1; COPY Stitch → og-hindi-to-marathi-advanced-structures.png; REPLACE hero',
    comment: 'Stitch has exact "advanced_structures" image. Rename current. Copy Stitch. Hero matches: केला जाते, खववते (passive/causative).'
  },
  {
    id: 5,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-hindi-to-marathi-daily-conversation.png',
    currentWebp: 'og-hindi-to-marathi-daily-conversation.webp',
    currentBase: 'og-hindi-to-marathi-daily-conversation',
    renamedTo: 'og-hindi-to-marathi-time-seasons-clock',
    impactedPage: 'hindi-to-marathi/daily-conversation',
    impactedTitle: 'Hindi to Marathi Daily Conversation: Survival Sentences',
    topic: 'daily-conversation',
    stitchSource: 'clean_educational_banner_graphic_for_hindi_to_marathi_daily_conversation',
    newHeroSource: 'Stitch → og-hindi-to-marathi-daily-conversation.png',
    decision: 'RENAME current to time-seasons-clock; COPY Stitch → og-hindi-to-marathi-daily-conversation.png; REPLACE hero',
    comment: 'Stitch has exact "daily_conversation" image. Rename current. Copy Stitch. Hero matches: तयार, मदत, पाहिजे, नको (survival sentences).'
  },
  {
    id: 6,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-hindi-to-marathi-festivals.png',
    currentWebp: 'og-hindi-to-marathi-festivals.webp',
    currentBase: 'og-hindi-to-marathi-festivals',
    renamedTo: 'og-hindi-to-marathi-travel_1',
    impactedPage: 'hindi-to-marathi/festivals',
    impactedTitle: 'Hindi to Marathi Festivals: Diwali, Ganpati & More',
    topic: 'festivals',
    stitchSource: 'clean_festive_educational_banner_graphic_for_hindi_to_marathi_festivals_diwali + clean_high_resolution_cultural_educational_banner_graphic_for_marathi_festival',
    newHeroSource: 'Stitch → og-hindi-to-marathi-festivals.png',
    decision: 'RENAME current to travel_1; COPY Stitch (festivals_diwali) → og-hindi-to-marathi-festivals.png; REPLACE hero',
    comment: 'Stitch has 2 festival images (Diwali + cultural). Rename current. Copy best festival Stitch. Hero matches: गुढीपाडवा, गणपती, दिवाळी.'
  },
  {
    id: 7,
    action: 'RENAME_AND_REPLACE',
    currentFile: 'og-hindi-to-marathi-greetings.png',
    currentWebp: 'og-hindi-to-marathi-greetings.webp',
    currentBase: 'og-hindi-to-marathi-greetings',
    renamedTo: 'og-hindi-to-marathi-travel-train',
    impactedPage: 'hindi-to-marathi/greetings',
    impactedTitle: 'Hindi to Marathi Greetings & First Sentences',
    topic: 'greetings',
    stitchSource: 'N/A (use existing og-english-to-marathi-greetings.png)',
    newHeroSource: 'og-english-to-marathi-greetings.png (exists)',
    decision: 'RENAME current to travel-train; REPLACE hero with og-english-to-marathi-greetings.png',
    comment: 'Current shows travel/train. Rename to travel-train. Greetings page gets english-to-marathi-greetings (exact topic match).'
  },
  {
    id: 8,
    action: 'RENAME_AND_REPLACE',
    currentFile: 'og-hindi-to-marathi-time-seasons.png',
    currentWebp: 'og-hindi-to-marathi-time-seasons.webp',
    currentBase: 'og-hindi-to-marathi-time-seasons',
    renamedTo: 'og-hindi-to-marathi-shopping_1',
    impactedPage: 'hindi-to-marathi/time-seasons',
    impactedTitle: 'Hindi to Marathi Time & Seasons: Clock, Calendar, Weather',
    topic: 'time-seasons',
    stitchSource: 'N/A (use existing og-english-to-marathi-time-seasons.png)',
    newHeroSource: 'og-english-to-marathi-time-seasons.png (exists)',
    decision: 'RENAME current to shopping_1; REPLACE hero with og-english-to-marathi-time-seasons.png',
    comment: 'Current shows shopping. Rename to shopping_1. Time-seasons page gets english-to-marathi-time-seasons (exact topic match).'
  },
  {
    id: 9,
    action: 'RENAME_AND_REPLACE',
    currentFile: 'og-hindi-to-marathi-travel.png',
    currentWebp: 'og-hindi-to-marathi-travel.webp',
    currentBase: 'og-hindi-to-marathi-travel',
    renamedTo: 'og-hindi-to-marathi-shopping-2',
    impactedPage: 'hindi-to-marathi/travel',
    impactedTitle: 'Hindi to Marathi Travel Words: Trains, Tickets & Stays',
    topic: 'travel',
    stitchSource: 'N/A (use existing og-english-to-marathi-transport-travel.png)',
    newHeroSource: 'og-english-to-marathi-transport-travel.png (exists)',
    decision: 'RENAME current to shopping-2; REPLACE hero with og-english-to-marathi-transport-travel.png',
    comment: 'Current shows shopping. Rename to shopping-2. Travel page gets english-to-marathi-transport-travel (exact topic match).'
  },
  {
    id: 10,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-phrases-making-plans.png',
    currentWebp: 'og-phrases-making-plans.webp',
    currentBase: 'og-phrases-making-plans',
    renamedTo: 'og-phrases-asking-directions_1',
    impactedPage: 'phrases/making-plans',
    impactedTitle: 'Marathi Phrases for Making Plans & Future Talk',
    topic: 'making-plans',
    stitchSource: 'clean_high_resolution_educational_phrase_banner_graphic_for_marathi_phrases_1',
    newHeroSource: 'Stitch → og-phrases-making-plans.png',
    decision: 'RENAME current to asking-directions_1; COPY Stitch (phrases_1) → og-phrases-making-plans.png; REPLACE hero',
    comment: 'Stitch phrases_1 is for making plans. Rename current. Copy Stitch. Hero matches: उद्या भेटूया, मी येतो, परवा भेटूया.'
  },
  {
    id: 11,
    action: 'RENAME_AND_REPLACE',
    currentFile: 'og-phrases-office-work.png',
    currentWebp: 'og-phrases-office-work.webp',
    currentBase: 'og-phrases-office-work',
    renamedTo: 'og-phrases-shopping_1',
    impactedPage: 'phrases/office-work',
    impactedTitle: 'Marathi Office Phrases for Work & Daily Use',
    topic: 'office-work',
    stitchSource: 'N/A (use existing og-english-to-marathi-workplace.png)',
    newHeroSource: 'og-english-to-marathi-workplace.png (exists)',
    decision: 'RENAME current to shopping_1; REPLACE hero with og-english-to-marathi-workplace.png',
    comment: 'Current shows shopping. Rename to shopping_1. Office-work page gets english-to-marathi-workplace (exact topic match).'
  },
  {
    id: 12,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-phrases-phone-and-messaging.png',
    currentWebp: 'og-phrases-phone-and-messaging.webp',
    currentBase: 'og-phrases-phone-and-messaging',
    renamedTo: 'og-phrases-asking-directions-2',
    impactedPage: 'phrases/phone-and-messaging',
    impactedTitle: 'Marathi Phrases for Phone Calls & Messaging',
    topic: 'phone-and-messaging',
    stitchSource: 'clean_educational_banner_graphic_for_english_to_marathi_technology_phone._split',
    newHeroSource: 'Stitch → og-phrases-phone-and-messaging.png',
    decision: 'RENAME current to asking-directions-2; COPY Stitch (tech_phone) → og-phrases-phone-and-messaging.png; REPLACE hero',
    comment: 'Stitch has tech phone image. Rename current. Copy Stitch. Hero matches: मोबाईल, व्हाट्सअॅप, मेसेज, कॉल, चार्ज.'
  },
  {
    id: 13,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-phrases-presentations-interviews.png',
    currentWebp: 'og-phrases-presentations-interviews.webp',
    currentBase: 'og-phrases-presentations-interviews',
    renamedTo: 'og-phrases-thanking-apologizing_1',
    impactedPage: 'phrases/presentations-interviews',
    impactedTitle: 'Marathi Phrases for Presentations & Interviews',
    topic: 'presentations-interviews',
    stitchSource: 'N/A (use existing og-hindi-to-marathi-business.png)',
    newHeroSource: 'og-hindi-to-marathi-business.png (exists)',
    decision: 'RENAME current to thanking-apologizing_1; REPLACE hero with og-hindi-to-marathi-business.png',
    comment: 'Current shows thanking/apologizing. Rename to thanking-apologizing_1. Presentations page gets hindi-to-marathi-business (exact topic: business).'
  },
  {
    id: 14,
    action: 'RENAME_AND_REPLACE',
    currentFile: 'og-phrases-shopping.png',
    currentWebp: 'og-phrases-shopping.webp',
    currentBase: 'og-phrases-shopping',
    renamedTo: 'og-phrases-business-meetings_1',
    impactedPage: 'phrases/shopping',
    impactedTitle: 'Marathi Shopping Phrases',
    topic: 'shopping',
    stitchSource: 'N/A (use existing og-hindi-to-marathi-shopping.png)',
    newHeroSource: 'og-hindi-to-marathi-shopping.png (exists)',
    decision: 'RENAME current to business-meetings_1; REPLACE hero with og-hindi-to-marathi-shopping.png',
    comment: 'Current shows business meetings. Rename to business-meetings_1. Shopping page gets hindi-to-marathi-shopping (exact topic match).'
  },
  {
    id: 15,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-phrases-thanking-apologizing.png',
    currentWebp: 'og-phrases-thanking-apologizing.webp',
    currentBase: 'og-phrases-thanking-apologizing',
    renamedTo: 'og-phrases-phone-and-messaging_1',
    impactedPage: 'phrases/thanking-apologizing',
    impactedTitle: 'Marathi Phrases for Thanking & Apologizing',
    topic: 'thanking-apologizing',
    stitchSource: 'clean_high_resolution_polite_educational_blog_banner_graphic_for_how_to_say',
    newHeroSource: 'Stitch → og-phrases-thanking-apologizing.png',
    decision: 'RENAME current to phone-and-messaging_1; COPY Stitch (polite_how_to_say) → og-phrases-thanking-apologizing.png; REPLACE hero',
    comment: 'Stitch has polite/how-to-say image. Rename current. Copy Stitch. Hero matches: धन्यवाद, माफ करा, कृपया, काही हरकत नाही.'
  },
  {
    id: 16,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-phrases-travel.png',
    currentWebp: 'og-phrases-travel.webp',
    currentBase: 'og-phrases-travel',
    renamedTo: 'og-phrases-asking-directions-3',
    impactedPage: 'phrases/travel',
    impactedTitle: 'Marathi Travel Phrases',
    topic: 'travel',
    stitchSource: 'N/A (use existing og-english-to-marathi-transport-travel.png)',
    newHeroSource: 'og-english-to-marathi-transport-travel.png (exists)',
    decision: 'RENAME current to asking-directions-3; REPLACE hero with og-english-to-marathi-transport-travel.png',
    comment: 'Current shows asking directions. Rename to asking-directions-3. Travel page gets english-to-marathi-transport-travel (exact topic match).'
  },
  {
    id: 17,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-vocabulary-adjectives.png',
    currentWebp: 'og-vocabulary-adjectives.webp',
    currentBase: 'og-vocabulary-adjectives',
    renamedTo: 'og-vocabulary-work-office_1',
    impactedPage: 'vocabulary/adjectives',
    impactedTitle: 'Marathi Adjectives: 68 Describing Words',
    topic: 'adjectives',
    stitchSource: 'clean_high_resolution_educational_vocabulary_banner_graphic_for_marathi_3',
    newHeroSource: 'Stitch → og-vocabulary-adjectives.png',
    decision: 'RENAME current to work-office_1; COPY Stitch (vocab_3) → og-vocabulary-adjectives.png; REPLACE hero',
    comment: 'Stitch vocab_3 is for adjectives. Rename current. Copy Stitch. Hero matches: 68 adjectives (मोठा/लहान, चांगला/वाईट, उष्ण/थंड).'
  },
  {
    id: 18,
    action: 'RENAME_AND_REPLACE',
    currentFile: 'og-vocabulary-animals.png',
    currentWebp: 'og-vocabulary-animals.webp',
    currentBase: 'og-vocabulary-animals',
    renamedTo: 'og-vocabulary-adjectives_1',
    impactedPage: 'vocabulary/animals',
    impactedTitle: 'Marathi Animal Names: 40 Animals with Hindi & English',
    topic: 'animals',
    stitchSource: 'N/A (renamed file becomes new adjectives)',
    newHeroSource: 'og-vocabulary-adjectives_1.png (renamed from animals)',
    decision: 'RENAME current to adjectives_1; REPLACE hero with og-vocabulary-adjectives_1.png (the renamed file)',
    comment: 'Chain: animals→adjectives_1. Animals page gets the renamed adjectives_1 (which IS the adjectives Stitch image).'
  },
  {
    id: 19,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-vocabulary-body-parts.png',
    currentWebp: 'og-vocabulary-body-parts.webp',
    currentBase: 'og-vocabulary-body-parts',
    renamedTo: 'og-vocabulary-abstract-concepts_1',
    impactedPage: 'vocabulary/body-parts',
    impactedTitle: 'Marathi Body Parts: 43 Words from Head to Toe',
    topic: 'body-parts',
    stitchSource: 'clean_high_resolution_educational_banner_graphic_for_marathi_body_parts_43',
    newHeroSource: 'Stitch → og-vocabulary-body-parts.png',
    decision: 'RENAME current to abstract-concepts_1; COPY Stitch (body_parts_43) → og-vocabulary-body-parts.png; REPLACE hero',
    comment: 'Stitch has exact "body_parts_43" image. Rename current. Copy Stitch. Hero matches: 43 body parts (डोकं, डोळा, हात, पाय, पोट).'
  },
  {
    id: 20,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-vocabulary-clothing.png',
    currentWebp: 'og-vocabulary-clothing.webp',
    currentBase: 'og-vocabulary-clothing',
    renamedTo: 'og-vocabulary-transport_1',
    impactedPage: 'vocabulary/clothing',
    impactedTitle: 'Marathi Clothes Vocabulary: Clothing & Jewellery Words',
    topic: 'clothing',
    stitchSource: 'clean_high_resolution_educational_banner_graphic_for_marathi_clothing_words',
    newHeroSource: 'Stitch → og-vocabulary-clothing.png',
    decision: 'RENAME current to transport_1; COPY Stitch (clothing_words) → og-vocabulary-clothing.png; REPLACE hero',
    comment: 'Stitch has exact "clothing_words" image. Rename current. Copy Stitch. Hero matches: साडी, धोतर, शर्ट, चप्पल, नथ, बांगड्या.'
  },
  {
    id: 21,
    action: 'RENAME_AND_REPLACE_WITH_STITCH',
    currentFile: 'og-vocabulary-food.png',
    currentWebp: 'og-vocabulary-food.webp',
    currentBase: 'og-vocabulary-food',
    renamedTo: 'og-vocabulary-adjectives-2',
    impactedPage: 'vocabulary/food',
    impactedTitle: 'Marathi Food Words',
    topic: 'food',
    stitchSource: 'clean_high_resolution_educational_banner_graphic_for_marathi_food_words',
    newHeroSource: 'Stitch → og-vocabulary-food.png',
    decision: 'RENAME current to adjectives-2; COPY Stitch (food_words) → og-vocabulary-food.png; REPLACE hero',
    comment: 'Stitch has exact "food_words" image. Rename current. Copy Stitch. Hero matches: भात, भाजी, भाकरी, दाल, खोवा.'
  },
  {
    id: 22,
    action: 'RENAME_AND_REPLACE',
    currentFile: 'og-vocabulary-shopping.png',
    currentWebp: 'og-vocabulary-shopping.webp',
    currentBase: 'og-vocabulary-shopping',
    renamedTo: 'og-vocabulary-abstract-concepts-2',
    impactedPage: 'vocabulary/shopping',
    impactedTitle: 'Marathi Shopping & Market Words',
    topic: 'shopping',
    stitchSource: 'N/A (use existing og-hindi-to-marathi-shopping.png)',
    newHeroSource: 'og-hindi-to-marathi-shopping.png (exists)',
    decision: 'RENAME current to abstract-concepts-2; REPLACE hero with og-hindi-to-marathi-shopping.png',
    comment: 'Current shows abstract words. Rename to abstract-concepts-2. Shopping page gets hindi-to-marathi-shopping (exact topic match).'
  },

  // ============================================================
  // 3 KEEP_NEW_CONTENT
  // ============================================================
  {
    id: 23,
    action: 'KEEP_REGENERATE',
    currentFile: 'og-hindi-to-marathi-school-and-study.png',
    currentWebp: 'og-hindi-to-marathi-school-and-study.webp',
    currentBase: 'og-hindi-to-marathi-school-and-study',
    renamedTo: 'og-hindi-to-marathi-school-and-study (keep)',
    impactedPage: 'hindi-to-marathi/school-and-study',
    impactedTitle: 'Hindi to Marathi School & Study: Classroom, Subjects, Exams',
    topic: 'school-and-study',
    stitchSource: 'clean_high_resolution_educational_banner_graphic_for_marathi_school_education',
    newHeroSource: 'Stitch → og-hindi-to-marathi-school-and-study.png (regenerate)',
    decision: 'KEEP filename; REGENERATE from Stitch (school_education); REPLACE hero',
    comment: 'Stitch has school_education image. Keep filename. Regenerate from Stitch. Hero matches: classroom, subjects, exams.'
  },
  {
    id: 24,
    action: 'KEEP_REGENERATE',
    currentFile: 'og-hindi-to-marathi-technology.png',
    currentWebp: 'og-hindi-to-marathi-technology.webp',
    currentBase: 'og-hindi-to-marathi-technology',
    renamedTo: 'og-hindi-to-marathi-technology (keep)',
    impactedPage: 'hindi-to-marathi/technology',
    impactedTitle: 'Hindi to Marathi Technology: Phone, Internet, Apps',
    topic: 'technology',
    stitchSource: 'clean_educational_banner_graphic_for_english_to_marathi_technology_phone._split',
    newHeroSource: 'Stitch → og-hindi-to-marathi-technology.png (regenerate)',
    decision: 'KEEP filename; REGENERATE from Stitch (tech_phone); REPLACE hero',
    comment: 'Stitch has tech phone image. Keep filename. Regenerate from Stitch. Hero matches: मोबाईल, इंटरनेट, चार्ज, अॅप, बैटरी.'
  },
  {
    id: 25,
    action: 'KEEP_REGENERATE',
    currentFile: 'og-hindi-to-marathi-work-career.png',
    currentWebp: 'og-hindi-to-marathi-work-career.webp',
    currentBase: 'og-hindi-to-marathi-work-career',
    renamedTo: 'og-hindi-to-marathi-work-career (keep)',
    impactedPage: 'hindi-to-marathi/work-career',
    impactedTitle: 'Hindi to Marathi Work & Career: Jobs, Office, Professions',
    topic: 'work-career',
    stitchSource: 'N/A (use english-to-marathi-workplace or blog-first-day-work)',
    newHeroSource: 'og-english-to-marathi-workplace.png or og-blog-first-day-work.png (existing)',
    decision: 'KEEP filename; REPLACE hero with existing workplace image; REGENERATE later if needed',
    comment: 'Current shows wrong content. Keep filename. Hero gets english-to-marathi-workplace (topic: workplace).'
  },

  // ============================================================
  // 1 DELETE
  // ============================================================
  {
    id: 26,
    action: 'DELETE',
    currentFile: 'og-english-to-marathi-travel.png',
    currentWebp: 'N/A',
    currentBase: 'og-english-to-marathi-travel',
    renamedTo: 'DELETE',
    impactedPage: 'NONE',
    impactedTitle: 'N/A',
    topic: 'N/A',
    stitchSource: 'N/A',
    newHeroSource: 'N/A',
    decision: 'DELETE file (no page uses it)',
    comment: 'Orphan image. No page expects og-english-to-marathi-travel. Correct travel page is english-to-marathi/transport-travel → og-english-to-marathi-transport-travel.png (exists).'
  }
];

console.log('=== COMPLETE 26-IMAGE DECISION MATRIX ===\n');

for (const m of matrix) {
  console.log(`${'='.repeat(80)}`);
  console.log(`ID: ${m.id} | ${m.action}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Current File:     ${m.currentFile}`);
  console.log(`Current WebP:     ${m.currentWebp}`);
  console.log(`Renamed To:       ${m.renamedTo}`);
  console.log(`Impacted Page:    ${m.impactedPage}`);
  console.log(`Page Title:       ${m.impactedTitle}`);
  console.log(`Topic:            ${m.topic}`);
  console.log(`Stitch Source:    ${m.stitchSource}`);
  console.log(`New Hero Source:  ${m.newHeroSource}`);
  console.log(`Decision:         ${m.decision}`);
  console.log(`Comment:          ${m.comment}`);
  console.log('');
}

const renameCount = matrix.filter(m => m.action.startsWith('RENAME')).length;
const keepCount = matrix.filter(m => m.action === 'KEEP_REGENERATE').length;
const deleteCount = matrix.filter(m => m.action === 'DELETE').length;
const stitchCount = matrix.filter(m => m.action.includes('STITCH')).length;

console.log(`${'='.repeat(80)}`);
console.log('SUMMARY');
console.log(`${'='.repeat(80)}`);
console.log(`Total: ${matrix.length}`);
console.log(`  RENAME_AND_REPLACE: ${matrix.filter(m => m.action === 'RENAME_AND_REPLACE').length}`);
console.log(`  RENAME_AND_REPLACE_WITH_STITCH: ${stitchCount}`);
console.log(`  KEEP_REGENERATE: ${keepCount}`);
console.log(`  DELETE: ${deleteCount}`);
console.log(`\nStitch images needed: ${stitchCount}`);
console.log(`Pages getting new hero: ${matrix.filter(m => m.impactedPage !== 'NONE').length}`);