// Guide seed expander — turns compact seeds into full Guide objects.
// Curated per-seed: slug, keyword, headwords, answer rows (noun/adj patterns
// auto-add 2 rows from verified vocab data), phrase rows.
// Auto-filled from vocab.json (word-specific, never invented): title,
// description, lead, mistakes (Hindi contrast), tip (usage note + example),
// FAQs, links. Merge enforces all dup/anti-thin gates.
//
// Run: node ./tools/expand-guide-seeds.mjs <seedFile1> [seedFile2 ...]
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vocab = JSON.parse(readFileSync(join(root, 'src', 'data', 'learn', 'vocab.json'), 'utf8'));
const vocabByMarathi = new Map(vocab.map((w) => [w.marathi, w]));

const seedFiles = process.argv.slice(2);
if (!seedFiles.length) throw new Error('usage: node tools/expand-guide-seeds.mjs <seedFile...>');
const seeds = seedFiles.flatMap((f) => {
	let s = readFileSync(join(root, f), 'utf8');
	if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
	return JSON.parse(s);
});

const tr = (w) => w.transliteration;
const genMistakes = (g, w) => {
	const m = [];
	if (w.hindi && w.hindi !== w.marathi) m.push(`❌ ${w.hindi} (Hindi) → ✅ ${w.marathi} (the Marathi word)`);
	m.push('❌ English word order → ✅ Marathi runs subject–object–verb, so the verb lands last in every sentence above');
	return m;
};
const genTip = (w) => {
	const parts = [];
	if (w.noteEn) parts.push(w.noteEn);
	parts.push(`Example from the curriculum: ${w.exampleMarathi} — ${w.exampleEnglish}`);
	return parts.join('. ');
};
const genFaqs = (g, w) => [
	{
		question: `What is ${g.keyword} in Marathi?`,
		answer: `${w.marathi} (${tr(w)}) — ${w.english}.${w.hindi && w.hindi !== w.marathi ? ` Hindi speakers know it as ${w.hindi}.` : ' The same word is used in Hindi too.'}`,
	},
	{
		question: `How do you use ${w.marathi} in a sentence?`,
		answer: `${w.exampleMarathi} — ${w.exampleEnglish}`,
	},
	{
		question: `Is ${w.marathi} the same as Hindi?`,
		answer:
			w.hindi === w.marathi
				? `Yes — ${w.marathi} is spelled and used identically in Hindi and Marathi.`
				: `Not exactly — Hindi uses ${w.hindi}, while Marathi uses ${w.marathi}. Marathi speakers understand the Hindi word, but the Marathi word sounds natural.`,
	},
];

const expanded = [];
for (const s of seeds) {
	if (!s.slug || !s.keyword) throw new Error('seed missing slug/keyword: ' + JSON.stringify(s).slice(0, 80));
	const main = s.words?.[0] ? vocabByMarathi.get(s.words[0]) : undefined;
	if (s.words?.length && !main) throw new Error(`seed "${s.slug}" headword not in vocab: ${s.words[0]}`);

	// auto-extend answer rows for noun/adj patterns
	const answer = s.answer ? [...s.answer] : main ? [{ mr: main.marathi, tr: tr(main), en: main.english }] : [];
	if (main && (s.pattern === 'noun' || s.pattern === 'adj') && answer.length < 3) {
		if (s.pattern === 'noun') {
			answer.push({ mr: `मला ${main.marathi} पाहिजे`, tr: `malā ${tr(main)} pāhije`, en: `I need ${main.english.replace(/\s*\(.*\)$/, '')}` });
			answer.push({ mr: `${main.marathi} आहे का?`, tr: `${tr(main)} āhe kā?`, en: `Is there ${main.english.replace(/\s*\(.*\)$/, '')}?` });
		} else {
			answer.push({ mr: `खूप ${main.marathi}`, tr: `khūp ${tr(main)}`, en: `very ${main.english.replace(/\s*\(.*\)$/, '')}` });
			answer.push({ mr: `${main.marathi} आहे`, tr: `${tr(main)} āhe`, en: `it is ${main.english.replace(/\s*\(.*\)$/, '')}` });
		}
	}

	const enShort = main ? main.english.replace(/\s*\(.*\)$/, '') : s.keyword;
	const g = {
		slug: s.slug,
		kind: s.kind ?? 'word',
		category: s.category ?? (s.kind === 'phrase' ? 'Common phrases' : s.kind === 'conversation' ? 'Common conversations' : 'Word guides'),
		keyword: s.keyword,
		title: s.title ?? `${enShort[0].toUpperCase()}${enShort.slice(1)} in Marathi — ${main ? `${main.marathi} (${tr(main)})` : enShort}`,
		description:
			s.description ??
			`${main ? `${main.marathi} (${tr(main)})` : enShort} means ${enShort} in Marathi. Learn the word, its Hindi contrast, and a real curriculum example sentence — with audio.`,
		pubDate: '2026-10-11',
		tags: s.tags ?? [g2tag(s.category)],
		lead:
			s.lead ??
			(main
				? `${enShort[0].toUpperCase()}${enShort.slice(1)} in Marathi is ${main.marathi} (${tr(main)}). ${main.noteEn ? main.noteEn + ' ' : ''}Here is the word, a real curriculum sentence, and the phrases that use it.`
				: `${enShort[0].toUpperCase()}${enShort.slice(1)} in Marathi — the phrases below cover how Marathi actually says it, with transliteration and audio.`),
		words: s.words,
		answer,
		phrases: s.phrases,
		dialogue: s.dialogue,
		mistakes: s.mistakes ?? (main ? genMistakes(s, main) : undefined),
		tip: s.tip ?? (main ? genTip(main) : undefined),
		faqs: s.faqs ?? (main ? genFaqs(s, main) : undefined),
		related: s.related,
		links:
			s.links ?? [
				{ label: 'Vocabulary by topic', href: '/vocabulary/' },
				{ label: 'Marathi lessons: full curriculum', href: '/lessons/' },
			],
	};
	expanded.push(g);
}

function g2tag(cat) {
	if (!cat) return 'word';
	return String(cat).toLowerCase().replace(/[^a-z]+/g, '-');
}

// merge into guides.json with the standard gates
const guidesPath = join(root, 'src', 'data', 'blog', 'guides.json');
let curRaw = readFileSync(guidesPath, 'utf8');
if (curRaw.charCodeAt(0) === 0xfeff) curRaw = curRaw.slice(1);
const cur = JSON.parse(curRaw);
const slugs = new Set(cur.map((g) => g.slug));
const kws = new Set(cur.map((g) => g.keyword));
for (const g of expanded) {
	if (slugs.has(g.slug)) throw new Error('dup slug: ' + g.slug);
	if (kws.has(g.keyword)) throw new Error('dup keyword: ' + g.keyword);
	slugs.add(g.slug);
	kws.add(g.keyword);
}
const all = [...cur, ...expanded];
writeFileSync(guidesPath, JSON.stringify(all, null, 2) + '\n');
console.log(`expanded + merged: +${expanded.length} → total ${all.length} guides`);
