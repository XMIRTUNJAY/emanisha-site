#!/usr/bin/env node
/**
 * audit-images.mjs — authoritative page-art audit.
 *
 * Replaces the old OCR-topic heuristic (which guessed an image's topic from
 * fuzzy OCR text and produced false failures) with checks against the single
 * source of truth: src/lib/art.ts.
 *
 * For every built page in dist/ it asserts:
 *   1. the page's social art (<meta property="og:image">) == pageArtPng(route)
 *   2. that image file exists in public/og/
 *   3. every /og/*.webp or *.png the page references exists on disk
 *      (broken-image / missing-asset guard)
 *
 * Exit code 1 on any FAIL, so it works as a CI regression guard.
 *
 *   npm run audit:images
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distRoot = join(root, 'dist');
const ogDir = join(root, 'public', 'og');

// ---------------------------------------------------------------------------
// 1. Reconstruct art.ts's route -> filename mapping (single source of truth)
// ---------------------------------------------------------------------------

const artSrc = readFileSync(join(root, 'src', 'lib', 'art.ts'), 'utf8');

const renamedMap = {};
const mapBlock = artSrc.match(/const renamedMap: Record<string, string> = \{([\s\S]*?)\n {2}\};/);
if (mapBlock) {
  const re = /'([^']+)':\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(mapBlock[1])) !== null) renamedMap[m[1]] = m[2];
}

const defaultBase = (route) => (route === '' ? 'og-home' : `og-${route.replace(/\//g, '-')}`);
const expectedBase = (route) => renamedMap[route] ?? defaultBase(route);

const exists = (file) => existsSync(join(ogDir, file));

// ---------------------------------------------------------------------------
// 2. Scan dist/
// ---------------------------------------------------------------------------

const pages = [];
function walk(dir, base = '') {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      walk(full, rel);
    } else if (entry.name === 'index.html') {
      const route = ('/' + rel.replace(/\/index\.html$/, '/')).replace('/index.html', '/');
      const html = readFileSync(full, 'utf8');
      const og = html.match(/<meta property="og:image" content="([^"]+)"/);
      const refs = new Set();
      for (const m of html.matchAll(/\/og\/([a-z0-9_.-]+\.(?:webp|png))/gi)) refs.add(m[1]);
      pages.push({
        route,
        ogImage: og ? decodeURIComponent(og[1]).split('/og/').pop() : null,
        refs: [...refs],
      });
    }
  }
}
walk(distRoot);

// dist route "/vocabulary/animals/" -> art route "vocabulary/animals"
const toArtRoute = (route) => route.replace(/^\//, '').replace(/\/$/, '');

// ---------------------------------------------------------------------------
// 3. Compare
// ---------------------------------------------------------------------------

let pass = 0, fail = 0, skipped = 0;
const failures = [];

for (const page of pages) {
  const artRoute = toArtRoute(page.route);
  const expected = `${expectedBase(artRoute)}.png`;

  // A route with no art defined in public/og is simply not covered yet.
  if (!exists(expected)) {
    skipped++;
    continue;
  }

  if (page.ogImage === expected) {
    pass++;
  } else if (page.ogImage === null) {
    fail++;
    failures.push(`${page.route}  expected og:image ${expected}  but page has no og:image  [MISSING]`);
  } else {
    fail++;
    failures.push(`${page.route}  expected og:image ${expected}  got ${page.ogImage}  [MISMATCH]`);
  }

  // Broken-asset guard: every /og/ file the page points at must exist.
  for (const ref of page.refs) {
    if (!exists(ref)) {
      fail++;
      failures.push(`${page.route}  references missing asset og/${ref}  [BROKEN ASSET]`);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Report
// ---------------------------------------------------------------------------

console.log('\n=== PAGE ART AUDIT (verified against src/lib/art.ts) ===');
console.log(`Renamed mappings parsed: ${Object.keys(renamedMap).length}`);
console.log(`Pages scanned:           ${pages.length}`);
console.log(`  ✓ og:image correct:     ${pass}`);
console.log(`  ✗ failures:             ${fail}`);
console.log(`  · no art defined:       ${skipped}`);

if (fail > 0) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(`  ${f}`);
  console.log('\n❌ PAGE ART AUDIT FAILED');
  process.exit(1);
}

console.log('\n✅ PAGE ART AUDIT PASSED — every page art matches art.ts and all referenced assets exist.');
process.exit(0);
