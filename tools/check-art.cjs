const fs = require('fs');
for (const f of ['dist/vocabulary/food/index.html', 'dist/index.html', 'dist/lessons/01/index.html']) {
  const h = fs.readFileSync(f, 'utf8');
  const imgs = [...h.matchAll(/<img[^>]*src="([^"]*)"[^>]*>/g)].map((m) => m[1]);
  console.log(f, '| imgs:', imgs.length, '| lazy:', (h.match(/loading="lazy"/g) || []).length);
  console.log('  ', imgs.slice(0, 3).join(' | '));
}
