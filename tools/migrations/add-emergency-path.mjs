import fs from 'fs';

const original = JSON.parse(fs.readFileSync('./src/data/seo/english-paths.json', 'utf8'));
const newPage = JSON.parse(fs.readFileSync('./new-emergency-path.json', 'utf8'));

const combined = [...original, ...newPage];
fs.writeFileSync('./src/data/seo/english-paths.json', JSON.stringify(combined, null, 2) + '\n', 'utf8');
console.log('Done! Total english paths:', combined.length, '(added', newPage.length, 'new)');