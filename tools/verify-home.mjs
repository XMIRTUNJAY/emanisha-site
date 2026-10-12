import { chromium } from 'playwright';
const BASE = 'http://localhost:4322/learn-marathi';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const res = await page.evaluate(() => {
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const parse = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
  const ratio = (fg, bg) => {
    const L1 = lum(fg), L2 = lum(bg);
    const a = Math.max(L1, L2), b = Math.min(L1, L2);
    return +( (a + 0.05) / (b + 0.05) ).toFixed(2);
  };
  // walk up to find opaque background
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const p = parse(c);
      const alpha = (c.match(/[\d.]+/g) || [])[3];
      if (p.length === 3 && (alpha === undefined || parseFloat(alpha) > 0.9)) return p;
      n = n.parentElement;
    }
    return [253, 251, 247];
  };

  const checks = [];
  const items = [
    ['h1', 'h1'],
    ['hero subtitle', '.premium-hero__subtitle'],
    ['hero kicker', '.premium-hero__kicker'],
    ['stat label', '.premium-hero__stat-label'],
    ['section title', '.shead__title'],
    ['section lede', '.shead__lede'],
    ['body text (why)', '.why-item'],
    ['showcase word', '.showcase__word'],
    ['showcase translit', '.showcase__translit'],
    ['faq answer', '.faq-item p'],
    ['feature chip', '.feature-chip'],
  ];
  for (const [name, sel] of items) {
    const el = document.querySelector(sel);
    if (!el) { checks.push({ name, missing: true }); continue; }
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    const bg = bgOf(el);
    checks.push({ name, fg: cs.color, bg: `rgb(${bg.join(',')})`, ratio: ratio(fg, bg), size: cs.fontSize });
  }

  // showcase content
  const show = {
    word: document.querySelector('.showcase__word')?.textContent?.trim(),
    translit: document.querySelector('.showcase__translit')?.textContent?.trim(),
    audioBtn: !!document.querySelector('.showcase__audio[data-say]'),
    dataSay: document.querySelector('.showcase__audio')?.getAttribute('data-say'),
    ghosts: document.querySelectorAll('.showcase__card--ghost').length,
  };

  // geometry sanity
  const geo = {};
  for (const sel of ['.premium-hero', '.showcase', '.method-grid', '.unit-grid', '.faq-grid']) {
    const el = document.querySelector(sel);
    if (!el) { geo[sel] = null; continue; }
    const r = el.getBoundingClientRect();
    geo[sel] = { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left) };
  }
  // any element extending past viewport at desktop?
  const vw = document.documentElement.clientWidth;
  let past = 0;
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > vw + 1) past++;
  });

  // heading outline
  const outline = [...document.querySelectorAll('main h1, main h2, main h3')].map((h) => h.tagName + ': ' + h.textContent.trim().slice(0, 46));

  // tap targets
  const small = [];
  document.querySelectorAll('main a, main button, main summary').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.height < 40) small.push({ t: el.textContent.trim().slice(0, 26), h: Math.round(r.height) });
  });

  return { checks, show, geo, past, outline: outline.slice(0, 24), small, docHeight: document.body.scrollHeight };
});

console.log(JSON.stringify(res, null, 2));
console.log('CONSOLE ERRORS:', errors.length ? errors : 'none');
await browser.close();
