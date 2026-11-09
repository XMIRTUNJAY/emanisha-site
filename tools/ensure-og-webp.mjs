// Ensure every OG card has the .webp variant that pageArt() references.
//
// pageArt() returns /og/<base>.webp, but six cards were created before the
// generator started emitting WebP alongside PNG, so their <picture> source
// pointed at a file that did not exist. This derives the missing .webp from
// the matching .png (or .jpg) and reports anything it cannot resolve.
//
// Run: node ./tools/ensure-og-webp.mjs
import sharp from 'sharp';
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const cardDirs = [
  join(root, 'public', 'og'),
  join(root, 'public', 'learn-marathi', 'og'),
  join(root, 'public', 'notebook'),
];

let made = 0;
let unresolved = [];

for (const dir of cardDirs) {
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir);
  const bases = new Set(
    files
      .filter((f) => /\.(png|jpg|webp)$/.test(f))
      .map((f) => f.replace(/\.(png|jpg|webp)$/, '')),
  );

  for (const base of bases) {
    const webp = join(dir, `${base}.webp`);
    if (existsSync(webp)) continue;

    const png = join(dir, `${base}.png`);
    const jpg = join(dir, `${base}.jpg`);
    const src = existsSync(png) ? png : existsSync(jpg) ? jpg : null;
    if (!src) {
      unresolved.push(`${base} (no source image)`);
      continue;
    }
    await sharp(src).webp({ quality: 80 }).toFile(webp);
    made++;
  }
}

console.log(`ensure-og-webp: ${made} WebP cards generated`);
if (unresolved.length) {
  console.log(`  ${unresolved.length} card(s) have no source image:`);
  for (const u of unresolved) console.log(`    ${u}`);
}
