// Blog guide audit — prints a per-guide richness report and fails (exit 1)
// if any guide would ship thin. Mirrors the build-time gate in
// src/lib/guides.ts so it can be run standalone: node ./tools/audit-blog-guides.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const guides = JSON.parse(readFileSync(join(root, 'src', 'data', 'blog', 'guides.json'), 'utf8'));
const vocab = JSON.parse(readFileSync(join(root, 'src', 'data', 'learn', 'vocab.json'), 'utf8'));
const vocabSet = new Set(vocab.map((w) => w.marathi));

const pad = (s, n) => String(s).padEnd(n);
console.log(`\nBLOG GUIDE AUDIT — ${guides.length} guides\n`);
console.log(pad('slug', 46) + pad('sec', 4) + pad('ans', 4) + pad('phr', 4) + pad('dlg', 4) + pad('wds', 4) + pad('mis', 4) + pad('faq', 4) + pad('lnk', 4) + 'status');

let bad = 0;
for (const g of guides) {
	const linkCount = (g.related?.length ?? 0) + (g.links?.length ?? 0);
	const sections =
		1 + (g.phrases ? 1 : 0) + (g.dialogue ? 1 : 0) + (g.words?.length ? 1 : 0) +
		(g.mistakes ? 1 : 0) + (g.tip ? 1 : 0) + 1 + (linkCount ? 1 : 0);
	const problems = [];
	if (g.answer.length < 3) problems.push(`answer ${g.answer.length}<3`);
	const wordRows = (g.phrases?.length ?? 0) + (g.dialogue?.length ?? 0) + (g.words?.length ?? 0);
	// word guides carry their rows in the curriculum spotlight + example line
	if (!(g.words?.length && g.kind === 'word') && (g.phrases?.length ?? 0) + (g.dialogue?.length ?? 0) < 3) problems.push('rows<3');
	if (wordRows < 3 && !g.words?.length) problems.push('rows<3');
	if ((g.mistakes?.length ?? 0) < 2) problems.push('mistakes<2');
	if (!g.tip || g.tip.length < 40) problems.push('tip');
	if (g.faqs.length < 3) problems.push('faqs<3');
	if (linkCount < 2) problems.push('links<2');
	if (g.lead.length < 100) problems.push('lead<100');
	for (const w of g.words ?? []) if (!vocabSet.has(w)) problems.push(`word "${w}" not in vocab`);
	if (g.kind === 'word' && !g.words?.length) problems.push('word guide without vocab');

	const status = problems.length ? 'THIN: ' + problems.join('; ') : 'ok';
	if (problems.length) bad++;
	console.log(
		pad(g.slug, 46) + pad(sections, 4) + pad(g.answer.length, 4) +
		pad(g.phrases?.length ?? 0, 4) + pad(g.dialogue?.length ?? 0, 4) +
		pad(g.words?.length ?? 0, 4) + pad(g.mistakes?.length ?? 0, 4) +
		pad(g.faqs.length, 4) + pad(linkCount, 4) + status
	);
}
console.log(`\n${guides.length - bad}/${guides.length} guides pass the anti-thin audit.`);
if (bad) {
	console.error(`${bad} guides are thin — fix before publishing.`);
	process.exit(1);
}
