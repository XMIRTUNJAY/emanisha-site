import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, 'dist');
const BASE_URL = `file://${DIST_DIR}`;

// Pages to capture
const pages = [
  { url: '/learn-marathi/', name: 'home' },
  { url: '/learn-marathi/vocabulary/', name: 'vocab-index' },
  { url: '/learn-marathi/vocabulary/adjectives/', name: 'vocab-adjectives' },
  { url: '/learn-marathi/vocabulary/animals/', name: 'vocab-animals' },
  { url: '/learn-marathi/vocabulary/food/', name: 'vocab-food' },
  { url: '/learn-marathi/vocabulary/body-parts/', name: 'vocab-body-parts' },
  { url: '/learn-marathi/vocabulary/clothing/', name: 'vocab-clothing' },
  { url: '/learn-marathi/vocabulary/shopping/', name: 'vocab-shopping' },
  { url: '/learn-marathi/phrases/', name: 'phrases-index' },
  { url: '/learn-marathi/phrases/making-plans/', name: 'phrases-making-plans' },
  { url: '/learn-marathi/phrases/shopping/', name: 'phrases-shopping' },
  { url: '/learn-marathi/phrases/presentations-interviews/', name: 'phrases-presentations' },
  { url: '/learn-marathi/phrases/office-work/', name: 'phrases-office-work' },
  { url: '/learn-marathi/hindi-to-marathi/', name: 'hindi-index' },
  { url: '/learn-marathi/hindi-to-marathi/festivals/', name: 'hindi-festivals' },
  { url: '/learn-marathi/hindi-to-marathi/advanced-structures/', name: 'hindi-advanced' },
  { url: '/learn-marathi/hindi-to-marathi/daily-conversation/', name: 'hindi-daily' },
  { url: '/learn-marathi/hindi-to-marathi/shopping/', name: 'hindi-shopping' },
  { url: '/learn-marathi/english-to-marathi/', name: 'english-index' },
  { url: '/learn-marathi/english-to-marathi/words/', name: 'english-words' },
  { url: '/learn-marathi/english-to-marathi/phrases/', name: 'english-phrases' },
  { url: '/learn-marathi/grammar/', name: 'grammar-index' },
  { url: '/learn-marathi/grammar/commands-polite/', name: 'grammar-commands' },
  { url: '/learn-marathi/grammar/postpositions/', name: 'grammar-postpositions' },
  { url: '/learn-marathi/blog/', name: 'blog-index' },
  { url: '/learn-marathi/blog/at-the-doctor/', name: 'blog-doctor' },
];

test.describe('Visual regression - key pages', () => {
  for (const page of pages) {
    test(`screenshot: ${page.name}`, async ({ page: pwPage }) => {
      await pwPage.goto(`${BASE_URL}${page.url}`, { waitUntil: 'networkidle' });
      await pwPage.waitForLoadState('domcontentloaded');
      
      // Wait for hero image to load
      await pwPage.waitForSelector('figure.hero-figure picture source', { timeout: 5000 }).catch(() => {});
      
      // Take full page screenshot
      await pwPage.screenshot({ 
        path: `playwright-screenshots/${page.name}.png`, 
        fullPage: true 
      });
      
      // Also take viewport screenshot (above fold)
      await pwPage.screenshot({ 
        path: `playwright-screenshots/${page.name}-above-fold.png`, 
        fullPage: false 
      });
    });
  }
});