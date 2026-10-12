import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const BASE = process.env.BASE || 'http://localhost:4322/learn-marathi';
const shots = [
  { name: 'home-desktop', width: 1440, height: 1000, url: '/' },
  { name: 'home-mobile', width: 390, height: 844, url: '/' },
  { name: 'home-tablet', width: 820, height: 1180, url: '/' },
  { name: 'vocab-desktop', width: 1440, height: 1000, url: '/vocabulary/' },
  { name: 'lesson-desktop', width: 1440, height: 1000, url: '/lessons/' },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE + s.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  // full page
  await page.screenshot({ path: `tools/redesign-shots/${s.name}.png`, fullPage: true });
  console.log('captured', s.name, 'height', await page.evaluate(() => document.body.scrollHeight));
  await ctx.close();
}
await browser.close();
