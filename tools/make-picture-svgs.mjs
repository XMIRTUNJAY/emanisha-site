// One-off generator for the 40 Picture Guess illustrations (original art for
// this repository — regenerate with: node tools/make-picture-svgs.mjs).
// Style: flat vector, 200×200 viewBox, warm Bol Marathi palette, no text.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'games', 'picture-guess');
mkdirSync(outDir, { recursive: true });

const T = '#8E2D12'; // terracotta
const TD = '#6B1F0E'; // terracotta dark
const G = '#2E7D5B'; // green
const GD = '#1F5A40'; // green dark
const M = '#B8860B'; // mustard
const C = '#F0EBE3'; // cream
const K = '#2D1B15'; // dark brown
const N = '#6D5B4E'; // muted brown
const B = '#5B7E95'; // muted blue
const BD = '#3F5E75'; // muted blue dark

const svg = (body) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-hidden="true">\n${body}\n</svg>\n`;

const ART = {
	'safarchand.svg': svg(`
		<circle cx="100" cy="115" r="58" fill="${TD}"/>
		<circle cx="100" cy="110" r="55" fill="${T}"/>
		<path d="M100 55 Q96 38 108 30" stroke="${K}" stroke-width="6" fill="none" stroke-linecap="round"/>
		<ellipse cx="122" cy="38" rx="16" ry="9" fill="${G}" transform="rotate(-24 122 38)"/>
		<ellipse cx="78" cy="105" rx="14" ry="24" fill="#C54F2C" opacity="0.55"/>`),
	'pani.svg': svg(`
		<path d="M62 40 L75 165 Q100 175 125 165 L138 40 Z" fill="${C}" stroke="${N}" stroke-width="4"/>
		<path d="M68 88 L76 160 Q100 169 124 160 L132 88 Q100 100 68 88 Z" fill="${B}"/>
		<path d="M74 110 Q100 120 126 110" stroke="${BD}" stroke-width="4" fill="none" opacity="0.6"/>
		<ellipse cx="100" cy="42" rx="36" ry="7" fill="${BD}" opacity="0.35"/>`),
	'doodh.svg': svg(`
		<path d="M70 40 L70 60 L62 80 L62 165 Q100 175 138 165 L138 80 L130 60 L130 40 Z" fill="#FFFFFF" stroke="${N}" stroke-width="4"/>
		<rect x="62" y="92" width="76" height="18" fill="${B}"/>
		<path d="M62 128 Q100 138 138 128 L138 165 Q100 175 62 165 Z" fill="${B}" opacity="0.25"/>`),
	'bhaat.svg': svg(`
		<path d="M45 110 Q100 128 155 110 L142 152 Q100 166 58 152 Z" fill="#FFFFFF" stroke="${N}" stroke-width="4"/>
		<path d="M48 110 Q100 90 152 110 Q100 128 48 110 Z" fill="#FFFFFF" stroke="${N}" stroke-width="4"/>
		<circle cx="85" cy="104" r="6" fill="${C}" stroke="${N}" stroke-width="2"/>
		<circle cx="105" cy="100" r="6" fill="${C}" stroke="${N}" stroke-width="2"/>
		<circle cx="120" cy="106" r="6" fill="${C}" stroke="${N}" stroke-width="2"/>
		<path d="M30 168 Q100 182 170 168" stroke="${N}" stroke-width="4" fill="none"/>`),
	'kutra.svg': svg(`
		<ellipse cx="100" cy="112" rx="52" ry="48" fill="${M}"/>
		<path d="M55 82 L42 44 Q70 52 78 74 Z" fill="${M}"/>
		<path d="M145 82 L158 44 Q130 52 122 74 Z" fill="${M}"/>
		<ellipse cx="100" cy="130" rx="26" ry="20" fill="${C}"/>
		<circle cx="82" cy="98" r="7" fill="${K}"/>
		<circle cx="118" cy="98" r="7" fill="${K}"/>
		<ellipse cx="100" cy="122" rx="10" ry="8" fill="${K}"/>
		<path d="M100 130 L100 138 M100 138 Q92 146 84 140 M100 138 Q108 146 116 140" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>`),
	'manjar.svg': svg(`
		<circle cx="100" cy="112" r="50" fill="${M}"/>
		<path d="M62 80 L58 42 L92 66 Z" fill="${M}"/>
		<path d="M138 80 L142 42 L108 66 Z" fill="${M}"/>
		<path d="M66 74 L64 54 L84 68 Z" fill="${C}"/>
		<path d="M134 74 L136 54 L116 68 Z" fill="${C}"/>
		<ellipse cx="82" cy="102" rx="8" ry="11" fill="${GD}"/>
		<ellipse cx="118" cy="102" rx="8" ry="11" fill="${GD}"/>
		<path d="M96 122 Q100 118 104 122" stroke="${K}" stroke-width="3" fill="none"/>
		<path d="M100 122 L100 130 M100 130 Q94 136 88 132 M100 130 Q106 136 112 132" stroke="${K}" stroke-width="3" fill="none" stroke-linecap="round"/>
		<ellipse cx="100" cy="118" rx="5" ry="4" fill="${T}"/>`),
	'gaay.svg': svg(`
		<ellipse cx="100" cy="118" rx="54" ry="46" fill="#FFFFFF" stroke="${N}" stroke-width="3"/>
		<ellipse cx="100" cy="140" rx="30" ry="22" fill="${C}"/>
		<path d="M58 78 L48 50 L74 62 Z" fill="${C}" stroke="${N}" stroke-width="3"/>
		<path d="M142 78 L152 50 L126 62 Z" fill="${C}" stroke="${N}" stroke-width="3"/>
		<circle cx="82" cy="102" r="7" fill="${K}"/>
		<circle cx="118" cy="102" r="7" fill="${K}"/>
		<ellipse cx="100" cy="132" rx="12" ry="9" fill="${C}"/>
		<ellipse cx="100" cy="138" rx="7" ry="5" fill="${T}"/>
		<path d="M60 92 Q100 84 140 92" stroke="${N}" stroke-width="3" fill="none"/>`),
	'ghar.svg': svg(`
		<path d="M40 92 L100 38 L160 92" stroke="${TD}" stroke-width="4" fill="none"/>
		<path d="M34 96 L100 32 L166 96 L156 96 L100 46 L44 96 Z" fill="${T}"/>
		<rect x="55" y="96" width="90" height="70" fill="${C}" stroke="${N}" stroke-width="4"/>
		<rect x="88" y="118" width="24" height="48" fill="${TD}"/>
		<rect x="64" y="110" width="16" height="16" fill="${B}"/>
		<rect x="120" y="110" width="16" height="16" fill="${B}"/>`),
	'soorya.svg': svg(`
		<circle cx="100" cy="100" r="40" fill="${M}"/>
		<g stroke="${M}" stroke-width="8" stroke-linecap="round">
			<path d="M100 30 L100 44"/><path d="M100 156 L100 170"/>
			<path d="M30 100 L44 100"/><path d="M156 100 L170 100"/>
			<path d="M51 51 L61 61"/><path d="M139 139 L149 149"/>
			<path d="M149 51 L139 61"/><path d="M61 139 L51 149"/>
		</g>
		<circle cx="100" cy="100" r="30" fill="#D89A12"/>`),
	'phool.svg': svg(`
		<path d="M100 108 Q96 150 78 168" stroke="${G}" stroke-width="6" fill="none"/>
		<ellipse cx="86" cy="146" rx="14" ry="7" fill="${G}" transform="rotate(-28 86 146)"/>
		<g fill="${T}">
			<ellipse cx="100" cy="62" rx="14" ry="24"/>
			<ellipse cx="100" cy="122" rx="14" ry="24"/>
			<ellipse cx="70" cy="92" rx="24" ry="14"/>
			<ellipse cx="130" cy="92" rx="24" ry="14"/>
			<ellipse cx="79" cy="71" rx="20" ry="12" transform="rotate(45 79 71)"/>
			<ellipse cx="121" cy="71" rx="20" ry="12" transform="rotate(-45 121 71)"/>
			<ellipse cx="79" cy="113" rx="20" ry="12" transform="rotate(-45 79 113)"/>
			<ellipse cx="121" cy="113" rx="20" ry="12" transform="rotate(45 121 113)"/>
		</g>
		<circle cx="100" cy="92" r="16" fill="${M}"/>`),
	'shirt.svg': svg(`
		<path d="M72 42 L40 60 L52 92 L68 84 L68 162 L132 162 L132 84 L148 92 L160 60 L128 42 Q100 56 72 42 Z" fill="${G}"/>
		<path d="M72 42 Q100 60 128 42" stroke="${GD}" stroke-width="4" fill="none"/>
		<path d="M96 46 L100 54 L104 46" stroke="${GD}" stroke-width="4" fill="none"/>`),
	'aamba.svg': svg(`
		<path d="M62 96 Q62 52 106 52 Q148 52 148 96 Q148 148 106 152 Q62 150 62 96 Z" fill="${M}"/>
		<path d="M76 88 Q78 64 106 60" stroke="#D89A12" stroke-width="6" fill="none" stroke-linecap="round"/>
		<path d="M106 52 Q104 40 114 34" stroke="${K}" stroke-width="5" fill="none" stroke-linecap="round"/>
		<ellipse cx="126" cy="38" rx="14" ry="8" fill="${G}" transform="rotate(-30 126 38)"/>`),
	'chaha.svg': svg(`
		<path d="M50 88 L58 150 Q100 160 142 150 L150 88 Z" fill="#FFFFFF" stroke="${N}" stroke-width="4"/>
		<path d="M54 92 L146 92 Q146 112 128 116 L72 116 Q54 112 54 92 Z" fill="${T}"/>
		<path d="M150 96 Q170 98 168 112 Q166 126 146 124" stroke="${N}" stroke-width="5" fill="none"/>
		<path d="M84 66 Q88 56 84 46 M104 66 Q108 56 104 46 M124 66 Q128 56 124 46" stroke="${N}" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7"/>
		<ellipse cx="100" cy="160" rx="58" ry="8" fill="${C}" stroke="${N}" stroke-width="3"/>`),
	'daar.svg': svg(`
		<rect x="50" y="36" width="100" height="130" rx="4" fill="${TD}"/>
		<rect x="58" y="44" width="84" height="122" fill="${T}"/>
		<rect x="66" y="52" width="30" height="52" fill="${M}" opacity="0.4"/>
		<rect x="104" y="52" width="30" height="52" fill="${M}" opacity="0.4"/>
		<rect x="66" y="112" width="30" height="46" fill="${M}" opacity="0.4"/>
		<rect x="104" y="112" width="30" height="46" fill="${M}" opacity="0.4"/>
		<circle cx="130" cy="106" r="5" fill="${M}"/>`),
	'khidki.svg': svg(`
		<rect x="44" y="44" width="112" height="112" rx="4" fill="${N}"/>
		<rect x="52" y="52" width="96" height="96" fill="${B}"/>
		<path d="M52 52 L148 148 M148 52 L52 148" stroke="#FFFFFF" stroke-width="3" opacity="0.5"/>
		<rect x="96" y="52" width="8" height="96" fill="${N}"/>
		<rect x="52" y="96" width="96" height="8" fill="${N}"/>
		<ellipse cx="76" cy="76" rx="14" ry="8" fill="#FFFFFF" opacity="0.6" transform="rotate(-18 76 76)"/>`),
	'khurchi.svg': svg(`
		<path d="M62 40 L62 96 Q62 108 76 108 L124 108 Q138 108 138 96 L138 40" stroke="${TD}" stroke-width="10" fill="none" stroke-linecap="round"/>
		<path d="M62 96 L62 164 M138 96 L138 164" stroke="${TD}" stroke-width="10" stroke-linecap="round"/>
		<path d="M62 120 L138 120" stroke="${TD}" stroke-width="9" stroke-linecap="round"/>
		<path d="M50 40 L150 40" stroke="${TD}" stroke-width="10" stroke-linecap="round" opacity="0"/>`),
	'diva.svg': svg(`
		<path d="M84 40 L116 40 L110 74 L90 74 Z" fill="${TD}"/>
		<rect x="86" y="74" width="28" height="10" fill="${K}"/>
		<path d="M70 88 L130 88 L118 150 Q100 158 82 150 Z" fill="${M}"/>
		<ellipse cx="100" cy="152" rx="30" ry="8" fill="${TD}"/>
		<circle cx="100" cy="118" r="14" fill="#FFDBD1" opacity="0.85"/>`),
	'dola.svg': svg(`
		<path d="M28 100 Q100 48 172 100 Q100 152 28 100 Z" fill="#FFFFFF" stroke="${K}" stroke-width="5"/>
		<circle cx="100" cy="100" r="26" fill="${B}"/>
		<circle cx="100" cy="100" r="13" fill="${K}"/>
		<circle cx="106" cy="94" r="4" fill="#FFFFFF"/>`),
	'haat.svg': svg(`
		<path d="M70 168 L66 104 Q64 92 74 92 Q82 92 82 102 L82 88 Q82 78 90 78 Q98 78 98 88 L98 82 Q98 72 106 72 Q114 72 114 82 L114 90 Q114 82 122 82 Q130 82 130 92 L130 130 Q130 152 116 168 Z" fill="${M}" stroke="${TD}" stroke-width="4"/>
		<path d="M70 130 Q60 136 62 146 Q64 156 76 156" stroke="${M}" stroke-width="14" fill="none" stroke-linecap="round"/>`),
	'paay.svg': svg(`
		<path d="M76 36 Q100 28 118 42 L124 120 Q126 140 112 152 L112 164 L84 164 L84 148 Q70 138 74 116 Z" fill="${M}" stroke="${TD}" stroke-width="4"/>
		<path d="M84 164 L84 176 Q100 182 112 176 L112 164" fill="${TD}"/>
		<path d="M92 60 Q100 56 108 60" stroke="${TD}" stroke-width="3" fill="none"/>`),
	'jhaad.svg': svg(`
		<rect x="92" y="110" width="16" height="60" fill="${K}"/>
		<circle cx="100" cy="78" r="42" fill="${G}"/>
		<circle cx="72" cy="94" r="24" fill="${GD}"/>
		<circle cx="128" cy="94" r="24" fill="${GD}"/>
		<circle cx="100" cy="60" r="22" fill="#3C8E68"/>`),
	'chandra.svg': svg(`
		<path d="M126 36 Q70 44 70 100 Q70 156 126 164 Q96 150 88 122 Q82 98 90 72 Q98 48 126 36 Z" fill="${M}"/>
		<circle cx="60" cy="60" r="3" fill="${N}"/>
		<circle cx="48" cy="110" r="2.5" fill="${N}"/>
		<circle cx="70" cy="160" r="2" fill="${N}"/>
		<circle cx="140" cy="70" r="2.5" fill="${N}"/>`),
	'chhatri.svg': svg(`
		<path d="M30 100 Q100 20 170 100 Q100 84 30 100 Z" fill="${T}"/>
		<path d="M64 96 Q100 40 100 92 M136 96 Q100 40 100 92" stroke="${TD}" stroke-width="3" fill="none"/>
		<path d="M100 88 L100 152" stroke="${K}" stroke-width="5"/>
		<path d="M100 152 Q100 164 90 162" stroke="${K}" stroke-width="5" fill="none" stroke-linecap="round"/>
		<circle cx="100" cy="30" r="5" fill="${K}"/>`),
	'topi.svg': svg(`
		<path d="M48 118 Q48 60 100 60 Q152 60 152 118 L152 132 L48 132 Z" fill="${T}"/>
		<rect x="40" y="128" width="120" height="16" rx="8" fill="${TD}"/>
		<circle cx="100" cy="60" r="9" fill="${M}"/>`),
	'saadi.svg': svg(`
		<path d="M60 44 L84 40 L100 66 L116 40 L140 44 L156 168 L44 168 Z" fill="${T}"/>
		<path d="M60 44 L100 66 L140 44" stroke="${M}" stroke-width="4" fill="none"/>
		<path d="M52 96 Q100 110 148 96" stroke="${M}" stroke-width="4" fill="none"/>
		<path d="M48 132 Q100 146 152 132" stroke="${M}" stroke-width="4" fill="none"/>
		<circle cx="100" cy="70" r="4" fill="${M}"/>`),
	'batata.svg': svg(`
		<ellipse cx="82" cy="112" rx="40" ry="30" fill="${M}" transform="rotate(-14 82 112)"/>
		<ellipse cx="124" cy="82" rx="34" ry="26" fill="#C99A1E" transform="rotate(12 124 82)"/>
		<circle cx="70" cy="104" r="3" fill="${TD}"/>
		<circle cx="90" cy="120" r="3" fill="${TD}"/>
		<circle cx="118" cy="78" r="3" fill="${TD}"/>
		<circle cx="132" cy="90" r="3" fill="${TD}"/>`),
	'hatti.svg': svg(`
		<ellipse cx="100" cy="118" rx="60" ry="48" fill="${N}"/>
		<circle cx="148" cy="82" r="30" fill="${N}"/>
		<path d="M168 88 Q184 100 172 116 Q182 106 174 94 Z" fill="${N}"/>
		<path d="M172 112 Q170 128 156 132 Q166 134 172 126 Q178 116 172 112 Z" fill="${N}"/>
		<circle cx="142" cy="76" r="5" fill="${K}"/>
		<path d="M52 84 Q40 92 44 106" stroke="${N}" stroke-width="14" fill="none" stroke-linecap="round"/>
		<ellipse cx="88" cy="150" rx="10" ry="16" fill="${N}"/>
		<ellipse cx="118" cy="150" rx="10" ry="16" fill="${N}"/>
		<path d="M76 104 Q100 94 124 104" stroke="${TD}" stroke-width="4" fill="none" opacity="0.4"/>`),
	'vaagh.svg': svg(`
		<circle cx="100" cy="106" r="50" fill="${M}"/>
		<path d="M60 68 L50 40 L82 54 Z" fill="${M}"/>
		<path d="M140 68 L150 40 L118 54 Z" fill="${M}"/>
		<path d="M78 66 L86 90 M100 62 L100 88 M122 66 L114 90" stroke="${K}" stroke-width="6" stroke-linecap="round"/>
		<circle cx="82" cy="100" r="7" fill="${K}"/>
		<circle cx="118" cy="100" r="7" fill="${K}"/>
		<ellipse cx="100" cy="124" rx="10" ry="8" fill="${C}"/>
		<path d="M92 118 L100 124 L108 118" stroke="${K}" stroke-width="3" fill="none"/>
		<path d="M100 124 L100 134 M100 134 Q92 140 86 134 M100 134 Q108 140 114 134" stroke="${K}" stroke-width="3" fill="none" stroke-linecap="round"/>`),
	'mor.svg': svg(`
		<circle cx="100" cy="76" r="26" fill="${B}"/>
		<path d="M84 68 Q100 52 116 68" stroke="${G}" stroke-width="4" fill="none"/>
		<path d="M112 66 Q118 60 124 62" stroke="${TD}" stroke-width="3" fill="none" stroke-linecap="round"/>
		<circle cx="112" cy="68" r="3" fill="${K}"/>
		<path d="M100 102 L100 128" stroke="${B}" stroke-width="8"/>
		<g fill="${G}">
			<ellipse cx="56" cy="132" rx="16" ry="10" transform="rotate(-18 56 132)"/>
			<ellipse cx="144" cy="132" rx="16" ry="10" transform="rotate(18 144 132)"/>
			<ellipse cx="72" cy="150" rx="18" ry="10" transform="rotate(-6 72 150)"/>
			<ellipse cx="128" cy="150" rx="18" ry="10" transform="rotate(6 128 150)"/>
			<ellipse cx="100" cy="158" rx="18" ry="10"/>
		</g>
		<g fill="${M}">
			<circle cx="56" cy="132" r="4"/><circle cx="144" cy="132" r="4"/>
			<circle cx="72" cy="150" r="4"/><circle cx="128" cy="150" r="4"/>
			<circle cx="100" cy="158" r="4"/>
		</g>
		<path d="M92 96 L108 96" stroke="${G}" stroke-width="8" stroke-linecap="round"/>`),
	'sasa.svg': svg(`
		<circle cx="100" cy="118" r="44" fill="${C}" stroke="${N}" stroke-width="3"/>
		<ellipse cx="76" cy="66" rx="10" ry="28" fill="${C}" stroke="${N}" stroke-width="3" transform="rotate(-12 76 66)"/>
		<ellipse cx="124" cy="66" rx="10" ry="28" fill="${C}" stroke="${N}" stroke-width="3" transform="rotate(12 124 66)"/>
		<ellipse cx="76" cy="66" rx="5" ry="20" fill="${T}" opacity="0.5" transform="rotate(-12 76 66)"/>
		<circle cx="86" cy="108" r="6" fill="${K}"/>
		<circle cx="114" cy="108" r="6" fill="${K}"/>
		<path d="M96 122 L104 122" stroke="${K}" stroke-width="3"/>
		<path d="M100 122 Q96 130 90 128 M100 122 Q104 130 110 128" stroke="${K}" stroke-width="3" fill="none"/>
		<circle cx="100" cy="116" r="4" fill="${T}"/>`),
	'bakri.svg': svg(`
		<ellipse cx="100" cy="116" rx="50" ry="46" fill="${C}" stroke="${N}" stroke-width="3"/>
		<path d="M66 76 L58 52 L78 60 Z" fill="${N}"/>
		<path d="M134 76 L142 52 L122 60 Z" fill="${N}"/>
		<ellipse cx="84" cy="102" rx="7" ry="9" fill="${K}"/>
		<ellipse cx="116" cy="102" rx="7" ry="9" fill="${K}"/>
		<ellipse cx="100" cy="128" rx="12" ry="9" fill="${M}"/>
		<ellipse cx="100" cy="132" rx="7" ry="5" fill="${TD}"/>
		<path d="M92 84 Q100 90 108 84" stroke="${N}" stroke-width="3" fill="none"/>`),
	'maasa.svg': svg(`
		<path d="M36 100 Q76 62 122 78 Q150 88 156 100 Q150 112 122 122 Q76 138 36 100 Z" fill="${B}"/>
		<path d="M156 100 L184 78 L184 122 Z" fill="${BD}"/>
		<circle cx="66" cy="94" r="7" fill="#FFFFFF"/>
		<circle cx="68" cy="94" r="3.5" fill="${K}"/>
		<path d="M96 74 Q104 100 96 126 M116 78 Q124 100 116 122" stroke="${BD}" stroke-width="4" fill="none" opacity="0.7"/>
		<path d="M40 100 Q56 92 60 100 Q56 108 40 100" fill="${M}" opacity="0.7"/>`),
	'pakshi.svg': svg(`
		<ellipse cx="96" cy="108" rx="44" ry="34" fill="${M}"/>
		<circle cx="134" cy="76" r="20" fill="${M}"/>
		<path d="M152 74 L172 80 L152 88 Z" fill="${TD}"/>
		<circle cx="138" cy="72" r="4" fill="${K}"/>
		<path d="M64 104 Q88 88 112 104 Q88 122 64 104 Z" fill="${TD}" opacity="0.5"/>
		<path d="M92 142 L88 166 M104 142 L106 166" stroke="${TD}" stroke-width="5" stroke-linecap="round"/>
		<path d="M70 92 Q60 76 68 64" stroke="${TD}" stroke-width="4" fill="none" opacity="0.6"/>`),
	'ghadyaal.svg': svg(`
		<circle cx="100" cy="100" r="62" fill="${C}" stroke="${TD}" stroke-width="8"/>
		<circle cx="100" cy="100" r="50" fill="#FFFFFF"/>
		<g stroke="${N}" stroke-width="3">
			<path d="M100 54 L100 62"/><path d="M100 138 L100 146"/>
			<path d="M54 100 L62 100"/><path d="M138 100 L146 100"/>
		</g>
		<path d="M100 100 L100 64" stroke="${K}" stroke-width="5" stroke-linecap="round"/>
		<path d="M100 100 L128 116" stroke="${TD}" stroke-width="4" stroke-linecap="round"/>
		<circle cx="100" cy="100" r="5" fill="${T}"/>`),
	'dhabdhaba.svg': svg(`
		<path d="M30 40 L170 40 L170 58 L146 58 L146 150 Q146 162 132 162 L68 162 Q54 162 54 150 L54 58 L30 58 Z" fill="${N}"/>
		<path d="M60 58 L60 140 Q60 150 70 150 L130 150 Q140 150 140 140 L140 58" fill="${B}"/>
		<path d="M74 58 L74 100 M100 58 L100 116 M126 58 L126 100" stroke="#FFFFFF" stroke-width="5" opacity="0.5"/>
		<path d="M54 40 L60 20 L72 40 M126 40 L136 16 L146 40" fill="${G}" opacity="0"/>`),
	'talaav.svg': svg(`
		<rect x="24" y="104" width="152" height="60" rx="10" fill="${B}"/>
		<path d="M24 118 Q64 108 100 118 Q136 128 176 118" stroke="#FFFFFF" stroke-width="4" fill="none" opacity="0.5"/>
		<path d="M40 104 Q70 60 100 96 Q124 64 160 104" fill="${GD}" opacity="0.25"/>
		<circle cx="60" cy="128" r="6" fill="${M}" opacity="0.8"/>
		<circle cx="140" cy="136" r="5" fill="${M}" opacity="0.8"/>
		<path d="M150 60 Q160 40 176 44" stroke="${G}" stroke-width="8" fill="none" stroke-linecap="round"/>`),
	'paus.svg': svg(`
		<path d="M56 92 Q44 92 44 78 Q44 64 58 64 Q60 44 82 44 Q100 44 104 60 Q122 56 128 72 Q142 74 140 88 Q138 100 124 100 L60 100 Q56 100 56 92 Z" fill="${N}"/>
		<g stroke="${B}" stroke-width="7" stroke-linecap="round">
			<path d="M66 116 L60 134"/><path d="M96 116 L90 134"/><path d="M126 116 L120 134"/>
			<path d="M80 142 L76 154"/><path d="M112 142 L108 154"/>
		</g>`),
	'dhag.svg': svg(`
		<path d="M48 124 Q32 124 32 106 Q32 90 48 88 Q50 66 74 66 Q88 66 94 78 Q102 66 118 70 Q136 74 136 92 Q154 92 154 108 Q154 124 138 124 Z" fill="${N}"/>
		<path d="M60 140 Q80 132 100 140 Q120 148 140 140" stroke="${B}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.6"/>`),
	'vij.svg': svg(`
		<path d="M40 132 Q28 132 28 114 Q28 98 44 96 Q46 74 70 74 Q88 74 94 90 Q112 86 118 102 Q134 104 132 120 Q130 132 116 132 Z" fill="${N}"/>
		<path d="M96 96 L72 140 L92 140 L80 172 L118 124 L98 124 L110 96 Z" fill="${M}"/>`),
	'pagdi.svg': svg(`
		<path d="M40 132 Q36 84 76 66 Q112 50 142 70 Q164 84 160 112 Q158 132 144 132 Z" fill="${T}"/>
		<path d="M56 118 Q100 96 148 118" stroke="${M}" stroke-width="8" fill="none"/>
		<path d="M64 96 Q104 74 142 96" stroke="${TD}" stroke-width="6" fill="none" opacity="0.7"/>
		<rect x="36" y="128" width="128" height="18" rx="9" fill="${TD}"/>
		<circle cx="100" cy="70" r="7" fill="${M}"/>`),
};

let count = 0;
for (const [name, content] of Object.entries(ART)) {
	writeFileSync(join(outDir, name), content);
	count += 1;
}
console.log(`wrote ${count} SVGs to ${outDir}`);
