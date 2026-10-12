// Blog guide engine — data-driven "common phrase / common conversation /
// word guide" pages for /blog/. Content lives in src/data/blog/guides.json;
// facts that come from the curriculum (Marathi, Hindi, transliteration,
// example sentences) are validated at build time so a typo'd headword fails
// the build instead of shipping a thin or wrong page.

import vocab from '../data/learn/vocab.json';

export type GuideKind = 'phrase' | 'conversation' | 'word';

export type GuideRow = { mr: string; tr: string; en: string; note?: string };

export type DialogueLine = { who: string; mr: string; tr: string; en: string };

export type Guide = {
	slug: string;
	kind: GuideKind;
	category: string;
	keyword: string;
	title: string;
	description: string;
	pubDate: string;
	updatedDate?: string;
	tags: string[];
	lead: string;
	/** Vocab headwords (must exist in vocab.json) for the curriculum-backed table. */
	words?: string[];
	/** Quick-answer table rows (the direct answer to the search query). */
	answer: GuideRow[];
	phrases?: GuideRow[];
	dialogue?: DialogueLine[];
	mistakes?: string[];
	tip?: string;
	faqs: { question: string; answer: string }[];
	related?: { slug: string; label: string }[];
	/** Extra internal links (lessons, vocabulary, static posts). */
	links?: { label: string; href: string }[];
};

import raw from '../data/blog/guides.json';

const guides = raw as Guide[];

// ---- build-time validation (fail loudly, never ship thin) ----
// Thin-content gate: every guide must carry real, structured content —
// minimum sections, rows, FAQs and links — or the build refuses to pass.

const vocabByMarathi = new Map<string, (typeof vocab)[number]>();
for (const w of vocab) {
	if (!vocabByMarathi.has(w.marathi)) vocabByMarathi.set(w.marathi, w);
}

const seen = new Set<string>();
for (const g of guides) {
	if (seen.has(g.slug)) throw new Error(`guides: duplicate slug "${g.slug}"`);
	seen.add(g.slug);
	if (!g.slug || !g.title || !g.description || !g.keyword) {
		throw new Error(`guides: "${g.slug}" missing slug/title/description/keyword`);
	}
	if (!g.faqs?.length) throw new Error(`guides: "${g.slug}" needs at least one FAQ (FAQ schema)`);
	if (g.kind !== 'conversation' && !g.answer.length) {
		throw new Error(`guides: "${g.slug}" needs answer rows`);
	}
	if (g.kind === 'conversation' && !g.dialogue?.length) {
		throw new Error(`guides: "${g.slug}" is a conversation but has no dialogue`);
	}
	for (const w of g.words ?? []) {
		if (!vocabByMarathi.has(w)) {
			throw new Error(`guides: "${g.slug}" references vocab headword "${w}" which is not in vocab.json`);
		}
	}
	if (g.kind === 'word' && !g.words?.length) {
		throw new Error(`guides: "${g.slug}" is a word guide but has no curriculum words`);
	}

	// ---- anti-thin audit (>= 6 content sections, real rows everywhere) ----
	const problems: string[] = [];
	if (g.answer.length < 3) problems.push(`answer rows ${g.answer.length} < 3`);
	const extraRows = (g.phrases?.length ?? 0) + (g.dialogue?.length ?? 0) + (g.words?.length ?? 0);
	// word guides carry their rows in the curriculum spotlight + example line,
	// so spotlight words count toward the row minimum
	const needsExtraRows = !(g.words?.length && (g.words.length > 1 || g.kind === 'word'));
	if (needsExtraRows && (g.phrases?.length ?? 0) + (g.dialogue?.length ?? 0) < 3) {
		problems.push(`phrases/dialogue rows ${g.phrases?.length ?? 0 + g.dialogue?.length ?? 0} < 3`);
	}
	if (extraRows < 3 && !g.words?.length) problems.push(`content rows ${extraRows} < 3`);
	if ((g.mistakes?.length ?? 0) < 2) problems.push('mistakes < 2');
	if (!g.tip || g.tip.length < 40) problems.push('tip missing/short');
	if (g.faqs.length < 3) problems.push('faqs < 3');
	const linkCount = (g.related?.length ?? 0) + (g.links?.length ?? 0);
	if (linkCount < 2) problems.push('related/links < 2');
	if (g.lead.length < 100) problems.push('lead < 100 chars');
	if (g.description.length < 80) problems.push('description < 80 chars');
	const sections =
		1 + // quick answer table
		(g.phrases ? 1 : 0) +
		(g.dialogue ? 1 : 0) +
		(g.words?.length ? 1 : 0) + // curriculum spotlight
		(g.mistakes ? 1 : 0) +
		(g.tip ? 1 : 0) +
		1 + // faqs
		(linkCount ? 1 : 0); // related
	if (sections < 6) problems.push(`content sections ${sections} < 6`);
	if (problems.length) {
		throw new Error(`guides: "${g.slug}" is THIN — ${problems.join('; ')}`);
	}
}
const relatedSlugs = new Set(guides.flatMap((g) => (g.related ?? []).map((r) => r.slug)));
for (const s of relatedSlugs) {
	if (!seen.has(s)) throw new Error(`guides: related slug "${s}" does not exist`);
}

export const allGuides: Guide[] = guides;

export const guideBySlug = (slug: string): Guide | undefined => guides.find((g) => g.slug === slug);

export const guidesByCategory = (): Map<string, Guide[]> => {
	const map = new Map<string, Guide[]>();
	for (const g of guides) {
		const list = map.get(g.category) ?? [];
		list.push(g);
		map.set(g.category, list);
	}
	return map;
};

/** Curriculum-backed rows for a guide's word spotlight (validated headwords). */
export function vocabRows(headwords: string[]): GuideRow[] {
	return headwords.map((m) => {
		const w = vocabByMarathi.get(m)!;
		return { mr: w.marathi, tr: w.transliteration, en: w.english, note: w.hindi ? `Hindi: ${w.hindi}` : undefined };
	});
}

export function vocabExample(headword: string): { mr: string; en: string } | undefined {
	const w = vocabByMarathi.get(headword);
	return w ? { mr: w.exampleMarathi, en: w.exampleEnglish } : undefined;
}
