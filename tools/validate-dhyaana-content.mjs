// Content QA gate for the Dhyaana content database.
// Run: npm run content:dhyaana   (also runs inside the Dhyaana build, so a
// broken dataset blocks the deploy).
//
// Fails on: schema violations, duplicate ids, day counts that disagree with
// the plan, unknown world references, orphaned journey days, empty or
// suspiciously thin fields, and journeys whose description is too short to
// stand on its own.
//
// Warnings on: world ids that are declared but never used, knowledge entries
// with a very short body, and days that reuse the same title.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const contentDir = join(root, 'apps', 'dhyaana', 'src', 'content');

const WORLD_IDS = ['dhyana', 'gyaan', 'nidra', 'prajna', 'pranayama', 'therapy'];
const DEVANAGARI = /[ऀ-ॿ]/;
const MIN_KNOWLEDGE_BODY = 60;
const MIN_JOURNEY_DESC = 30;

const fails = [];
const warns = [];
const fail = (msg) => fails.push(msg);
const warn = (msg) => warns.push(msg);

const load = (name) => {
  const file = join(contentDir, name);
  if (!existsSync(file)) {
    fail(`${name}: missing`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    fail(`${name}: invalid JSON (${e.message})`);
    return null;
  }
};

const db = load('dhyaana.json');
const days = load('journey-days.json');
if (!db || !days) {
  console.error('Dhyaana content: FAILED');
  for (const f of fails) console.error('  FAIL  ' + f);
  process.exit(1);
}

// ---------------------------------------------------------------- structure
if (db.version !== 1) fail(`dhyaana.json: version must be 1, got ${db.version}`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(db.updatedAt ?? '')) {
  fail(`dhyaana.json: updatedAt must be YYYY-MM-DD, got "${db.updatedAt}"`);
}

// -------------------------------------------------------------------- worlds
const worlds = db.worlds ?? [];
const worldIds = new Set();
for (const w of worlds) {
  for (const field of ['id', 'name', 'devanagari', 'essence', 'description', 'cue', 'color']) {
    if (!w?.[field]) fail(`worlds: "${w?.id ?? '?'}" missing ${field}`);
  }
  if (!WORLD_IDS.includes(w?.id)) fail(`worlds: unknown id "${w?.id}"`);
  if (worldIds.has(w?.id)) fail(`worlds: duplicate id "${w?.id}"`);
  worldIds.add(w?.id);
  if (w?.color && !/^#[0-9A-Fa-f]{6}$/.test(w.color)) {
    fail(`worlds: "${w.id}" color must be #RRGGBB, got "${w.color}"`);
  }
  if (w?.devanagari && !DEVANAGARI.test(w.devanagari)) {
    fail(`worlds: "${w.id}" devanagari has no Devanagari characters`);
  }
}
for (const id of WORLD_IDS) {
  if (!worldIds.has(id)) fail(`worlds: missing required world "${id}"`);
}

// ------------------------------------------------------------------ journeys
const journeys = db.journeys ?? [];
const journeyIds = new Set();
for (const j of journeys) {
  for (const field of ['id', 'title', 'eyebrow', 'description', 'defaultWorld', 'defaultMinutes']) {
    if (!j?.[field]) fail(`journeys: "${j?.id ?? '?'}" missing ${field}`);
  }
  if (journeyIds.has(j?.id)) fail(`journeys: duplicate id "${j?.id}"`);
  journeyIds.add(j?.id);
  if (!/^[a-z0-9-]+$/.test(j?.id ?? '')) {
    fail(`journeys: "${j?.id}" id must be kebab-case`);
  }
  if (!Number.isInteger(j?.days) || j.days < 1) {
    fail(`journeys: "${j?.id}" days must be a positive integer`);
  }
  if (!worldIds.has(j?.defaultWorld)) {
    fail(`journeys: "${j?.id}" unknown defaultWorld "${j?.defaultWorld}"`);
  }
  if (!Number.isInteger(j?.defaultMinutes) || j.defaultMinutes < 1 || j.defaultMinutes > 60) {
    fail(`journeys: "${j?.id}" defaultMinutes must be 1..60`);
  }
  if ((j?.description ?? '').length < MIN_JOURNEY_DESC) {
    fail(`journeys: "${j?.id}" description is too short (${j?.description?.length ?? 0} chars)`);
  }
}

// --------------------------------------------------------------- journey days
const journeyDays = days.journeyDays ?? {};
for (const [journeyId, list] of Object.entries(journeyDays)) {
  const journey = journeys.find((j) => j.id === journeyId);
  if (!journey) {
    fail(`journey-days: "${journeyId}" has no matching journey`);
    continue;
  }
  if (!Array.isArray(list) || !list.length) {
    fail(`journey-days: "${journeyId}" has no days`);
    continue;
  }
  if (list.length !== journey.days) {
    fail(`journey-days: "${journeyId}" has ${list.length} days but the journey declares ${journey.days}`);
  }
  const titles = new Map();
  for (const [index, day] of list.entries()) {
    const label = `journey-days: "${journeyId}" day ${index + 1}`;
    if (!day?.title) fail(`${label} missing title`);
    if (!day?.practice) fail(`${label} missing practice`);
    if (!Number.isInteger(day?.minutes) || day.minutes < 1 || day.minutes > 60) {
      fail(`${label} minutes must be 1..60`);
    }
    if (day?.world && !worldIds.has(day.world)) {
      fail(`${label} unknown world "${day.world}"`);
    }
    // A repeated title within one journey is allowed (a kosha spans days),
    // but flag it so the author can confirm it is intentional.
    const seen = titles.get(day?.title) ?? 0;
    titles.set(day?.title, seen + 1);
  }
  for (const [title, count] of titles) {
    if (count > 1) {
      warn(`journey-days: "${journeyId}" reuses the title "${title}" ${count} times`);
    }
  }
}
for (const j of journeys) {
  if (!journeyDays[j.id]) fail(`journeys: "${j.id}" has no day plans`);
}

// ------------------------------------------------------------------ knowledge
const knowledge = db.knowledge ?? [];
const knowledgeIds = new Set();
for (const k of knowledge) {
  for (const field of ['id', 'term', 'devanagari', 'transliteration', 'meaning', 'body', 'source', 'question']) {
    if (!k?.[field]) fail(`knowledge: "${k?.id ?? '?'}" missing ${field}`);
  }
  if (knowledgeIds.has(k?.id)) fail(`knowledge: duplicate id "${k?.id}"`);
  knowledgeIds.add(k?.id);
  if (!/^[a-z0-9-]+$/.test(k?.id ?? '')) {
    fail(`knowledge: "${k?.id}" id must be kebab-case`);
  }
  if (!DEVANAGARI.test(k?.devanagari ?? '')) {
    fail(`knowledge: "${k?.id}" devanagari has no Devanagari characters`);
  }
  if ((k?.body ?? '').length < MIN_KNOWLEDGE_BODY) {
    warn(`knowledge: "${k?.id}" body is thin (${k?.body?.length ?? 0} chars)`);
  }
  if (!['available', 'planned'].includes(k?.status)) {
    fail(`knowledge: "${k?.id}" status must be "available" or "planned", got "${k?.status}"`);
  }
}

// -------------------------------------------------------- world usage report
const usedWorlds = new Set();
for (const j of journeys) {
  usedWorlds.add(j.defaultWorld);
  for (const day of journeyDays[j.id] ?? []) if (day.world) usedWorlds.add(day.world);
}
for (const id of worldIds) {
  if (!usedWorlds.has(id)) warn(`worlds: "${id}" is not used by any journey day`);
}

// ------------------------------------------------------------------- report
const totalDays = Object.values(journeyDays).reduce((s, l) => s + (Array.isArray(l) ? l.length : 0), 0);
console.log('Dhyaana content');
console.log(`  worlds:   ${worlds.length}`);
console.log(`  journeys: ${journeys.length} (${totalDays} days)`);
console.log(`  concepts: ${knowledge.length}`);
console.log(`  updated:  ${db.updatedAt}`);

if (warns.length) {
  console.log(`\n  ${warns.length} warning(s):`);
  for (const w of warns) console.log('    WARN  ' + w);
}
if (fails.length) {
  console.error(`\n  ${fails.length} failure(s):`);
  for (const f of fails) console.error('    FAIL  ' + f);
  console.error('\nDhyaana content: FAILED');
  process.exit(1);
}
console.log('\nDhyaana content: OK');
