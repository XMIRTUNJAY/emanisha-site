// Find CSS custom properties that are USED but never DEFINED anywhere in src.
// Undefined vars make the whole declaration invalid, so properties silently
// vanish (this is how --border went unnoticed across 53 call sites).
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('src');
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(css|astro|ts|js|mjs)$/.test(e.name)) files.push(p);
  }
})(SRC);

const defined = new Set();
const used = new Map(); // name -> Set(files)

const defRe = /(--[a-zA-Z0-9-]+)\s*:/g;
const useRe = /var\(\s*(--[a-zA-Z0-9-]+)/g;

for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = defRe.exec(txt))) defined.add(m[1]);
  while ((m = useRe.exec(txt))) {
    const n = m[1];
    if (!used.has(n)) used.set(n, new Set());
    used.get(n).add(path.relative(SRC, f).replace(/\\/g, '/'));
  }
}

const UNDEFINED_ALLOW = new Set([
  // set at runtime by inline scripts / external libs
  '--delay', '--wave', '--pitch',
]);

const missing = [...used.entries()]
  .filter(([n]) => !defined.has(n) && !UNDEFINED_ALLOW.has(n))
  .sort();

console.log('defined vars:', defined.size);
console.log('used vars   :', used.size);
console.log('UNDEFINED but used:', missing.length);
for (const [n, fs_] of missing) {
  console.log(`\n  ${n}   (${fs_.size} file${fs_.size > 1 ? 's' : ''})`);
  console.log('    ' + [...fs_].slice(0, 8).join(', ') + (fs_.size > 8 ? ` (+${fs_.size - 8})` : ''));
}
