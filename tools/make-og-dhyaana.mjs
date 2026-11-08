// Regenerate the Dhyaana share card from its SVG source.
//   node ./tools/make-og-dhyaana.mjs
// Output: public/og/og-dhyaana.png (1200x630). The .svg is the source of truth,
// matching how the other og-*.svg / og-*.png pairs in public/og are kept.
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const svg = join(root, 'public', 'og', 'og-dhyaana.svg');
const png = join(root, 'public', 'og', 'og-dhyaana.png');

await sharp(svg).png().toFile(png);
const meta = await sharp(png).metadata();
console.log(`og-dhyaana.png: ${meta.width}x${meta.height}`);
