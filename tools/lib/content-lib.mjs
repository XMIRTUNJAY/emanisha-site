// Shared content-engine helpers for tools/*.mjs (plain Node, zero deps).
// Loads the SEO page datasets, parses curated taxonomy out of
// src/lib/learn.ts (balanced-bracket scanner — regex alone breaks on
// nested braces), and derives the full set of known routes for
// internal-link validation.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const FAMILY_BASE = {
	vocabulary: '/vocabulary/',
	phrases: '/phrases/',
	grammar: '/grammar/',
	'hindi-bridge': '/hindi-to-marathi/',
	'english-path': '/english-to-marathi/',
};

export const FAMILY_FILES = {
	vocabulary: 'vocab-topics.json',
	phrases: 'phrase-pages.json',
	grammar: 'grammar-pages.json',
	'hindi-bridge': 'hindi-bridges.json',
	'english-path': 'english-paths.json',
};

export const DEVANAGARI = /[\u0900-\u097F]/;

const readJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));

export const loadVocab = () => readJson('src/data/learn/vocab.json');
export const loadUnits = () => readJson('src/data/learn/units.json');

export function loadSeoPages() {
	const pages = [];
	for (const [family, file] of Object.entries(FAMILY_FILES)) {
		for (const p of readJson(`src/data/seo/${file}`)) pages.push({ ...p, family });
	}
	return pages;
}

// --- learn.ts extraction (same approach as build-search-index.mjs) ---------

export function extractArrayBody(source, declName) {
	const marker = `export const ${declName}`;
	const start = source.indexOf(marker);
	if (start === -1) return '';
	// Start the scan after '=' — a typed declaration like
	// `export const clusters: Cluster[] = [` contains '[' in the TYPE
	// annotation, and starting there silently extracts an empty body.
	const eq = source.indexOf('=', start);
	const bracket = source.indexOf('[', eq);
	let depth = 0;
	let inStr = null;
	let escaped = false;
	for (let i = bracket; i < source.length; i++) {
		const ch = source[i];
		if (inStr) {
			if (escaped) escaped = false;
			else if (ch === '\\') escaped = true;
			else if (ch === inStr) inStr = null;
			continue;
		}
		if (ch === "'" || ch === '"' || ch === '`') inStr = ch;
		else if (ch === '[') depth++;
		else if (ch === ']') {
			depth--;
			if (depth === 0) return source.slice(bracket + 1, i);
		}
	}
	return '';
}

export function splitTopLevelObjects(body) {
	const blocks = [];
	let depth = 0;
	let inStr = null;
	let escaped = false;
	let current = -1;
	for (let i = 0; i < body.length; i++) {
		const ch = body[i];
		if (inStr) {
			if (escaped) escaped = false;
			else if (ch === '\\') escaped = true;
			else if (ch === inStr) inStr = null;
			if (current >= 0) blocks[current] += ch;
			continue;
		}
		if (ch === "'" || ch === '"' || ch === '`') inStr = ch;
		else if (ch === '{') {
			if (depth === 0) {
				current = blocks.length;
				blocks.push('');
			}
			depth++;
		} else if (ch === '}') depth--;
		if (current >= 0) blocks[current] += ch;
		if (depth === 0 && current >= 0 && ch === '}') current = -1;
	}
	return blocks.filter((b) => b.trim().startsWith('{'));
}

export const field = (block, name) => {
	const m = block.match(new RegExp(`${name}:\\s*'([^']*)'`, 's'));
	return m ? m[1] : '';
};

export const strArray = (block, name) => {
	const m = block.match(new RegExp(`${name}:\\s*\\[([^\\]]*)\\]`, 's'));
	return m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
};

export function loadCurated() {
	const src = readFileSync(join(ROOT, 'src', 'lib', 'learn.ts'), 'utf8');
	const grab = (name) =>
		splitTopLevelObjects(extractArrayBody(src, name)).map((b) => ({
			slug: field(b, 'slug'),
			title: field(b, 'title'),
			description: field(b, 'description'),
			intent: field(b, 'intent'),
		}));
	return {
		clusters: grab('clusters'),
		phraseSets: grab('phraseSets'),
		grammarTopics: grab('grammarTopics'),
	};
}

// --- Known-route registry (for internal-link validation) -------------------

export function knownRoutes(seoPages, curated, units) {
	const routes = new Set(['/']);
	// Static page files → routes. Dynamic routes are expanded below.
	const walk = (dir, prefix) => {
		for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
			const p = join(dir, e.name);
			if (e.isDirectory()) walk(p, `${prefix}${e.name}/`);
			else if (e.name.endsWith('.astro')) {
				const name = e.name.replace(/\.astro$/, '');
				if (name.includes('[')) continue; // dynamic — expanded from data
				if (name === '404') continue;
				routes.add(name === 'index' ? `/${prefix}` : `/${prefix}${name}/`);
			}
		}
	};
	walk('src/pages', '');
	// The learn-marathi section lives under src/pages/learn-marathi/ but the
	// content dataset references its routes LM-relative ("/blog/..."), so add
	// the subtree again with the /learn-marathi prefix stripped off.
	walk(join('src', 'pages', 'learn-marathi'), '');
	routes.add('/404.html');

	for (const u of units) routes.add(`/lessons/${u.unit}/`);
	for (const c of curated.clusters) {
		routes.add(`/vocabulary/${c.slug}/`);
		routes.add(`/quiz/${c.slug}/`);
	}
	for (const p of curated.phraseSets) routes.add(`/phrases/${p.slug}/`);
	for (const g of curated.grammarTopics) routes.add(`/grammar/${g.slug}/`);
	for (const p of seoPages) {
		if (p.status === 'published') routes.add(`${FAMILY_BASE[p.family]}${p.slug}/`);
	}
	return routes;
}
