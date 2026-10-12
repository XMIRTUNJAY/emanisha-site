// Convert the OG/social cards from PNG to JPEG (1200x630, q82, mozjpeg).
//
// Why: the pages reference art.ts `pageArtSocial()` -> /og/<base>.jpg. JPEG is
// universally supported by link-preview crawlers (Facebook, X, LinkedIn,
// WhatsApp, Slack) and is ~10x smaller than the old PNG set, which shipped
// ~162 MB in every deploy for cards no browser ever downloaded.
//
// Run: node ./tools/optimize-og-social.mjs        (generate .jpg)
//      node ./tools/optimize-og-social.mjs --prune (generate + delete .png)
import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const prune = process.argv.includes('--prune');

const targets = [];
const ogDir = join(root, 'public', 'og');
for (const name of readdirSync(ogDir)) if (name.endsWith('.png')) targets.push(join(ogDir, name));
// Root-level fallback card (public/og-default.png) referenced by BaseHead.
const rootDefault = join(root, 'public', 'og-default.png');
try { statSync(rootDefault); targets.push(rootDefault); } catch { /* optional */ }

let done = 0;
let before = 0;
let after = 0;
for (const png of targets) {
  const jpg = png.replace(/\.png$/, '.jpg');
  before += statSync(png).size;
  await sharp(png).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(jpg);
  after += statSync(jpg).size;
  done++;
  if (prune) unlinkSync(png);
}

const mb = (b) => (b / 1024 / 1024).toFixed(1) + ' MB';
console.log(`optimize-og-social: ${done} cards -> JPEG (${mb(before)} -> ${mb(after)})${prune ? ' [pruned PNGs]' : ''}`);
