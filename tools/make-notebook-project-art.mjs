// Generate the notebook project hero SVGs that are missing.
//
// Every project page renders /projects/<id>.svg as its hero, but only four
// of the seven projects have one, so three pages ship a broken hero image.
// This regenerates any project SVG that is absent, matching the house style
// of the ones that exist (dotted ground, split rule, serif title, and a
// simple bar/arc motif on the right).
//
// Run: node ./tools/make-notebook-project-art.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'notebook', 'projects');
const contentDir = join(root, 'src', 'content', 'notebook', 'projects');

/** Dotted ground, matching the existing cards. */
const dots = () => {
  const out = [];
  for (let y = 20; y <= 724; y += 44) {
    for (let x = 20; x <= 1180; x += 40) out.push(`<circle cx="${x}" cy="${y}" r="1.6"/>`);
  }
  return `<g fill="#e4e4e7">${out.join('')}</g>`;
};

/** Split the title into lines of roughly equal width. */
function wrapTitle(title, max = 22) {
  const words = title.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

/** A rising-bar motif, varied per project so the cards are not identical. */
function motif(seed) {
  const bars = [];
  let x = 756 + (seed % 3) * 24;
  for (let i = 0; i < 4; i++) {
    const h = 70 + ((seed * (i + 3)) % 5) * 50;
    bars.push(`<rect x="${x}" y="${450 - h + 70}" width="64" height="${h}" rx="8" fill="#fff" stroke="#18181b" stroke-width="3"/>`);
    x += 86;
  }
  return `<g>${bars.join('')}</g>`;
}

function svg({ label, title, sections, seed }) {
  const lines = wrapTitle(title);
  const text = lines
    .map(
      (line, i) =>
        `    <text x="80" y="${210 + i * 72}" font-family="Georgia, 'Times New Roman', serif" font-size="62" font-weight="700" fill="#18181b">${line
          .replace(/&/g, '&')
          .replace(/</g, '<')}</text>`,
    )
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="${label}">
  <rect width="1200" height="720" fill="#fbfbfa"/>
  ${dots()}
  <line x1="710" y1="80" x2="710" y2="650" stroke="#e4e4e7" stroke-width="2"/>
  <rect x="80" y="88" width="44" height="8" fill="#b45309"/>
  <text x="80" y="132" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="23" letter-spacing="4" fill="#63636b">ENGINEERING NOTEBOOK</text>
  <text x="1120" y="132" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="23" fill="#63636b">CASE STUDY</text>
${text}
  <text x="80" y="664" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="23" fill="#63636b">${sections} sections</text>
  ${motif(seed)}
</svg>
`;
}

// Read each project's frontmatter for its title and section count.
const projects = readdirSync(contentDir).filter((f) => f.endsWith('.mdx'));
let made = 0;
let skipped = 0;

projects.forEach((file, index) => {
  const id = file.replace(/\.mdx$/, '');
  const out = join(outDir, `${id}.svg`);
  if (existsSync(out)) {
    skipped++;
    return;
  }
  const source = readFileSync(join(contentDir, file), 'utf8');
  const title =
    source.match(/^title:\s*["']?(.*?)["']?\s*$/m)?.[1]?.replace(/^["']|["']$/g, '') ?? id;
  const label = title.replace(/[:(].*$/, '').trim() || id;
  const sections = (source.match(/^sections:\s*(\d+)/m)?.[1] ?? '6');
  writeFileSync(out, svg({ label, title, sections, seed: index }));
  console.log(`wrote ${id}.svg`);
  made++;
});

console.log(`make-notebook-project-art: ${made} generated, ${skipped} already present`);
