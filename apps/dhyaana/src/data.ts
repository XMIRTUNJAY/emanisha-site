export type WorldId = "dhyana" | "gyaan" | "nidra" | "prajna" | "pranayama" | "therapy";

export type World = {
  id: WorldId;
  name: string;
  devanagari: string;
  essence: string;
  description: string;
  cue: string;
  color: string;
};

export const worlds: World[] = [
  {
    id: "dhyana",
    name: "Dhyana",
    devanagari: "ध्यान",
    essence: "Awareness",
    description: "Meditation, witnessing and quiet attention.",
    cue: "Enter stillness",
    color: "#C66B3A",
  },
  {
    id: "gyaan",
    name: "Gyaan",
    devanagari: "ज्ञान",
    essence: "Wisdom",
    description: "Explore ideas from Indian contemplative traditions.",
    cue: "Open the library",
    color: "#A87935",
  },
  {
    id: "nidra",
    name: "Nidra",
    devanagari: "निद्रा",
    essence: "Deep rest",
    description: "Sleep journeys, body scans and evening release.",
    cue: "Rest deeply",
    color: "#8E5B3F",
  },
  {
    id: "prajna",
    name: "Prajna",
    devanagari: "प्रज्ञा",
    essence: "Discernment",
    description: "Structured reflection and compassionate self-inquiry.",
    cue: "Begin inquiry",
    color: "#916F5A",
  },
  {
    id: "pranayama",
    name: "Pranayama",
    devanagari: "प्राणायाम",
    essence: "Vitality",
    description: "Guided breath awareness and foundational techniques.",
    cue: "Follow the breath",
    color: "#75846A",
  },
  {
    id: "therapy",
    name: "Therapy",
    devanagari: "विश्राम",
    essence: "Restoration",
    description: "Nature, sound and gentle restorative experiences.",
    cue: "Find restoration",
    color: "#577266",
  },
];

export type JourneyDay = {
  day: number;
  title: string;
  practice: string;
  minutes: number;
  world: WorldId;
  intention: string;
};

export type Journey = {
  id: string;
  title: string;
  eyebrow: string;
  days: number;
  description: string;
  dayPlans: JourneyDay[];
};

type DaySeed = [title: string, practice: string, minutes?: number, world?: WorldId];

function buildDays(defaultWorld: WorldId, defaultMinutes: number, seeds: DaySeed[]): JourneyDay[] {
  return seeds.map(([title, practice, minutes, world], index) => ({
    day: index + 1,
    title,
    practice,
    minutes: minutes ?? defaultMinutes,
    world: world ?? defaultWorld,
    intention: practice.toLowerCase(),
  }));
}

const vedicReset = buildDays("dhyana", 6, [
  ["Arrive", "Body awareness", 5],
  ["Make room", "Natural breath", 7],
  ["Notice", "Thoughts as events", 6],
  ["Choose", "A personal sankalpa", 8, "prajna"],
  ["Return", "Open awareness", 10],
  ["Ground", "Feet, seat, spine", 5],
  ["Breathe", "Equal breath 4-4", 6, "pranayama"],
  ["Listen", "Sound without naming", 6, "therapy"],
  ["Release", "Evening letting go", 7, "nidra"],
  ["Reflect", "Name what is here", 8, "prajna"],
  ["Soften", "Jaw, shoulders, belly", 6],
  ["Walk", "Attention in motion", 7, "therapy"],
  ["Study", "One sutra, one question", 8, "gyaan"],
  ["Rest", "Short Yoga Nidra", 12, "nidra"],
  ["Return", "Mindful re-entry", 5],
  ["Focus", "One-point attention", 8],
  ["Mantra", "Japa and listening", 7, "gyaan"],
  ["Gratitude", "A quiet reckoning", 6, "prajna"],
  ["Space", "Open awareness", 10],
  ["Integrate", "Practice in daily life", 8, "gyaan"],
  ["Continue", "Carry the thread", 10],
]);

const panchaKosha = buildDays("dhyana", 7, [
  ["Annamaya", "The physical body", 6],
  ["Annamaya", "Eating with attention", 5],
  ["Pranamaya", "The breath body", 7, "pranayama"],
  ["Pranamaya", "Extending the exhale", 6, "pranayama"],
  ["Manomaya", "The mental body", 7],
  ["Manomaya", "Watching a thought arrive", 8],
  ["Vijnanamaya", "The wisdom body", 8, "gyaan"],
  ["Vijnanamaya", "Who is noticing?", 9, "prajna"],
  ["Anandamaya", "The body of ease", 10, "nidra"],
  ["Anandamaya", "Rest without effort", 10, "nidra"],
]);

const dinacharya = buildDays("dhyana", 5, [
  ["Brahma Muhurta", "Before the world wakes", 6],
  ["Morning", "Set one clear intention", 5, "prajna"],
  ["Midday", "Three-minute reset", 3],
  ["Afternoon", "Walk with attention", 7, "therapy"],
  ["Evening", "Release the working day", 6, "nidra"],
  ["Dusk", "A gentle transition", 7, "pranayama"],
  ["Night", "Rest and re-entry", 10, "nidra"],
]);

const mantraJapa = buildDays("gyaan", 6, [
  ["Om", "The root sound", 6],
  ["So Ham", "Breath as mantra", 6, "pranayama"],
  ["Gayatri", "A steady rhythm", 7],
  ["Shanti", "Repeating peace", 6],
  ["Lokah", "Widening the wish", 7],
  ["Mrityunjaya", "Meeting fear gently", 8],
  ["Silence", "After the repetition", 8],
]);

const sleepYatra = buildDays("nidra", 12, [
  ["Night one", "Arriving in bed", 10],
  ["Night two", "The weight of the body", 11],
  ["Night three", "Breath at the nostrils", 10],
  ["Night four", "Letting the day fall away", 12],
  ["Night five", "A slower body scan", 14],
  ["Night six", "Points of contact", 12],
  ["Night seven", "The space between sounds", 13],
  ["Night eight", "A sankalpa for rest", 12],
  ["Night nine", "Cooling the mind", 14],
  ["Night ten", "The long exhale", 15],
  ["Night eleven", "No effort left", 16],
  ["Night twelve", "Rest without watching", 18],
  ["Night thirteen", "Waking gently", 10],
  ["Night fourteen", "Carry the rest forward", 12],
]);

const oneMinuteReset = buildDays("dhyana", 1, [
  ["Pause", "One breath, nothing more", 1],
  ["Soften", "Release the jaw and shoulders", 1],
  ["Notice", "Name what is here", 1, "prajna"],
  ["Listen", "One sound, fully", 1, "therapy"],
  ["Return", "Feel the feet again", 1],
]);

export const journeys: Journey[] = [
  {
    id: "vedic-reset",
    title: "21-Day Vedic Reset",
    eyebrow: "Foundation",
    days: 21,
    description: "A gentle daily rhythm of awareness, breath and reflection.",
    dayPlans: vedicReset,
  },
  {
    id: "pancha-kosha",
    title: "Pancha Kosha",
    eyebrow: "Five-layer journey",
    days: 10,
    description: "Explore the body, breath, mind, discernment and ease.",
    dayPlans: panchaKosha,
  },
  {
    id: "dinacharya",
    title: "Dinacharya",
    eyebrow: "Daily rhythm",
    days: 7,
    description: "Shape a contemplative practice around the arc of your day.",
    dayPlans: dinacharya,
  },
  {
    id: "mantra-japa",
    title: "Mantra & Japa",
    eyebrow: "Sound and attention",
    days: 7,
    description: "An accessible introduction to repetition and attentive listening.",
    dayPlans: mantraJapa,
  },
  {
    id: "sleep-yatra",
    title: "Sleep Yatra",
    eyebrow: "Evening practice",
    days: 14,
    description: "Build a softer passage from activity into restorative rest.",
    dayPlans: sleepYatra,
  },
  {
    id: "one-minute-reset",
    title: "One-Minute Reset",
    eyebrow: "Anytime practice",
    days: 5,
    description: "Small pauses for returning to what is here.",
    dayPlans: oneMinuteReset,
  },
];

export type KnowledgeEntry = {
  id: string;
  term: string;
  devanagari: string;
  transliteration: string;
  meaning: string;
  body: string;
  source: string;
  question: string;
  status: "available" | "planned";
};

export const knowledge: KnowledgeEntry[] = [
  {
    id: "sankalpa",
    term: "Sankalpa",
    devanagari: "संकल्प",
    transliteration: "saṅkalpa",
    meaning: "A considered intention",
    body: "In this modern practice context, a sankalpa is a concise intention that helps orient attention and action. It is not a promise of a particular outcome.",
    source: "Contemplative practice note",
    question: "What intention is small enough to keep today?",
    status: "available",
  },
  {
    id: "sakshi",
    term: "Sakshi",
    devanagari: "साक्षी",
    transliteration: "sākṣī",
    meaning: "The witness",
    body: "A useful lens for noticing experience without immediately becoming entangled in it. Here, we explore it as a contemplative idea rather than a fixed claim.",
    source: "Contemplative practice note",
    question: "What changes when you watch a feeling instead of becoming it?",
    status: "available",
  },
  {
    id: "pratyahara",
    term: "Pratyahara",
    devanagari: "प्रत्याहार",
    transliteration: "pratyāhāra",
    meaning: "Turning inward",
    body: "Often discussed as the fifth limb in Patañjali’s eightfold yoga, pratyahara concerns the relationship between awareness and sensory experience.",
    source: "Yoga Sutra 2.54–2.55 (orientation)",
    question: "Which input could you set down for one hour today?",
    status: "available",
  },
  {
    id: "chitta-vritti",
    term: "Chitta Vritti",
    devanagari: "चित्तवृत्ति",
    transliteration: "citta-vṛtti",
    meaning: "The movements of the mind",
    body: "The fluctuations that fill awareness: thoughts, memories, judgements and plans. Yoga begins not by stopping them but by seeing them clearly.",
    source: "Yoga Sutra 1.2 (orientation)",
    question: "Which movement of mind is loudest right now?",
    status: "available",
  },
  {
    id: "abhyasa",
    term: "Abhyasa",
    devanagari: "अभ्यास",
    transliteration: "abhyāsa",
    meaning: "Steady practice",
    body: "Practice is less a single effort than a direction returned to again and again. Continuity matters more than intensity.",
    source: "Yoga Sutra 1.13–1.14 (orientation)",
    question: "What would returning look like today, even briefly?",
    status: "available",
  },
  {
    id: "vairagya",
    term: "Vairagya",
    devanagari: "वैराग्य",
    transliteration: "vairāgya",
    meaning: "Non-clinging",
    body: "A quiet release of the demand that experience be different. It is not indifference; it is space around the grip.",
    source: "Yoga Sutra 1.15 (orientation)",
    question: "Where are you holding on a little too tightly?",
    status: "available",
  },
  {
    id: "dhyana",
    term: "Dhyana",
    devanagari: "ध्यान",
    transliteration: "dhyāna",
    meaning: "Sustained attention",
    body: "The seventh limb of Patañjali’s eightfold yoga: attention that stays with its object without repeated effort.",
    source: "Yoga Sutra 3.2 (orientation)",
    question: "What is worth your sustained attention?",
    status: "available",
  },
  {
    id: "pranayama",
    term: "Pranayama",
    devanagari: "प्राणायाम",
    transliteration: "prāṇāyāma",
    meaning: "Breath regulation",
    body: "The deliberate cultivation of breath rhythm. In this app we keep to gentle equal breathing and avoid retention.",
    source: "Yoga Sutra 2.49–2.51 (orientation)",
    question: "How does the breath feel before you try to change it?",
    status: "available",
  },
  {
    id: "santosha",
    term: "Santosha",
    devanagari: "संतोष",
    transliteration: "santoṣa",
    meaning: "Contentment",
    body: "One of the niyamas: a willingness to meet what is present without rehearsing lack. Not passivity, but a different starting point.",
    source: "Yoga Sutra 2.42 (orientation)",
    question: "What is already sufficient in this moment?",
    status: "available",
  },
  {
    id: "svadhyaya",
    term: "Svadhyaya",
    devanagari: "स्वाध्याय",
    transliteration: "svādhyāya",
    meaning: "Self-study",
    body: "Reading, reciting and studying that turns attention back toward the self. Study becomes a mirror rather than an accumulation.",
    source: "Yoga Sutra 2.44 (orientation)",
    question: "What are you learning about yourself, not just about the text?",
    status: "available",
  },
  {
    id: "yamas",
    term: "Yamas",
    devanagari: "यम",
    transliteration: "yama",
    meaning: "Ethical restraints",
    body: "The first limb: non-harming, truthfulness, non-stealing, moderation and non-possessiveness. Practice begins in how we treat others.",
    source: "Yoga Sutra 2.30 (orientation)",
    question: "Which restraint would change your day most?",
    status: "available",
  },
  {
    id: "niyamas",
    term: "Niyamas",
    devanagari: "नियम",
    transliteration: "niyama",
    meaning: "Observances",
    body: "The second limb: cleanliness, contentment, discipline, self-study and surrender. Small commitments that shape a life.",
    source: "Yoga Sutra 2.32 (orientation)",
    question: "Which observance are you already practising without naming it?",
    status: "available",
  },
];
