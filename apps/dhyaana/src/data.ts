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
    color: "#696A91",
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

export const journeys = [
  {
    title: "21-Day Vedic Reset",
    eyebrow: "Foundation",
    days: 21,
    description: "A gentle daily rhythm of awareness, breath and reflection.",
    progress: 4,
  },
  {
    title: "Pancha Kosha",
    eyebrow: "Five-layer journey",
    days: 10,
    description: "Explore the body, breath, mind, discernment and ease.",
    progress: 0,
  },
  {
    title: "Dinacharya",
    eyebrow: "Daily rhythm",
    days: 7,
    description: "Shape a contemplative practice around the arc of your day.",
    progress: 0,
  },
  {
    title: "Mantra & Japa",
    eyebrow: "Sound and attention",
    days: 7,
    description: "An accessible introduction to repetition and attentive listening.",
    progress: 0,
  },
  {
    title: "Sleep Yatra",
    eyebrow: "Evening practice",
    days: 14,
    description: "Build a softer passage from activity into restorative rest.",
    progress: 0,
  },
  {
    title: "One-Minute Reset",
    eyebrow: "Anytime practice",
    days: 5,
    description: "Small pauses for returning to what is here.",
    progress: 0,
  },
];

export const practices = [
  {
    title: "Arrive in the body",
    world: "Dhyana",
    minutes: 5,
    note: "A grounded settling practice",
    tone: "clay",
  },
  {
    title: "Moonlit body scan",
    world: "Nidra",
    minutes: 12,
    note: "Release the day gradually",
    tone: "indigo",
  },
  {
    title: "Equal breath",
    world: "Pranayama",
    minutes: 3,
    note: "A gentle, balanced rhythm",
    tone: "sage",
  },
  {
    title: "Forest listening",
    world: "Therapy",
    minutes: 10,
    note: "Rest attention in natural sound",
    tone: "forest",
  },
];

export const knowledge = [
  {
    term: "Sankalpa",
    devanagari: "संकल्प",
    meaning: "A considered intention",
    body: "In this modern practice context, a sankalpa is a concise intention that helps orient attention and action. It is not a promise of a particular outcome.",
  },
  {
    term: "Sakshi",
    devanagari: "साक्षी",
    meaning: "The witness",
    body: "A useful lens for noticing experience without immediately becoming entangled in it. Here, we explore it as a contemplative idea rather than a fixed claim.",
  },
  {
    term: "Pratyahara",
    devanagari: "प्रत्याहार",
    meaning: "Turning inward",
    body: "Often discussed as the fifth limb in Patañjali’s eightfold yoga, pratyahara concerns the relationship between awareness and sensory experience.",
  },
];
