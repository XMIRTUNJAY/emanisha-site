// Content manifest generator → content-manifest.json (repo root).
// The single machine-readable source of truth for every content page on
// the site: content-engine datasets (draft + published), curated taxonomy
// pages from learn.ts, and lessons. Regenerate after any content change:
//   npm run content:manifest
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	ROOT,
	FAMILY_BASE,
	loadSeoPages,
	loadUnits,
	loadCurated,
	loadVocab,
} from './lib/content-lib.mjs';

const pages = loadSeoPages();
const vocab = loadVocab();
const units = loadUnits();
const curated = loadCurated();

const datasetEntries = pages.map((p) => ({
	slug: p.slug,
	url: `${FAMILY_BASE[p.family]}${p.slug}/`,
	type: p.family,
	primaryIntent: p.searchIntent,
	languagePath: p.languagePaths,
	topic: p.topics[0] ?? null,
	topics: p.topics,
	level: p.level,
	primaryKeyword: p.primaryKeyword,
	secondaryKeywords: p.secondaryKeywords ?? [],
	curriculumUnits: p.units ?? [],
	relatedPages: p.relatedPages ?? [],
	status: p.status,
}));

const curatedEntries = [
	...curated.clusters.map((c) => ({ family: 'vocabulary', ...c, unitRefs: [] })),
	...curated.phraseSets.map((c) => ({ family: 'phrases', ...c, unitRefs: [] })),
	...curated.grammarTopics.map((c) => ({ family: 'grammar', ...c, unitRefs: [] })),
].map((c) => ({
	slug: c.slug,
	url: `${FAMILY_BASE[c.family]}${c.slug}/`,
	type: c.family,
	primaryIntent: c.intent?.split(';')[0]?.includes('grammar') ? 'grammar' : c.family,
	languagePath: ['hindi', 'english'],
	topic: null,
	topics: c.intent?.split(';').map((s) => s.trim()) ?? [],
	level: null,
	primaryKeyword: c.intent?.split(';')[0]?.trim() ?? null,
	secondaryKeywords: c.intent?.split(';').slice(1).map((s) => s.trim()) ?? [],
	curriculumUnits: [],
	relatedPages: [],
	status: 'published',
	source: 'learn.ts',
}));

const lessonEntries = units.map((u) => ({
	slug: u.unit,
	url: `/lessons/${u.unit}/`,
	type: 'lesson',
	primaryIntent: 'learn',
	languagePath: ['hindi', 'english'],
	topic: u.titleEn,
	topics: u.goalsEn ?? [],
	level: Number(u.unit) <= 5 ? 'beginner' : Number(u.unit) <= 19 ? 'intermediate' : 'advanced',
	primaryKeyword: null,
	secondaryKeywords: [],
	curriculumUnits: [u.unit],
	relatedPages: [],
	status: 'published',
	source: 'units.json',
}));

const manifest = {
	generated: new Date().toISOString().slice(0, 10),
	totals: {
		datasetPages: pages.length,
		published: pages.filter((p) => p.status === 'published').length,
		draft: pages.filter((p) => p.status === 'draft').length,
		curatedPages: curatedEntries.length,
		lessons: units.length,
		words: vocab.length,
	},
	pages: [...datasetEntries, ...curatedEntries, ...lessonEntries],
};

writeFileSync(join(ROOT, 'content-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(
	`content-manifest: ${manifest.totals.published} published + ${manifest.totals.draft} draft dataset pages, ${curatedEntries.length} curated, ${units.length} lessons → content-manifest.json`,
);
