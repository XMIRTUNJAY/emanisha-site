// Contextual OG cards for the question-blog batch (1200×630).
// Each card = shared brand chrome (badge, title, tagline) + bespoke vector
// motif for the post's topic. Runs once; make-og-pages.mjs skips existing
// PNGs, so these are never overwritten.
// Run: node ./tools/make-og-blog-art.mjs
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const outDir = join(root, 'public', 'og');
const artDir = join(root, 'tools', 'og-art');
mkdirSync(outDir, { recursive: true });
mkdirSync(artDir, { recursive: true });

const C = {
	base: '#8E2D12',
	deep: '#6E210C',
	cream: '#FDFBF7',
	peach: '#FFDBD1',
	sun: '#F5B841',
	leaf: '#7AB648',
	sky: '#BEE3F8',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = (s) => s.replace(/[^\x00-\x7F]/g, '').replace(/\s{2,}/g, ' ').trim();

const chrome = (title, art) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="${C.base}"/>
<rect width="1200" height="630" fill="url(#v)" opacity="0"/>
${art}
<rect x="70" y="60" width="92" height="92" rx="22" fill="${C.cream}"/>
<text x="116" y="124" font-size="52" text-anchor="middle" fill="${C.base}" font-family="sans-serif" font-weight="bold">BM</text>
<text x="70" y="240" font-size="58" fill="${C.cream}" font-family="sans-serif" font-weight="bold" textLength="760" lengthAdjust="spacingAndGlyphs">${esc(strip(title))}</text>
<text x="70" y="292" font-size="30" fill="${C.peach}" font-family="sans-serif">Learn Marathi · Bol Marathi</text>
</svg>`;

const cards = {
	// 1 — market stall awning + bag
	'how-to-shop-in-marathi': chrome('How to Shop in Marathi', `
<g transform="translate(180,360)">
  <g>
    <path d="M0 0 h640 v40 h-640 z" fill="${C.deep}"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 80} 0 h40 v40 a40 18 0 0 1 -40 0 z" fill="${i % 2 ? C.cream : C.sun}"/>`).join('')}
  </g>
  <rect x="60" y="40" width="520" height="150" rx="14" fill="${C.cream}"/>
  <path d="M120 190 v-70 q0 -30 40 -30 q40 0 40 30 v70 z" fill="${C.sun}"/>
  <path d="M138 90 q22 -34 44 0" stroke="${C.base}" stroke-width="10" fill="none" stroke-linecap="round"/>
  <text x="380" y="120" font-size="38" text-anchor="middle" fill="${C.base}" font-family="sans-serif" font-weight="bold">KIMMAT KAY?</text>
</g>`),

	// 2 — train + platform clock
	'train-station-marathi': chrome('At the Train Station', `
<g transform="translate(220,350)">
  <rect x="0" y="60" width="560" height="150" rx="70" fill="${C.cream}"/>
  <rect x="30" y="90" width="110" height="60" rx="12" fill="${C.sky}"/>
  <rect x="160" y="90" width="110" height="60" rx="12" fill="${C.sky}"/>
  <rect x="470" y="60" width="90" height="150" rx="20" fill="${C.deep}"/>
  <circle cx="120" cy="210" r="26" fill="${C.deep}"/>
  <circle cx="440" cy="210" r="26" fill="${C.deep}"/>
  <rect x="640" y="-60" width="14" height="140" fill="${C.cream}"/>
  <circle cx="647" cy="-70" r="46" fill="${C.cream}"/>
  <path d="M647 -70 v-30 M647 -70 h24" stroke="${C.base}" stroke-width="8" stroke-linecap="round"/>
  <text x="280" y="40" font-size="30" fill="${C.peach}" font-family="sans-serif" font-weight="bold">PLATFORM 5</text>
</g>`),

	// 3 — big clock at 5:30
	'how-to-tell-time-in-marathi': chrome('How to Tell Time in Marathi', `
<g transform="translate(500,452)">
  <circle r="130" fill="${C.cream}"/>
  <circle r="112" fill="none" stroke="${C.base}" stroke-width="6"/>
  ${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<circle cx="${(Math.sin(a) * 96).toFixed(1)}" cy="${(-Math.cos(a) * 96).toFixed(1)}" r="${i % 3 ? 4 : 7}" fill="${C.base}"/>`; }).join('')}
  <path d="M0 0 L52 -30" stroke="${C.base}" stroke-width="12" stroke-linecap="round"/>
  <path d="M0 0 L-14 78" stroke="${C.sun}" stroke-width="9" stroke-linecap="round"/>
  <circle r="10" fill="${C.base}"/>
  <text x="0" y="152" font-size="30" text-anchor="middle" fill="${C.peach}" font-family="sans-serif" font-weight="bold">SAADE PAACH VAAJLE</text>
</g>`),

	// 4 — two speech bubbles, one ?
	'how-are-you-in-marathi': chrome('How Are You? in Marathi', `
<g transform="translate(200,360)">
  <g transform="rotate(-6 170 90)">
    <rect x="0" y="0" width="340" height="150" rx="30" fill="${C.cream}"/>
    <path d="M60 150 l-10 60 l70 -60 z" fill="${C.cream}"/>
    <text x="170" y="98" font-size="58" text-anchor="middle" fill="${C.base}" font-family="sans-serif" font-weight="bold">KASA AAHES?</text>
  </g>
  <g transform="translate(420,80) rotate(6)">
    <rect x="0" y="0" width="340" height="150" rx="30" fill="${C.sun}"/>
    <path d="M280 150 l10 60 l-70 -60 z" fill="${C.sun}"/>
    <text x="170" y="98" font-size="52" text-anchor="middle" fill="${C.base}" font-family="sans-serif" font-weight="bold">MI THIK AAHE</text>
  </g>
</g>`),

	// 5 — two people meeting, heart above
	'bhet-meaning-in-marathi': chrome('What Does "Bhet" Mean?', `
<g transform="translate(320,380)">
  <circle cx="120" cy="40" r="44" fill="${C.cream}"/>
  <path d="M40 170 q0 -90 80 -90 t80 90 z" fill="${C.cream}"/>
  <circle cx="440" cy="40" r="44" fill="${C.peach}"/>
  <path d="M360 170 q0 -90 80 -90 t80 90 z" fill="${C.peach}"/>
  <g transform="translate(280,-30)">
    <path d="M0 20 C0 -15 55 -15 55 20 C55 50 0 80 0 100 C0 80 -55 50 -55 20 C-55 -15 0 -15 0 20 z" fill="${C.sun}"/>
  </g>
  <text x="280" y="230" font-size="34" text-anchor="middle" fill="${C.peach}" font-family="sans-serif" font-weight="bold">BHETU = LET'S MEET</text>
</g>`),

	// 6 — stop-sign octagon
	'thamba-meaning-in-marathi': chrome('What Does "Thamba" Mean?', `
<g transform="translate(500,470)">
  <path d="M-60 -138 L60 -138 L138 -60 L138 60 L60 138 L-60 138 L-138 60 L-138 -60 Z" fill="${C.sun}"/>
  <path d="M-46 -108 L46 -108 L108 -46 L108 46 L46 108 L-46 108 L-108 46 L-108 -46 Z" fill="${C.base}"/>
  <text x="0" y="22" font-size="64" text-anchor="middle" fill="${C.cream}" font-family="sans-serif" font-weight="bold">STOP</text>
  <text x="0" y="180" font-size="32" text-anchor="middle" fill="${C.peach}" font-family="sans-serif" font-weight="bold">THAMBA</text>
</g>`),

	// 7 — check vs cross
	'yes-no-in-marathi': chrome('Yes and No in Marathi', `
<g transform="translate(210,368)">
  <circle cx="150" cy="80" r="100" fill="${C.leaf}"/>
  <path d="M95 82 l40 44 l70 -84" stroke="${C.cream}" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="560" cy="80" r="100" fill="${C.deep}"/>
  <path d="M515 35 l90 90 M605 35 l-90 90" stroke="${C.peach}" stroke-width="22" stroke-linecap="round"/>
  <text x="150" y="228" font-size="38" text-anchor="middle" fill="${C.cream}" font-family="sans-serif" font-weight="bold">HO</text>
  <text x="560" y="228" font-size="38" text-anchor="middle" fill="${C.peach}" font-family="sans-serif" font-weight="bold">NAKO</text>
</g>`),

	// 8 — three gender chips + pointer
	'this-in-marathi': chrome('Saying "This" in Marathi', `
<g transform="translate(220,380)">
  <g font-family="sans-serif" font-weight="bold" text-anchor="middle">
    <rect x="0" y="0" width="210" height="150" rx="26" fill="${C.sky}"/>
    <text x="105" y="78" font-size="44" fill="${C.base}">MASC</text>
    <text x="105" y="122" font-size="34" fill="${C.base}" opacity="0.75">ha</text>
    <rect x="250" y="0" width="210" height="150" rx="26" fill="${C.sun}"/>
    <text x="355" y="78" font-size="44" fill="${C.base}">FEM</text>
    <text x="355" y="122" font-size="34" fill="${C.base}" opacity="0.75">hee</text>
    <rect x="500" y="0" width="210" height="150" rx="26" fill="${C.peach}"/>
    <text x="605" y="78" font-size="44" fill="${C.base}">NEUT</text>
    <text x="605" y="122" font-size="34" fill="${C.base}" opacity="0.75">he</text>
  </g>
  <path d="M355 190 l0 50" stroke="${C.cream}" stroke-width="6" stroke-dasharray="2 14" stroke-linecap="round"/>
</g>`),

	// 9 — heart + music note + open book
	'i-like-in-marathi': chrome('Saying "I Like…" in Marathi', `
<g transform="translate(240,370)">
  <g transform="translate(90,90)">
    <path d="M0 16 C0 -16 48 -16 48 16 C48 44 0 70 0 88 C0 70 -48 44 -48 16 C-48 -16 0 -16 0 16 z" fill="${C.peach}"/>
  </g>
  <g transform="translate(330,40)" stroke="${C.sun}" fill="${C.sun}">
    <path d="M0 130 v-92 h18 v74 a16 16 0 1 1 -18 18 z M18 38 l60 -18 v70 M78 92 v0" stroke-width="0"/>
    <rect x="14" y="30" width="10" height="88" />
    <rect x="14" y="30" width="52" height="12" transform="skewY(-14)"/>
    <circle cx="66" cy="110" r="18"/>
    <circle cx="10" cy="138" r="14"/>
  </g>
  <g transform="translate(540,90)">
    <path d="M0 0 q70 -26 130 0 v110 q-60 -22 -130 0 z" fill="${C.cream}"/>
    <path d="M0 0 q-70 -26 -130 0 v110 q60 -22 130 0 z" fill="${C.cream}" opacity="0.85"/>
    <path d="M0 -14 v138" stroke="${C.base}" stroke-width="6"/>
  </g>
  <text x="330" y="250" font-size="34" text-anchor="middle" fill="${C.peach}" font-family="sans-serif" font-weight="bold">MALA AAVDAT</text>
</g>`),

	// 10 — life ring with question mark
	'i-dont-understand-in-marathi': chrome("'I Don't Understand' in Marathi", `
<g transform="translate(500,452)">
  <circle r="118" fill="${C.cream}"/>
  ${[45, 135, 225, 315].map((a) => `<rect x="-150" y="-18" width="42" height="36" rx="9" fill="${C.sun}" transform="rotate(${a})"/>`).join('')}
  <circle r="46" fill="${C.base}"/>
  <text x="0" y="26" font-size="64" text-anchor="middle" fill="${C.cream}" font-family="sans-serif" font-weight="bold">?</text>
  <text x="0" y="168" font-size="30" text-anchor="middle" fill="${C.peach}" font-family="sans-serif" font-weight="bold">RESCUE LINES</text>
</g>`),
};

for (const [slug, svg] of Object.entries(cards)) {
	const png = join(outDir, `og-blog-${slug}.png`);
	writeFileSync(join(artDir, `blog-${slug}.svg`), svg);
	await sharp(Buffer.from(svg)).png().toFile(png);
	console.log(`og-art: og-blog-${slug}.png`);
}
console.log(`done: ${Object.keys(cards).length} cards`);
