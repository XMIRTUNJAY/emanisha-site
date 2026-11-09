// Generate the missing cover image for the MF360 notebook project.
//
// The project has no dashboard screenshot (its own prose says the frontend is
// a scaffold), but it does have a project SVG that the page already renders.
// Rasterise that to the cover PNG so the page's og:image resolves.
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'public', 'notebook', 'projects', 'mutual-fund-360.svg');
const outDir = join(root, 'public', 'notebook', 'case-studies', 'mutual-fund-360');
const out = join(outDir, 'dashboard.png');

if (!existsSync(src)) {
  console.error(`missing source: ${src}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

// 1200x630 is the social-card ratio used elsewhere on the site.
await sharp(src)
  .resize(1200, 630, { fit: 'cover', position: 'top' })
  .png({ compressionLevel: 9 })
  .toFile(out);

const meta = await sharp(out).metadata();
console.log(`wrote ${out.split('/').slice(-3).join('/')}: ${meta.width}x${meta.height}`);
