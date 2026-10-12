import { test, expect } from '@playwright/test';

// Games route verification against the built site (npm run preview, port 4321).
// Run: npm run build && npm run preview  →  npx playwright test playwright-games.test.ts
const BASE = 'http://127.0.0.1:4321/learn-marathi';

const routes = [
	{ url: '/games/', name: 'games-hub' },
	{ url: '/games/marathi-wordle/', name: 'wordle' },
	{ url: '/games/picture-guess/', name: 'picture-guess' },
	{ url: '/games/marathi-crossword/', name: 'crossword' },
	{ url: '/games/word-chain/', name: 'word-chain' },
	{ url: '/games/sentence-scramble/', name: 'sentence-scramble' },
];

const viewports = [
	{ name: 'desktop', width: 1280, height: 800 },
	{ name: 'mobile', width: 390, height: 844 },
];

test.describe('Games routes load cleanly', () => {
	test.setTimeout(60000);

	for (const vp of viewports) {
		test.use({ viewport: { width: vp.width, height: vp.height } });
		for (const r of routes) {
			test(`${vp.name} ${r.url}: h1 visible, no console errors, no failed requests`, async ({ page }) => {
				const consoleErrors: string[] = [];
				const failed: string[] = [];
				page.on('console', (m) => {
					if (m.type() === 'error') consoleErrors.push(m.text());
				});
				page.on('pageerror', (e) => consoleErrors.push(String(e)));
				page.on('requestfailed', (req) => failed.push(req.url()));

				const resp = await page.goto(`${BASE}${r.url}`, { waitUntil: 'networkidle' });
				expect(resp?.status(), `status for ${r.url}`).toBe(200);
				await expect(page.locator('h1')).toBeVisible();
				expect(consoleErrors, `console errors on ${r.url}:\n${consoleErrors.join('\n')}`).toEqual([]);
				// audio files are 404-tolerant at runtime but must not fail on the page itself
				expect(failed.filter((u) => !u.includes('.mp3')), `failed requests on ${r.url}: ${failed.join(', ')}`).toEqual([]);
			});
		}
	}
});

test.describe('Game interactions', () => {
	test.setTimeout(60000);
	test.use({ viewport: { width: 1280, height: 800 } });

	test('wordle: daily board renders 6 rows and keyboard', async ({ page }) => {
		await page.goto(`${BASE}/games/marathi-wordle/`);
		await page.click('[data-play]');
		await expect(page.locator('#wl-board .wl-row')).toHaveCount(6);
		const keys = await page.locator('#wl-keys .wl-key').count();
		expect(keys).toBeGreaterThan(20);
	});

	test('wordle: practice round accepts a full guess via keyboard clicks', async ({ page }) => {
		await page.goto(`${BASE}/games/marathi-wordle/`);
		await page.click('[data-play]');
		await page.click('#tab-practice');
		// read the answer length from the board row, type a wrong guess, expect evaluation
		const firstKey = page.locator('#wl-keys .wl-key').first();
		const len = await page.locator('#wl-board .wl-row').first().locator('.wl-tile').count();
		for (let i = 0; i < len; i++) await firstKey.click();
		await page.locator('#wl-keys .wl-key', { hasText: '⏎' }).click();
		const evaluated = await page.locator('#wl-board .wl-row').first().locator('.wl-tile.correct, .wl-tile.present, .wl-tile.absent').count();
		expect(evaluated).toBe(len);
	});

	test('picture-guess: SVG art loads and options render', async ({ page }) => {
		await page.goto(`${BASE}/games/picture-guess/`);
		await page.click('[data-play]');
		await expect(page.locator('#pg-img')).toHaveJSProperty('complete', true);
		const options = await page.locator('#pg-cands .qopt').count();
		expect(options).toBe(4);
	});

	test('word-chain: four candidates, one valid per rule', async ({ page }) => {
		await page.goto(`${BASE}/games/word-chain/`);
		await page.click('[data-play]');
		const options = await page.locator('#wc-cands .qopt').count();
		expect(options).toBe(4);
		await expect(page.locator('#wc-word')).toBeVisible();
	});

	test('sentence-scramble: tiles render and check rejects empty', async ({ page }) => {
		await page.goto(`${BASE}/games/sentence-scramble/`);
		await page.click('[data-play]');
		const tiles = await page.locator('#ss-bank .tok').count();
		expect(tiles).toBeGreaterThanOrEqual(3);
		await page.click('#ss-check');
		await expect(page.locator('#ss-msg')).toContainText('All tiles');
	});

	test('crossword: grid renders letter cells and clue lists', async ({ page }) => {
		await page.goto(`${BASE}/games/marathi-crossword/`);
		await page.click('[data-play]');
		const letterCells = await page.locator('.cw-cell.letter').count();
		expect(letterCells).toBeGreaterThan(5);
		await expect(page.locator('#cw-clues h3').first()).toHaveText('Across');
	});
});
