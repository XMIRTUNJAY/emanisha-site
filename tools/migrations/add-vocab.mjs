import fs from 'fs';

const original = JSON.parse(fs.readFileSync('./src/data/learn/vocab.json', 'utf8'));
const newEntries = JSON.parse(fs.readFileSync('./new-vocab-entries.json', 'utf8'));

const combined = [...original, ...newEntries];
fs.writeFileSync('./src/data/learn/vocab.json', JSON.stringify(combined, null, 2) + '\n', 'utf8');
console.log('Done! Total words:', combined.length, '(added', newEntries.length, 'new)');
console.log('Categories:', [...new Set(combined.map(w => w.category))].sort());