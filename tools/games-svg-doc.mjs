// Generates docs/GAMES_SVG_PROMPTS.md from src/data/games/picture-guess.json
// (run: node tools/games-svg-doc.mjs). The table is the build source for the
// Picture Guess illustrations — regenerate + tweak any artwork.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'src/data/games/picture-guess.json'), 'utf8'));
const vocab = JSON.parse(readFileSync(join(root, 'src/data/learn/vocab.json'), 'utf8'));
const byId = new Map(vocab.map((w) => [w.id, w]));

const SUBJECT = {
	'safarchand.svg': 'one red apple with a small green leaf',
	'pani.svg': 'a glass of water, half full, with two ripple lines',
	'doodh.svg': 'a white milk glass with a blue label band',
	'bhaat.svg': 'a white bowl holding a mound of cooked rice, three visible grains',
	'kutra.svg': 'a friendly dog face with floppy ears and a cream muzzle',
	'manjar.svg': 'a cat face with pointed ears, green eyes and whiskers',
	'gaay.svg': 'a cow face with small horns and a cream muzzle',
	'ghar.svg': 'a simple house with a terracotta roof, door and two windows',
	'soorya.svg': 'a warm sun with eight rays',
	'phool.svg': 'an eight-petal flower with a round center',
	'shirt.svg': 'a green t-shirt',
	'aamba.svg': 'one ripe yellow-orange mango with a stem and leaf',
	'chaha.svg': 'a teacup on a saucer with steam lines and brown tea inside',
	'daar.svg': 'a wooden door with four inset panels and a round handle',
	'khidki.svg': 'a window with a cross frame and a light reflection',
	'khurchi.svg': 'a simple chair with a backrest and four legs',
	'diva.svg': 'a traditional oil lamp with a flame glow',
	'dola.svg': 'one wide-open eye with an iris and highlight',
	'haat.svg': 'an open hand with four fingers and a thumb',
	'paay.svg': 'one foot in profile',
	'jhaad.svg': 'a tree with a dark trunk and layered green crown',
	'chandra.svg': 'a crescent moon with three small stars',
	'chhatri.svg': 'an open umbrella with a curved handle',
	'topi.svg': 'a cap with a small round button on top',
	'saadi.svg': 'a draped sari with two gold border lines',
	'batata.svg': 'two brown potatoes with a few dimple dots',
	'hatti.svg': 'an elephant in profile with a trunk and one tusk hint',
	'vaagh.svg': 'a tiger face with dark stripes',
	'mor.svg': 'a peacock with a blue neck and five tail feathers with eye dots',
	'sasa.svg': 'a rabbit face with two long upright ears',
	'bakri.svg': 'a goat face with small straight horns',
	'maasa.svg': 'a fish in profile with fins and a round eye',
	'pakshi.svg': 'a small bird in profile with a beak and two legs',
	'ghadyaal.svg': 'a round clock face showing roughly ten past ten',
	'dhabdhaba.svg': 'a waterfall falling from a rock ledge into a pool',
	'talaav.svg': 'a still lake with two ripples and a distant hill',
	'paus.svg': 'a rain cloud with five falling rain strokes',
	'dhag.svg': 'a single fluffy cloud',
	'vij.svg': 'a lightning bolt under a small cloud',
	'pagdi.svg': 'a turban with two wrapped bands',
};

const SETTINGS =
	'Flat vector illustration, centered, transparent background, warm educational style, soft rounded shapes, ' +
	'palette #8E2D12 (terracotta) #2E7D5B (green) #B8860B (mustard) plus muted neutrals, viewBox 0 0 200 200, ' +
	'no gradients, no text (text would reveal the answer).';

const rows = data.items
	.map((it) => {
		const w = byId.get(it.id);
		const subject = SUBJECT[it.svg] ?? w.english.toLowerCase();
		return `| \`${it.svg}\` | ${w.marathi} | ${w.transliteration} | ${w.english} | ${it.level} | "${subject}" |`;
	})
	.join('\n');

const doc = `# Picture Guess — SVG prompt table

Original illustrations for \`public/games/picture-guess/\` (40 words from
\`src/data/games/picture-guess.json\`, which references \`vocab.json\` ids).
Regenerate the shipped set with \`node tools/make-picture-svgs.mjs\`.

## Constant settings (every row)

${SETTINGS}

## Files

| filename | Marathi | Transliteration | English | Level | Prompt (subject) |
|---|---|---|---|---|---|
${rows}

## Adding / replacing art

1. Pick a row, generate or draw an SVG that matches the subject prompt.
2. Keep the settings block above (size, palette, no text).
3. Save as \`public/games/picture-guess/<filename>\` — the game picks it up on
   the next build; missing files fall back to a labeled placeholder card.
`;
writeFileSync(join(root, 'docs', 'GAMES_SVG_PROMPTS.md'), doc);
console.log(`docs/GAMES_SVG_PROMPTS.md written (${data.items.length} rows)`);
