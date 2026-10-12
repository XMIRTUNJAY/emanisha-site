#!/usr/bin/env node
// page-hero-table.mjs — prints route | hero-file | actual OCR headline for every
// built page, so hero↔content alignment can be eyeballed.
import fs from 'node:fs';
import path from 'node:path';

const raw = fs.readFileSync('tools/ocr-digest.txt', 'utf8').replace(/\r/g, '');
const map = new Map();
let cur = null;
for (const l of raw.split('\n')) {
  const m = l.match(/^###\s+(og-[^\s]+)/);
  if (m) { cur = m[1]; map.set(cur, ''); continue; }
  if (cur) map.set(cur, (map.get(cur) || '') + ' ' + l);
}

function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.name === 'index.html') out.push(p);
  }
  return out;
}

const filter = process.argv[2] ? new RegExp(process.argv[2]) : null;
for (const p of walk('dist').sort()) {
  const html = fs.readFileSync(p, 'utf8');
  let file = '(none)';
  const m = html.match(/\/og\/(og-[a-z0-9_.-]+)\.webp/i);
  if (m) file = m[1];
  else { const o = html.match(/og:image" content="[^"]*\/og\/(og-[a-z0-9_.-]+)\.png/i); if (o) file = o[1]; }
  const route = p.split(path.sep).slice(1, -1).join('/') || '/';
  if (filter && !filter.test(route)) continue;
  const ocr = (map.get(file) || '').replace(/\s+/g, ' ').trim().slice(0, 78);
  console.log(route.padEnd(38) + ' | ' + file.replace(/^og-/, '').padEnd(34) + ' | ' + ocr);
}
