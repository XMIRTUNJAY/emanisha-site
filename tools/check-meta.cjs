// Title/description length audit (spec: ≤60 / ≤155). Run on dist.
const fs = require('fs');
const path = require('path');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : p.endsWith('.html') && e.name !== '404.html' ? [p] : [];
});
let bad = 0;
for (const f of walk('dist')) {
  const h = fs.readFileSync(f, 'utf8');
  const t = (h.match(/<title>(.*?)<\/title>/) || [])[1] || '';
  const d = (h.match(/name="description" content="(.*?)"/) || [])[1] || '';
  const rel = f.replace(/\\/g, '/').replace('dist/', '');
  if (t.length > 60 || d.length > 155 || !t || !d) {
    bad++;
    console.log(`${rel}\n  title[${t.length}]: ${t.slice(0, 80)}\n  desc[${d.length}]: ${d.slice(0, 90)}`);
  }
}
console.log(bad ? `${bad} pages over limits` : 'ALL TITLES/DESCS WITHIN LIMITS');
