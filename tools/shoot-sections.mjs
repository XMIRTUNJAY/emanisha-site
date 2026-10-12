import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://localhost:4322/learn-marathi';
const OUT = 'C:/Users/kumar/projects/_shots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const h = await page.evaluate(() => document.body.scrollHeight);
const step = 900;
let i = 0;
for (let y = 0; y < h; y += step) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/desk-${String(i).padStart(2,'0')}.jpg`, type: 'jpeg', quality: 55 });
  i++;
}
console.log('desktop sections', i, 'total h', h);

const mctx = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 1 });
const mp = await mctx.newPage();
await mp.goto(BASE + '/', { waitUntil: 'networkidle' });
await mp.waitForTimeout(1500);
const mh = await mp.evaluate(() => document.body.scrollHeight);
let j = 0;
for (let y = 0; y < mh; y += 800) {
  await mp.evaluate((yy) => window.scrollTo(0, yy), y);
  await mp.waitForTimeout(400);
  await mp.screenshot({ path: `${OUT}/mob-${String(j).padStart(2,'0')}.jpg`, type: 'jpeg', quality: 55 });
  j++;
}
console.log('mobile sections', j, 'total h', mh);

await browser.close();
