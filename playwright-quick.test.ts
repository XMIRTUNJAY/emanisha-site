import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, 'dist');
const BASE_URL = `file://${DIST_DIR}`;

// Pages to capture
const pages = [
  { url: '/', name: 'home' },
  { url: '/vocabulary/', name: 'vocab-index' },
  { url: '/vocabulary/adjectives/', name: 'vocab-adjectives' },
  { url: '/phrases/', name: 'phrases-index' },
  { url: '/hindi-to-marathi/', name: 'hindi-index' },
];

test.describe('Quick visual check', () => {
  test.setTimeout(60000);
  
  for (const page of pages) {
    test(`screenshot: ${page.name}`, async ({ page: pwPage }) => {
      await pwPage.goto(`${BASE_URL}${page.url}`, { waitUntil: 'networkidle' });
      await pwPage.waitForLoadState('domcontentloaded');
      
      // Wait a bit for rendering
      await pwPage.waitForTimeout(2000);
      
      // Take full page screenshot
      await pwPage.screenshot({ 
        path: `playwright-screenshots/${page.name}.png`, 
        fullPage: true 
      });
      
      // Also take above-fold screenshot
      await pwPage.screenshot({ 
        path: `playwright-screenshots/${page.name}-above-fold.png`, 
        fullPage: false 
      });
      
      // Just verify page loaded
      await expect(pwPage.locator('h1')).toBeVisible({ timeout: 10000 });
    });
  }
});