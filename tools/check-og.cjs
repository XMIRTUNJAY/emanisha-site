const fs = require('fs');
for (const f of ['dist/index.html', 'dist/vocabulary/food/index.html', 'dist/lessons/01/index.html', 'dist/quiz/food/index.html', 'dist/hi/shabd/index.html']) {
  const h = fs.readFileSync(f, 'utf8');
  console.log(f, '=>', (h.match(/og:image" content="([^"]*)"/) || [])[1]);
}
