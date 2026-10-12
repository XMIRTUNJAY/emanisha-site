import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = 'http://localhost:4322/learn-marathi';
const OUT = 'C:/Users/kumar/projects/_shots';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

// desktop hero
const ctx = await browser.newContext({ viewport: { width: 1440, height: 820 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
await p.screenshot({ path: `${OUT}/new-hero-desktop.jpg`, type: 'jpeg', quality: 62 });

// full desktop, downscaled by using a tall viewport then scaling via CSS is not possible;
// capture full page then rely on section shots
await p.evaluate(() => window.scrollTo(0, 900));
await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/new-desktop-2.jpg`, type: 'jpeg', quality: 62 });
await p.evaluate(() => window.scrollTo(0, 1900));
await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/new-desktop-3.jpg`, type: 'jpeg', quality: 62 });
await p.evaluate(() => window.scrollTo(0, 2900));
await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/new-desktop-4.jpg`, type: 'jpeg', quality: 62 });
await p.evaluate(() => window.scrollTo(0, 3900));
await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/new-desktop-5.jpg`, type: 'jpeg', quality: 62 });

// mobile hero
const m = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 1 });
const mp = await m.newPage();
await mp.goto(BASE + '/', { waitUntil: 'networkidle' });
await mp.waitForTimeout(1200);
await mp.screenshot({ path: `${OUT}/new-mobile-hero.jpg`, type: 'jpeg', quality: 62 });

console.log('done');
await browser.close();
