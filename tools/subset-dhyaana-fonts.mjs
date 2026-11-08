// Subset the Mukta Devanagari fonts to the characters the app actually uses.
//
//   node ./tools/subset-dhyaana-fonts.mjs
//
// The full Mukta TTFs are ~830 KB and are downloaded on every page load, but
// the app renders only a few dozen Devanagari characters (world names, the
// ध्यान wordmark, section labels). Subsetting to those characters and
// converting to WOFF2 cuts the payload to a few KB.
//
// Inputs : apps/dhyaana/src/assets/mukta-{400,500}.ttf
// Outputs: apps/dhyaana/src/assets/mukta-{400,500}.woff2
//
// Requires Python with fontTools + brotli (pip install fonttools brotli).
// The woff2 files are committed; re-run only when the character set changes.
import { readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const srcDir = join(root, 'apps', 'dhyaana', 'src', 'assets');

// Collect every Devanagari codepoint used anywhere in the app source.
const sources = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|ts|jsx?)$/.test(entry.name)) sources.push(full);
  }
};
walk(join(root, 'apps', 'dhyaana', 'src'));

const chars = new Set();
for (const file of sources) {
  for (const ch of readFileSync(file, 'utf8')) {
    if (/[ऀ-ॿ]/.test(ch)) chars.add(ch);
  }
}

// Always keep the Devanagari digits, danda, and the sign used by the wordmark.
for (const extra of '०१२३४५६७८९।॥ऽँ') chars.add(extra);

const unicodes = [...chars]
  .map((c) => 'U+' + c.codePointAt(0).toString(16).toUpperCase())
  .sort();

console.log(`Collected ${chars.size} Devanagari codepoints from ${sources.length} source files.`);

const python = `
import sys
from fontTools import subset

src, dst, text_file = sys.argv[1], sys.argv[2], sys.argv[3]
with open(text_file, encoding="utf-8") as fh:
    text = fh.read()

options = subset.Options()
options.flavor = "woff2"
options.desubroutinize = True
options.layout_features = ["*"]
options.name_IDs = ["*"]
options.name_legacy = True
options.notdef_outline = True
options.recalc_bounds = True
options.drop_tables += ["DSIG"]
options.hinting = False

font = subset.load_font(src, options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
subset.save_font(font, dst, options)
print("ok")
`;

let failed = false;
for (const weight of [400, 500]) {
  const src = join(srcDir, `mukta-${weight}.ttf`);
  const dst = join(srcDir, `mukta-${weight}.woff2`);
  if (!existsSync(src)) {
    console.error(`  ! missing source: ${src}`);
    failed = true;
    continue;
  }
  // Pass the character set through a file: passing it as an argv string can
  // mangle the encoding on some shells.
  const textFile = join(dirname(src), `.mukta-subset-${weight}.txt`);
  writeFileSync(textFile, [...chars].join(''), 'utf8');
  try {
    execFileSync('python', ['-c', python, src, dst, textFile], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    console.error(`  ! subset failed for ${weight}: ${e.stderr?.toString().slice(0, 500) ?? e.message}`);
    failed = true;
  } finally {
    if (existsSync(textFile)) rmSync(textFile);
  }
  if (failed) continue;
  const before = readFileSync(src).length;
  const after = readFileSync(dst).length;
  console.log(
    `  mukta-${weight}: ${(before / 1024).toFixed(0)} KB TTF -> ${(after / 1024).toFixed(1)} KB WOFF2`,
  );
}

if (failed) {
  console.error('\nSubset failed. Keep the .ttf files and update @font-face to use them.');
  process.exit(1);
}

console.log('\nDone. Update @font-face to reference .woff2, then remove the .ttf sources.');
console.log('Codepoints:', unicodes.join(' '));
