import { chromium } from 'playwright';
const BASE = 'http://localhost:4322/learn-marathi';
const browser = await chromium.launch();
const errs = [];

/* ---------- header + path (desktop) ---------- */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const header = await page.evaluate(() => {
  const h = document.querySelector('.site-header');
  const cs = getComputedStyle(h);
  const cta = document.querySelector('.nav-cta');
  return {
    position: cs.position,
    backdrop: cs.backdropFilter || cs.webkitBackdropFilter,
    bg: cs.backgroundColor,
    borderBottom: cs.borderBottomWidth + ' ' + cs.borderBottomColor,
    ctaText: cta ? cta.textContent.trim() : null,
    ctaHref: cta ? cta.getAttribute('href') : null,
    ctaBg: cta ? getComputedStyle(cta).backgroundColor : null,
    ctaRadius: cta ? getComputedStyle(cta).borderRadius : null,
  };
});
console.log('HEADER', JSON.stringify(header, null, 2));

// scrolled state
await page.evaluate(() => window.scrollTo(0, 400));
await page.waitForTimeout(300);
const scrolled = await page.evaluate(() => ({
  isScrolled: document.querySelector('.site-header')?.classList.contains('is-scrolled'),
  shadow: getComputedStyle(document.querySelector('.site-header')).boxShadow,
}));
console.log('SCROLLED', JSON.stringify(scrolled));
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(200);

/* ---------- learning path ---------- */
const path = await page.evaluate(() => {
  const root = document.querySelector('[data-path]');
  if (!root) return null;
  const links = [...root.querySelectorAll('.path__link')].map((a) => ({
    label: a.querySelector('.path__label')?.textContent,
    href: a.getAttribute('href'),
  }));
  const initial = getComputedStyle(root.querySelector('.path__node'));
  return {
    links,
    nodeBorder: initial.borderTopWidth + ' ' + initial.borderTopColor,
    activeBadge: root.querySelector('.path__badge')?.textContent ?? null,
    hasControls: !!root.querySelector('[data-path-next]'),
    railCount: root.querySelectorAll('.path__rail').length,
  };
});
console.log('PATH', JSON.stringify(path, null, 2));

// hover interaction check
const before = await page.$eval('.path__step:not(.path__step--active) .path__node', (el) => getComputedStyle(el).borderTopColor);
await page.hover('.path__step:not(.path__step--active) .path__link');
await page.waitForTimeout(250);
const after = await page.$eval('.path__step:not(.path__step--active) .path__node', (el) => getComputedStyle(el).borderTopColor);
console.log('PATH HOVER border:', before, '->', after, before !== after ? '(interactive OK)' : '(NO CHANGE)');

// click a path link and confirm it lands on a real page
await page.click('.path__step:nth-child(4) .path__link');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
console.log('PATH NAV ->', await page.evaluate(() => ({ url: location.pathname, h1: document.querySelector('main h1')?.textContent?.trim().slice(0, 50) })));

await ctx.close();
console.log('CONSOLE ERRORS:', errs.length ? errs : 'none');
await browser.close();
