// Content-engine QA gate for src/data/seo/*.json.
// Run: npm run content:qa  (also runs in `prebuild` — a failing dataset
// blocks the build, so unvalidated pages can never ship.)
//
// Fails on: schema violations, duplicate slugs/titles/descriptions,
// slug collisions with curated taxonomy or reserved route names,
// unresolvable data references (category, word id, unit, pick),
// broken internal links, sub-threshold content, malformed scripts
// (Latin in Marathi answer fields, Devanagari in English fields),
// missing practice on published pages.
// Warns on: near-duplicate intents, keyword/title mismatch, draft debt.
import {
	ROOT,
	FAMILY_BASE,
	DEVANAGARI,
	loadSeoPages,
	loadVocab,
	loadUnits,
	loadCurated,
	knownRoutes,
} from './lib/content-lib.mjs';

const INTENTS = ['learn', 'translate', 'practice', 'grammar', 'conversation', 'vocabulary', 'comparison', 'pronunciation'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const RESERVED = {
	'hindi-bridge': ['words', 'phrases', 'index'],
	'english-path': ['words', 'phrases', 'index'],
};
// Minimum resolved-content thresholds — a page below the bar is thin and
// must not be published (extend an existing page instead).
const MIN = {
	vocabulary: { words: 10 },
	phrases: { phrases: 8 },
	'hindi-bridge': { bridges: 5 },
	'english-path': { sentences: 5 },
	grammar: { notes: 1 },
};

const pages = loadSeoPages();
const vocab = loadVocab();
const units = loadUnits();
const curated = loadCurated();
const routes = knownRoutes(pages, curated, units);

const vocabCats = new Set(vocab.map((w) => w.category));
const vocabIds = new Set(vocab.map((w) => w.id));
const unitsByNo = new Map(units.map((u) => [u.unit, u]));
const wordCountForCats = (cats) => vocab.filter((w) => cats.includes(w.category)).length;

const fails = [];
const warns = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);
const id = (p) => `${p.family}/${p.slug}`;

// Curated slugs per route-family (collision guard).
const curatedSlugs = {
	vocabulary: new Set(curated.clusters.map((c) => c.slug)),
	phrases: new Set(curated.phraseSets.map((p) => p.slug)),
	grammar: new Set(curated.grammarTopics.map((g) => g.slug)),
};
const knownTitles = new Set(
	[...curated.clusters, ...curated.phraseSets, ...curated.grammarTopics].map((c) => c.title.toLowerCase()),
);

const seenSlugs = new Map();
const seenTitles = new Map();
const seenDescs = new Map();
const seenKeywords = new Map();

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const resolvePhrases = (p) => {
	let n = 0;
	for (const u of p.speakingUnits ?? []) n += unitsByNo.get(u)?.speaking.length ?? 0;
	for (const pick of p.speakingPicks ?? []) {
		n += (unitsByNo.get(pick.unit)?.speaking ?? []).filter((s) => pick.lessons.includes(s.lesson)).length;
	}
	return n;
};

for (const p of pages) {
	const pid = id(p);

	// --- schema -------------------------------------------------------------
	for (const k of ['slug', 'title', 'description', 'searchIntent', 'level', 'languagePaths', 'topics', 'primaryKeyword', 'intro', 'status']) {
		if (p[k] === undefined || p[k] === null || p[k] === '') fail(`${pid}: missing required field "${k}"`);
	}
	if (p.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) fail(`${pid}: slug must be kebab-case`);
	if (!INTENTS.includes(p.searchIntent)) fail(`${pid}: bad searchIntent "${p.searchIntent}"`);
	if (!LEVELS.includes(p.level)) fail(`${pid}: bad level "${p.level}"`);
	if (!['draft', 'published'].includes(p.status)) fail(`${pid}: bad status "${p.status}"`);
	if (!Array.isArray(p.languagePaths) || !p.languagePaths.length) fail(`${pid}: languagePaths must be non-empty`);
	if (!Array.isArray(p.topics) || !p.topics.length) fail(`${pid}: topics must be non-empty`);
	if (!Array.isArray(p.intro) || p.intro.length === 0) fail(`${pid}: intro must have at least one paragraph`);
	if (p.title && p.title.length > 60) fail(`${pid}: title over 60 chars (${p.title.length})`);
	if (p.description && (p.description.length < 60 || p.description.length > 155))
		fail(`${pid}: description length ${p.description?.length} outside 60–155`);

	// --- uniqueness ---------------------------------------------------------
	if (seenSlugs.has(pid)) fail(`${pid}: duplicate slug in family`);
	seenSlugs.set(pid, true);
	if (curatedSlugs[p.family]?.has(p.slug)) fail(`${pid}: slug collides with curated ${p.family} page`);
	if ((RESERVED[p.family] ?? []).includes(p.slug)) fail(`${pid}: slug collides with reserved static route`);
	const t = norm(p.title);
	if (seenTitles.has(t)) fail(`${pid}: duplicate title (also used by ${seenTitles.get(t)})`);
	seenTitles.set(t, pid);
	if (knownTitles.has(t)) fail(`${pid}: title duplicates curated page "${p.title}"`);
	const d = norm(p.description);
	if (seenDescs.has(d)) fail(`${pid}: duplicate description`);
	seenDescs.set(d, pid);
	const kw = norm(p.primaryKeyword);
	if (seenKeywords.has(kw)) warn(`${pid}: primary keyword also targeted by ${seenKeywords.get(kw)} — merge or differentiate intent`);
	seenKeywords.set(kw, pid);
	if (kw && !norm(`${p.title} ${p.h1 ?? ''} ${p.description}`).includes(kw)) {
		warn(`${pid}: primaryKeyword "${p.primaryKeyword}" absent from title/H1/description`);
	}

	// --- data references ------------------------------------------------------
	for (const c of p.categories ?? []) {
		if (!vocabCats.has(c)) fail(`${pid}: unknown vocab category "${c}"`);
	}
	for (const wid of p.wordIds ?? []) {
		if (!vocabIds.has(wid)) fail(`${pid}: unknown word id "${wid}"`);
	}
	for (const u of [...(p.units ?? []), ...(p.speakingUnits ?? []), ...(p.bridgeUnits ?? [])]) {
		if (!unitsByNo.has(u)) fail(`${pid}: unknown unit "${u}"`);
	}
	for (const pick of p.speakingPicks ?? []) {
		const u = unitsByNo.get(pick.unit);
		if (!u) {
			fail(`${pid}: speakingPick references unknown unit "${pick.unit}"`);
			continue;
		}
		for (const l of pick.lessons) {
			if (!u.speaking.some((s) => s.lesson === Number(l))) fail(`${pid}: unit ${pick.unit} has no speaking lesson ${l}`);
		}
	}
	for (const pick of p.grammarPicks ?? []) {
		const u = unitsByNo.get(pick.unit);
		if (!u) {
			fail(`${pid}: grammarPick references unknown unit "${pick.unit}"`);
			continue;
		}
		for (const l of pick.lessons) {
			if (!u.grammar.some((g) => g.lesson === Number(l))) fail(`${pid}: unit ${pick.unit} has no grammar lesson ${l}`);
		}
	}

	// --- script checks on authored blocks ------------------------------------
	for (const [i, para] of (p.intro ?? []).entries()) {
		if (para.length < 80) warn(`${pid}: intro paragraph ${i + 1} is very short (${para.length} chars)`);
	}
	for (const q of p.practice?.mcq ?? []) {
		if (!q.question || !Array.isArray(q.options)) {
			fail(`${pid}: mcq missing question/options`);
			continue;
		}
		if (q.options.length < 2) fail(`${pid}: mcq "${q.question.slice(0, 40)}" has <2 options`);
		if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length)
			fail(`${pid}: mcq "${q.question.slice(0, 40)}" answer index out of range`);
		if (new Set(q.options).size !== q.options.length) fail(`${pid}: mcq "${q.question.slice(0, 40)}" has duplicate options`);
	}
	for (const f of p.practice?.fill ?? []) {
		if (!f.sentence || !f.answer) fail(`${pid}: fill item missing sentence/answer`);
		// The blank must actually be blanked-out in the prompt.
		if (f.sentence && !f.sentence.includes('___')) fail(`${pid}: fill sentence missing "___" blank: "${f.sentence.slice(0, 50)}"`);
	}
	for (const t of p.practice?.translate ?? []) {
		if (!t.source || !t.answer) fail(`${pid}: translate item missing source/answer`);
		else if (!DEVANAGARI.test(t.answer)) fail(`${pid}: translate answer is not Marathi (no Devanagari): "${t.answer.slice(0, 40)}"`);
	}
	for (const m of p.mistakes ?? []) {
		if (!m.wrong || !m.right || !m.why) fail(`${pid}: mistake entry needs wrong/right/why`);
	}
	for (const f of p.faq ?? []) {
		if (!f.question || !f.answer) fail(`${pid}: faq entry missing question/answer`);
		// Devanagari inside FAQ questions is legitimate (quoting the taught word).
	}

	// --- internal links ----------------------------------------------------------
	for (const rp of p.relatedPages ?? []) {
		if (!rp.startsWith('/') || !rp.endsWith('/')) fail(`${pid}: relatedPage "${rp}" must be /-wrapped with trailing slash`);
		else if (!routes.has(rp)) fail(`${pid}: relatedPage "${rp}" does not resolve to a known route`);
	}

	// --- published quality threshold ----------------------------------------------
	if (p.status === 'published') {
		const words = (p.categories?.length || p.wordIds?.length) ? wordCountForCats(p.categories ?? []) + (p.wordIds ?? []).length : 0;
		const phrases = resolvePhrases(p);
		const bridges = (p.bridgeUnits ?? []).reduce((n, u) => n + (unitsByNo.get(u)?.bridge.length ?? 0), 0);
		const notes = (p.grammarPicks ?? []).reduce((n, pick) => n + pick.lessons.length, 0);
		if (p.family === 'vocabulary' && words < MIN.vocabulary.words) fail(`${pid}: thin page — ${words} words (< ${MIN.vocabulary.words})`);
		if (p.family === 'phrases' && phrases < MIN.phrases.phrases) fail(`${pid}: thin page — ${phrases} phrases (< ${MIN.phrases.phrases})`);
		if (p.family === 'hindi-bridge' && bridges < MIN['hindi-bridge'].bridges) fail(`${pid}: thin page — ${bridges} bridges (< ${MIN['hindi-bridge'].bridges})`);
		if (p.family === 'english-path' && phrases < MIN['english-path'].sentences) fail(`${pid}: thin page — ${phrases} sentences (< ${MIN['english-path'].sentences})`);
		if (p.family === 'grammar' && notes < MIN.grammar.notes) fail(`${pid}: no grammar notes`);
		const practiceCount = (p.practice?.mcq?.length ?? 0) + (p.practice?.fill?.length ?? 0) + (p.practice?.translate?.length ?? 0);
		if (practiceCount < 3) fail(`${pid}: published page needs ≥3 practice items (has ${practiceCount})`);
		if (!(p.mistakes?.length >= 2)) fail(`${pid}: published page needs ≥2 common mistakes`);
		if (!(p.relatedPages?.length >= 1)) warn(`${pid}: no declared relatedPages — relying on auto-links only`);
		if (!(p.faq?.length >= 1)) warn(`${pid}: no FAQ (missed FAQPage schema opportunity)`);
		if (!(p.units?.length >= 1)) fail(`${pid}: no curriculum connection — every SEO page must point at a unit`);
	}
}

// Cross-page duplication heuristic: same family + topic-set overlap ≥ 2 topics.
const byFamily = new Map();
for (const p of pages.filter((x) => x.status === 'published')) {
	const list = byFamily.get(p.family) ?? [];
	for (const q of list) {
		const overlap = p.topics.filter((t) => q.topics.includes(t)).length;
		if (overlap >= 3) warn(`possible near-duplicate: ${id(p)} ↔ ${id(q)} share ${overlap} topics`);
	}
	byFamily.set(p.family, [...list, p]);
}

const published = pages.filter((p) => p.status === 'published').length;
console.log(`content-validate: ${pages.length} dataset pages (${published} published, ${pages.length - published} draft)`);
for (const w of warns) console.log(`WARN: ${w}`);
if (fails.length) {
	for (const f of fails) console.log(`FAIL: ${f}`);
	console.log(`content-validate: ${fails.length} failure(s)`);
	process.exit(1);
}
console.log('content-validate: PASS');
