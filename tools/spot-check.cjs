// Pass-2/3 spot-check: H1, title, CTA inventory per page.
const fs = require('fs');
const pages = [
  'lessons/01/index.html', 'lessons/14/index.html', 'lessons/26/index.html',
  'grammar/pronouns/index.html', 'grammar/verbs/index.html',
  'grammar/sentence-structure/index.html',
  'vocabulary/beginners/index.html', 'vocabulary/food/index.html',
  'phrases/greetings/index.html', 'how-it-works/index.html',
  'marathi-numbers/index.html', 'marathi-pronunciation/index.html',
  'index.html', 'app/index.html', 'start/index.html',
];
for (const f of pages) {
  const h = fs.readFileSync('dist/' + f, 'utf8');
  const strip = (s) => (s || '?').replace(/<[^>]+>/g, '').slice(0, 95);
  const h1 = strip((h.match(/<h1[^>]*>(.*?)<\/h1>/) || [])[1]);
  const title = strip((h.match(/<title>(.*?)<\/title>/) || [])[1]);
  const ctas = (h.match(/data-cta="(vocabulary|phrase|grammar|lesson|general|subtle)"/g) || []).join(',');
  const h1count = (h.match(/<h1/g) || []).length;
  console.log(f + '\n  H1(' + h1count + '): ' + h1 + '\n  TITLE: ' + title + '\n  CTAs: ' + ctas);
}
