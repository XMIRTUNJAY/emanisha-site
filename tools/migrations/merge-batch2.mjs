import fs from 'fs';

// Read original
const original = JSON.parse(fs.readFileSync('./src/data/seo/hindi-bridges.json', 'utf8'));
const newEntries = JSON.parse(fs.readFileSync('./new-hindi-bridges-batch2.json', 'utf8'));

// Create set of existing slugs
const existingSlugs = new Set(original.map(e => e.slug));

// Filter only new entries
const uniqueNew = newEntries.filter(e => !existingSlugs.has(e.slug));
console.log('New entries to add:', uniqueNew.map(e => e.slug));

// Combine
const combined = [...original, ...uniqueNew];

// Write back
fs.writeFileSync('./src/data/seo/hindi-bridges.json', JSON.stringify(combined, null, 2) + '\n', 'utf8');
console.log('Done! Total entries:', combined.length, '(added', uniqueNew.length, 'new)');