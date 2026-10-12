import { chromium } from 'playwright';

const BASE = 'http://localhost:4322/learn-marathi';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const report = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el);
  const out = {};

  // fonts actually used
  const h1 = document.querySelector('h1');
  const body = document.body;
  out.fonts = {
    h1: h1 ? cs(h1).fontFamily : null,
    h1Size: h1 ? cs(h1).fontSize : null,
    body: cs(body).fontFamily,
    bodySize: cs(body).fontSize,
    lineHeight: cs(body).lineHeight,
  };

  // Are webfonts loaded?
  out.loadedFontFaces = [...document.fonts].map(f => `${f.family}:${f.weight}:${f.status}`);

  // Section inventory (top-level children of main)
  const main = document.querySelector('main');
  const walk = (node, depth = 0) => {
    const res = [];
    for (const child of node.children) {
      const r = child.getBoundingClientRect();
      const st = cs(child);
      const heading = child.querySelector(':scope > h1, :scope > h2, :scope > header h2, :scope > header h1, :scope > .section-head h2');
      const kicker = child.querySelector(':scope > .kicker, :scope > header .kicker, :scope > .section-head .kicker, :scope > * > .kicker');
      if (r.height > 40) {
        res.push({
          tag: child.tagName.toLowerCase(),
          cls: child.className?.toString().slice(0, 60),
          h: Math.round(r.height),
          y: Math.round(r.top + window.scrollY),
          bg: st.backgroundColor,
          heading: heading?.textContent?.trim().slice(0, 70) || null,
          kicker: kicker?.textContent?.trim().slice(0, 40) || null,
          fontSizeHeading: heading ? cs(heading).fontSize : null,
        });
      }
    }
    return res;
  };
  out.sections = walk(main);

  // Document height
  out.docHeight = document.body.scrollHeight;
  // horizontal overflow
  out.hOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;

  // count of emoji-ish icons
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  let emoji = 0;
  document.querySelectorAll('main *').forEach(el => {
    if (el.children.length === 0 && emojiRe.test(el.textContent || '')) emoji++;
  });
  out.emojiNodes = emoji;

  // count of distinct background colors used across sections
  out.bgColors = [...new Set(out.sections.map(s => s.bg))];

  // number of H1s and H2s
  out.h1count = document.querySelectorAll('main h1').length;
  out.h2count = document.querySelectorAll('main h2').length;
  out.h2texts = [...document.querySelectorAll('main h2')].map(h => h.textContent.trim().slice(0, 60));

  return out;
});

console.log(JSON.stringify(report, null, 2));

// Mobile overflow + tap target check
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mp = await mctx.newPage();
await mp.goto(BASE + '/', { waitUntil: 'networkidle' });
await mp.waitForTimeout(800);
const mob = await mp.evaluate(() => {
  const small = [];
  document.querySelectorAll('main a, main button').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.height < 40) small.push({ t: el.textContent.trim().slice(0,30), h: Math.round(r.height) });
  });
  const scrollBtns = [...document.querySelectorAll('main button')].length;
  return {
    hOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    docHeight: document.body.scrollHeight,
    smallTargets: small.length,
    sampleSmall: small.slice(0, 8),
  };
});
console.log('MOBILE', JSON.stringify(mob, null, 2));

await browser.close();
