// Post-build rewrite for the de-agent-platform static export.
//
// The platform is authored for domain-root deployment (Vercel). When embedded
// at emanisha.in/de-agent/, every root-absolute URL must gain the /de-agent
// prefix. This script rewrites the BUILT dist (never the platform source):
//   - "href/src/action/fetch('/<section>/..."  ->  ".../de-agent/<section>/..."
//   - absolute https://emanisha.in/<section>/  ->  .../de-agent/<section>/
//   - exact href="/"                            ->  href="/de-agent/"
//   - leftover de-agent-platform.vercel.app    ->  emanisha.in/de-agent
// Covers .html/.js/.json/.xml/.txt/.webmanifest/.svg/.css. Prints counts and
// fails if any unprefixed platform refs remain.
import fs from 'node:fs';
import path from 'node:path';

const PREFIXES = [
	'skills', 'mcp', 'agents', 'hooks', 'plugins', 'templates', 'patterns',
	'runbooks', 'projects', 'tutorials', 'references', 'docs', 'guides',
	'roadmap', 'taxonomy', 'categories', 'search', 'publisher', 'dashboard',
	'admin', 'agentic', 'marketplace', 'resources', 'data', '_astro', 'api',
];
const ALT = PREFIXES.join('|');
const SITE = 'https://emanisha.in';
const VERCEL = 'https://de-agent-platform.vercel.app';

const dist = process.argv[2];
if (!dist || !fs.existsSync(dist)) {
	console.error('usage: node tools/de-agent-rewrite.mjs <platform-dist-dir>');
	process.exit(1);
}

const TEXT_EXT = /\.(html|js|mjs|json|xml|txt|webmanifest|svg|css)$/;
let files = 0;
let subs = 0;

function walk(dir) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) {
			walk(p);
			continue;
		}
		if (!TEXT_EXT.test(p)) continue;
		let s = fs.readFileSync(p, 'utf8');
		const o = s;
		// 1. absolute URLs with site origin (sitemap, rss, canonical, og)
		s = s.replace(new RegExp(`${SITE.replace(/\//g, '\\/')}\\/(${ALT})(?=[\\/"'#])`, 'g'), `${SITE}/de-agent/$1`);
		// 2. root-absolute refs in markup/js/css/json ("...', =, (, whitespace before /).
		// Trailing delimiter may be /, closing quote, or #fragment.
		s = s.replace(new RegExp(`(["'=\\(\\s,])\\/(${ALT})(?=[\\/"'#])`, 'g'), '$1/de-agent/$2');
		// 3. exact site-root links -> subsection root
		s = s.replace(/href="\/"/g, 'href="/de-agent/"');
		s = s.replace(/href='\/'/g, "href='/de-agent/'");
		// 3b. root-level single files (og image, favicon) -> subsection copies
		s = s.split(`${SITE}/og.svg`).join(`${SITE}/de-agent/og.svg`);
		s = s.split('"/og.svg"').join('"/de-agent/og.svg"');
		s = s.split("'\/og.svg'").join("'/de-agent/og.svg'");
		s = s.split('"/favicon.svg').join('"/de-agent/favicon.svg');
		s = s.split("'\/favicon.svg").join("'/de-agent/favicon.svg");
		s = s.split('"/rss.xml"').join('"/de-agent/rss.xml"');
		s = s.split("'\/rss.xml'").join("'/de-agent/rss.xml'");
		// 4. leftover Vercel origin
		s = s.split(VERCEL).join(`${SITE}/de-agent`);
		if (s !== o) {
			fs.writeFileSync(p, s);
			files++;
			subs += o.split('/skills/').length - s.split('/skills/').length + (o.length - s.length > 0 ? 1 : 0);
		}
	}
}
walk(dist);

// verification sweep: any unprefixed platform refs left?
const leftovers = [];
(function scan(dir) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) {
			scan(p);
			continue;
		}
		if (!TEXT_EXT.test(p)) continue;
		const s = fs.readFileSync(p, 'utf8');
		const re = new RegExp(`(["'=\\(\\s,])\\/(${ALT})(?=[\\/"'#])`);
		const m = s.match(re);
		if (m) leftovers.push(path.relative(dist, p) + ' :: ' + m[0].slice(0, 50));
		if (s.includes(VERCEL)) leftovers.push(path.relative(dist, p) + ' :: vercel-url');
		if (s.includes(`${SITE}/og.svg`) || s.includes('"/og.svg"')) {
			leftovers.push(path.relative(dist, p) + ' :: root og.svg');
		}
		if (/["']\/favicon\.svg/.test(s)) leftovers.push(path.relative(dist, p) + ' :: root favicon');
		if (/["']\/rss\.xml["']/.test(s)) leftovers.push(path.relative(dist, p) + ' :: root rss');
	}
})(dist);

console.log(`rewrote ${files} files`);
if (leftovers.length) {
	console.log('LEFTOVER UNPREFIXED REFS (' + leftovers.length + '):');
	leftovers.slice(0, 15).forEach((l) => console.log('  ' + l));
	process.exit(1);
}
console.log('verify: zero unprefixed platform refs');
