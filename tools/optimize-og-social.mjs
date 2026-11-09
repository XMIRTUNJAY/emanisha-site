// Convert the OG/social cards from PNG to JPEG (1200x630, q82, mozjpeg).
//
// Why: the pages reference art.ts `pageArtSocial()` -> /og/<base>.jpg. JPEG is
// universally supported by link-preview crawlers (Facebook, X, LinkedIn,
// WhatsApp, Slack) and the PNG originals are never fetched by a browser.
//
// Run: node ./tools/optimize-og-social.mjs        (generate .jpg)
//      node ./tools/optimize-og-social.mjs --prune (generate + delete .png)
import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const prune = process.argv.includes('--prune');

/*
 * Every directory that can hold a social card. The original version only
 * scanned public/og, so the learn-marathi cards were never converted and the
 * 220 blog posts whose PNG had no JPEG sibling served a 404 og:image.
 */
const cardDirs = [
  join(root, 'public', 'og'),
  join(root, 'public', 'learn-marathi', 'og'),
  join(root, 'public', 'notebook'),
];

const targets = [];
for (const dir of cardDirs) {
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir)) {
    if (name.endsWith('.png')) targets.push(join(dir, name));
  }
}

// Root-level fallback card (public/og-default.png) referenced by BaseHead.
for (const fallback of ['og-default.png', 'learn-marathi/og-default.png']) {
  const file = join(root, 'public', fallback);
  if (existsSync(file)) targets.push(file);
}

let done = 0;
let skipped = 0;
let before = 0;
let after = 0;

for (const png of targets) {
  const jpg = png.replace(/\.png$/, '.jpg');
  // Skip if a fresh JPEG already exists; regenerating is not idempotent in
  // size and wastes a full decode pass on every run.
  if (existsSync(jpg) && statSync(jpg).size > 0 && !prune) {
    skipped++;
    continue;
  }
  before += statSync(png).size;
  await sharp(png).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(jpg);
  after += statSync(jpg).size;
  done++;
  if (prune) unlinkSync(png);
}

const mb = (b) => (b / 1024 / 1024).toFixed(1) + ' MB';
console.log(
  `optimize-og-social: ${done} generated, ${skipped} already present` +
    (done ? ` (${mb(before)} PNG -> ${mb(after)} JPEG)` : ''),
);
