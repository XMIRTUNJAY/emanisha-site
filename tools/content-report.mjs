// Content QA report → docs/CONTENT_QA.md.
// Run AFTER `npm run build`. Combines:
//   1. dataset summary (load + republish validation status)
//   2. dist-wide internal link check (every href in built HTML resolves)
//   3. orphan detection (pages with no inbound content links —
//      header/footer strips excluded so nav doesn't mask orphans)
//   4. metadata spot stats (pages, words, bridges, phrases served)
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	ROOT,
	FAMILY_BASE,
	loadSeoPages,
	loadUnits,
	loadCurated,
	loadVocab,
	knownRoutes,
} from './lib/content-lib.mjs';

const dist = join(ROOT, 'dist');
if (!existsSync(join(dist, 'index.html'))) {
	console.error('content-report: dist/ not built — run npm run build first');
	process.exit(1);
}

const outPath = join(ROOT, 'docs', 'CONTENT_QA.md');
const seoPages = loadSeoPages();
const published = seoPages.filter((p) => p.status === 'published');
const drafts = seoPages.filter((p) => p.status === 'draft');
const units = loadUnits();
const curated = loadCurated();
const vocab = loadVocab();
const routes = knownRoutes(seoPages, curated, units);

// --- walk dist HTML ---------------------------------------------------------
const htmlFiles = [];
const walkHtml = (dir) => {
	for (const e of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, e.name);
		if (e.isDirectory()) walkHtml(p);
		else if (e.name === 'index.html' || e.name === '404.html') htmlFiles.push(p);
	}
};
walkHtml(dist);

const pageOf = (file) => {
	let rel = relative(dist, file).replace(/\\/g, '/');
	if (rel === '404.html') return '/404.html';
	rel = rel.replace(/index\.html$/, '');
	return `/${rel}`;
};

// content-area links (header + footer stripped so chrome doesn't hide orphans)
const stripChrome = (html) =>
	html.replace(/<header[\s\S]*?<\/header>/gi, '').replace(/<footer[\s\S]*?<\/footer>/gi, '');

const brokenLinks = []; // {from, href}
const inbound = new Map(); // path -> Set(from)
const hrefRe = /href="(\/learn-marathi\/[^"#?]*?)"/g;

for (const file of htmlFiles) {
	const from = pageOf(file);
	const contentLinks = new Set();
	for (const m of stripChrome(readFileSync(file, 'utf8')).matchAll(hrefRe)) contentLinks.add(m[1]);
	for (const raw of contentLinks) {
		const path = raw.replace(/^\/learn-marathi/, '') || '/';
		const target = join(dist, path.replace(/\/$/, ''), 'index.html');
		const ok = path === '/' ? existsSync(join(dist, 'index.html')) : existsSync(target);
		if (!ok && !/\.(png|jpg|webp|svg|json|xml|tsv|txt|webmanifest|js|css)$/.test(path)) {
			brokenLinks.push({ from, href: path });
			continue;
		}
		if (!inbound.has(path)) inbound.set(path, new Set());
		inbound.get(path).add(from);
	}
}

// Orphans: built pages with zero content-area inbound links (self excluded).
const orphans = [];
for (const file of htmlFiles) {
	const p = pageOf(file);
	if (['/404.html', '/'].includes(p)) continue;
	const set = new Set(inbound.get(p) ?? []);
	set.delete(p);
	if (set.size === 0) orphans.push(p);
}

// Per-family stats.
const byFamily = {};
for (const p of seoPages) {
	byFamily[p.family] = byFamily[p.family] ?? { published: 0, draft: 0 };
	byFamily[p.family][p.status] = (byFamily[p.family][p.status] ?? 0) + 1;
}

const lines = [];
lines.push('# CONTENT_QA — content engine report', '');
lines.push(`Generated: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · run \`npm run build && node tools/content-report.mjs\` to refresh`, '');
lines.push('## Totals', '');
lines.push('| Metric | Count |', '|---|---|');
lines.push(`| Built HTML pages | ${htmlFiles.length} |`);
lines.push(`| Curriculum words served | ${vocab.length} |`);
lines.push(`| Lessons (units) | ${units.length} |`);
lines.push(`| Curated cluster/phrase/grammar pages | ${curated.clusters.length + curated.phraseSets.length + curated.grammarTopics.length} |`);
lines.push(`| Content-engine pages (published) | ${published.length} |`);
lines.push(`| Content-engine pages (draft) | ${drafts.length} |`);
lines.push(`| Sitemap routes known | ${routes.size} |`, '');

lines.push('## Content-engine pages by family', '');
lines.push('| Family | URL base | Published | Draft |', '|---|---|---|---|');
for (const [family, base] of Object.entries(FAMILY_BASE)) {
	lines.push(`| ${family} | ${base} | ${byFamily[family]?.published ?? 0} | ${byFamily[family]?.draft ?? 0} |`);
}
lines.push('');
lines.push('## Published content-engine pages', '');
lines.push('| Page | Intent | Level | Words/rows traced | Practice items |');
lines.push('|---|---|---|---|---|');
const unitsByNo = new Map(units.map((u) => [u.unit, u]));
for (const p of published) {
	const words = (p.categories?.length ? vocab.filter((w) => p.categories.includes(w.category)).length : 0) + (p.wordIds?.length ?? 0);
	const phrases =
		(p.speakingUnits ?? []).reduce((n, u) => n + (unitsByNo.get(u)?.speaking.length ?? 0), 0) +
		(p.speakingPicks ?? []).reduce((n, pick) => n + pick.lessons.length, 0);
	const bridges = (p.bridgeUnits ?? []).reduce((n, u) => n + (unitsByNo.get(u)?.bridge.length ?? 0), 0);
	const notes = (p.grammarPicks ?? []).reduce((n, g) => n + g.lessons.length, 0);
	const traced = [words && `${words} words`, phrases && `${phrases} phrases`, bridges && `${bridges} bridges`, notes && `${notes} notes`].filter(Boolean).join(' + ') || '—';
	const practice = (p.practice?.mcq?.length ?? 0) + (p.practice?.fill?.length ?? 0) + (p.practice?.translate?.length ?? 0);
	lines.push(`| ${FAMILY_BASE[p.family]}${p.slug}/ | ${p.searchIntent} | ${p.level} | ${traced} | ${practice} |`);
}
lines.push('');
lines.push('## Link integrity (dist-wide)', '');
lines.push(`Internal content links scanned across ${htmlFiles.length} pages.`, '');
if (brokenLinks.length) {
	lines.push('| From | Broken href |', '|---|---|');
	for (const b of brokenLinks) lines.push(`| ${b.from} | ${b.href} |`);
} else {
	lines.push('**0 broken internal links.**');
}
lines.push('');
lines.push('## Orphan pages (no inbound content links)', '');
if (orphans.length) {
	for (const o of orphans) lines.push(`- ${o}`);
} else {
	lines.push('**None.**');
}
lines.push('');
if (drafts.length) {
	lines.push('## Draft pages (not built)', '');
	for (const d of drafts) lines.push(`- ${FAMILY_BASE[d.family]}${d.slug}/ — ${d.title}`);
	lines.push('');
}

writeFileSync(outPath, lines.join('\n'));
console.log(`content-report: ${htmlFiles.length} pages, ${brokenLinks.length} broken links, ${orphans.length} orphans → docs/CONTENT_QA.md`);
if (brokenLinks.length) process.exitCode = 1;
