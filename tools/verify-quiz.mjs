import { chromium } from 'playwright';
const BASE = 'http://localhost:4322/learn-marathi';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

await page.goto(BASE + '/quiz/verbs/', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

const opts = await page.$$eval('.qopt', (els) =>
  els.map((el) => {
    const cs = getComputedStyle(el);
    const k = el.querySelector('.k');
    return {
      text: el.textContent.trim().slice(0, 28),
      border: cs.borderTopWidth + ' ' + cs.borderTopColor,
      radius: cs.borderRadius,
      display: cs.display,
      padding: cs.padding,
      fontFamily: cs.fontFamily.split(',')[0],
      hasK: !!k,
      kBox: k ? getComputedStyle(k).width + 'x' + getComputedStyle(k).height : null,
      kBg: k ? getComputedStyle(k).backgroundColor : null,
    };
  }),
);
console.log('option count:', opts.length);
console.log(JSON.stringify(opts.slice(0, 3), null, 2));

// click the first option, check feedback + ok/bad styling
await page.click('.qopt');
await page.waitForTimeout(400);
const after = await page.evaluate(() => {
  const fb = document.getElementById('qfb');
  const clicked = document.querySelector('.qopt.ok, .qopt.bad');
  const cs = clicked ? getComputedStyle(clicked) : null;
  const fbCs = getComputedStyle(fb);
  const before = getComputedStyle(fb, '::before');
  return {
    fbText: fb.textContent.slice(0, 40),
    fbClass: fb.className,
    fbColor: fbCs.color,
    fbIconContent: before.content,
    fbIconBg: before.backgroundColor,
    clickedState: clicked ? clicked.className : null,
    clickedBorder: cs ? cs.borderTopWidth + ' ' + cs.borderTopColor : null,
    clickedBg: cs ? cs.backgroundColor : null,
  };
});
console.log('after click:', JSON.stringify(after, null, 2));

// arrange mode tokens
await page.click('#tab-arrange');
await page.waitForTimeout(500);
const toks = await page.$$eval('.tok', (els) =>
  els.slice(0, 3).map((el) => {
    const cs = getComputedStyle(el);
    return { text: el.textContent, border: cs.borderTopWidth, radius: cs.borderRadius, pad: cs.padding };
  }),
);
const ph = await page.$eval('.abuild .ph', (el) => ({ text: el.textContent, color: getComputedStyle(el).color })).catch(() => null);
console.log('tokens:', JSON.stringify(toks, null, 2), 'placeholder:', JSON.stringify(ph));

console.log('CONSOLE ERRORS:', errs.length ? errs : 'none');
await browser.close();
