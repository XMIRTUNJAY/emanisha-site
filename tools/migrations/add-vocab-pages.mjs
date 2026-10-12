import fs from 'fs';

const original = JSON.parse(fs.readFileSync('./src/data/seo/vocab-topics.json', 'utf8'));
const newPages = JSON.parse(fs.readFileSync('./new-vocab-pages.json', 'utf8'));

const combined = [...original, ...newPages];
fs.writeFileSync('./src/data/seo/vocab-topics.json', JSON.stringify(combined, null, 2) + '\n', 'utf8');
console.log('Done! Total vocab pages:', combined.length, '(added', newPages.length, 'new)');
console.log('New slugs:', newPages.map(p => p.slug));