// One-off: wrap plain internal hrefs ("/foo/") in siteUrl('/foo/') so they
// carry the deploy base path. These blog link lists were the last plain hrefs.
import fs from 'node:fs';
import path from 'node:path';

const files = [
  'src/pages/blog/how-to-say-help-in-marathi.astro',
  'src/pages/blog/how-to-say-i-love-you-in-marathi.astro',
  'src/pages/blog/how-to-say-please-in-marathi.astro',
  'src/pages/blog/how-to-say-water-in-marathi.astro',
];

let total = 0;
for (const f of files) {
  const p = path.resolve(f);
  let src = fs.readFileSync(p, 'utf8');
  const before = src;
  // href="/something/"  ->  href={siteUrl('/something/')}
  src = src.replace(/href="(\/[^"]*)"/g, (_m, u) => `href={siteUrl('${u}')}`);
  const n = (before.match(/href="\/[^"]*"/g) || []).length;
  total += n;
  if (src !== before) {
    fs.writeFileSync(p, src);
    console.log(`${f}: wrapped ${n}`);
  } else {
    console.log(`${f}: no change`);
  }
  // sanity: siteUrl must be imported
  if (!/import\s*\{[^}]*\bsiteUrl\b[^}]*\}\s*from/.test(src)) {
    console.log(`  !! WARNING: siteUrl not imported in ${f}`);
  }
}
console.log('total wrapped:', total);
