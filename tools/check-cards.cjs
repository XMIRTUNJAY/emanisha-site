const fs = require('fs');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = d + '/' + e.name;
  if (e.isDirectory()) return walk(p);
  return p.endsWith('.html') ? [p] : [];
});
for (const f of walk('dist')) {
  const h = fs.readFileSync(f, 'utf8');
  const cards = [...h.matchAll(/<a class="card"[^>]*>([\s\S]*?)<\/a>/g)];
  if (!cards.length) continue;
  const bare = cards.filter((m) => !/<img/.test(m[1]));
  const heroes = (h.match(/class="hero-figure"/g) || []).length;
  if (bare.length) {
    console.log(f.replace('dist/', '') + ` — ${bare.length}/${cards.length} cards imageless, heroes: ${heroes}`);
  }
}
console.log('audit done');
