// Build-time search index generator.
// Reads canonical snapshots (src/data/learn/*.json) for words + units,
// and extracts inline clusters/phraseSets/grammarTopics from src/lib/learn.ts
// with a balanced-bracket scanner (regex alone breaks on nested braces).
import fs from 'fs';
import {
	extractArrayBody,
	splitTopLevelObjects,
	field,
	strArray,
	loadSeoPages,
	FAMILY_BASE,
} from './lib/content-lib.mjs';

function buildIndex() {
	const learnTs = fs.readFileSync('src/lib/learn.ts', 'utf8');
	const vocab = JSON.parse(fs.readFileSync('src/data/learn/vocab.json', 'utf8'));
	const units = JSON.parse(fs.readFileSync('src/data/learn/units.json', 'utf8'));

	const index = [];

	// Vocabulary clusters (inline in learn.ts)
	for (const block of splitTopLevelObjects(extractArrayBody(learnTs, 'clusters'))) {
		const title = field(block, 'title');
		const slug = field(block, 'slug');
		const description = field(block, 'description');
		if (!title || !slug) continue;
		const categories = strArray(block, 'categories');
		index.push({
			id: `vocab-${slug}`,
			title,
			type: 'vocabulary',
			url: `/learn-marathi/vocabulary/${slug}/`,
			description: description || `${categories.join(', ')} words`,
			keywords: [title, ...categories, 'vocabulary', 'words'].join(' ').toLowerCase(),
		});
	}

	// Phrase sets (inline in learn.ts)
	for (const block of splitTopLevelObjects(extractArrayBody(learnTs, 'phraseSets'))) {
		const title = field(block, 'title');
		const slug = field(block, 'slug');
		if (!title || !slug) continue;
		const categories = strArray(block, 'categories');
		index.push({
			id: `phrase-${slug}`,
			title,
			type: 'phrases',
			url: `/learn-marathi/phrases/${slug}/`,
			description: field(block, 'description') || `${categories.join(', ')} phrases`,
			keywords: [title, ...categories, 'phrases'].join(' ').toLowerCase(),
		});
	}

	// Grammar topics (inline in learn.ts)
	for (const block of splitTopLevelObjects(extractArrayBody(learnTs, 'grammarTopics'))) {
		const title = field(block, 'title');
		const slug = field(block, 'slug');
		if (!title || !slug) continue;
		index.push({
			id: `grammar-${slug}`,
			title,
			type: 'grammar',
			url: `/learn-marathi/grammar/${slug}/`,
			description: field(block, 'description'),
			keywords: [title, field(block, 'intent'), 'grammar', 'rules'].join(' ').toLowerCase(),
		});
	}

	// SEO content-engine pages (JSON datasets — no TS parsing needed).
	// Only published pages are searchable.
	const typeFor = { vocabulary: 'vocabulary', phrases: 'phrases', grammar: 'grammar', 'hindi-bridge': 'hindi-to-marathi', 'english-path': 'english-to-marathi' };
	for (const p of loadSeoPages()) {
		if (p.status !== 'published') continue;
		index.push({
			id: `seo-${p.family}-${p.slug}`,
			title: p.title,
			type: typeFor[p.family] ?? 'vocabulary',
			url: `/learn-marathi${FAMILY_BASE[p.family]}${p.slug}/`,
			description: p.description,
			keywords: [p.title, p.primaryKeyword, ...(p.secondaryKeywords ?? []), ...(p.topics ?? [])].join(' ').toLowerCase(),
		});
	}

	// Units (canonical JSON snapshot)
	for (const u of units) {
		index.push({
			id: `unit-${u.unit}`,
			title: `Unit ${u.unit}: ${u.titleEn}`,
			type: 'lesson',
			url: `/learn-marathi/lessons/${u.unit}/`,
			description: u.subtitleEn || '',
			keywords: [`unit ${u.unit}`, u.titleEn, u.title, 'lesson'].join(' ').toLowerCase(),
		});
	}

	// Words (canonical JSON snapshot, all 1002)
	const words = Array.isArray(vocab) ? vocab : Object.values(vocab);
	for (const w of words) {
		if (!w.id || !w.marathi || !w.english) continue;
		index.push({
			id: `word-${w.id}`,
			title: w.marathi,
			type: 'word',
			url: `/learn-marathi/vocabulary/`,
			description: `${w.english}${w.hindi ? ` (${w.hindi})` : ''}`,
			keywords: [w.marathi, w.english, w.hindi, w.transliteration].filter(Boolean).join(' ').toLowerCase(),
		});
	}

	return index;
}

const index = buildIndex();
fs.writeFileSync('public/search-index.json', JSON.stringify(index, null, 2));
console.log(`Search index built with ${index.length} entries`);
