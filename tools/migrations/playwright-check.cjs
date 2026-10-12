const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  // Test 1: Homepage
  console.log('Testing homepage...');
  await page.goto('http://localhost:4321/learn-marathi/', { waitUntil: 'networkidle' });

  // Check navbar elements
  const brand = await page.locator('.brand').first();
  const search = await page.locator('[data-search-input]').first();
  const prefsBtn = await page.locator('[data-prefs-btn]').first();
  const onlineStatus = await page.locator('#online-status').first();
  const menuBtn = await page.locator('.menu-btn').first();
  const navLinks = await page.locator('.nav-links a');

  console.log('Navbar checks:');
  console.log('  Brand visible:', await brand.isVisible());
  console.log('  Search visible:', await search.isVisible());
  console.log('  Preferences btn visible:', await prefsBtn.isVisible());
  console.log('  Online status visible:', await onlineStatus.isVisible());
  console.log('  Menu btn visible:', await menuBtn.isVisible());
  console.log('  Nav links count:', await navLinks.count());

  // Check cards on homepage
  const cards = await page.locator('.card-grid .card');
  console.log('  Card grid cards:', await cards.count());

  // Check mascot
  const mascot = await page.locator('.mascot-svg').first();
  console.log('  Mascot visible:', await mascot.isVisible());

  // Test 2: Vocabulary page (flip cards)
  console.log('\nTesting vocabulary page...');
  await page.goto('http://localhost:4321/learn-marathi/vocabulary/beginners/', { waitUntil: 'networkidle' });

  const vocabCards = await page.locator('.vocab-card');
  console.log('  Flip cards count:', await vocabCards.count());

  const viewToggle = await page.locator('.view-btn[data-view="cards"]');
  if (await viewToggle.isVisible()) {
    await viewToggle.click();
    await page.waitForTimeout(300);
    const cardsGrid = await page.locator('.vocab-cards-grid .vocab-card');
    console.log('  Flip cards grid count:', await cardsGrid.count());
  }

  // Test 3: Lesson page
  console.log('\nTesting lesson page...');
  await page.goto('http://localhost:4321/learn-marathi/lessons/01/', { waitUntil: 'networkidle' });

  const sayButtons = await page.locator('.say[data-say]');
  console.log('  Say buttons count:', await sayButtons.count());

  const lessonTables = await page.locator('.table-scroll table.vocab');
  console.log('  Lesson tables:', await lessonTables.count());

  // Test 4: Quiz page
  console.log('\nTesting quiz page...');
  await page.goto('http://localhost:4321/learn-marathi/quiz/beginners/', { waitUntil: 'networkidle' });

  const quizWord = await page.locator('#qword');
  const quizOpts = await page.locator('.qopt');
  console.log('  Quiz word visible:', await quizWord.isVisible());
  console.log('  Quiz options count:', await quizOpts.count());

  const arrangeTab = await page.locator('#tab-arrange');
  if (await arrangeTab.isVisible()) {
    await arrangeTab.click();
    await page.waitForTimeout(300);
    const tokens = await page.locator('.tok');
    console.log('  Arrange tokens count:', await tokens.count());
  }

  // Test 5: Review page
  console.log('\nTesting review page...');
  await page.goto('http://localhost:4321/learn-marathi/review/', { waitUntil: 'networkidle' });

  const progressCard = await page.locator('[data-progress-card]');
  console.log('  Progress card visible:', await progressCard.isVisible());

  // Errors summary
  console.log('\n=== Console Errors ===');
  if (errors.length) {
    errors.forEach(e => console.log('  ERROR:', e));
  } else {
    console.log('  No console errors');
  }

  await browser.close();
})();