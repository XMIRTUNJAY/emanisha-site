import { chromium } from 'playwright';

const base = 'http://localhost:4321/learn-marathi';
const paths = process.argv.slice(2);
const targets = paths.length ? paths : ['vocabulary/adjectives/', '', 'lessons/01/'];

const browser = await chromium.launch();
const widths = [1280, 1024, 768, 480, 375];
for (const p of targets) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(`${base}/${p}`, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const info = await page.evaluate(() => {
      const img = document.querySelector('.hero-figure img') ||
                  document.querySelector('.premium-hero img') ||
                  document.querySelector('main img');
      if (!img) return null;
      const cs = getComputedStyle(img);
      const heroFigure = img.closest('.hero-figure');
      const figCs = heroFigure ? getComputedStyle(heroFigure) : null;
      const r = img.getBoundingClientRect();
      return {
        cls: img.className || img.closest('.hero-figure,.premium-hero')?.className || '(img)',
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
        rendered: `${Math.round(r.width)}x${Math.round(r.height)}`,
        rule: `w ${cs.width} | h ${cs.height} | maxH ${cs.maxHeight} | objectFit ${cs.objectFit}`,
        ratioNeeded: (img.naturalWidth / img.naturalHeight).toFixed(3),
        ratioRendered: r.height ? (r.width / r.height).toFixed(3) : 'n/a',
        figureH: heroFigure ? `${Math.round(heroFigure.getBoundingClientRect().height)} (overflow ${figCs.overflow})` : 'n/a',
      };
    });
    console.log(`\n/${p}  @${w}px`);
    if (!info) { console.log('  no hero image found'); }
    else {
      console.log(`  natural ${info.natural}  rendered ${info.rendered}`);
      console.log(`  ${info.rule}`);
      console.log(`  aspect natural=${info.ratioNeeded} rendered=${info.ratioRendered}  ${Math.abs(info.ratioNeeded-info.ratioRendered)<0.05?'OK':'*** DISTORTED ***'}`);
      console.log(`  figure height ${info.figureH}`);
    }
    await page.close();
  }
}
await browser.close();
