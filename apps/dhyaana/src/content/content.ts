import raw from "./dhyaana.json";
import daysRaw from "./journey-days.json";

/**
 * Content database loader.
 *
 * All Dhyaana content lives in ./dhyaana.json and ./journey-days.json so it
 * can be edited and validated as data rather than as code. This module turns
 * those files into the shapes the UI expects.
 *
 * Run `npm run content:dhyaana` (tools/validate-dhyaana-content.mjs) to check
 * the data before building.
 */

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

type WorldSeed = (typeof raw.worlds)[number];

/**
 * The JSON import gives TypeScript a union of every literal shape in the
 * file, which loses the optional `world` key and widens it to `string`.
 * Widen both to the shapes the loader actually reads.
 */
type JourneySeed = {
  id: string;
  title: string;
  eyebrow: string;
  days: number;
  description: string;
  defaultWorld: WorldId;
  defaultMinutes: number;
};

type DaySeed = {
  title: string;
  practice: string;
  minutes?: number;
  world?: WorldId;
};

export const worlds: World[] = raw.worlds as World[];

export const journeys: Journey[] = (raw.journeys as JourneySeed[]).map((journey) => {
  const seeds = (daysRaw.journeyDays as Record<string, DaySeed[]>)[journey.id] ?? [];
  const dayPlans: JourneyDay[] = seeds.map((seed, index) => ({
    day: index + 1,
    title: seed.title,
    practice: seed.practice,
    minutes: seed.minutes ?? journey.defaultMinutes,
    world: seed.world ?? journey.defaultWorld,
    intention: seed.practice.toLowerCase(),
  }));
  return {
    id: journey.id,
    title: journey.title,
    eyebrow: journey.eyebrow,
    days: journey.days,
    description: journey.description,
    dayPlans,
  };
});

export const knowledge: KnowledgeEntry[] = raw.knowledge as KnowledgeEntry[];
