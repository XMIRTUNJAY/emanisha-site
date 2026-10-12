// SEO content engine: loads page datasets from src/data/seo/*.json,
// resolves every data hook against the canonical curriculum snapshots
// (src/data/learn/*.json via lib/learn), and computes related links.
//
// Hard rule: any word, phrase or grammar row rendered on a generated page
// must trace back to vocab.json / units.json (by category, word id or
// unit pick) or be page-level prose. tools/validate-content.mjs enforces
// the same contract at QA time; the resolvers here throw at build time
// on a bad reference so nothing thin or wrong ships silently.

import {
	vocab,
	getUnit,
	clusters,
	phraseSets,
	grammarTopics,
	type Word,
	type SpeakingRow,
	type GrammarRow,
	type BridgeRow,
} from './learn';
import { siteUrl } from './site';

import vocabTopicsData from '../data/seo/vocab-topics.json';
import phrasePagesData from '../data/seo/phrase-pages.json';
import grammarPagesData from '../data/seo/grammar-pages.json';
import hindiBridgeData from '../data/seo/hindi-bridges.json';
import englishPathData from '../data/seo/english-paths.json';

export type SearchIntent =
	| 'learn'
	| 'translate'
	| 'practice'
	| 'grammar'
	| 'conversation'
	| 'vocabulary'
	| 'comparison'
	| 'pronunciation';

export type Family = 'vocabulary' | 'phrases' | 'grammar' | 'hindi-bridge' | 'english-path';

export type PracticeMcq = { question: string; options: string[]; answer: number; explanation?: string };
export type PracticeFill = { sentence: string; answer: string; hint?: string };
export type PracticeTranslate = { source: string; sourceLang?: 'en' | 'hi'; answer: string; note?: string };
export type Practice = { mcq?: PracticeMcq[]; fill?: PracticeFill[]; translate?: PracticeTranslate[] };
export type Mistake = { wrong: string; right: string; why: string };
export type PageSection = { heading: string; paragraphs: string[] };
export type RelatedLink = { label: string; href: string };

export type SeoPage = {
	family: Family;
	slug: string;
	title: string;
	description: string;
	h1?: string;
	searchIntent: SearchIntent;
	level: 'beginner' | 'intermediate' | 'advanced';
	languagePaths: ('hindi' | 'english')[];
	topics: string[];
	primaryKeyword: string;
	secondaryKeywords: string[];
	intro: string[];
	tip?: string;
	// Data hooks — every one resolves against the curriculum snapshots.
	categories?: string[];
	wordIds?: string[];
	speakingUnits?: string[];
	speakingPicks?: { unit: string; lessons: number[] }[];
	grammarPicks?: { unit: string; lessons: number[] }[];
	bridgeUnits?: string[];
	units?: string[];
	// Page-level authored content (prose + practice; validated by tools).
	sections?: PageSection[];
	mistakes?: Mistake[];
	practice?: Practice;
	relatedPages?: string[];
	faq?: { question: string; answer: string }[];
	appCtaVariant?: 'vocabulary' | 'phrase' | 'grammar' | 'lesson' | 'general';
	status: 'draft' | 'published';
};

export const FAMILY_BASE: Record<Family, string> = {
	vocabulary: '/vocabulary/',
	phrases: '/phrases/',
	grammar: '/grammar/',
	'hindi-bridge': '/hindi-to-marathi/',
	'english-path': '/english-to-marathi/',
};

export const FAMILY_LABEL: Record<Family, string> = {
	vocabulary: 'Vocabulary',
	phrases: 'Phrases',
	grammar: 'Grammar',
	'hindi-bridge': 'Hindi → Marathi',
	'english-path': 'English → Marathi',
};

const raw: Record<Family, Omit<SeoPage, 'family'>[]> = {
	vocabulary: vocabTopicsData as Omit<SeoPage, 'family'>[],
	phrases: phrasePagesData as Omit<SeoPage, 'family'>[],
	grammar: grammarPagesData as Omit<SeoPage, 'family'>[],
	'hindi-bridge': hindiBridgeData as Omit<SeoPage, 'family'>[],
	'english-path': englishPathData as Omit<SeoPage, 'family'>[],
};

export const allSeoPages: SeoPage[] = (Object.entries(raw) as [Family, Omit<SeoPage, 'family'>[]][]).flatMap(
	([family, pages]) => pages.map((p) => ({ ...p, family })),
);

export const seoPages = allSeoPages.filter((p) => p.status === 'published');

export const seoPagesByFamily = (family: Family): SeoPage[] => seoPages.filter((p) => p.family === family);

export const seoPageUrl = (p: SeoPage): string => siteUrl(`${FAMILY_BASE[p.family]}${p.slug}/`);

// ---------------------------------------------------------------------------
// Resolvers — throw at build time on any reference that does not exist.

export function wordsFor(page: SeoPage): Word[] {
	const words: Word[] = [];
	if (page.categories) words.push(...vocab.filter((w) => page.categories!.includes(w.category)));
	for (const id of page.wordIds ?? []) {
		const w = vocab.find((x) => x.id === id);
		if (!w) throw new Error(`seo/lib: unknown word id "${id}" on page "${page.slug}"`);
		if (!words.includes(w)) words.push(w);
	}
	return words;
}

export function speakingFor(page: SeoPage): (SpeakingRow & { unit: string })[] {
	const rows: (SpeakingRow & { unit: string })[] = [];
	for (const no of page.speakingUnits ?? []) rows.push(...getUnit(no).speaking.map((s) => ({ ...s, unit: no })));
	for (const pick of page.speakingPicks ?? []) {
		const u = getUnit(pick.unit);
		rows.push(...u.speaking.filter((s) => pick.lessons.includes(s.lesson)).map((s) => ({ ...s, unit: pick.unit })));
	}
	if (rows.length === 0 && (page.speakingUnits?.length || page.speakingPicks?.length)) {
		throw new Error(`seo/lib: no speaking rows resolved for page "${page.slug}"`);
	}
	return rows;
}

export function grammarNotesFor(page: SeoPage): (GrammarRow & { unit: string })[] {
	return (page.grammarPicks ?? []).flatMap(({ unit: no, lessons }) => {
		const u = getUnit(no);
		const rows = u.grammar.filter((g) => lessons.includes(g.lesson)).map((g) => ({ ...g, unit: no }));
		if (rows.length !== lessons.length) {
			throw new Error(`seo/lib: grammar pick ${no} lessons [${lessons}] on page "${page.slug}" resolved ${rows.length} rows`);
		}
		return rows;
	});
}

export function bridgesForPage(page: SeoPage): (BridgeRow & { unit: string })[] {
	return (page.bridgeUnits ?? []).flatMap((no) => getUnit(no).bridge.map((b) => ({ ...b, unit: no })));
}

// ---------------------------------------------------------------------------
// Internal linking engine. Declared links first, then automatic links from
// shared topics (other families), curriculum units, and the family hub.
// Deterministic, capped, deduped — no "10 random articles" lists.

const slugTaken = new Set([
	...clusters.map((c) => `vocabulary/${c.slug}`),
	...phraseSets.map((p) => `phrases/${p.slug}`),
	...grammarTopics.map((g) => `grammar/${g.slug}`),
]);

for (const p of allSeoPages) {
	const key = `${p.family === 'vocabulary' ? 'vocabulary' : p.family === 'phrases' ? 'phrases' : p.family === 'grammar' ? 'grammar' : p.family}/${p.slug}`;
	if (slugTaken.has(key)) throw new Error(`seo/lib: slug collision "${key}"`);
	slugTaken.add(key);
}

const topicIndex = new Map<string, SeoPage[]>();
for (const p of seoPages) {
	for (const t of p.topics) topicIndex.set(t, [...(topicIndex.get(t) ?? []), p]);
}

export function relatedFor(page: SeoPage, cap = 7): RelatedLink[] {
	const links: RelatedLink[] = [];
	const seen = new Set<string>();
	const push = (label: string, path: string) => {
		const href = siteUrl(path);
		if (seen.has(href) || links.length >= cap) return;
		seen.add(href);
		links.push({ label, href });
	};

	for (const rp of page.relatedPages ?? []) {
		// Label lookup: prefer the referenced page's own title when it is a generated page.
		const target = seoPages.find((p) => seoPageUrl(p) === siteUrl(rp));
		push(target ? target.title : labelFromPath(rp), rp);
	}

	// Cross-family pages that share a topic (concept → related concept).
	const cross: SeoPage[] = [];
	for (const t of page.topics) {
		for (const p of topicIndex.get(t) ?? []) {
			if (p !== page && p.family !== page.family && !cross.includes(p)) cross.push(p);
		}
	}
	for (const p of cross) push(p.title, `${FAMILY_BASE[p.family]}${p.slug}/`);

	// Curriculum connection (SEO page → structured course).
	for (const no of page.units ?? []) push(`Unit ${no} — ${getUnit(no).titleEn}`, `/lessons/${no}/`);

	// Same-family sibling sharing a topic (one only, keeps lists meaningful).
	const sibling = seoPages.find((p) => p !== page && p.family === page.family && p.topics.some((t) => page.topics.includes(t)));
	if (sibling) push(sibling.title, `${FAMILY_BASE[sibling.family]}${sibling.slug}/`);

	// Quiz exists only for the original clusters.
	if (page.family === 'vocabulary' && clusters.some((c) => c.slug === page.slug)) {
		push(`Quiz yourself: ${page.title}`, `/quiz/${page.slug}/`);
	}

	return links;
}

function labelFromPath(path: string): string {
	const seg = path.replace(/\/$/, '').split('/').pop() ?? path;
	return seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
