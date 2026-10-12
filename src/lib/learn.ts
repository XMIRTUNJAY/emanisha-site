// Canonical website content model for Learn Marathi.
// Field-for-field subset of the Bol Marathi app source:
//   content/units/unit_*.json + lib/content/generated_vocab.dart
// Generated snapshots live in src/data/learn/*.json (see tools/).

import unitsData from '../data/learn/units.json';
import vocabData from '../data/learn/vocab.json';
import { siteUrl } from './site';

export type Word = {
  id: string;
  marathi: string;
  hindi: string;
  english: string;
  transliteration: string;
  category: string;
  exampleMarathi: string;
  exampleHindi: string;
  exampleEnglish: string;
  note: string;
  noteEn: string;
};

export type GrammarRow = { lesson: number; title: string; titleEn: string; text: string; textEn: string; note?: string };
export type CultureRow = { lesson: number; title: string; titleEn: string; text: string; textEn: string; note?: string };
export type SpeakingRow = { lesson: number; sentence: string; hindi: string; english: string; tip: string };
export type ListeningRow = { lesson: number; marathi: string; hindi: string; english: string; speaker: string };
export type BridgeRow = {
  lesson: number; hindi: string; english: string; marathi: string;
  map: Record<string, string>; mapEn: Record<string, string>;
  grammar: string; grammarEn: string;
};
export type BuilderRow = {
  lesson: number; prompt: string; promptEn: string; tokens: string[];
  answer: string[]; hindi: string; hindiEn: string;
};

export type Unit = {
  unit: string; title: string; titleEn: string; subtitle: string; subtitleEn: string;
  intro: string; goals: string[]; goalsEn: string[]; lessons: number; vocabGroups: string[];
  grammar: GrammarRow[]; cultural: CultureRow[]; speaking: SpeakingRow[];
  listening: ListeningRow[]; bridge: BridgeRow[]; sentenceBuilder: BuilderRow[];
};

export const units = unitsData as Unit[];
export const vocab = vocabData as Word[];

export const wordsByCategory = (categories: string[]): Word[] =>
  vocab.filter((w) => categories.includes(w.category));

// Ordered lookup by Marathi headword. Throws at build time if an entry
// is missing — blog posts fail loudly rather than shipping thin.
export const wordsByMarathi = (list: string[]): Word[] =>
  list.map((m) => {
    const w = vocab.find((x) => x.marathi === m);
    if (!w) throw new Error(`wordsByMarathi: missing "${m}"`);
    return w;
  });

export type Cluster = {
  slug: string;
  title: string;
  description: string;
  intent: string;
  categories: string[];
  unitRefs: string[];
  // Hand-written category intro (100–150 words, strictly descriptive of
  // the data: counts, units, contents, how to use). No linguistic claims
  // beyond the source. Optional practical tip, same rule.
  intro: string;
  tip?: string;
  related: { label: string; href: string }[];
};

// Curated clusters only — every cluster has ≥15 real entries (merged
// small categories). No per-word thin pages.
export const clusters: Cluster[] = [
  {
    slug: 'beginners',
    title: '100+ Marathi Words for Beginners',
    description: 'The first Marathi words to learn: greetings, yes/no, please, numbers and everyday essentials with Hindi and English meanings.',
    intent: 'learn marathi for beginners; marathi words for beginners',
    categories: ['Greetings', 'Phrases', 'Numbers', 'Colors'],
    unitRefs: ['01', '02'],
    intro:
      'Start here. This list gathers the first words every Marathi learner needs: respectful greetings like नमस्कार, yes and no, please and sorry, the numbers 1–20, and basic colors — each with Hindi meaning, English meaning, pronunciation and a real example sentence from Units 01–02 of the Bol Marathi course. Many entries (नमस्कार, धन्यवाद, कृपया) match their Hindi counterparts exactly, so Hindi speakers will recognize a head start. Work down the table saying each word aloud, check it against the Hindi you know, then try the example sentence. When the list feels familiar, greetings phrases and Unit 01 turn recognition into real sentences.',
    tip: 'Say each word aloud before moving on — hearing yourself matters more than re-reading.',
    related: [
      { label: 'Marathi greetings & daily phrases', href: siteUrl('/phrases/greetings/') },
      { label: 'Hindi to Marathi words', href: siteUrl('/hindi-to-marathi/words/') },
      { label: 'Unit 01 — Marathi Fundamentals', href: siteUrl('/lessons/01/') },
    ],
  },
  {
    slug: 'colors',
    title: 'Marathi Colors',
    description: 'Marathi color words — with Hindi meanings, pronunciation and example sentences from the Bol Marathi curriculum.',
    intent: 'marathi colors; marathi colour names',
    categories: ['Colors'],
    unitRefs: ['01', '20'],
    intro:
      'Thirteen Marathi color words with Hindi meanings, pronunciation and examples. Small list, quick win — colors attach to nouns you already know (सफरचंद is लाल, literally in its example sentence), making them ideal first adjectives. Also folded into the beginner list.',
    tip: 'Point at five objects around you and name their colors in Marathi.',
    related: [
      { label: 'Beginner words', href: siteUrl('/vocabulary/beginners/') },
      { label: 'Daily-use Marathi words', href: siteUrl('/vocabulary/daily-life/') },
      { label: 'Unit 20 — Review & Mastery', href: siteUrl('/lessons/20/') },
    ],
  },
  {
    slug: 'food',
    title: 'Marathi Food Words',
    description: 'Marathi words for food, vegetables, grains and eating — with Hindi meanings, pronunciation and example sentences.',
    intent: 'marathi food words; marathi food vocabulary',
    categories: ['Food'],
    unitRefs: ['03'],
    intro:
      'Eighty-four Marathi food words from Unit 03 (Everyday Vocabulary): grains and staples like भात (cooked rice) and भाकरी, vegetables and fruits, spices from हळद to मोहरी, dairy, sweets like मोदक and पुरणपोळी, snacks like चिवडा and चकली, and restaurant words like बिल and थाळी. Every entry carries Hindi and English meanings, pronunciation and an example sentence drawn from real cooking and eating situations. Food vocabulary pulls double duty: it names what is on your plate and supplies the nouns your first Marathi sentences are built from.',
    tip: 'Learn these in kitchen order — grains, vegetables, spices, sweets — instead of alphabetically.',
    related: [
      { label: 'Daily-use Marathi words', href: siteUrl('/vocabulary/daily-life/') },
      { label: 'Daily conversation phrases', href: siteUrl('/phrases/daily/') },
      { label: 'Unit 03 — Everyday Vocabulary', href: siteUrl('/lessons/03/') },
    ],
  },
  {
    slug: 'family',
    title: 'Marathi Family Words',
    description: 'Marathi words for family members and people — with Hindi meanings, pronunciation and examples.',
    intent: 'marathi family words; marathi relations',
    categories: ['Family', 'People', 'Pronouns'],
    unitRefs: ['03', '05'],
    intro:
      'The words for the people around you: family members, everyday people-words and the pronouns that point at them (मी, तू, तो and friends), drawn from Units 03 and 05. Each entry has Hindi and English meanings, pronunciation and an example. Family words are high-frequency by nature — you will use them in nearly every conversation — and they pair directly with the pronouns grammar topic, which explains the full paradigm these words appear with.',
    tip: 'Learn each family word together with its pronoun: माझा भाऊ, माझी बहीण.',
    related: [
      { label: 'Marathi pronouns (grammar)', href: siteUrl('/grammar/pronouns/') },
      { label: 'Beginner words', href: siteUrl('/vocabulary/beginners/') },
      { label: 'Unit 05 — Pronouns & People', href: siteUrl('/lessons/05/') },
    ],
  },
  {
    slug: 'travel',
    title: 'Marathi Travel Words & Phrases',
    description: 'Marathi words for travel, directions, tickets and stays — plus the phrases travellers actually use.',
    intent: 'marathi travel words; marathi travel phrases',
    categories: ['Travel', 'Directions'],
    unitRefs: ['14', '15'],
    intro:
      'Sixty-six Marathi travel words from Units 14–15: transport and tickets, stations and stays, directions like वर (on) and खाली (under), and the places of Maharashtra from the Sahyadri to the Konkan coast. Every entry has Hindi and English meanings, pronunciation and an example sentence — many drawn from ticket counters, platforms and roads. Pair this list with the travel phrases: words name the things, phrases get you there.',
    tip: 'Learn direction words in opposite pairs: वर/खाली, मागे/पुढे.',
    related: [
      { label: 'Travel phrases', href: siteUrl('/phrases/travel/') },
      { label: 'Shopping & market words', href: siteUrl('/vocabulary/shopping/') },
      { label: 'Unit 14 — Nature & Travel', href: siteUrl('/lessons/14/') },
    ],
  },
  {
    slug: 'shopping',
    title: 'Marathi Shopping & Market Words',
    description: 'Marathi words for shopping, price, bargaining and the market — with numbers for prices.',
    intent: 'marathi shopping words; marathi market phrases',
    categories: ['Shopping', 'Numbers'],
    unitRefs: ['09'],
    intro:
      'Marathi for the market, from Unit 09: shopping and bargaining words together with the numbers that make prices work. Each entry carries Hindi and English meanings, pronunciation and an example — many set at stalls and counters. Small category, high leverage: a dozen shopping words plus numbers cover most market conversations. Practice by pricing everything you see.',
    tip: 'Combine a number with a shopping word out loud: barely a sentence, already useful.',
    related: [
      { label: 'Numbers & time', href: siteUrl('/vocabulary/numbers-time/') },
      { label: 'Travel words', href: siteUrl('/vocabulary/travel/') },
      { label: 'Unit 09 — Shopping & Market', href: siteUrl('/lessons/09/') },
    ],
  },
  {
    slug: 'numbers-time',
    title: 'Marathi Numbers, Time & Days',
    description: 'Marathi numbers, clock time, days and seasons — with Hindi meanings and pronunciation.',
    intent: 'marathi numbers; marathi time; marathi days',
    categories: ['Numbers', 'Time'],
    unitRefs: ['01', '16'],
    intro:
      'Count and tell time in Marathi: numbers 1–20, the tens to 90, 100 and ordinals, plus clock time, days, weeks, months and seasons from Units 01 and 16. Every entry has Hindi and English meanings, pronunciation and an example sentence. Numbers unlock prices, times and dates; time words unlock plans. The dedicated numbers page covers counting in depth, and the days-and-months page covers the calendar.',
    tip: 'Read clocks and price tags in Marathi for a week — passive exposure that sticks.',
    related: [
      { label: 'Shopping words (prices)', href: siteUrl('/vocabulary/shopping/') },
      { label: 'Beginner words', href: siteUrl('/vocabulary/beginners/') },
      { label: 'Unit 16 — Time & Seasons', href: siteUrl('/lessons/16/') },
    ],
  },
  {
    slug: 'verbs',
    title: 'Essential Marathi Verbs',
    description: 'The most useful Marathi verbs — eat, drink, go, come, do — with Hindi meanings and sentence examples.',
    intent: 'marathi verbs; marathi action words',
    categories: ['Verbs'],
    unitRefs: ['02', '04'],
    intro:
      'One hundred and five Marathi verbs — the engine room of the language. Eat, drink, go, come, do, and a hundred more, each with Hindi and English meanings, pronunciation and an example sentence from Units 02 and 04. Verbs are where Marathi diverges most visibly from English: they sit at the end of the sentence, so every verb you learn here slots straight into the sentence-structure pattern. Learn them with their examples, not alone.',
    tip: 'For each verb, say its example sentence — the ending is the lesson.',
    related: [
      { label: 'Marathi verbs (grammar)', href: siteUrl('/grammar/verbs/') },
      { label: 'Sentence structure', href: siteUrl('/grammar/sentence-structure/') },
      { label: 'Unit 04 — Core Sentence Patterns', href: siteUrl('/lessons/04/') },
    ],
  },
  {
    slug: 'daily-life',
    title: 'Marathi Words for Daily Life',
    description: 'Marathi words for home, routine, body and everyday objects — the vocabulary daily conversation is built from.',
    intent: 'marathi daily use words; marathi home words',
    categories: ['Home', 'Routine', 'Body', 'Adjectives', 'Adverbs'],
    unitRefs: ['03', '10'],
    intro:
      'The vocabulary of an ordinary day: home and household objects, daily routine, body parts, and the describing words (adjectives) and how-words (adverbs) that flesh out sentences — from Units 03 and 10. Each entry has Hindi and English meanings, pronunciation and an example. This is the largest cluster because daily life needs the most words; adjectives and adverbs are included here since they modify exactly these nouns and verbs.',
    tip: 'Narrate your routine in Marathi as you do it — brushing, cooking, leaving.',
    related: [
      { label: 'Food words', href: siteUrl('/vocabulary/food/') },
      { label: 'Daily conversation phrases', href: siteUrl('/phrases/daily/') },
      { label: 'Unit 03 — Everyday Vocabulary', href: siteUrl('/lessons/03/') },
    ],
  },
];

export type PhraseSet = {
  slug: string;
  title: string;
  description: string;
  intent: string;
  unitRefs: string[];
  intro: string;
  tip?: string;
  related: { label: string; href: string }[];
};

export const phraseSets: PhraseSet[] = [
  {
    slug: 'greetings',
    title: 'Marathi Greetings & Polite Phrases',
    description: 'How to greet, thank, apologise and be polite in Marathi — with Hindi and English meanings.',
    intent: 'marathi greetings; namaskar in marathi',
    unitRefs: ['01'],
    intro:
      'The phrases that open doors: नमस्कार for hello, धन्यवाद for thanks, माफ करा for sorry and excuse-me — each with Hindi and English meanings, a speaking tip and the Unit 01 sentences they come from. Politeness travels well: these three phrases cover most first-contact situations. Say each aloud twice before moving on.',
    tip: 'नमस्कार works any time of day; add शुभ सकाळ mornings and शुभ रात्री nights.',
    related: [
      { label: 'Beginner words', href: siteUrl('/vocabulary/beginners/') },
      { label: 'Daily conversation', href: siteUrl('/phrases/daily/') },
      { label: 'Unit 01 — Marathi Fundamentals', href: siteUrl('/lessons/01/') },
    ],
  },
  {
    slug: 'daily',
    title: 'Marathi Phrases for Daily Conversation',
    description: 'Everyday Marathi sentences — introductions, needs, feelings — mapped from Hindi so Hindi speakers get them instantly.',
    intent: 'marathi daily conversation; daily use marathi sentences',
    unitRefs: ['01', '02'],
    intro:
      'Everyday Marathi sentences from Units 01–02: introductions (माझं नाव…), needs (मला पाणी पाहिजे), states (मी ठीक आहे) — each with Hindi and English meanings plus a tip that unpacks the grammar inside. These are complete thoughts, not word lists: memorize five and you can survive small talk. Each one also appears as a bridge lesson showing exactly how the Hindi equivalent maps over.',
    tip: 'Pick three sentences and use them today, even talking to yourself.',
    related: [
      { label: 'Hindi to Marathi phrases', href: siteUrl('/hindi-to-marathi/phrases/') },
      { label: 'Essential verbs', href: siteUrl('/vocabulary/verbs/') },
      { label: 'Unit 02 — Survival Marathi', href: siteUrl('/lessons/02/') },
    ],
  },
  {
    slug: 'travel',
    title: 'Marathi Travel Phrases',
    description: 'Tickets, stations, stays and directions — the Marathi phrases travellers need, with Hindi meanings.',
    intent: 'marathi travel phrases',
    unitRefs: ['14', '15'],
    intro:
      'Tickets, stations, stays and directions from Units 14–15: the Marathi sentences travellers actually say, each with Hindi and English meanings and a speaking tip. Learn the ten you need for your next trip rather than the whole list — then let the travel vocabulary fill in the nouns.',
    tip: 'Before a trip, memorize the transport and stay sentences first.',
    related: [
      { label: 'Travel words', href: siteUrl('/vocabulary/travel/') },
      { label: 'Shopping words', href: siteUrl('/vocabulary/shopping/') },
      { label: 'Unit 14 — Nature & Travel', href: siteUrl('/lessons/14/') },
    ],
  },
  {
    slug: 'shopping',
    title: 'Marathi Shopping Phrases',
    description: 'Bargain in Marathi: how much, reduce a little, bill please — real Unit 09 sentences with Hindi and English meanings.',
    intent: 'marathi shopping phrases; bargaining in marathi',
    unitRefs: ['09'],
    intro:
      'Six sentences from Unit 09 (Shopping & Market) that cover a whole market trip: asking the price, naming a quantity, bargaining politely, accepting, paying online and asking for the bill. Each has Hindi and English meanings plus a speaking tip. Memorize these six before your next market visit.',
    tip: 'थोडं कमी करा, कृपया — polite bargaining in one line.',
    related: [
      { label: 'Shopping & market words', href: siteUrl('/vocabulary/shopping/') },
      { label: 'Daily conversation', href: siteUrl('/phrases/daily/') },
      { label: 'Unit 09 — Shopping & Market', href: siteUrl('/lessons/09/') },
    ],
  },
];

export type GrammarTopic = {
  slug: string;
  title: string;
  description: string;
  intent: string;
  unitRefs: string[];
  // Explicit {unit, lessons} picks — every row shown is verified to
  // belong to the topic (no keyword guessing across note bodies).
  picks: { unit: string; lessons: number[] }[];
  intro: string;
  tip?: string;
  related: { label: string; href: string }[];
};

export const grammarTopics: GrammarTopic[] = [
  {
    slug: 'pronouns',
    title: 'Marathi Pronouns',
    description: 'I, you, he/she, we, they in Marathi — with Hindi comparison and example sentences from the curriculum.',
    intent: 'marathi pronouns; mi tu to in marathi',
    unitRefs: ['01', '05', '07'],
    picks: [
      { unit: '05', lessons: [1, 2, 3, 4, 5, 6] },
      { unit: '01', lessons: [4] },
    ],
    intro:
      'I, you, he, she, we, they — the full Marathi pronoun paradigm from Unit 05, plus demonstratives, interrogatives, reflexives, honorifics and kinship terms, with the introductory मी lesson from Unit 01. Each note carries Marathi explanation and English meaning. Pronouns are small, frequent and load-bearing: get them right and every sentence you build stands straighter.',
    tip: 'Master मी, तू/तुम्ही and तो/ती first — the rest is refinement.',
    related: [
      { label: 'Family words', href: siteUrl('/vocabulary/family/') },
      { label: 'Sentence structure', href: siteUrl('/grammar/sentence-structure/') },
      { label: 'Unit 05 — Pronouns & People', href: siteUrl('/lessons/05/') },
    ],
  },
  {
    slug: 'verbs',
    title: 'Marathi Verbs & Tenses',
    description: 'How Marathi verbs work — everyday verbs, continuous tense and the SOV sentence pattern, compared with Hindi.',
    intent: 'marathi verbs grammar; marathi tenses',
    unitRefs: ['01', '04', '21'],
    picks: [
      { unit: '04', lessons: [3, 4, 5, 6] },
      { unit: '01', lessons: [5] },
      { unit: '21', lessons: [5, 6] },
    ],
    intro:
      'How Marathi verbs work: movement and compound verbs, ability and obligation forms, the introductory verbs lesson from Unit 01, and advanced passive and causative voice from Unit 21. Each note has Marathi explanation and English meaning. Since Marathi verbs close every sentence, this topic pairs naturally with sentence structure and the essential-verbs word list.',
    tip: 'Read every example to its last word — the verb is the point.',
    related: [
      { label: 'Essential verbs', href: siteUrl('/vocabulary/verbs/') },
      { label: 'Sentence structure', href: siteUrl('/grammar/sentence-structure/') },
      { label: 'Unit 04 — Core Sentence Patterns', href: siteUrl('/lessons/04/') },
    ],
  },
  {
    slug: 'sentence-structure',
    title: 'Marathi Sentence Structure',
    description: 'Marathi is Subject–Object–Verb, like Hindi. Learn the pattern with real examples and sentence-building practice.',
    intent: 'marathi sentence structure; marathi grammar',
    unitRefs: ['01', '04', '08'],
    picks: [
      { unit: '01', lessons: [6] },
      { unit: '04', lessons: [1, 2] },
      { unit: '08', lessons: [1, 2] },
    ],
    intro:
      'Marathi runs subject–object–verb — like Hindi, unlike English. These notes trace the pattern from its first statement (Unit 01) through objects and dative constructions (Unit 04) to the postpositions that anchor location and relation (Unit 08: मध्ये, वर and friends). With Hindi comparison and English meanings throughout. Internalize this one pattern and the sentence-builder exercises start feeling obvious.',
    tip: 'Take any English sentence, move the verb to the end, and check against the examples.',
    related: [
      { label: 'Hindi to Marathi sentences', href: siteUrl('/hindi-to-marathi/phrases/') },
      { label: 'Marathi verbs', href: siteUrl('/grammar/verbs/') },
      { label: 'Unit 01 — Marathi Fundamentals', href: siteUrl('/lessons/01/') },
    ],
  },
  {
    slug: 'questions',
    title: 'Marathi Question Words: What, Where, When, How, Who, Why',
    description: 'Ask anything in Marathi: काय, कुठे, कधी, कसे, कोण, का — all six question words with examples from Unit 07.',
    intent: 'marathi question words; how to ask questions in marathi',
    unitRefs: ['07'],
    picks: [{ unit: '07', lessons: [1, 2, 3, 4, 5, 6] }],
    intro:
      'All six Marathi question words from Unit 07 — काय (what), कुठे (where), कधी (when), कसे (how), कोण (who), का (why) — each as a full lesson note with Marathi explanation and English meaning. Questions unlock every conversation: with these six plus the verbs list, you can ask about anything.',
    tip: 'Learn them as a set of six, then attach each to a verb you know.',
    related: [
      { label: 'Essential verbs', href: siteUrl('/vocabulary/verbs/') },
      { label: 'Marathi pronouns', href: siteUrl('/grammar/pronouns/') },
      { label: 'Unit 07 — Questions & Inquiry', href: siteUrl('/lessons/07/') },
    ],
  },
  {
    slug: 'postpositions',
    title: 'Marathi Postpositions: In, On, Under, Near & More',
    description: 'Marathi location words — मध्ये, वर, खाली, शेजारी and more — with examples from Unit 08.',
    intent: 'marathi postpositions; location words in marathi',
    unitRefs: ['08'],
    picks: [{ unit: '08', lessons: [1, 2, 3, 4, 5, 6] }],
    intro:
      'Where things are: all six Unit 08 postposition lessons — in/inside, on/above, under/below, near/beside, behind/ahead, from/until — with Marathi explanations and English meanings. Postpositions follow the noun (unlike English prepositions), which is exactly why they pair with the sentence-structure pattern.',
    tip: 'Practice each with one noun: घरात, घरावर, घराखाली.',
    related: [
      { label: 'Sentence structure', href: siteUrl('/grammar/sentence-structure/') },
      { label: 'Marathi verbs', href: siteUrl('/grammar/verbs/') },
      { label: 'Unit 08 — Postpositions', href: siteUrl('/lessons/08/') },
    ],
  },
];

export const getUnit = (no: string): Unit => {
  const u = units.find((x) => x.unit === no);
  if (!u) throw new Error(`Unknown unit: ${no}`);
  return u;
};

// Search-oriented H1s per unit. Derived from the verified curriculum
// (unit titles + focus column in bol_marathi/content/units/README.md).
// URLs and curriculum identity are unchanged — only the displayed H1
// and title answer search intent.
export const unitSeo: Record<string, { h1: string; blurb: string }> = {
  '01': { h1: 'Marathi Basics for Beginners: Greetings, First Words & Sentences', blurb: 'Alphabet, greetings and your first 50 words.' },
  '02': { h1: 'Survival Marathi: Essential Verbs & Everyday Questions', blurb: 'Possession, questions and verbs for daily situations.' },
  '03': { h1: 'Everyday Marathi Vocabulary: Family, Home & Food Words', blurb: '100+ high-frequency words for home life.' },
  '04': { h1: 'Marathi Sentence Patterns: Build Correct SOV Sentences', blurb: 'Movement verbs, compound verbs and ability.' },
  '05': { h1: 'Marathi Pronouns & People: I, You, He, She Explained', blurb: 'Full pronoun paradigm plus kinship words.' },
  '06': { h1: 'Marathi Pronunciation Guide: Sounds Hindi Speakers Must Learn', blurb: 'Retroflex, nasal, visarga and anusvara.' },
  '07': { h1: 'Marathi Questions: Question Words & How to Ask Anything', blurb: 'Question words and their everyday usage.' },
  '08': { h1: 'Marathi Postpositions: Location & Relation Markers', blurb: 'The small words that anchor every sentence.' },
  '09': { h1: 'Marathi Shopping Words: Market, Price & Bargaining', blurb: 'Price, units and bargaining phrases.' },
  '10': { h1: 'Marathi Health Words: Body, Symptoms & Doctor Visits', blurb: 'Describe symptoms and visit a doctor.' },
  '11': { h1: 'Marathi for School & Work: Education and Office Words', blurb: 'School, interviews and office life.' },
  '12': { h1: 'Marathi Technology Words: Devices, Internet & Safety', blurb: 'Talk about phones, internet and safety.' },
  '13': { h1: 'Marathi Festivals & Culture: Ganesh, Diwali, Gudi Padwa', blurb: 'Festival words and cultural context.' },
  '14': { h1: 'Marathi Nature & Travel Words: Sahyadri, Konkan & Wildlife', blurb: 'Landscapes, travel and wildlife.' },
  '15': { h1: 'Marathi Travel Phrases: Tickets, Stations & Stays', blurb: 'Book, navigate and stay anywhere in Maharashtra.' },
  '16': { h1: 'Marathi Numbers, Time & Seasons: Clock, Calendar, Days', blurb: 'Tell time and talk about seasons.' },
  '17': { h1: 'Marathi Emotions & Feelings Words: Joy, Sorrow, Empathy', blurb: 'Say how you feel, precisely.' },
  '18': { h1: 'Marathi Hobbies & Leisure Words: Sports, Arts & Practice', blurb: 'Talk about what you love doing.' },
  '19': { h1: 'Marathi for Work & Career: Jobs, Interviews & Growth', blurb: 'Job search and workplace language.' },
  '20': { h1: 'Marathi Review & Mastery Test: Everything So Far', blurb: 'Cumulative review across all topics.' },
  '21': { h1: 'Advanced Marathi Grammar: Prefixes, Compounds & Voice', blurb: 'Take grammar beyond the basics.' },
  '22': { h1: 'Marathi Literature & Poetry: Saints to Modern Poets', blurb: 'Abhanga, ovi and modern poetry.' },
  '23': { h1: 'Business Marathi: Trade, Finance & Contracts', blurb: 'Professional and commercial language.' },
  '24': { h1: 'Marathi Media & News Words: Press, Broadcast & Social', blurb: 'Follow Marathi news and media.' },
  '25': { h1: 'Advanced Marathi Conversation: Debate & Presentation', blurb: 'Argue, present and persuade.' },
  '26': { h1: 'Marathi Final Assessment: Mock Exam & Certificate', blurb: 'Prove your Marathi end to end.' },
  '27': { h1: '7-Day Marathi Challenge: Day-by-Day Sprint', blurb: 'Greetings to revision in seven daily wins.' },
  '28': { h1: 'Marathi Pronouns (Sarvanam): मी to स्वतः', blurb: 'Personal, possessive and question pronouns.' },
  '29': { h1: 'Marathi Words & Meanings: Shabdarth Lists', blurb: 'Letter words, synonyms and antonyms.' },
  '30': { h1: 'Hindi to Marathi Phrases: Daily Translation', blurb: 'Say daily Hindi lines in Marathi.' },
  '31': { h1: 'Marathi Top-Up Bundle: Family, Weather & More', blurb: 'Bank, tech, quiz and thin-topic top-ups.' },
};

/** Phrases for a set: speaking rows of referenced units (real app content). */
export const phrasesFor = (set: PhraseSet): (SpeakingRow & { unit: string })[] =>
  set.unitRefs.flatMap((no) => getUnit(no).speaking.map((s) => ({ ...s, unit: no })));

/** Bridge rows (Hindi→Marathi) of referenced units. */
export const bridgesFor = (unitRefs: string[]): (BridgeRow & { unit: string })[] =>
  unitRefs.flatMap((no) => getUnit(no).bridge.map((b) => ({ ...b, unit: no })));
