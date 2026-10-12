// One-off: exact akshara splits for crossword design candidates + plain-consonant endings.
import { readFileSync, writeFileSync } from 'node:fs';
import { splitGraphemes, normalizeMr } from '../src/lib/games/graphemes.ts';

const vocab = JSON.parse(readFileSync('src/data/learn/vocab.json', 'utf8'));
const want = ['साखर','काका','नाताळ','बाजार','रविवार','नकाशा','दिवाळी','लाडू','हाड','झाडू','घन','नवीन','नियम','रक्त','शत्रू','वाट','वाईट','मोबाईल','भाऊ','नऊ','दूर','चार','सात','काय','हवा','धन','पान','माळा','वाळू'];
let out = '';
for (const m of want) {
	const w = vocab.find((x) => x.marathi === m);
	out += (w ? w.id : 'MISSING') + ' ' + m + ' => ' + JSON.stringify(splitGraphemes(m)) + '\n';
}
out += '\n--- words whose final akshara is a plain consonant (single char) ---\n';
const ends = {};
for (const w of vocab) {
	const u = splitGraphemes(normalizeMr(w.marathi));
	const last = u[u.length - 1];
	if (last && last.length === 1 && /[क-ह]/.test(last)) {
		if (!ends[last]) ends[last] = [];
		ends[last].push(w.marathi);
	}
}
for (const k of ['क', 'ग', 'ड', 'त', 'प', 'म', 'य', 'ब', 'द', 'र', 'ळ', 'ण', 'ल', 'स', 'ह', 'व', 'न', 'ज', 'श', 'च']) {
	out += k + ': ' + (ends[k] || []).slice(0, 10).join(', ') + '\n';
}
writeFileSync('temp_splits.txt', out);
console.log('written', out.length, 'bytes');
