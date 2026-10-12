const fs = require('fs');
const bad = [];
const walkHtml = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = d + '/' + e.name;
  if (e.isDirectory()) return walkHtml(p);
  return p.endsWith('.html') ? [p] : [];
});
for (const f of walkHtml('dist')) {
  const h = fs.readFileSync(f, 'utf8');
  for (const m of h.matchAll(/href="(\/learn-marathi[^"]*)"/g)) {
    let t = m[1].split('#')[0].split('?')[0].replace(/^\/learn-marathi/, '');
    if (/\.(css|js|svg|png|jpg|webp|xml|ico|tsv)$/.test(t)) continue;
    if (t === '') t = '/';
    t = t.endsWith('/') ? t + 'index.html' : t + '/index.html';
    if (t === '/index.html' && m[1].replace(/^\/learn-marathi/, '') === '') continue;
    const p = 'dist' + t;
    if (!fs.existsSync(p)) bad.push(f + ' -> ' + m[1]);
  }
}
console.log(bad.length ? bad.join('\n') : 'LINKS OK');
let miss = 0;
for (const f of walkHtml('dist')) {
  if (f.endsWith('404.html')) continue;
  const h = fs.readFileSync(f, 'utf8');
  const u = (h.match(/og:image" content="([^"]*)"/) || [])[1] || '';
  const p = u.replace('https://xmirtunjay.github.io/learn-marathi/', 'dist/');
  if (!u || !fs.existsSync(p)) { miss++; console.log('MISSING OG: ' + f + ' -> ' + u); }
}
console.log(miss ? miss + ' missing' : 'ALL OG FILES EXIST');
const sm = (fs.readFileSync('dist/sitemap-0.xml', 'utf8').match(/<loc>/g) || []).length;
console.log('sitemap urls:', sm);
