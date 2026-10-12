import { chromium } from 'playwright';
const BASE = 'http://localhost:4322/learn-marathi';
const routes = [
  '/', '/vocabulary/', '/vocabulary/transport/', '/lessons/', '/lessons/01/',
  '/phrases/', '/grammar/', '/hindi-to-marathi/', '/english-to-marathi/',
  '/quiz/', '/review/', '/start/', '/app/', '/blog/', '/hi/',
];
const browser = await chromium.launch();
const results = [];
for (const route of routes) {
  for (const vp of [{ n: 'desktop', w: 1440, h: 900 }, { n: 'mobile', w: 390, h: 844 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(700);
      const r = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
        h: document.body.scrollHeight,
        h1: document.querySelectorAll('main h1').length,
        title: document.title.slice(0, 50),
      }));
      results.push({ route, vp: vp.n, ...r, errors: errs.length ? errs.slice(0, 2) : 0 });
    } catch (e) {
      results.push({ route, vp: vp.n, fatal: String(e).slice(0, 80) });
    }
    await ctx.close();
  }
}
const bad = results.filter((r) => r.fatal || r.overflow || (r.errors && r.errors !== 0) || r.h1 === 0);
console.log('TOTAL', results.length, 'PROBLEMS', bad.length);
console.log(JSON.stringify(bad, null, 2));
console.log('\nAll h1 counts ok:', results.every((r) => r.h1 >= 1));
await browser.close();
