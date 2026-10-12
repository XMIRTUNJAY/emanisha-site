import { chromium } from 'playwright';
const BASE = 'http://localhost:4322/learn-marathi';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const culprits = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > vw + 1 || r.right > vw + 1) {
      bad.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString() || '').slice(0, 50),
        w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right),
        parent: (el.parentElement?.className?.toString() || '').slice(0, 40),
      });
    }
  });
  return { vw, count: bad.length, top: bad.slice(0, 25) };
});
console.log(JSON.stringify(culprits, null, 2));
await browser.close();
